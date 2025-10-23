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

async def upload_and_predict(file: UploadFile = File(..., description="Arquivo CSV ou XLSX com dados.")):
    """
    Recebe um arquivo CSV ou XLSX, executa a pipeline de ML e retorna um JSON com os
    dados originais mais as colunas de predição.
    """
    # 1. Validação do formato do arquivo (CSV ou XLSX)
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in ['csv', 'xlsx']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de arquivo inválido. Por favor, envie um arquivo .csv ou .xlsx"
        )

    try:
        # 2. Ler o conteúdo do arquivo
        logger.info(f"Recebido arquivo: {file.filename}")
        contents = await file.read()
        
        df = None # Inicializa o DataFrame

        if file_extension == 'csv':
            # --- Lógica para CSV (como antes) ---
            buffer = io.StringIO(contents.decode('utf-8'))
            df = pd.read_csv(buffer, sep=';')
            logger.info("Arquivo CSV lido com sucesso.")
        
        elif file_extension == 'xlsx':
            # --- LÓGICA ADICIONADA PARA EXCEL ---
            buffer = io.BytesIO(contents) # Excel lê bytes, não texto
            # pd.read_excel lê a *primeira aba* por padrão, o que geralmente é o correto.
            df = pd.read_excel(buffer, engine='openpyxl') 
            logger.info("Arquivo XLSX lido com sucesso.")

        if df is None or df.empty:
             raise pd.errors.EmptyDataError("O arquivo está vazio ou não pôde ser lido.")

        logger.info(f"Dimensões do DataFrame: {df.shape}")

        # --- CORREÇÃO DE DECIMAL (Mantida, pois é segura) ---
        target_cols_to_fix = ['Target1', 'Target2', 'Target3']
        for col in target_cols_to_fix:
            if col in df.columns:
                df[col] = pd.to_numeric(
                    df[col].astype(str).str.replace(',', '.'), 
                    errors='coerce'
                )
        logger.info("Colunas Target forçadas para numérico (tratando decimal , e .)")
        # --- FIM DA CORREÇÃO ---

        # 3. Chamar o serviço de predição
        logger.info("Enviando DataFrame para o serviço de predição...")
        results = prediction_service.execute_prediction_pipeline(df)
        logger.info("Predição concluída com sucesso.")

        # 4. Retornar os resultados formatados
        return results

    except pd.errors.EmptyDataError:
        logger.error(f"Erro ao processar '{file.filename}': Arquivo vazio.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo enviado está vazio ou não pôde ser lido."
        )
    except Exception as e:
        logger.error(f"Erro inesperado durante o processamento de '{file.filename}': {e}", exc_info=True) 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ocorreu um erro interno ao processar o arquivo: {str(e)}"
        )