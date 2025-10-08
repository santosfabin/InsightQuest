# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importa apenas o roteador de predição
from app.api import prediction_endpoint

app = FastAPI(
    title="API de Predição de Performance de Jogadores",
    description="API que utiliza um modelo de ML para prever a performance de jogadores.",
    version="1.0.0"
)

# ... (o código do CORS continua igual)
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui apenas o roteador de predição
app.include_router(prediction_endpoint.router)

@app.get("/", tags=["Root"])
def read_root():
    """Endpoint raiz para verificar o status da API."""
    return {"message": "Bem-vindo à API de Predição de Jogadores!"}