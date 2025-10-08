# backend/app/services/auth_service.py

from typing import Dict
from app.models.user_schema import UserCreate, UserInDB, UserOut
from app.auth.jwt_handler import get_password_hash, verify_password, create_access_token

# --- Simulação de um Banco de Dados de Usuários em Memória ---
# Guarda os usuários em um dicionário: { "username": UserInDB(...) }
fake_users_db: Dict[str, UserInDB] = {}
next_user_id = 1
# --- Fim da Simulação ---

class AuthService:
    def get_user_by_username(self, username: str) -> UserInDB | None:
        """Busca um usuário no nosso 'banco de dados' em memória."""
        return fake_users_db.get(username)

    def register_user(self, user_create: UserCreate) -> UserOut | None:
        """Registra um novo usuário. Retorna None se o usuário já existir."""
        global next_user_id
        if self.get_user_by_username(user_create.username):
            return None 

        hashed_password = get_password_hash(user_create.password)
        user_in_db = UserInDB(
            username=user_create.username, 
            hashed_password=hashed_password
        )
        
        fake_users_db[user_create.username] = user_in_db
        
        user_out = UserOut(id=next_user_id, username=user_create.username)
        next_user_id += 1
        return user_out

    def authenticate_user(self, username: str, password: str) -> str | None:
        """Autentica um usuário e retorna um token JWT se as credenciais forem válidas."""
        user = self.get_user_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            return None 
        
        access_token = create_access_token(data={"sub": user.username})
        return access_token

# Instância única do serviço para ser usada em toda a aplicação
auth_service = AuthService()