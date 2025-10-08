# backend/app/auth/jwt_handler.py

import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext

# Configurações do JWT
SECRET_KEY = os.getenv("SECRET_KEY", "a-chave-secreta-deve-ser-bem-longa-e-segura")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Contexto para hashing de senhas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: Dict[str, Any]) -> str:
    """Cria um novo token de acesso JWT."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any] | None:
    """Decodifica e valida um token de acesso. Retorna o payload se válido."""
    try:
        # A opção 'verify_exp' já é True por padrão no jwt.decode
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_token
    except JWTError:
        return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha plana corresponde à senha com hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera o hash de uma senha."""
    return pwd_context.hash(password)