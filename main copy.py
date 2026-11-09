import os
import io
import logging
from datetime import datetime, timedelta, timezone

import pandas as pd
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from passlib.context import CryptContext
from jose import jwt, JWTError
from pydantic import BaseModel, Field


# =========================
# ENV
# =========================
load_dotenv()

def get_env(key: str, default: str | None = None) -> str:
    value = os.getenv(key, default)
    if value is None or str(value).strip() == "":
        raise RuntimeError(f"ENV '{key}' kosong")
    return value


DB_HOST = get_env("DB_HOST")
DB_USER = get_env("DB_USER")
DB_PASSWORD = get_env("DB_PASSWORD")
DB_NAME = get_env("DB_NAME")

SECRET_KEY = get_env("SECRET_KEY")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(get_env("TOKEN_EXPIRE_MINUTES", "480"))

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

ALLOWED_ORIGINS = [
    o.strip() for o in get_env("ALLOWED_ORIGINS", "").split(",") if o.strip()
]


# =========================
# LOGGING
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s : %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()]
)

logger = logging.getLogger("API")


# =========================
# DB
# =========================
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# AUTH
# =========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if not email:
            raise HTTPException(401, "Token invalid")

        user = db.execute(
            text("""
                SELECT u.*, r.nama_role, i.jenis_instansi, i.parent_instansi_id
                FROM users u
                JOIN master_role r ON u.role_id = r.id
                JOIN master_instansi i ON u.instansi_id = i.id
                WHERE u.email = :email AND u.is_active = 1
            """),
            {"email": email}
        ).fetchone()

        if not user:
            raise HTTPException(401, "User tidak ditemukan / nonaktif")

        return dict(user._mapping)

    except JWTError:
        raise HTTPException(401, "Token expired")


# =========================
# RBAC HELPER
# =========================
def require_roles(user, allowed_roles: list[str]):
    if user["nama_role"] not in allowed_roles:
        raise HTTPException(status_code=403, detail="Akses ditolak")


# =========================
# APP
# =========================
app = FastAPI(title="Akur Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# MODELS
# =========================
class Token(BaseModel):
    access_token: str
    token_type: str


class BulkReconRequest(BaseModel):
    variabel_id: int
    periode_id: int
    level_wilayah: str = Field(pattern="^(provinsi|kabkot|kecamatan)$")


# =========================
# LOGIN
# =========================
@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.execute(
        text("""
            SELECT u.*, r.nama_role, i.jenis_instansi
            FROM users u
            JOIN master_role r ON u.role_id = r.id
            JOIN master_instansi i ON u.instansi_id = i.id
            WHERE u.email = :email AND u.is_active = 1
        """),
        {"email": form_data.username}
    ).fetchone()

    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        logger.warning(f"Ups... Anda Gagal Login | {form_data.username}")
        raise HTTPException(400, "Email atau password salah")

    db.execute(text("UPDATE users SET last_login = NOW() WHERE id = :id"), {"id": user.id})
    db.commit()

    token = create_token({
        "sub": user.email,
        "user_id": user.id,
        "role": user.nama_role
    })

    logger.info(f"Yay! Anda berhasil login | {user.email}")

    return {"access_token": token, "token_type": "bearer"}


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"status": "API aktif", "docs": "/docs"}


# =========================
# IMPORT DATA
# =========================
@app.post("/dashboard/import-data")
def import_data(
    sumber: str = Form(...),
    variabel_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    if sumber not in ["bps", "dinas"]:
        raise HTTPException(400, "sumber harus bps/dinas")
    
    require_roles(user, ["operator", "superadmin"])

    if not file.filename.endswith((".xls", ".xlsx")):
        raise HTTPException(400, "File harus Excel")

    df = pd.read_excel(io.BytesIO(file.file.read()))

    wil = db.execute(text("SELECT id, nama_wilayah FROM master_wilayah")).fetchall()
    map_wil = {w.nama_wilayah.upper(): w.id for w in wil}

    per = db.execute(text("SELECT id, bulan, tahun FROM master_periode")).fetchall()
    map_per = {(int(p.bulan), int(p.tahun)): p.id for p in per}

    count = 0

    for row in df.to_dict("records"):

        loc = str(row.get("Desa") or row.get("Kota/Kabupaten") or row.get("Kecamatan") or "").upper()
        w_id = map_wil.get(loc, user["wilayah_id"])

        dt = pd.to_datetime(row.get("Tgl Tanam"), errors="coerce")
        if pd.isna(dt):
            continue

        p_id = map_per.get((dt.month, dt.year))
        if not p_id:
            continue

        if sumber == "dinas":
            sql = text("""
                INSERT INTO data_dinas
                (variabel_id, periode_id, instansi_id, wilayah_id, nilai,
                 latitude, longitude, nama_kelompok, created_by, created_at)
                VALUES (:v,:p,:i,:w,:n,:lat,:lng,:kel,:cb,NOW())
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
                "i": user["instansi_id"],
                "w": w_id,
                "n": float(row.get("Luas") or 0),
                "lat": float(row.get("Lat") or 0),
                "lng": float(row.get("Lng") or 0),
                "kel": str(row.get("Nama Kelompok") or ""),
                "cb": user["user_id"]
            }

        else:
            sql = text("""
                INSERT INTO data_bps
                (variabel_id, periode_id, wilayah_id, nilai, created_by, created_at)
                VALUES (:v,:p,:w,:n,:cb,NOW())
                ON DUPLICATE KEY UPDATE
                    nilai = VALUES(nilai),
                    updated_at = NOW()
            """)

            params = {
                "v": variabel_id,
                "p": p_id,
                "w": w_id,
                "n": float(row.get("Nilai BPS") or 0),
                "cb": user["user_id"]
            }

        db.execute(sql, params)
        count += 1

    db.commit()

    return {"message": f"Berhasil import {count} data"}


# =========================
# EDIT (MINIMAL CRUD STABIL)
# =========================
@app.post("/edit/dinas")
def edit_dinas(payload: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["operator", "admin_wilayah", "superadmin"])

    sql = text("""
        INSERT INTO data_dinas (variabel_id, periode_id, wilayah_id, nilai, created_by, created_at)
        VALUES (:v,:p,:w,:n,:cb,NOW())
        ON DUPLICATE KEY UPDATE
            nilai = VALUES(nilai),
            updated_at = NOW()
    """)

    db.execute(sql, {
        "v": payload["variabel_id"],
        "p": payload["periode_id"],
        "w": payload["wilayah_id"],
        "n": payload["nilai"],
        "cb": user["user_id"]
    })

    db.commit()
    return {"status": "OK"}


@app.post("/edit/bps")
def edit_bps(payload: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["operator", "superadmin"])

    sql = text("""
        INSERT INTO data_bps (variabel_id, periode_id, wilayah_id, nilai, created_by, created_at)
        VALUES (:v,:p,:w,:n,:cb,NOW())
        ON DUPLICATE KEY UPDATE
            nilai = VALUES(nilai),
            updated_at = NOW()
    """)

    db.execute(sql, {
        "v": payload["variabel_id"],
        "p": payload["periode_id"],
        "w": payload["wilayah_id"],
        "n": payload["nilai"],
        "cb": user["user_id"]
    })

    db.commit()
    return {"status": "OK"}


@app.delete("/edit/{jenis}/{id}")
def delete_data(jenis: str, id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):

    require_roles(user, ["superadmin"])

    if jenis not in ["dinas", "bps"]:
        raise HTTPException(status_code=400, detail="jenis tidak valid")

    table = "data_dinas" if jenis == "dinas" else "data_bps"

    db.execute(text(f"DELETE FROM {table} WHERE id = :id"), {"id": id})
    db.commit()

    return {"status": "deleted"}

# =========================
# REPORT
# =========================
@app.get("/dashboard/report")
def report(variabel_id: int, periode_id: int, db: Session = Depends(get_db)):

    rows = db.execute(
        text("""
            SELECT w.nama_wilayah, r.nilai_bps, r.nilai_dinas, r.gap_nilai
            FROM rekonsiliasi_data r
            JOIN master_wilayah w ON w.id = r.wilayah_id
            WHERE r.variabel_id = :v AND r.periode_id = :p
        """),
        {"v": variabel_id, "p": periode_id}
    ).fetchall()

    return [dict(r._mapping) for r in rows]