import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

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

interface StorableAnalysis extends AnalysisResults {
	id?: number;
	timestamp: Date;
}

export interface StoredAnalysisResults extends AnalysisResults {
	id: number;
	timestamp: Date;
}

interface AnalysisDB extends DBSchema {
	analyses: {
		key: number;

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

export async function saveAnalysis(
	analysisData: AnalysisResults
): Promise<void> {
	console.log("4. saveAnalysis: Função foi chamada.");

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

export async function getHistory(): Promise<StoredAnalysisResults[]> {
	const db = await initDB();
	const tx = db.transaction("analyses", "readonly");
	const store = tx.objectStore("analyses");
	const index = store.index("timestamp");
	const allAnalyses = await index.getAll();

	return allAnalyses.reverse() as StoredAnalysisResults[];
}
