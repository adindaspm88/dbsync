from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy import text

from db import get_db
from config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = db.execute(text("""
            SELECT u.*, r.nama_role, i.jenis_instansi
            FROM users u
            JOIN master_role r ON r.id = u.role_id
            LEFT JOIN master_instansi i ON i.id = u.instansi_id
            WHERE u.email = :email AND u.is_active = 1
        """), {"email": email}).mappings().first()

        if not user:
            raise HTTPException(401, "Unauthorized")

        return user

    except JWTError:
        raise HTTPException(401, "Token invalid")


def require_roles(user, roles):
    if user["nama_role"] not in roles:
        raise HTTPException(403, "Forbidden")
