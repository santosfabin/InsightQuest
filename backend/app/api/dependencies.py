# backend/app/api/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.auth import jwt_handler
from app.services.auth_service import auth_service, fake_users_db
from app.models.user_schema import UserOut

# Define o esquema de segurança OAuth2, apontando para o endpoint de login.
# O FastAPI usará isso para encontrar o token na requisição.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    """
    Dependência para obter o usuário atual a partir de um token JWT.
    Esta função será injetada nas rotas que queremos proteger.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = jwt_handler.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = auth_service.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    
    # Simula a obtenção do ID do usuário para o schema de saída
    try:
        user_id = list(fake_users_db.keys()).index(username) + 1
        return UserOut(id=user_id, username=user.username)
    except ValueError:
        raise credentials_exception