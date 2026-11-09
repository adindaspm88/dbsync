from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Body
from sqlalchemy import text
import pandas as pd
import io

from db import get_db
from deps import get_current_user, require_roles
from auth import hash_password, create_token, verify_password


from collections import defaultdict
from pydantic import BaseModel

from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class DinasValue(BaseModel):
    variabel_id: int
    periode_id: int
    wilayah_id: int
    nilai: float
    justifikasi: str | None = None


class LuarLbsValue(BaseModel):
    variabel_id: int
    periode_id: int
    wilayah_id: int
    nilai: float
    nama_kelompok: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    foto_fase: str | None = None
    foto_polygon: str | None = None


@router.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # 1. cari user
    user = db.execute(text("""
        SELECT * FROM users WHERE email = :email
    """), {"email": payload.email}).mappings().first()

    # 2. validasi user
    if not user:
        raise HTTPException(status_code=400, detail="Email atau password salah")

    # 3. validasi password (pakai auth.py)
    if not user["is_active"] or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Email atau password salah")

    # 4. generate token (pakai auth.py)
    token = create_token({
        "sub": user["email"],
        "user_id": user["id"]
    })

    # 5. response
    db.execute(text("UPDATE users SET last_login = NOW() WHERE id = :id"), {"id": user["id"]})
    db.commit()
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "nama": user["nama"], "email": user["email"]}
    }


@router.get("/modules")
def list_modules(db=Depends(get_db)):
    return db.execute(text("""
        SELECT m.id, m.kode, m.nama, m.deskripsi, m.indikator_id,
               i.kode AS kode_indikator, i.nama AS nama_indikator
        FROM master_modul m JOIN master_indikator i ON i.id = m.indikator_id
        WHERE m.is_active = 1 AND i.is_active = 1 ORDER BY m.id
    """)).mappings().all()


@router.get("/modules/{kode}/variables")
def module_variables(kode: str, db=Depends(get_db)):
    rows = db.execute(text("""
        SELECT v.id, v.modul_id, v.kode, v.nama, v.satuan, v.deskripsi
        FROM master_variabel v JOIN master_modul m ON m.id = v.modul_id
        WHERE m.kode = :kode AND m.is_active = 1 AND v.is_active = 1 ORDER BY v.id
    """), {"kode": kode}).mappings().all()
    return rows


@router.get("/modules/{kode}/dashboard")
def module_dashboard(kode: str, tahun: int | None = None, wilayah_id: int | None = None, db=Depends(get_db)):
    return db.execute(text("""
        SELECT v.id AS variabel_id, v.kode, v.nama, v.satuan,
               p.id AS periode_id, p.tahun, p.nomor_periode, p.periode_label,
               COALESCE(SUM(b.nilai), 0) AS total_bps,
               COALESCE(SUM(d.nilai), 0) AS total_dinas
        FROM master_modul m JOIN master_variabel v ON v.modul_id=m.id
        JOIN master_periode p ON p.is_active=1
        LEFT JOIN data_bps b ON b.variabel_id=v.id AND b.periode_id=p.id
            AND b.wilayah_id IN (SELECT id FROM master_wilayah WHERE level_wilayah='kabkot')
            AND (:wilayah_id IS NULL OR :wilayah_id=(SELECT id FROM master_wilayah WHERE level_wilayah='provinsi' LIMIT 1) OR b.wilayah_id=:wilayah_id)
        LEFT JOIN data_dinas d ON d.variabel_id=v.id AND d.periode_id=p.id
            AND d.wilayah_id IN (SELECT id FROM master_wilayah WHERE level_wilayah='kabkot')
            AND (:wilayah_id IS NULL OR :wilayah_id=(SELECT id FROM master_wilayah WHERE level_wilayah='provinsi' LIMIT 1) OR d.wilayah_id=:wilayah_id)
        WHERE m.kode=:kode AND m.is_active=1 AND v.is_active=1
            AND (:tahun IS NULL OR p.tahun=:tahun) AND (b.id IS NOT NULL OR d.id IS NOT NULL)
        GROUP BY v.id,v.kode,v.nama,v.satuan,p.id,p.tahun,p.nomor_periode,p.periode_label
        ORDER BY p.tahun DESC,p.id DESC,v.id
    """), {"kode": kode, "tahun": tahun, "wilayah_id": wilayah_id}).mappings().all()


@router.get("/lookups")
def lookups(db=Depends(get_db)):
    return {
        "wilayahs": db.execute(text("SELECT id, kode_wilayah, nama_wilayah, level_wilayah, parent_id FROM master_wilayah ORDER BY id")).mappings().all(),
        "periodes": db.execute(text("SELECT id, tahun, jenis_periode, nomor_periode, periode_label FROM master_periode WHERE is_active = 1 ORDER BY tahun, id")).mappings().all(),
    }


@router.get("/modules/{kode}/comparison")
def module_comparison(kode: str, tahun: int | None = None, db=Depends(get_db)):
    return db.execute(text("""
        SELECT v.id AS variabel_id, v.kode AS kode_variabel, v.nama AS nama_variabel,
               v.satuan, w.id AS wilayah_id, w.kode_wilayah AS kode_kabupaten,
               w.nama_wilayah, p.id AS periode_id, p.tahun, p.nomor_periode,
               p.jenis_periode, p.periode_label,
               SUM(CASE WHEN x.sumber='bps' THEN x.nilai END) AS nilai_bps,
               SUM(CASE WHEN x.sumber='dinas' THEN x.nilai END) AS nilai_dinas,
               MAX(CASE WHEN x.sumber='dinas' THEN x.justifikasi END) AS narasi_dinas,
               MAX(CASE WHEN x.sumber='dinas' THEN x.status_verifikasi END) AS status_verifikasi,
               MAX(CASE WHEN x.sumber='dinas' THEN x.id END) AS dinas_id
        FROM (
            SELECT variabel_id, periode_id, wilayah_id, nilai, 'bps' AS sumber,
                   NULL AS justifikasi, NULL AS status_verifikasi, id
            FROM data_bps
            UNION ALL
            SELECT variabel_id, periode_id, wilayah_id, nilai, 'dinas' AS sumber,
                   justifikasi, status_verifikasi, id
            FROM data_dinas
        ) x
        JOIN master_modul m ON m.kode=:kode AND m.is_active=1
        JOIN master_variabel v ON v.id=x.variabel_id AND v.modul_id=m.id AND v.is_active=1
        JOIN master_periode p ON p.id=x.periode_id AND p.is_active=1
        JOIN master_wilayah w ON w.id=x.wilayah_id AND w.level_wilayah IN ('kabkot','provinsi')
        WHERE (:tahun IS NULL OR p.tahun = :tahun)
        GROUP BY v.id, v.kode, v.nama, v.satuan, w.id, w.kode_wilayah,
                 w.nama_wilayah, p.id, p.tahun, p.nomor_periode,
                 p.jenis_periode, p.periode_label
        ORDER BY p.tahun DESC, p.id DESC, w.id, v.id
    """), {"kode": kode, "tahun": tahun}).mappings().all()


@router.post("/dinas")
def save_dinas(payload: DinasValue, db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Operator", "Admin Wilayah", "Super Admin"])
    instansi_id = db.execute(text("SELECT id FROM master_instansi WHERE id=:id AND jenis_instansi='dinas' AND is_active=1"), {"id": user.get("instansi_id")}).scalar() if user.get("instansi_id") else None
    if not instansi_id:
        instansi_id = db.execute(text("SELECT id FROM master_instansi WHERE jenis_instansi='dinas' AND wilayah_id=:w AND is_active=1 LIMIT 1"), {"w": payload.wilayah_id}).scalar()
    if not instansi_id:
        raise HTTPException(400, "Instansi Dinas untuk wilayah ini belum tersedia")
    params = {"v": payload.variabel_id, "i": instansi_id, "w": payload.wilayah_id,
              "p": payload.periode_id, "n": payload.nilai, "j": payload.justifikasi, "u": user["id"]}
    existing = db.execute(text("SELECT id FROM data_dinas WHERE variabel_id=:v AND wilayah_id=:w AND periode_id=:p LIMIT 1"), params).scalar()
    if existing:
        db.execute(text("UPDATE data_dinas SET nilai=:n, justifikasi=:j, updated_by=:u, updated_at=NOW() WHERE id=:id"), {**params, "id": existing})
    else:
        db.execute(text("""
            INSERT INTO data_dinas (variabel_id, instansi_id, wilayah_id, periode_id, nilai,
                justifikasi, created_by, updated_by, created_at)
            VALUES (:v, :i, :w, :p, :n, :j, :u, :u, NOW())
        """), params)
    db.commit()
    return {"status": "saved"}


@router.post("/luar-lbs")
def save_luar_lbs(payload: LuarLbsValue, db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Operator", "Admin Wilayah", "Super Admin"])
    instansi_id = db.execute(text("SELECT id FROM master_instansi WHERE id=:id AND jenis_instansi='dinas' AND is_active=1"), {"id": user.get("instansi_id")}).scalar() if user.get("instansi_id") else None
    if not instansi_id:
        instansi_id = db.execute(text("SELECT id FROM master_instansi WHERE jenis_instansi='dinas' AND wilayah_id=:w AND is_active=1 LIMIT 1"), {"w": payload.wilayah_id}).scalar()
    if not instansi_id:
        raise HTTPException(400, "Instansi Dinas untuk wilayah ini belum tersedia")
    params = {"v":payload.variabel_id,"i":instansi_id,"w":payload.wilayah_id,"p":payload.periode_id,
        "n":payload.nilai,"k":payload.nama_kelompok,"lat":payload.latitude,"lng":payload.longitude,
        "foto":payload.foto_fase,"polygon":payload.foto_polygon,"u":user["id"]}
    existing = db.execute(text("SELECT id FROM data_dinas WHERE variabel_id=:v AND wilayah_id=:w AND periode_id=:p LIMIT 1"), params).scalar()
    if existing:
        db.execute(text("""UPDATE data_dinas SET nilai=:n, nama_kelompok=:k, latitude=:lat,
            longitude=:lng, foto_fase=:foto, foto_polygon=:polygon, updated_by=:u,
            updated_at=NOW() WHERE id=:id"""), {**params,"id":existing})
    else:
        db.execute(text("""
            INSERT INTO data_dinas (variabel_id, instansi_id, wilayah_id, periode_id, nilai,
                nama_kelompok, latitude, longitude, foto_fase, foto_polygon,
                created_by, updated_by, created_at)
            VALUES (:v,:i,:w,:p,:n,:k,:lat,:lng,:foto,:polygon,:u,:u,NOW())
        """), params)
    db.commit()
    return {"status":"saved"}


@router.get("/modules/{kode}/luar-lbs")
def luar_lbs(kode: str, tahun: int | None = None, db=Depends(get_db)):
    return db.execute(text("""
        SELECT d.id, w.nama_wilayah, w.kode_wilayah, w.parent_id,
               parent.nama_wilayah AS kecamatan, d.nilai AS nilai_dinas,
               d.nama_kelompok AS kelompok, d.latitude, d.longitude,
               p.periode_label, p.tahun, d.foto_fase, d.foto_polygon AS polygon
        FROM data_dinas d JOIN master_variabel v ON v.id=d.variabel_id
        JOIN master_modul m ON m.id=v.modul_id
        JOIN master_wilayah w ON w.id=d.wilayah_id
        LEFT JOIN master_wilayah parent ON parent.id=w.parent_id
        JOIN master_periode p ON p.id=d.periode_id
        WHERE m.kode=:kode AND v.kode IN ('LT_LLBS','L_LBS')
          AND (:tahun IS NULL OR p.tahun=:tahun)
        ORDER BY p.tahun DESC, p.id DESC, w.nama_wilayah
    """), {"kode": kode, "tahun": tahun}).mappings().all()


class UserCreate(BaseModel):
    nama: str
    email: str
    password: str
    role_id: int

@router.post("/users/create")
def create_user(payload: UserCreate, db=Depends(get_db)):

    hashed = hash_password(payload.password)

    db.execute(text("""
        INSERT INTO users (nama, email, password_hash, role_id, is_active)
        VALUES (:nama, :email, :password, :role_id, 1)
    """), {
        "nama": payload.nama,
        "email": payload.email,
        "password": hashed,
        "role_id": payload.role_id
    })

    db.commit()

    return {"message": "User created"}


@router.get("/dashboard/cards")
def cards(tahun: int, db=Depends(get_db)):

    sql = text("""
        SELECT
            v.id,
            v.nama,
            v.kode,
            v.satuan,
            pb.periode_label,
            bps.total_bps,
            dinas.total_dinas
        FROM master_variabel v

        LEFT JOIN (
            SELECT
                b1.variabel_id,
                b1.periode_id,
                SUM(b1.nilai) AS total_bps
            FROM data_bps b1
            WHERE b1.periode_id = (
                SELECT MAX(b2.periode_id)
                FROM data_bps b2
                JOIN master_periode mp2
                    ON mp2.id = b2.periode_id
                WHERE b2.variabel_id = b1.variabel_id
                AND mp2.tahun = :tahun
            )
            GROUP BY b1.variabel_id, b1.periode_id
        ) bps
        ON bps.variabel_id = v.id

        LEFT JOIN master_periode pb
        ON pb.id = bps.periode_id

        LEFT JOIN (
            SELECT
                d1.variabel_id,
                d1.periode_id,
                SUM(d1.nilai) AS total_dinas
            FROM data_dinas d1
            WHERE d1.periode_id = (
                SELECT MAX(d2.periode_id)
                FROM data_dinas d2
                JOIN master_periode mp2
                    ON mp2.id = d2.periode_id
                WHERE d2.variabel_id = d1.variabel_id
                AND mp2.tahun = :tahun
            )
            GROUP BY d1.variabel_id, d1.periode_id
        ) dinas
        ON dinas.variabel_id = v.id

        ORDER BY v.id;
    """)

    rows = db.execute(sql, {"tahun": tahun}).mappings().all()

    # gap dihitung di backend response
    return [
        {
            **r,
            "gap": (r["total_bps"] or 0) - (r["total_dinas"] or 0)
        }
        for r in rows
    ]

@router.get("/dashboard/chart")
def chart(
    wilayah_id: int,
    tahun: int,
    variabel_id: int,
    db=Depends(get_db)
):

    sql = textsql = text("""
        SELECT
            p.tahun,
            p.nomor_periode,
            p.periode_label,
            COALESCE(SUM(bps.nilai),0) AS bps,
            COALESCE(SUM(dinas.nilai),0) AS dinas
        FROM master_periode p

        LEFT JOIN data_bps bps
            ON bps.periode_id = p.id
        AND bps.wilayah_id = :wilayah
        AND bps.variabel_id = :variabel

        LEFT JOIN data_dinas dinas
            ON dinas.periode_id = p.id
        AND dinas.wilayah_id = :wilayah
        AND dinas.variabel_id = :variabel

        WHERE p.tahun = :tahun
        AND p.jenis_periode = 'bulanan'

        GROUP BY
            p.id,
            p.tahun,
            p.nomor_periode,
            p.periode_label

        ORDER BY p.nomor_periode
    """)

    rows = db.execute(sql, {
        "tahun": tahun,
        "wilayah": wilayah_id,
        "variabel": variabel_id
    }).mappings().all()

    # =========================
    # LINE CHART (bulanan)
    # =========================
    line = {
        "x": [r["periode_label"] for r in rows],
        "bps": [r["bps"] for r in rows],
        "dinas": [r["dinas"] for r in rows],
    }

    # =========================
    # BAR CHART (4 bulanan)
    # =========================
    group = defaultdict(lambda: {"bps": 0, "dinas": 0})

    for r in rows:

        nomor = r["nomor_periode"]

        if 1 <= nomor <= 4:
            key = "Caturwulan I"
        elif 5 <= nomor <= 8:
            key = "Caturwulan II"
        else:
            key = "Caturwulan III"

        group[key]["bps"] += r["bps"]
        group[key]["dinas"] += r["dinas"]

    bar = {
        "categories": list(group.keys()),
        "bps": [group[k]["bps"] for k in group],
        "dinas": [group[k]["dinas"] for k in group],
    }

    return {
        "line": line,
        "bar": bar
    }

@router.get("/recon")
def recon(variabel_id: int, periode_id: int, db=Depends(get_db)):

    sql = text("""
        SELECT
            w.nama_wilayah,
            bps.nilai AS bps,
            COALESCE(dinas.nilai,0) AS dinas
        FROM data_bps bps

        LEFT JOIN data_dinas dinas
            ON bps.variabel_id = dinas.variabel_id
        AND bps.periode_id = dinas.periode_id
        AND bps.wilayah_id = dinas.wilayah_id

        LEFT JOIN master_wilayah w
            ON w.id = bps.wilayah_id

        WHERE bps.variabel_id = :v
        AND bps.periode_id = :p
    """)

    rows = db.execute(sql, {
        "v": variabel_id,
        "p": periode_id
    }).mappings().all()

    return [
        {
            **r,
            "gap": (r["bps"] or 0) - (r["dinas"] or 0)
        }
        for r in rows
    ]


@router.post("/import")
def import_data(
    sumber: str = Form(...),
    variabel_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    sumber = sumber.lower()
    if sumber not in ["bps", "dinas"]:
        raise HTTPException(400, "sumber harus bps/dinas")
    
    require_roles(user, ["Operator", "Super Admin"])

    if not file.filename.endswith((".xls", ".xlsx")):
        raise HTTPException(400, "File harus Excel")

    df = pd.read_excel(io.BytesIO(file.file.read()))

    wil = db.execute(text("SELECT id, nama_wilayah FROM master_wilayah")).fetchall()
    map_wil = {w.nama_wilayah.upper(): w.id for w in wil}

    per = db.execute(text("SELECT id, nomor_periode, tahun FROM master_periode")).fetchall()
    map_per = {(p.tahun, p.nomor_periode): p.id for p in per}
    count = 0

    for row in df.to_dict("records"):

        loc = str(
            row.get("Desa") or 
            row.get("Kota/Kabupaten") or 
            row.get("Kecamatan") or ""
        ).upper()

        w_id = map_wil.get(loc) or user.get("wilayah_id") or db.execute(
            text("SELECT id FROM master_wilayah WHERE level_wilayah='provinsi' LIMIT 1")
        ).scalar()

        dt = pd.to_datetime(row.get("Tgl Tanam"), errors="coerce")
        if pd.isna(dt):
            continue

        p_id = map_per.get((dt.year, dt.month))
        if not p_id:
            continue

        if sumber == "dinas":
            sql = text("""
                INSERT INTO data_dinas
                (variabel_id, periode_id, instansi_id, wilayah_id, nilai,
                 latitude, longitude, nama_kelompok, created_by, updated_by, created_at)
                VALUES (:v,:p,:i,:w,:n,:lat,:lng,:kel,:cb,:ub,NOW())
                ON DUPLICATE KEY UPDATE
                    nilai = VALUES(nilai),
                    latitude = VALUES(latitude),
                    longitude = VALUES(longitude),
                    nama_kelompok = VALUES(nama_kelompok),
                    updated_at = NOW()
            """)

            params = {
                "v": variabel_id,
                "p": p_id,
                "i": user.get("instansi_id") or db.execute(text("SELECT id FROM master_instansi WHERE jenis_instansi='dinas' AND wilayah_id=:w AND is_active=1 LIMIT 1"), {"w": w_id}).scalar(),
                "w": w_id,
                "n": float(row.get("Luas") or 0),
                "lat": float(row.get("Lat") or 0),
                "lng": float(row.get("Lng") or 0),
                "kel": str(row.get("Nama Kelompok") or ""),
                "cb": user["id"],
                "ub": user["id"]
            }

        else:
            sql = text("""
                INSERT INTO data_bps
                (variabel_id, instansi_id, periode_id, wilayah_id, nilai, created_by, updated_by, created_at)
                VALUES (:v,:i,:p,:w,:n,:cb,:ub,NOW())
                ON DUPLICATE KEY UPDATE
                    nilai = VALUES(nilai),
                    updated_at = NOW()
            """)

            params = {
                "v": variabel_id,
                "i": user.get("instansi_id") or db.execute(text("SELECT id FROM master_instansi WHERE jenis_instansi='bps' AND wilayah_id=:w LIMIT 1"), {"w": w_id}).scalar(),
                "p": p_id,
                "w": w_id,
                "n": float(row.get("Nilai BPS") or 0),
                "cb": user["id"],
                "ub": user["id"]
            }

        db.execute(sql, params)
        count += 1

    db.commit()

    return {"message": f"Berhasil import {count} data"}



@router.patch("/edit/{jenis}/{id}")
def edit(sumber: str, id: int, nilai: float, db=Depends(get_db), user=Depends(get_current_user)):

    require_roles(user, ["Operator", "Admin Wilayah", "Super Admin"])

    if sumber not in ["bps", "dinas"]:
        raise HTTPException(400, "sumber harus bps/dinas")
    table = "data_bps" if sumber == "bps" else "data_dinas"

    db.execute(text(f"""
        UPDATE {table}
        SET nilai = :n, updated_at = NOW()
        WHERE id = :id
    """), {"n": nilai, "id": id})

    db.commit()

    return {"status": "updated"}
