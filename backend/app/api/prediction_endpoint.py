# backend/app/api/prediction_endpoint.py

import pandas as pd
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, status
import logging # Importa o módulo de logging

# Importa o schema de resposta
from app.models.prediction_schema import AnalysisResult
# Importa a instância do serviço de predição
from app.services.prediction_service import prediction_service

# Configura um logger básico (opcional, mas bom para logs)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/predict",
    tags=["Predictions"],
)

@router.post(
    "/upload-csv",
    response_model=AnalysisResult,
    summary="Realiza predição em um arquivo CSV"
)
async def upload_and_predict(file: UploadFile = File(..., description="Arquivo CSV com dados de novos jogadores.")):
    """
    Recebe um arquivo CSV, executa a pipeline de ML e retorna um JSON com os
    dados originais mais as colunas de predição.
    """
    # 1. Validação inicial do arquivo
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de arquivo inválido. Por favor, envie um arquivo .csv."
        )

    try:
        # 2. Ler o conteúdo do arquivo e carregar em DataFrame
        logger.info(f"Recebido arquivo: {file.filename}")
        contents = await file.read()
        buffer = io.StringIO(contents.decode('utf-8'))
        df = pd.read_csv(buffer, sep=';') # Usa ponto e vírgula como separador
        logger.info(f"Arquivo CSV lido com sucesso. Dimensões: {df.shape}")

        # --- VALIDAÇÃO ADICIONAL (OPÇÃO B): Verificar colunas Target ---
        required_target_cols = ['Target1', 'Target2', 'Target3']
        missing_targets = [col for col in required_target_cols if col not in df.columns]

        if missing_targets:
            logger.warning(f"AVISO: O arquivo '{file.filename}' não contém as colunas Target originais: {missing_targets}.")
            logger.warning("A pipeline de predição continuará, mas os dados originais na resposta não incluirão esses targets.")
        # --- FIM DA VALIDAÇÃO ADICIONAL ---

        # 3. Chamar o serviço de predição
        logger.info("Enviando DataFrame para o serviço de predição...")
        results = prediction_service.execute_prediction_pipeline(df)
        logger.info("Predição concluída com sucesso.")

        # 4. Retornar os resultados formatados
        return results

    except pd.errors.EmptyDataError:
        logger.error(f"Erro ao processar '{file.filename}': Arquivo CSV vazio.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo CSV enviado está vazio."
        )
    except Exception as e:
        # Captura exceções genéricas
        logger.error(f"Erro inesperado durante o processamento de '{file.filename}': {e}", exc_info=True) # Loga o traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ocorreu um erro interno ao processar o arquivo: {str(e)}"
        )