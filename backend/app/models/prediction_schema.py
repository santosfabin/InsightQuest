from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HeatmapDataItem(BaseModel):
    x: str
    y: float

class HeatmapDataRow(BaseModel):
    id: str
    data: List[HeatmapDataItem]

class PredictionRow(BaseModel):
    """
    Schema para representar uma única linha de resultado da predição.
    """
    PREDICAO_Target1: Optional[float] = Field(None, description="Valor previsto para o Target 1.")
    PREDICAO_Target2: Optional[float] = Field(None, description="Valor previsto para o Target 2.")
    PREDICAO_Target3: Optional[float] = Field(None, description="Valor previsto para o Target 3.")
    original_data: Dict[str, Any] = Field(..., description="Dados originais e features geradas para a linha.")

class AnalysisResult(BaseModel):
    """
    Schema para a resposta completa da API.
    """
    total_rows: int = Field(..., description="Número total de linhas no arquivo enviado.")
    processed_rows: int = Field(..., description="Número de linhas processadas com sucesso.")
    predictions: List[PredictionRow] = Field(..., description="Lista com os resultados da predição para cada linha.")

    # --- ADIÇÃO ---
    r2_score_target1: Optional[float] = Field(None, description="Score R² da Predição vs Real para Target 1, se disponível.")
    r2_score_target2: Optional[float] = Field(None, description="Score R² da Predição vs Real para Target 2, se disponível.")
    r2_score_target3: Optional[float] = Field(None, description="Score R² da Predição vs Real para Target 3, se disponível.")
    
    correlation_heatmap_data: Optional[List[HeatmapDataRow]] = Field(None, description="Dados de correlação para o Heatmap (Features vs Predições).")
    # --- FIM DA ADIÇÃO ---