// frontend/src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ===== INTERFACES PARA A RESPOSTA DA API =====

// Interface correspondente ao schema 'PredictionRow' do backend
export interface ApiPredictionRow { // <-- EXPORT ADICIONADO
  PREDICAO_Target1: number;
  PREDICAO_Target2: number;
  PREDICAO_Target3: number;
  original_data: { [key: string]: unknown };
}

// Interface correspondente ao schema 'AnalysisResult' do backend
export interface ApiResponse { // <-- EXPORT ADICIONADO
  total_rows: number;
  processed_rows: number;
  predictions: ApiPredictionRow[];
}

// ===== FUNÇÃO DE UPLOAD E PREDIÇÃO =====

export const uploadAndPredict = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const predictUrl = `${API_BASE_URL}/predict/upload-csv`;
  console.log(`Enviando arquivo para: ${predictUrl}`);

  try {
    const response = await fetch(predictUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = `Erro HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (jsonError) { 
        // Loga o erro ao tentar parsear o corpo da resposta como JSON
        console.debug('Não foi possível parsear corpo de erro como JSON:', jsonError);
       }
      console.error(`Falha na requisição para ${predictUrl}: ${errorDetail}`);
      throw new Error(`Falha ao processar o arquivo: ${errorDetail}`);
    }

    const results: ApiResponse = await response.json();
    console.log("Resultados recebidos da API:", results);
    return results;

  } catch (error) {
    console.error('Erro durante a chamada da API:', error);
    if (error instanceof Error) {
       throw new Error(`Erro de rede ou conexão: ${error.message}`);
    } else {
       throw new Error(`Erro desconhecido durante a chamada da API: ${String(error)}`);
    }
  }
};