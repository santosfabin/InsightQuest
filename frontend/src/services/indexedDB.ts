// frontend/src/services/indexedDB.ts

import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

// =================================================================
// 1. DEFINIÇÃO CENTRALIZADA DAS ESTRUTURAS DE DADOS
// =================================================================

// ... (as interfaces TargetStats, Prediction, etc., permanecem as mesmas)
interface TargetStats {
	mean: number;
	std: number;
	distribution: string;
}
interface Prediction {
	match: number;
	target1: number;
	target2: number;
	target3: number;
	confidence: number;
}
interface TimeSeriesData {
	period: string;
	target1: number;
	target2: number;
	target3: number;
}
interface TargetDistribution {
	name: string;
	target1: number;
	target2: number;
	target3: number;
	[key: string]: string | number;
}

export interface AnalysisResults {
	totalMatches: number;
	processedSuccessfully: number;
	modelAccuracy: number;
	targets: {
		target1: TargetStats;
		target2: TargetStats;
		target3: TargetStats;
	};
	predictions: Prediction[];
	timeSeriesData: TimeSeriesData[];
	targetDistribution: TargetDistribution[];
}

// CORREÇÃO 1: Definimos um tipo para o objeto COMO ELE É ESCRITO no DB.
// Note que 'id' é opcional aqui. Isso resolve o erro na função saveAnalysis.
interface StorableAnalysis extends AnalysisResults {
	id?: number; // O 'id' é opcional no momento da escrita.
	timestamp: Date;
}

// CORREÇÃO 2: Este é o tipo que EXPORTAMOS e usamos na UI.
// Ele representa o objeto COMO ELE É LIDO do DB, com um 'id' garantido.
export interface StoredAnalysisResults extends AnalysisResults {
	id: number; // O 'id' é obrigatório no momento da leitura.
	timestamp: Date;
}

// =================================================================
// 2. SCHEMA E CONFIGURAÇÃO DO BANCO DE DADOS
// =================================================================

interface AnalysisDB extends DBSchema {
	analyses: {
		key: number;
		// CORREÇÃO 3: O schema usa o tipo mais permissivo 'StorableAnalysis'
		// para permitir a escrita de objetos sem 'id'.
		value: StorableAnalysis;
		indexes: { timestamp: Date };
	};
}

async function initDB(): Promise<IDBPDatabase<AnalysisDB>> {
	const db = await openDB<AnalysisDB>("analysis-history-db", 1, {
		upgrade(db: IDBPDatabase<AnalysisDB>) {
			const store = db.createObjectStore("analyses", {
				keyPath: "id",
				autoIncrement: true
			});
			store.createIndex("timestamp", "timestamp");
		}
	});
	return db;
}

// =================================================================
// 3. FUNÇÕES EXPORTADAS PARA MANIPULAR OS DADOS
// =================================================================

// Nenhuma alteração necessária aqui, o erro foi resolvido pelas novas tipagens.
export async function saveAnalysis(
	analysisData: AnalysisResults
): Promise<void> {
	console.log("4. saveAnalysis: Função foi chamada."); // Este é o log mais importante

	try {
		const db = await initDB();
		console.log("4a. saveAnalysis: Conexão com o DB estabelecida.");

		const tx = db.transaction("analyses", "readwrite");
		console.log("4b. saveAnalysis: Transação iniciada.");

		const store = tx.objectStore("analyses");
		console.log("4c. saveAnalysis: Object store acessado.");

		await store.put({ ...analysisData, timestamp: new Date() });
		console.log("4d. saveAnalysis: Comando 'put' executado.");

		await tx.done;
		console.log("4e. saveAnalysis: Transação concluída (done).");
	} catch (error) {
		console.error("ERRO dentro da função saveAnalysis:", error);
	}
}

// CORREÇÃO 4: A função agora retorna o tipo mais estrito 'StoredAnalysisResults[]'.
export async function getHistory(): Promise<StoredAnalysisResults[]> {
	const db = await initDB();
	const tx = db.transaction("analyses", "readonly");
	const store = tx.objectStore("analyses");
	const index = store.index("timestamp");
	const allAnalyses = await index.getAll();

	// Nós garantimos ao TypeScript que os objetos retornados sempre terão um 'id'
	// por causa do autoIncrement. Essa conversão de tipo (casting) é segura aqui.
	return allAnalyses.reverse() as StoredAnalysisResults[];
}
