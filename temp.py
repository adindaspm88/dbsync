from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from config import DATABASE_URL   # ✅ ambil dari config.py

engine = create_engine(DATABASE_URL)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p):
    return pwd_context.hash(p)

nama = "ALmira Utami"
email = "almirautami@bps.go.id"
password = "admin123"

hashed = hash_password(password)

with engine.begin() as conn:
    conn.execute(text("""
        INSERT INTO users
        (email, password_hash, nama, role_id, instansi_id, wilayah_id)
        VALUES (:e,:p,:n,:r,:i,:w)
    """), {
        "e": email,
        "p": hashed,
        "n": nama,
        "r": 1,
        "i": 1,
        "w": 1,
    })

print("Super Admin berhasil dibuat")