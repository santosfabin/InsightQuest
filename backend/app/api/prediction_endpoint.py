# backend/app/api/prediction_endpoint.py

import pandas as pd
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, status

# Importa o schema de resposta que criamos
from app.models.prediction_schema import AnalysisResult
# Importa a instância única do nosso serviço de predição
from app.services.prediction_service import prediction_service


# APIRouter nos ajuda a modularizar as rotas, como um mini-aplicativo FastAPI
router = APIRouter(
    prefix="/predict",  # Todas as rotas aqui começarão com /predict
    tags=["Predictions"],  # Agrupa as rotas na documentação sob a tag "Predictions"
)

@router.post(
    "/upload-csv", 
    response_model=AnalysisResult,
    summary="Realiza predição em um arquivo CSV"
)
async def upload_and_predict(
    file: UploadFile = File(..., description="Arquivo CSV com dados de novos jogadores.") 
):
    """
    Recebe um arquivo CSV, executa a pipeline de ML e retorna um JSON com os
    dados originais mais as colunas de predição e cluster.
    """


    # 1. Validação inicial do arquivo
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Formato de arquivo inválido. Por favor, envie um arquivo .csv."
        )

    try:
        # 2. Ler o conteúdo do arquivo em memória e carregar em um DataFrame do Pandas
        contents = await file.read()
        buffer = io.StringIO(contents.decode('utf-8'))
        df = pd.read_csv(buffer, sep=';')

        # 3. Chamar nosso serviço de predição para fazer todo o trabalho pesado
        # A instância 'prediction_service' já foi criada e já tem os modelos carregados.
        print(f"Arquivo '{file.filename}' recebido. Enviando para o serviço de predição...")
        results = prediction_service.execute_prediction_pipeline(df)
        
        # 4. Retornar os resultados formatados
        return results

    except Exception as e:
        # Captura exceções genéricas durante o processamento para depuração
        # e retorna um erro HTTP claro para o cliente.
        print(f"Ocorreu um erro inesperado durante o processamento do arquivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ocorreu um erro ao processar o arquivo: {str(e)}"
        )