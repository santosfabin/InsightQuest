// frontend/src/services/api.ts

const API_BASE_URL = import.meta.env.DEV ? "http://127.0.0.1:8000" : "/api";

// ===== INTERFACES PARA A RESPOSTA DA API =====

export interface ApiPredictionRow {
	PREDICAO_Target1: number | null;
	PREDICAO_Target2: number | null;
	PREDICAO_Target3: number | null;
	original_data: { [key: string]: unknown };
}

export interface ApiResponse {
	total_rows: number;
	processed_rows: number;
	predictions: ApiPredictionRow[];
	r2_score_target1?: number | null;
	r2_score_target2?: number | null;
	r2_score_target3?: number | null;
	correlation_heatmap_data?: HeatmapDataRow[] | null;
}

export interface RoundResponseData {
  round: string;
  hits: number;
  errors: number;
  omissions: number;
  total: number;
  [key: string]: string | number;
}

export interface RoundTimeData {
  round: string;
  avgTime: number;
  [key: string]: string | number;
}

export interface HeatmapDataItem {
    x: string;
    y: number;
}
export interface HeatmapDataRow {
    id: string; // Feature name
    data: HeatmapDataItem[];
}

// ===== FUNÇÃO DE UPLOAD E PREDIÇÃO =====

export const uploadAndPredict = async (file: File): Promise<ApiResponse> => {
	const formData = new FormData();
	formData.append("file", file);

	const predictUrl = `${API_BASE_URL}/predict/upload-csv`;
	console.log(`Enviando arquivo para: ${predictUrl}`);

	try {
		const response = await fetch(predictUrl, {
			method: "POST",
			body: formData
		});

		if (!response.ok) {
			let errorDetail = `Erro HTTP ${response.status}: ${response.statusText}`;
			try {
				const errorData = await response.json();
				errorDetail = errorData.detail || errorDetail;
			} catch (jsonError) {
				console.debug(
					"Não foi possível parsear corpo de erro como JSON:",
					jsonError
				);
			}
			console.error(
				`Falha na requisição para ${predictUrl}: ${errorDetail}`
			);
			throw new Error(`Falha ao processar o arquivo: ${errorDetail}`);
		}

		const results: ApiResponse = await response.json();
		return results;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Erro de rede ou conexão: ${error.message}`);
		} else {
			throw new Error(
				`Erro desconhecido durante a chamada da API: ${String(error)}`
			);
		}
	}
};
