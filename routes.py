from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Body
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
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
        SELECT u.*, r.nama_role, i.jenis_instansi
        FROM users u JOIN master_role r ON r.id = u.role_id
        LEFT JOIN master_instansi i ON i.id = u.instansi_id
        WHERE u.email = :email
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
        "user": {
            "id": user["id"], "nama": user["nama"], "email": user["email"],
            "role": user["nama_role"], "role_id": user["role_id"],
            "instansi_id": user.get("instansi_id"), "wilayah_id": user.get("wilayah_id"),
            "jenis_instansi": user.get("jenis_instansi"),
        }
    }


@router.get("/auth/me")
def current_user(user=Depends(get_current_user)):
    return {
        "id": user["id"], "nama": user["nama"], "email": user["email"],
        "role": user["nama_role"], "role_id": user["role_id"],
        "instansi_id": user.get("instansi_id"), "wilayah_id": user.get("wilayah_id"),
        "jenis_instansi": user.get("jenis_instansi"),
    }


@router.get("/modules")
def list_modules(db=Depends(get_db), user=Depends(get_current_user)):
    return db.execute(text("""
        SELECT m.id, m.kode, m.nama, m.deskripsi, m.indikator_id,
               i.kode AS kode_indikator, i.nama AS nama_indikator
        FROM master_modul m JOIN master_indikator i ON i.id = m.indikator_id
        WHERE m.is_active = 1 AND i.is_active = 1 ORDER BY m.id
    """)).mappings().all()


@router.get("/modules/{kode}/variables")
def module_variables(kode: str, db=Depends(get_db), user=Depends(get_current_user)):
    rows = db.execute(text("""
        SELECT v.id, v.modul_id, v.kode, v.nama, v.satuan, v.deskripsi
        FROM master_variabel v JOIN master_modul m ON m.id = v.modul_id
        WHERE m.kode = :kode AND m.is_active = 1 AND v.is_active = 1 ORDER BY v.id
    """), {"kode": kode}).mappings().all()
    return rows


@router.get("/modules/{kode}/dashboard")
def module_dashboard(kode: str, tahun: int | None = None, wilayah_id: int | None = None, db=Depends(get_db), user=Depends(get_current_user)):
    return db.execute(text("""
        WITH bps_aggregate AS (
            SELECT b.variabel_id,b.periode_id,SUM(b.nilai) AS total_bps
            FROM data_bps b
            JOIN master_wilayah wb ON wb.id=b.wilayah_id
            WHERE wb.level_wilayah='kabkot'
              AND (:wilayah_id IS NULL
                   OR :wilayah_id=(SELECT id FROM master_wilayah WHERE level_wilayah='provinsi' LIMIT 1)
                   OR b.wilayah_id=:wilayah_id)
            GROUP BY b.variabel_id,b.periode_id
        ), dinas_aggregate AS (
            SELECT d.variabel_id,d.periode_id,SUM(d.nilai) AS total_dinas
            FROM data_dinas d
            JOIN master_variabel vd ON vd.id=d.variabel_id
            JOIN master_wilayah wd ON wd.id=d.wilayah_id
            LEFT JOIN master_wilayah kecamatan ON kecamatan.id=wd.parent_id
            LEFT JOIN master_wilayah kabkot ON kabkot.id=kecamatan.parent_id
            WHERE (
                wd.level_wilayah='kabkot'
                OR (vd.kode='LT_LLBS' AND wd.level_wilayah='deskel')
            )
              AND (:wilayah_id IS NULL
                   OR :wilayah_id=(SELECT id FROM master_wilayah WHERE level_wilayah='provinsi' LIMIT 1)
                   OR wd.id=:wilayah_id
                   OR (vd.kode='LT_LLBS' AND wd.level_wilayah='deskel' AND kabkot.id=:wilayah_id))
            GROUP BY d.variabel_id,d.periode_id
        )
        SELECT v.id AS variabel_id,v.kode,v.nama,v.satuan,
               p.id AS periode_id,p.tahun,p.jenis_periode,p.nomor_periode,p.periode_label,
               COALESCE(b.total_bps,0) AS total_bps,
               COALESCE(d.total_dinas,0) AS total_dinas
        FROM master_modul m JOIN master_variabel v ON v.modul_id=m.id
        JOIN master_periode p ON p.is_active=1
        LEFT JOIN bps_aggregate b ON b.variabel_id=v.id AND b.periode_id=p.id
        LEFT JOIN dinas_aggregate d ON d.variabel_id=v.id AND d.periode_id=p.id
        WHERE m.kode=:kode AND m.is_active=1 AND v.is_active=1
            AND (:tahun IS NULL OR p.tahun=:tahun) AND (b.total_bps IS NOT NULL OR d.total_dinas IS NOT NULL)
        ORDER BY p.tahun DESC,p.id DESC,v.id
    """), {"kode": kode, "tahun": tahun, "wilayah_id": wilayah_id}).mappings().all()


@router.get("/lookups")
def lookups(db=Depends(get_db), user=Depends(get_current_user)):
    return {
        "wilayahs": db.execute(text("SELECT id, kode_wilayah, nama_wilayah, level_wilayah, parent_id FROM master_wilayah ORDER BY id")).mappings().all(),
        "periodes": db.execute(text("SELECT id, tahun, jenis_periode, nomor_periode, periode_label FROM master_periode WHERE is_active = 1 ORDER BY tahun, id")).mappings().all(),
    }


@router.get("/modules/{kode}/comparison")
def module_comparison(kode: str, tahun: int | None = None, db=Depends(get_db), user=Depends(get_current_user)):
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
def luar_lbs(kode: str, tahun: int | None = None, db=Depends(get_db), user=Depends(get_current_user)):
    return db.execute(text("""
        SELECT d.id, w.nama_wilayah AS wilayah_name, w.nama_wilayah, w.kode_wilayah, w.parent_id,
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
def create_user(payload: UserCreate, db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin"])

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


class AdminUserCreate(BaseModel):
    nama: str
    email: str
    password: str
    role_id: int
    instansi_id: int | None = None
    wilayah_id: int | None = None


class AdminUserUpdate(BaseModel):
    nama: str
    email: str
    role_id: int
    instansi_id: int | None = None
    wilayah_id: int | None = None
    password: str | None = None


MASTER_CONFIG = {
    "indikator": {
        "table": "master_indikator",
        "fields": ("kode", "nama", "deskripsi", "is_active"),
        "required": ("kode", "nama", "deskripsi"), "active": True,
    },
    "instansi": {
        "table": "master_instansi",
        "fields": ("kode_instansi", "nama_instansi", "jenis_instansi", "wilayah_id", "is_active"),
        "required": ("kode_instansi", "nama_instansi", "jenis_instansi", "wilayah_id"), "active": True,
    },
    "modul": {
        "table": "master_modul",
        "fields": ("indikator_id", "kode", "nama", "deskripsi", "is_active"),
        "required": ("indikator_id", "kode", "nama", "deskripsi"), "active": True,
    },
    "variabel": {
        "table": "master_variabel",
        "fields": ("modul_id", "kode", "nama", "satuan", "deskripsi", "is_active"),
        "required": ("modul_id", "kode", "nama"), "active": True,
    },
    "wilayah": {
        "table": "master_wilayah",
        "fields": ("kode_wilayah", "nama_wilayah", "level_wilayah", "parent_id"),
        "required": ("kode_wilayah", "nama_wilayah", "level_wilayah"), "active": False,
    },
}


def get_admin_wilayah_scope(user, db):
    instansi_id = user.get("instansi_id")
    if not instansi_id:
        raise HTTPException(403, "Akun Admin Wilayah belum terhubung ke instansi.")
    instansi = db.execute(text("SELECT wilayah_id, is_active FROM master_instansi WHERE id=:id"), {"id": instansi_id}).mappings().first()
    if not instansi or not instansi["is_active"]:
        raise HTTPException(403, "Instansi Admin Wilayah tidak aktif.")
    wilayah_id = user.get("wilayah_id") or instansi["wilayah_id"]
    operator_role_id = db.execute(text("SELECT id FROM master_role WHERE nama_role='Operator' AND is_active=1 LIMIT 1")).scalar()
    if not wilayah_id or not operator_role_id:
        raise HTTPException(403, "Instansi, wilayah, atau role Operator belum dikonfigurasi.")
    return {"instansi_id": instansi_id, "wilayah_id": wilayah_id, "operator_role_id": operator_role_id}


@router.get("/admin/options")
def admin_options(db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin", "Admin Wilayah"])
    if user["nama_role"] == "Admin Wilayah":
        scope = get_admin_wilayah_scope(user, db)
        return {
            "roles": db.execute(text("SELECT id, nama_role FROM master_role WHERE is_active=1 AND id=:id"), {"id": scope["operator_role_id"]}).mappings().all(),
            "instansi": db.execute(text("SELECT id, kode_instansi, nama_instansi FROM master_instansi WHERE id=:id"), {"id": scope["instansi_id"]}).mappings().all(),
            "wilayah": db.execute(text("SELECT id, kode_wilayah, nama_wilayah, level_wilayah, parent_id FROM master_wilayah WHERE id=:id"), {"id": scope["wilayah_id"]}).mappings().all(),
        }
    return {
        "roles": db.execute(text("SELECT id, nama_role FROM master_role WHERE is_active=1 AND nama_role IN ('Super Admin','Admin Wilayah','Operator') ORDER BY level_akses")).mappings().all(),
        "instansi": db.execute(text("SELECT id, kode_instansi, nama_instansi FROM master_instansi WHERE is_active=1 ORDER BY nama_instansi")).mappings().all(),
        "wilayah": db.execute(text("SELECT id, kode_wilayah, nama_wilayah, level_wilayah, parent_id FROM master_wilayah ORDER BY nama_wilayah")).mappings().all(),
    }


@router.get("/admin/users")
def admin_users(db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin", "Admin Wilayah"])
    scope = get_admin_wilayah_scope(user, db) if user["nama_role"] == "Admin Wilayah" else None
    return db.execute(text("""
        SELECT u.id, u.nama, u.email, u.role_id, r.nama_role AS role,
               u.instansi_id, i.nama_instansi, u.wilayah_id, w.nama_wilayah,
               u.is_active, u.last_login, u.created_at
        FROM users u JOIN master_role r ON r.id=u.role_id
        LEFT JOIN master_instansi i ON i.id=u.instansi_id
        LEFT JOIN master_wilayah w ON w.id=u.wilayah_id
        WHERE (:role_id IS NULL OR u.role_id=:role_id)
          AND (:instansi_id IS NULL OR u.instansi_id=:instansi_id)
          AND (:wilayah_id IS NULL OR u.wilayah_id=:wilayah_id)
        ORDER BY u.nama, u.id
    """), {
        "role_id": scope["operator_role_id"] if scope else None,
        "instansi_id": scope["instansi_id"] if scope else None,
        "wilayah_id": scope["wilayah_id"] if scope else None,
    }).mappings().all()


@router.post("/admin/users", status_code=201)
def admin_create_user(payload: AdminUserCreate, db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin", "Admin Wilayah"])
    if len(payload.password) < 8:
        raise HTTPException(422, "Password minimal 8 karakter.")
    scope = get_admin_wilayah_scope(user, db) if user["nama_role"] == "Admin Wilayah" else None
    if scope and payload.role_id != scope["operator_role_id"]:
        raise HTTPException(403, "Admin Wilayah hanya dapat menambahkan Operator.")
    role_id = scope["operator_role_id"] if scope else payload.role_id
    instansi_id = scope["instansi_id"] if scope else payload.instansi_id
    wilayah_id = scope["wilayah_id"] if scope else payload.wilayah_id
    role = db.execute(text("SELECT id FROM master_role WHERE id=:id AND is_active=1 AND nama_role IN ('Super Admin','Admin Wilayah','Operator')"), {"id": role_id}).scalar()
    if not role:
        raise HTTPException(400, "Role tidak valid.")
    try:
        result = db.execute(text("""
            INSERT INTO users (nama,email,password_hash,role_id,instansi_id,wilayah_id,created_by,is_active)
            VALUES (:nama,:email,:password,:role_id,:instansi_id,:wilayah_id,:created_by,1)
        """), {
            "nama": payload.nama.strip(), "email": payload.email.strip().lower(),
            "password": hash_password(payload.password), "role_id": role_id,
            "instansi_id": instansi_id, "wilayah_id": wilayah_id,
            "created_by": user["id"],
        })
        db.commit()
        return {"id": result.lastrowid, "message": "Pengguna berhasil ditambahkan."}
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(409, "Email sudah digunakan atau relasi instansi/wilayah tidak valid.") from error


@router.put("/admin/users/{user_id}")
def admin_update_user(user_id: int, payload: AdminUserUpdate, db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin", "Admin Wilayah"])
    if payload.password is not None and payload.password and len(payload.password) < 8:
        raise HTTPException(422, "Password minimal 8 karakter.")
    scope = get_admin_wilayah_scope(user, db) if user["nama_role"] == "Admin Wilayah" else None
    if scope and payload.role_id != scope["operator_role_id"]:
        raise HTTPException(403, "Admin Wilayah hanya dapat mengelola Operator.")
    role_id = scope["operator_role_id"] if scope else payload.role_id
    role = db.execute(text("SELECT id FROM master_role WHERE id=:id AND is_active=1 AND nama_role IN ('Super Admin','Admin Wilayah','Operator')"), {"id": role_id}).scalar()
    if not role:
        raise HTTPException(400, "Role tidak valid.")
    target = db.execute(text("SELECT id, role_id, instansi_id, wilayah_id FROM users WHERE id=:id"), {"id": user_id}).mappings().first()
    if not target:
        raise HTTPException(404, "Pengguna tidak ditemukan.")
    if scope and (target["role_id"] != scope["operator_role_id"] or target["instansi_id"] != scope["instansi_id"] or target["wilayah_id"] != scope["wilayah_id"]):
        raise HTTPException(404, "Operator tidak ditemukan pada wilayah dan instansi Anda.")
    if target["id"] == user["id"] and role_id != target["role_id"]:
        raise HTTPException(400, "Role akun yang sedang digunakan tidak dapat diubah.")
    params = {
        "id": user_id, "nama": payload.nama.strip(), "email": payload.email.strip().lower(),
        "role_id": role_id,
        "instansi_id": scope["instansi_id"] if scope else payload.instansi_id,
        "wilayah_id": scope["wilayah_id"] if scope else payload.wilayah_id,
    }
    password_sql = ""
    if payload.password:
        password_sql = ", password_hash=:password"
        params["password"] = hash_password(payload.password)
    try:
        db.execute(text(f"UPDATE users SET nama=:nama,email=:email,role_id=:role_id,instansi_id=:instansi_id,wilayah_id=:wilayah_id{password_sql} WHERE id=:id"), params)
        db.commit()
        return {"message": "Pengguna berhasil diperbarui."}
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(409, "Email sudah digunakan atau relasi instansi/wilayah tidak valid.") from error


@router.patch("/admin/users/{user_id}/active")
def admin_set_user_active(user_id: int, is_active: bool = Body(..., embed=True), db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin", "Admin Wilayah"])
    scope = get_admin_wilayah_scope(user, db) if user["nama_role"] == "Admin Wilayah" else None
    target = db.execute(text("SELECT id, role_id, instansi_id, wilayah_id, is_active FROM users WHERE id=:id"), {"id": user_id}).mappings().first()
    if not target:
        raise HTTPException(404, "Pengguna tidak ditemukan.")
    if scope and (target["role_id"] != scope["operator_role_id"] or target["instansi_id"] != scope["instansi_id"] or target["wilayah_id"] != scope["wilayah_id"]):
        raise HTTPException(404, "Operator tidak ditemukan pada wilayah dan instansi Anda.")
    if target["id"] == user["id"] and not is_active:
        raise HTTPException(400, "Akun yang sedang digunakan tidak dapat dinonaktifkan.")
    if target["role_id"] == user["role_id"] and not is_active:
        super_admin_count = db.execute(text("SELECT COUNT(*) FROM users WHERE role_id=:role_id AND is_active=1"), {"role_id": target["role_id"]}).scalar()
        if super_admin_count <= 1:
            raise HTTPException(400, "Super Admin aktif terakhir tidak dapat dinonaktifkan.")
    db.execute(text("UPDATE users SET is_active=:active WHERE id=:id"), {"active": int(is_active), "id": user_id})
    db.commit()
    return {"message": "Status pengguna diperbarui."}


@router.get("/admin/masters/{master_name}")
def admin_list_master(master_name: str, db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin"])
    config = MASTER_CONFIG.get(master_name)
    if not config:
        raise HTTPException(404, "Master tidak ditemukan.")
    return db.execute(text(f"SELECT * FROM {config['table']} ORDER BY id DESC")).mappings().all()


@router.post("/admin/masters/{master_name}", status_code=201)
def admin_create_master(master_name: str, payload: dict = Body(...), db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin"])
    config = MASTER_CONFIG.get(master_name)
    if not config:
        raise HTTPException(404, "Master tidak ditemukan.")
    fields = [field for field in config["fields"] if field in payload]
    missing = [field for field in config["required"] if field not in payload or payload[field] in (None, "")]
    if missing:
        raise HTTPException(422, f"Kolom wajib diisi: {', '.join(missing)}")
    params = {field: payload[field] for field in fields}
    columns = ",".join(fields)
    values = ",".join(f":{field}" for field in fields)
    if master_name in ("indikator", "modul"):
        columns += ",created_at"
        values += ",NOW()"
    try:
        result = db.execute(text(f"INSERT INTO {config['table']} ({columns}) VALUES ({values})"), params)
        db.commit()
        return {"id": result.lastrowid, "message": "Master berhasil ditambahkan."}
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(409, "Kode sudah digunakan atau relasi induk tidak valid.") from error


@router.put("/admin/masters/{master_name}/{record_id}")
def admin_update_master(master_name: str, record_id: int, payload: dict = Body(...), db=Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["Super Admin"])
    config = MASTER_CONFIG.get(master_name)
    if not config:
        raise HTTPException(404, "Master tidak ditemukan.")
    fields = [field for field in config["fields"] if field in payload]
    if not fields:
        raise HTTPException(422, "Tidak ada kolom yang diperbarui.")
    params = {field: payload[field] for field in fields}
    params["id"] = record_id
    updates = ",".join(f"{field}=:{field}" for field in fields)
    try:
        result = db.execute(text(f"UPDATE {config['table']} SET {updates} WHERE id=:id"), params)
        if result.rowcount == 0:
            exists = db.execute(text(f"SELECT id FROM {config['table']} WHERE id=:id"), {"id": record_id}).scalar()
            if not exists:
                raise HTTPException(404, "Data master tidak ditemukan.")
        db.commit()
        return {"message": "Master berhasil diperbarui."}
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(409, "Kode sudah digunakan atau relasi induk tidak valid.") from error


@router.get("/dashboard/cards")
def cards(tahun: int, db=Depends(get_db), user=Depends(get_current_user)):

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
    db=Depends(get_db),
    user=Depends(get_current_user),
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
def recon(variabel_id: int, periode_id: int, db=Depends(get_db), user=Depends(get_current_user)):

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
    require_roles(user, ["Operator", "Super Admin"])
    requested_source = (sumber or "").lower()
    if requested_source not in ["bps", "dinas"]:
        raise HTTPException(400, "sumber harus bps/dinas")
    if not file.filename or not file.filename.lower().endswith((".xls", ".xlsx")):
        raise HTTPException(400, "File harus Excel")

    instance = None
    if user.get("instansi_id"):
        instance = db.execute(text("SELECT id,jenis_instansi,wilayah_id,is_active FROM master_instansi WHERE id=:id"), {"id": user["instansi_id"]}).mappings().first()
    if user["nama_role"] == "Operator":
        if not instance or not instance["is_active"]:
            raise HTTPException(403, "Akun Operator harus terhubung ke instansi aktif.")
        sumber = "bps" if instance["jenis_instansi"] == "bps" else "dinas"
        wilayah_scope = user.get("wilayah_id") or instance["wilayah_id"]
    else:
        sumber = requested_source
        wilayah_scope = user.get("wilayah_id") or (instance["wilayah_id"] if instance else None)

    variable = db.execute(text("SELECT id FROM master_variabel WHERE id=:id AND is_active=1"), {"id": variabel_id}).scalar()
    if not variable:
        raise HTTPException(400, "Variabel tidak ditemukan atau tidak aktif.")

    if instance and instance["is_active"] and user["nama_role"] == "Operator":
        instansi_id = instance["id"]
    else:
        instansi_id = instance["id"] if instance and instance["is_active"] and instance["jenis_instansi"] == sumber else None

    df = pd.read_excel(io.BytesIO(file.file.read()))
    if df.empty:
        raise HTTPException(400, "File Excel tidak berisi data.")

    regions = db.execute(text("SELECT id,kode_wilayah,nama_wilayah,parent_id FROM master_wilayah")).mappings().all()
    by_code = {str(region["kode_wilayah"]).strip().upper(): region for region in regions}
    by_name = defaultdict(list)
    parent_by_id = {}
    for region in regions:
        by_name[region["nama_wilayah"].strip().upper()].append(region)
        parent_by_id[region["id"]] = region["parent_id"]
    periods = db.execute(text("SELECT id,nomor_periode,tahun FROM master_periode WHERE jenis_periode='bulanan' AND is_active=1")).mappings().all()
    period_map = {(int(period["tahun"]), int(period["nomor_periode"])): period["id"] for period in periods}

    def row_value(row, *keys):
        for key in keys:
            value = row.get(key)
            if value is not None and not pd.isna(value) and str(value).strip():
                return value
        return None

    def is_in_scope(region_id):
        if not wilayah_scope:
            return True
        current = region_id
        while current is not None:
            if int(current) == int(wilayah_scope):
                return True
            current = parent_by_id.get(current)
        return False

    count = 0
    skipped = 0
    for row in df.to_dict("records"):
        raw_location = row_value(row, "Kode Wilayah", "Kode Kabupaten", "Kode Desa", "Kode Kecamatan", "Wilayah ID", "Desa", "Kota/Kabupaten", "Kecamatan", "Wilayah")
        region = None
        if raw_location is not None:
            location = str(raw_location).strip().upper()
            if location.endswith(".0"):
                location = location[:-2]
            region = by_code.get(location)
            if region is None:
                matches = by_name.get(location, [])
                if len(matches) == 1:
                    region = matches[0]
                elif wilayah_scope:
                    region = next((match for match in matches if is_in_scope(match["id"])), None)
            if region is None:
                skipped += 1
                continue
        if region is None and wilayah_scope:
            region_id = wilayah_scope
        elif region is not None:
            region_id = region["id"]
        else:
            region_id = db.execute(text("SELECT id FROM master_wilayah WHERE level_wilayah='provinsi' LIMIT 1")).scalar()
        if not region_id or not is_in_scope(region_id):
            skipped += 1
            continue

        raw_date = row_value(row, "Tanggal", "Tgl Tanam", "Tanggal Data", "Periode")
        dt = pd.to_datetime(raw_date, errors="coerce") if raw_date is not None else pd.NaT
        if pd.isna(dt):
            year = pd.to_numeric(row_value(row, "Tahun", "tahun"), errors="coerce")
            month = pd.to_numeric(row_value(row, "Bulan", "bulan", "Nomor Periode"), errors="coerce")
            if pd.isna(year) or pd.isna(month):
                skipped += 1
                continue
            year, month = int(year), int(month)
        else:
            year, month = int(dt.year), int(dt.month)
        period_id = period_map.get((year, month))
        value_keys = ("Nilai BPS", "Nilai", "Luas", "nilai") if sumber == "bps" else ("Nilai Dinas", "Luas", "Nilai", "nilai", "Nilai BPS")
        value = pd.to_numeric(row_value(row, *value_keys), errors="coerce")
        if not period_id or pd.isna(value):
            skipped += 1
            continue

        row_instansi_id = instansi_id or db.execute(text("SELECT id FROM master_instansi WHERE jenis_instansi=:jenis AND wilayah_id=:wilayah AND is_active=1 LIMIT 1"), {"jenis": sumber, "wilayah": region_id}).scalar()
        if not row_instansi_id:
            skipped += 1
            continue

        if sumber == "dinas":
            latitude = pd.to_numeric(row_value(row, "Latitude", "Lat"), errors="coerce")
            longitude = pd.to_numeric(row_value(row, "Longitude", "Lng"), errors="coerce")
            db.execute(text("""
                INSERT INTO data_dinas
                    (variabel_id,periode_id,instansi_id,wilayah_id,nilai,latitude,longitude,nama_kelompok,created_by,updated_by,created_at)
                VALUES (:v,:p,:i,:w,:n,:lat,:lng,:kel,:user_id,:user_id,NOW())
                ON DUPLICATE KEY UPDATE nilai=VALUES(nilai),latitude=VALUES(latitude),longitude=VALUES(longitude),
                    nama_kelompok=VALUES(nama_kelompok),updated_by=VALUES(updated_by),updated_at=NOW()
            """), {
                "v": variabel_id, "p": period_id, "i": row_instansi_id, "w": region_id, "n": float(value),
                "lat": None if pd.isna(latitude) else float(latitude),
                "lng": None if pd.isna(longitude) else float(longitude),
                "kel": str(row_value(row, "Nama Kelompok", "Kelompok") or "") or None, "user_id": user["id"],
            })
        else:
            db.execute(text("""
                INSERT INTO data_bps (variabel_id,instansi_id,periode_id,wilayah_id,nilai,created_by,updated_by,created_at)
                VALUES (:v,:i,:p,:w,:n,:user_id,:user_id,NOW())
                ON DUPLICATE KEY UPDATE nilai=VALUES(nilai),updated_by=VALUES(updated_by),updated_at=NOW()
            """), {"v": variabel_id, "i": row_instansi_id, "p": period_id, "w": region_id, "n": float(value), "user_id": user["id"]})
        count += 1

    db.commit()
    return {"message": f"Berhasil import {count} data; {skipped} baris dilewati.", "imported": count, "skipped": skipped, "sumber": sumber}



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
