const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface UploadResponse {
  totalMatches: number;
  processedSuccessfully: number;
  modelAccuracy: number;
  targets: {
    target1: {
      mean: number;
      std: number;
      distribution: string;
    };
    target2: {
      mean: number;
      std: number;
      distribution: string;
    };
    target3: {
      mean: number;
      std: number;
      distribution: string;
    };
  };
  predictions: Array<{
    match: number;
    target1: number;
    target2: number;
    target3: number;
    confidence: number;
  }>;
  timeSeriesData: Array<{
    period: string;
    target1: number;
    target2: number;
    target3: number;
  }>;
  targetDistribution: Array<{
    name: string;
    target1: number;
    target2: number;
    target3: number;
  }>;
}

interface HistoryItem {
  id: string;
  filename: string;
  uploadDate: string;
  totalMatches: number;
  accuracy: number;
}

// Upload e análise de arquivo CSV
export const uploadAndPredict = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Erro ao processar arquivo');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

// Buscar histórico de análises
export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar histórico');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
};

// Buscar uma análise específica do histórico
export const getAnalysisById = async (id: string): Promise<UploadResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/${id}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar análise');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    throw error;
  }
};

// Deletar uma análise do histórico
export const deleteAnalysis = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Erro ao deletar análise');
    }
  } catch (error) {
    console.error('Erro ao deletar análise:', error);
    throw error;
  }
};

// Exportar resultados em CSV
export const exportResultsCSV = async (analysisId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/export/${analysisId}/csv`);
    
    if (!response.ok) {
      throw new Error('Erro ao exportar CSV');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Erro ao exportar:', error);
    throw error;
  }
};