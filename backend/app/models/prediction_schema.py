from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PredictionRow(BaseModel):
    """
    Schema para representar uma única linha de resultado da predição.
    Isso inclui as novas colunas geradas e os dados originais.
    """
    # Adicionamos as colunas de resultado que nosso modelo gera
    Cluster: int = Field(..., description="O cluster ao qual o jogador foi atribuído.")
    Target1_Pred: float = Field(..., description="Valor previsto para o Target 1.")
    Target2_Pred: float = Field(..., description="Valor previsto para o Target 2.")
    Target3_Pred: float = Field(..., description="Valor previsto para o Target 3.")
    
    # Usamos um dicionário flexível para incluir todas as colunas originais do arquivo enviado.
    # Isso evita ter que declarar todas as dezenas de colunas do seu CSV aqui.
    original_data: Dict[str, Any] = Field(..., description="Dados originais da linha do arquivo enviado.")

class AnalysisResult(BaseModel):
    """
    Schema para a resposta completa da API.
    Este será o JSON principal que o frontend receberá.
    """
    total_rows: int = Field(..., description="Número total de linhas no arquivo enviado.")
    processed_rows: int = Field(..., description="Número de linhas processadas com sucesso.")
    predictions: List[PredictionRow] = Field(..., description="Lista contendo os resultados da predição para cada linha.")