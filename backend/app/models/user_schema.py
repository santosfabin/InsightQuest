# backend/app/models/user_schema.py

from pydantic import BaseModel, Field

class UserBase(BaseModel):
    """Schema base para o usuário, com campos comuns."""
    username: str = Field(..., min_length=3, max_length=50, example="john_doe")

class UserCreate(UserBase):
    """Schema usado para a criação de um novo usuário."""
    password: str = Field(..., min_length=6, example="s3crEt_pAssWd")

class UserInDB(UserBase):
    """Schema que representa o usuário como armazenado (com senha hash)."""
    hashed_password: str

class UserOut(UserBase):
    """Schema usado para retornar dados do usuário para o cliente (sem senha)."""
    id: int
    
class Token(BaseModel):
    """Schema para a resposta do token de acesso."""
    access_token: str
    token_type: str = "bearer"