# backend/app/models/prediction_schema.py

from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PredictionRow(BaseModel):
    """
    Schema para representar uma única linha de resultado da predição (V2).
    Inclui as colunas de predição e os dados originais.
    """
    # Adiciona as colunas de predição conforme a nova pipeline
    PREDICAO_Target1: float = Field(..., description="Valor previsto para o Target 1.")
    PREDICAO_Target2: float = Field(..., description="Valor previsto para o Target 2.")
    PREDICAO_Target3: float = Field(..., description="Valor previsto para o Target 3.")

    # Mantém o dicionário flexível para os dados originais
    original_data: Dict[str, Any] = Field(..., description="Dados originais da linha do arquivo enviado.")

class AnalysisResult(BaseModel):
    """
    Schema para a resposta completa da API (V2).
    """
    total_rows: int = Field(..., description="Número total de linhas no arquivo enviado.")
    processed_rows: int = Field(..., description="Número de linhas processadas com sucesso.")
    predictions: List[PredictionRow] = Field(..., description="Lista contendo os resultados da predição para cada linha.")