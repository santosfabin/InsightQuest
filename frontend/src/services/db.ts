import Dexie, { type Table } from "dexie";
import type { ApiResponse } from "./api";

export interface HistoryEntry {
	id?: number;
	timestamp: Date;
	fileName: string;
	totalRows: number;
	processedRows: number;
	results: ApiResponse;
}

class InsightQuestDB extends Dexie {
	history!: Table<HistoryEntry>;

	constructor() {
		super("InsightQuestDB");
		this.version(1).stores({
			history: "++id, timestamp"
		});
	}
}

const db = new InsightQuestDB();

/**
 * Adiciona uma nova entrada de análise ao histórico.
 * @param fileName O nome do arquivo analisado.
 * @param apiResponse O objeto de resposta completo da API.
 */
export const addHistoryEntry = async (
	fileName: string,
	apiResponse: ApiResponse
): Promise<void> => {
	try {
		const entry: HistoryEntry = {
			fileName,
			results: apiResponse,
			timestamp: new Date(),
			totalRows: apiResponse.total_rows,
			processedRows: apiResponse.processed_rows
		};
		await db.history.add(entry);
		console.log("Análise salva no histórico com sucesso.");
	} catch (error) {
		console.error("Falha ao salvar a análise no histórico:", error);
	}
};

/**
 * Retorna todas as entradas do histórico, ordenadas da mais recente para a mais antiga.
 * @returns Uma promessa que resolve para um array de HistoryEntry.
 */
export const getHistoryEntries = async (): Promise<HistoryEntry[]> => {
	try {
		return await db.history.orderBy("timestamp").reverse().toArray();
	} catch (error) {
		console.error("Falha ao buscar o histórico:", error);
		return [];
	}
};

export const deleteHistoryEntry = async (id: number): Promise<void> => {
	try {
		await db.history.delete(id);
	} catch (error) {
		console.error(`Falha ao apagar a entrada ${id} do histórico:`, error);
	}
};

export const clearHistory = async (): Promise<void> => {
	try {
		await db.history.clear();
	} catch (error) {
		console.error("Falha ao limpar o histórico:", error);
	}
};
