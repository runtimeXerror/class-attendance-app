from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .database import get_db
from . import models

import os

SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production-use-env-var")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    payload = decode_token(token)
    role = payload.get("role")
    user_id = payload.get("id")
    if not role or not user_id:
        raise HTTPException(status_code=401, detail="Invalid token data")

    if role == "superadmin":
        user = db.query(models.SuperAdmin).filter(models.SuperAdmin.id == user_id).first()
    elif role == "admin":
        user = db.query(models.Admin).filter(models.Admin.id == user_id).first()
    elif role == "teacher":
        user = db.query(models.Teacher).filter(models.Teacher.id == user_id).first()
    elif role == "student":
        user = db.query(models.Student).filter(models.Student.id == user_id).first()
    else:
        raise HTTPException(status_code=401, detail="Unknown role")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {"user": user, "role": role}


def require_role(*allowed_roles):
    def checker(current=Depends(get_current_user)):
        if current["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return current
    return checker
