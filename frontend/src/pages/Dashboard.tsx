// frontend/src/pages/Dashboard.tsx

import { useState, useMemo } from "react";
import {
	BarChart3,
	Clock,
	Upload,
	FileSpreadsheet,
	Target,
	TrendingUp,
	AlertCircle,
	Eye,
	EyeOff,
	Hourglass,
	Users
} from "lucide-react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import FileUpload from "../components/FileUpload";
import TargetCard from "../components/TargetCard";
import PredictionsTable from "../components/PredictionsTable";
import {
	GenericPieChart,
	DistributionChart,
	LikertDistributionChart,
	PerformanceByClusterChart
} from "../components/AnalysisCharts";
import PreviewCharts from "../components/PreviewCharts";

import { uploadAndPredict } from "../services/api";
import type { ApiResponse, ApiPredictionRow } from "../services/api";
import HistoryList from "../components/HistoryList";
import { addHistoryEntry } from "../services/db";
import type { HistoryEntry } from "../services/db";

// Tipagem para os detalhes da família de cor
interface ColorFamilyDetails {
	color: string;
	rule: string;
	example: string;
}
interface PieSliceData {
	id: string | number;
	label: string | number;
	value: number;
	color?: string;
	details?: ColorFamilyDetails;
}
interface DistributionBin {
	range: string;
	count: number;
	[key: string]: string | number;
}
interface LikertData {
	metric: string;
	"1": number;
	"2": number;
	"3": number;
	"4": number;
	"5": number;
	[key: string]: string | number;
}
interface TargetStatsData {
	mean: number;
	std: number;
	distribution: string;
}
interface ClusterComparisonData {
	cluster: string;
	avgTarget1: number;
	avgTarget2: number;
	avgTarget3: number;
	[key: string]: string | number;
}

const rgbToHsl = (
	r: number,
	g: number,
	b: number
): { h: number; s: number; l: number } => {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h = 0,
		s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return { h: h * 360, s: s, l: l };
};

const getColorFamily = (r: number, g: number, b: number): string => {
	const { h, s, l } = rgbToHsl(r, g, b);
	if (l < 0.1) return "Preto";
	if (l > 0.95) return "Branco";
	if (s < 0.1) return "Cinza";
	if (h >= 340 || h < 20) return "Vermelho";
	if (h < 40) return "Laranja";
	if (h < 65) return "Amarelo";
	if (h < 150) return "Verde";
	if (h < 190) return "Ciano";
	if (h < 260) return "Azul";
	if (h < 290) return "Violeta/Roxo";
	if (h < 340) return "Rosa/Magenta";
	return "Outra Cor";
};

const colorFamilyDetails: { [key: string]: ColorFamilyDetails } = {
	Preto: {
		color: "#1f2937",
		rule: "Luminosidade < 10%",
		example: "#000000 ~ #1A1A1A"
	},
	Branco: {
		color: "#d1d5db",
		rule: "Luminosidade > 95%",
		example: "#F2F2F2 ~ #FFFFFF"
	},
	Cinza: {
		color: "#9ca3af",
		rule: "Saturação < 10%",
		example: "#808080, #C0C0C0"
	},
	Vermelho: {
		color: "#ef4444",
		rule: "Matiz 340°-20°",
		example: "#FF0000, #8B0000"
	},
	Laranja: {
		color: "#f97316",
		rule: "Matiz 20°-40°",
		example: "#FFA500, #FF8C00"
	},
	Amarelo: {
		color: "#eab308",
		rule: "Matiz 40°-65°",
		example: "#FFFF00, #FFD700"
	},
	Verde: {
		color: "#22c55e",
		rule: "Matiz 65°-150°",
		example: "#008000, #006400"
	},
	Ciano: {
		color: "#06b6d4",
		rule: "Matiz 150°-190°",
		example: "#00FFFF, #40E0D0"
	},
	Azul: {
		color: "#3b82f6",
		rule: "Matiz 190°-260°",
		example: "#0000FF, #00008B"
	},
	"Violeta/Roxo": {
		color: "#8b5cf6",
		rule: "Matiz 260°-290°",
		example: "#8A2BE2, #4B0082"
	},
	"Rosa/Magenta": {
		color: "#d946ef",
		rule: "Matiz 290°-340°",
		example: "#FF00FF, #C71585"
	},
	"Outra Cor": {
		color: "#64748b",
		rule: "Cor não classificada",
		example: "N/A"
	}
};

export default function Dashboard() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [file, setFile] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [results, setResults] = useState<ApiResponse | null>(null);
	const [showUpload, setShowUpload] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showDetailsTable, setShowDetailsTable] = useState(false);

	const handleProcess = async () => {
		if (!file) {
			setError("Nenhum arquivo selecionado.");
			return;
		}
		setIsProcessing(true);
		setError(null);
		setResults(null);
		setShowDetailsTable(false);
		try {
			const data = await uploadAndPredict(file);
			if (data?.predictions?.length > 0) {
				setResults(data);
				setShowUpload(false);
				await addHistoryEntry(file.name, data);
			} else {
				setError(
					"A análise foi concluída, mas não retornou resultados."
				);
				setShowUpload(true);
			}
		} catch (err) {
			console.error("Erro ao processar arquivo:", err);
			setError(err instanceof Error ? err.message : "Erro desconhecido.");
			setShowUpload(true);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleLoadFromHistory = (entry: HistoryEntry) => {
		const historicalFile = new File([], entry.fileName, {
			type: "text/csv"
		});
		setFile(historicalFile);
		setResults(entry.results);
		setError(null);
		setShowUpload(false);
		setShowDetailsTable(false);
		setActiveTab("dashboard");
	};

	const handleNewAnalysis = () => {
		setShowUpload(true);
		setFile(null);
		setResults(null);
		setError(null);
		setShowDetailsTable(false);
	};

	const toggleDetailsTable = () => {
		setShowDetailsTable(prevState => !prevState);
	};

	const processedData = useMemo(() => {
		const defaults = {
			avgTarget1: 0,
			avgTarget2: 0,
			avgTarget3: 0,
			timeDistribution: [] as DistributionBin[],
			colorDistribution: [] as PieSliceData[],
			likertDistribution: [] as LikertData[],
			clusterDistribution: [] as PieSliceData[],
			clusterComparison: [] as ClusterComparisonData[]
		};
		if (!results?.predictions) return defaults;
		const { predictions } = results;
		if (predictions.length === 0) return defaults;

		const sumT1 = predictions.reduce(
			(s, p) => s + (p.PREDICAO_Target1 || 0),
			0
		);
		const sumT2 = predictions.reduce(
			(s, p) => s + (p.PREDICAO_Target2 || 0),
			0
		);
		const sumT3 = predictions.reduce(
			(s, p) => s + (p.PREDICAO_Target3 || 0),
			0
		);
		const avgTarget1 = sumT1 / predictions.length;
		const avgTarget2 = sumT2 / predictions.length;
		const avgTarget3 = sumT3 / predictions.length;

		const tempos = predictions
			.map(p => p.original_data["TempoTotal"])
			.filter((t): t is number => typeof t === "number" && !isNaN(t));
		const maxTime = Math.max(...tempos);
		const binSize = Math.ceil(maxTime / 6 / 10) * 10;
		const timeBins: { [key: string]: number } = {};
		tempos.forEach(t => {
			const binStart = Math.floor(t / binSize) * binSize;
			const range = `${binStart}-${binStart + binSize}s`;
			timeBins[range] = (timeBins[range] || 0) + 1;
		});
		const timeDistribution: DistributionBin[] = Object.entries(timeBins)
			.map(([range, count]) => ({ range, count }))
			.sort(
				(a, b) =>
					parseInt(a.range.split("-")[0]) -
					parseInt(b.range.split("-")[0])
			);

		const colorFamilyCounts: { [key: string]: number } = {};
		predictions.forEach(p => {
			Object.keys(p.original_data)
				.filter(k => k.startsWith("Cor") && k.endsWith("_R"))
				.map(k => k.slice(0, -2))
				.forEach(base => {
					const [R, G, B] = [
						p.original_data[`${base}_R`],
						p.original_data[`${base}_G`],
						p.original_data[`${base}_B`]
					];
					if (
						typeof R === "number" &&
						typeof G === "number" &&
						typeof B === "number"
					) {
						const family = getColorFamily(R, G, B);
						colorFamilyCounts[family] =
							(colorFamilyCounts[family] || 0) + 1;
					}
				});
		});
		const colorDistribution: PieSliceData[] = Object.entries(
			colorFamilyCounts
		)
			.map(([family, count]) => ({
				id: family,
				label: family,
				value: count,
				details: colorFamilyDetails[family],
				color: colorFamilyDetails[family]?.color || "#64748b"
			}))
			.sort((a, b) => b.value - a.value);

		const likertCols = [
			"F0705",
			"F0706",
			"F0707",
			"F0708",
			"F0709",
			"F0710",
			"F0711",
			"F0712",
			"F0713"
		];
		const likertCounts: { [metric: string]: { [res: string]: number } } =
			{};
		likertCols.forEach(col => {
			if (predictions.length > 0 && col in predictions[0].original_data) {
				likertCounts[col] = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
				predictions.forEach(p => {
					const res = String(p.original_data[col]);
					if (likertCounts[col][res] !== undefined)
						likertCounts[col][res]++;
				});
			}
		});
		const likertDistribution: LikertData[] = Object.entries(
			likertCounts
		).map(([metric, counts]) => ({
			metric,
			"1": counts["1"],
			"2": counts["2"],
			"3": counts["3"],
			"4": counts["4"],
			"5": counts["5"]
		}));

		return {
			avgTarget1,
			avgTarget2,
			avgTarget3,
			timeDistribution,
			colorDistribution,
			likertDistribution,
			clusterDistribution: [],
			clusterComparison: []
		};
	}, [results]);

	const processedSuccessfully = results?.processed_rows ?? 0;
	const displayPredictions: ApiPredictionRow[] = results?.predictions ?? [];
	const target1Stats: TargetStatsData = {
		mean: processedData.avgTarget1,
		std: 0,
		distribution: "Média"
	};
	const target2Stats: TargetStatsData = {
		mean: processedData.avgTarget2,
		std: 0,
		distribution: "Média"
	};
	const target3Stats: TargetStatsData = {
		mean: processedData.avgTarget3,
		std: 0,
		distribution: "Média"
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
			<Header activeTab={activeTab} setActiveTab={setActiveTab} />
			<main className="max-w-7xl mx-auto px-8 py-8">
				{activeTab === "dashboard" && (
					<>
						{error && (
							<div
								className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md"
								role="alert"
							>
								<div className="flex items-center">
									<AlertCircle className="w-6 h-6 mr-3" />
									<div>
										<p className="font-bold">
											Erro na Análise
										</p>
										<p>{error}</p>
									</div>
								</div>
							</div>
						)}
						{!results && !showUpload ? (
							<div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
								<div className="text-center">
									<div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
										<BarChart3 className="w-12 h-12 text-purple-600" />
									</div>
									<h2 className="text-3xl font-bold text-gray-800 mb-3">
										Dashboard
									</h2>
									<p className="text-gray-500 mb-8 max-w-md mx-auto">
										Visão geral das suas análises
										preditivas. Comece enviando um arquivo
										CSV para análise.
									</p>
									<button
										onClick={handleNewAnalysis}
										className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
									>
										<Upload className="w-5 h-5 inline mr-2" />{" "}
										Nova Análise
									</button>
								</div>
							</div>
						) : showUpload ? (
							<FileUpload
								file={file}
								setFile={setFile}
								onProcess={handleProcess}
								isProcessing={isProcessing}
								onCancel={() => {
									setShowUpload(false);
									setError(null);
									setFile(null);
								}}
							/>
						) : results ? (
							<div className="space-y-10">
								<div className="flex items-center justify-between pb-6 border-b border-purple-200">
									<div>
										<h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
											<BarChart3 className="w-8 h-8 text-purple-600" />{" "}
											Dashboard - Resultados da Análise
										</h2>
										<p className="text-gray-500 mt-1">
											Análise concluída para o arquivo:{" "}
											<span className="font-medium text-gray-700">
												{file?.name ?? "Desconhecido"}
											</span>
										</p>
									</div>
									<button
										onClick={handleNewAnalysis}
										className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
									>
										<Upload className="w-5 h-5 inline mr-2" />{" "}
										Nova Análise
									</button>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<StatCard
										icon={FileSpreadsheet}
										title="Total de Linhas"
										value={results.total_rows.toString()}
										subtitle="No arquivo enviado"
										iconBg="bg-gradient-to-br from-blue-100 to-blue-200"
										iconColor="text-blue-600"
									/>
									<StatCard
										icon={TrendingUp}
										title="Linhas Processadas"
										value={processedSuccessfully.toString()}
										subtitle="Com sucesso pela API"
										iconBg="bg-gradient-to-br from-green-100 to-green-200"
										iconColor="text-green-600"
									/>
								</div>
								<section>
									<div className="mb-6 text-center">
										<h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
											<Hourglass className="w-6 h-6 text-blue-500" />{" "}
											Entendendo os Dados
										</h2>
										<p className="text-gray-500 text-sm max-w-xl mx-auto">
											Explorando as características dos
											dados enviados.
										</p>
									</div>
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
										{processedData.timeDistribution.length >
										0 ? (
											<DistributionChart
												data={
													processedData.timeDistribution
												}
												title="Distribuição do Tempo Gasto"
												xAxisLabel="Tempo (segundos)"
												yAxisLabel="Nº de Jogadores"
											/>
										) : (
											<div className="placeholder-card">
												Dados de Tempo Indisponíveis
											</div>
										)}
										{processedData.colorDistribution
											.length > 0 ? (
											<GenericPieChart
												data={
													processedData.colorDistribution
												}
												title="Distribuição de Cores Escolhidas"
												subtitle="Preferências visuais por família de cor"
											/>
										) : (
											<div className="placeholder-card">
												Dados de Cor Indisponíveis
											</div>
										)}
									</div>
									{processedData.likertDistribution.length >
									0 ? (
										<LikertDistributionChart
											data={
												processedData.likertDistribution
											}
											title="Distribuição de Respostas (Ex: Emoções F07xx)"
											subtitle="Feedback ou estado dos jogadores"
										/>
									) : (
										<div className="placeholder-card">
											Dados Likert Indisponíveis
										</div>
									)}
								</section>
								<section className="bg-white rounded-3xl shadow-lg p-8">
									<h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center flex items-center justify-center gap-2">
										<Target className="w-6 h-6 text-red-500" />{" "}
										Os Targets: O Que Estamos Prevendo?
									</h2>
									<p className="text-gray-500 text-sm mb-6 text-center max-w-xl mx-auto">
										A análise foca em prever três
										valores-chave (Targets).
									</p>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<TargetCard
											title="Target 1 (Média)"
											stats={target1Stats}
										/>
										<TargetCard
											title="Target 2 (Média)"
											stats={target2Stats}
										/>
										<TargetCard
											title="Target 3 (Média)"
											stats={target3Stats}
										/>
									</div>
								</section>
								<div className="text-center mt-10 mb-4 pt-6 border-t border-purple-200">
									<button
										onClick={toggleDetailsTable}
										className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-200 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
									>
										{showDetailsTable ? (
											<>
												{" "}
												<EyeOff className="w-5 h-5" />{" "}
												Ocultar Detalhes{" "}
											</>
										) : (
											<>
												{" "}
												<Eye className="w-5 h-5" />{" "}
												Mostrar Detalhes{" "}
											</>
										)}
									</button>
									{!showDetailsTable && (
										<p className="text-xs text-gray-500 mt-2">
											Clique para ver os resultados
											individuais.
										</p>
									)}
								</div>
								{showDetailsTable && (
									<PredictionsTable
										predictions={displayPredictions}
									/>
								)}
							</div>
						) : null}
					</>
				)}
				{activeTab === "history" && (
					<div className="space-y-6">
						<div className="flex items-center gap-3 mb-6">
							<Clock className="w-8 h-8 text-purple-600" />
							<div>
								<h2 className="text-3xl font-bold text-gray-800">
									Histórico de Análises
								</h2>
								<p className="text-gray-500 mt-1">
									Selecione uma análise anterior para
									carregar.
								</p>
							</div>
						</div>
						<HistoryList onLoadEntry={handleLoadFromHistory} />
					</div>
				)}
				{activeTab === "preview" && <PreviewCharts />}
			</main>
			<style>{`.placeholder-card { background-color: white; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); padding: 2rem; text-align: center; color: #6b7280; display: flex; align-items: center; justify-content: center; min-height: 400px; font-style: italic; }`}</style>
		</div>
	);
}
