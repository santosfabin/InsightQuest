# backend/app/api/auth_endpoint.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user_schema import UserCreate, UserOut, Token
from app.services.auth_service import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_create: UserCreate):
    """Endpoint para registrar um novo usuário."""
    user = auth_service.register_user(user_create)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered",
        )
    return user

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Endpoint para fazer login (usando formulário) e obter um token de acesso."""
    access_token = auth_service.authenticate_user(form_data.username, form_data.password)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": access_token, "token_type": "bearer"}