# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa o roteador que criamos no Passo 4
from app.api import prediction_endpoint, auth_endpoint

# Cria a instância principal da aplicação FastAPI
app = FastAPI(
    title="API de Predição de Performance de Jogadores",
    description="API que utiliza um modelo de Machine Learning para prever a performance de jogadores com base em dados de um arquivo CSV.",
    version="1.0.0"
)

# --- Configuração do CORS ---
# O CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança do navegador
# que impede que uma página web faça requisições para um domínio diferente do seu.
# Como nosso frontend (ex: localhost:5173) e backend (localhost:8000) rodam
# em "domínios" diferentes, precisamos explicitamente permitir essa comunicação.

# Lista de origens permitidas. Em produção, você deve restringir isso
# para o domínio exato do seu frontend (ex: "http://meu-dashboard.com").
# O "*" permite qualquer origem, o que é útil para desenvolvimento local.
origins = [
    "http://localhost",
    "http://localhost:5173", # Endereço padrão do Vite/React
    "http://localhost:3000", # Endereço padrão do Create React App
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # Permite cookies (importante para autenticação futura)
    allow_methods=["*"],    # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"],    # Permite todos os cabeçalhos
)

# --- Inclusão dos Roteadores ---
# Aqui, "montamos" o roteador de predição na nossa aplicação principal.
# Todas as rotas definidas em 'prediction_endpoint.router' agora fazem parte do 'app'.
app.include_router(auth_endpoint.router)
app.include_router(prediction_endpoint.router)

# --- Rota Raiz ---
# Uma rota simples para verificar se a API está online.
@app.get("/", tags=["Root"])
def read_root():
    """
    Endpoint raiz para verificar o status da API.
    """
    return {"message": "Bem-vindo à API de Predição de Jogadores!"}