// frontend/src/pages/Dashboard.tsx
import { useState, useMemo } from "react";
import {
  BarChart3,
  Clock,
  Upload,
  FileSpreadsheet,
  Target,
  AlertCircle,
  Eye,
  EyeOff,
  Hourglass,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import FileUpload from "../components/FileUpload";
import TargetCard from "../components/TargetCard";
import PredictionsTable from "../components/PredictionsTable";
import {
  GenericPieChart,
  DistributionChart,
  LikertDistributionChart,
  PredictionsVsRealChart,
  CorrelationHeatmapChart,
  TempoVsPerformanceChart,
  PerformanceEvolutionChart,
} from "../components/AnalysisCharts";
import { uploadAndPredict } from "../services/api";
import type {
  ApiResponse,
  ApiPredictionRow,
  HeatmapDataRow,
} from "../services/api";
import HistoryList from "../components/HistoryList";
import { addHistoryEntry } from "../services/db";
import type { HistoryEntry } from "../services/db";

// ... (interfaces e funções getColorFamily, rgbToHsl, colorFamilyDetails permanecem iguais) ...

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
interface ScatterPoint {
  x: number;
  y: number;
  player: string;
  target1?: number;
  cluster?: number;
}
interface ScatterData {
  id: string; // Geralmente 'Cluster 0' ou 'Cluster 1' para este novo gráfico
  data: ScatterPoint[];
}
interface PerformanceEvolutionPoint {
  x: string;
  y: number;
}

interface PerformanceEvolutionData {
  id: string;
  data: PerformanceEvolutionPoint[];
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
    example: "#000000 ~ #1A1A1A",
  },
  Branco: {
    color: "#d1d5db",
    rule: "Luminosidade > 95%",
    example: "#F2F2F2 ~ #FFFFFF",
  },
  Cinza: {
    color: "#9ca3af",
    rule: "Saturação < 10%",
    example: "#808080, #C0C0C0",
  },
  Vermelho: {
    color: "#ef4444",
    rule: "Matiz 340°-20°",
    example: "#FF0000, #8B0000",
  },
  Laranja: {
    color: "#f97316",
    rule: "Matiz 20°-40°",
    example: "#FFA500, #FF8C00",
  },
  Amarelo: {
    color: "#eab308",
    rule: "Matiz 40°-65°",
    example: "#FFFF00, #FFD700",
  },
  Verde: {
    color: "#22c55e",
    rule: "Matiz 65°-150°",
    example: "#008000, #006400",
  },
  Ciano: {
    color: "#06b6d4",
    rule: "Matiz 150°-190°",
    example: "#00FFFF, #40E0D0",
  },
  Azul: {
    color: "#3b82f6",
    rule: "Matiz 190°-260°",
    example: "#0000FF, #00008B",
  },
  "Violeta/Roxo": {
    color: "#8b5cf6",
    rule: "Matiz 260°-290°",
    example: "#8A2BE2, #4B0082",
  },
  "Rosa/Magenta": {
    color: "#d946ef",
    rule: "Matiz 290°-340°",
    example: "#FF00FF, #C71585",
  },
  "Outra Cor": {
    color: "#64748b",
    rule: "Cor não classificada",
    example: "N/A",
  },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsTable, setShowDetailsTable] = useState(false);

  // ... (handleProcess, handleLoadFromHistory, handleNewAnalysis, toggleDetailsTable permanecem iguais) ...
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
        setError("A análise foi concluída, mas não retornou resultados.");
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
      type: "text/csv", // Ou o tipo correto se você salvou
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
    setShowDetailsTable((prevState) => !prevState);
  };

  const processedData = useMemo(() => {
    const defaults = {
      avgTarget1: 0,
      avgTarget2: 0,
      avgTarget3: 0,
      stdDevTarget1: 0,
      stdDevTarget2: 0,
      stdDevTarget3: 0,
      timeDistribution: [] as DistributionBin[],
      colorDistribution: [] as PieSliceData[],
      likertDistribution: [] as LikertData[],
      clusterDistribution: [] as PieSliceData[],
      clusterComparison: [] as ClusterComparisonData[],
      scatterDataT1: null as ScatterData[] | null,
      scatterDataT2: null as ScatterData[] | null,
      scatterDataT3: null as ScatterData[] | null,
      heatmapData: null as HeatmapDataRow[] | null,
      avgTimeAll: 0,
      percHits: 0,
      percErrors: 0,
      percOmissions: 0,
      rawHits: 0,
      rawErrors: 0,
      rawOmissions: 0,
      hasRoundData: false,
      tempoVsPerformanceData: [] as ScatterData[],
	  performanceEvolutionData: [] as PerformanceEvolutionData[],
      timeCol: "T0498",
    };

    if (!results?.predictions) return defaults;
    const { predictions } = results;
    const playerCount = predictions.length;
    if (playerCount === 0) return defaults;

    // ... (cálculos de avgTarget1/2/3, stdDevTarget1/2/3 permanecem iguais) ...
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
    const predT1 = predictions
      .map((p) => p.PREDICAO_Target1)
      .filter((v): v is number => typeof v === "number");
    const predT2 = predictions
      .map((p) => p.PREDICAO_Target2)
      .filter((v): v is number => typeof v === "number");
    const predT3 = predictions
      .map((p) => p.PREDICAO_Target3)
      .filter((v): v is number => typeof v === "number");
    const calculateStdDev = (arr: number[], mean: number): number => {
      if (arr.length < 2) return 0;
      const variance =
        arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
      return Math.sqrt(variance);
    };
    const stdDevTarget1 = calculateStdDev(predT1, avgTarget1);
    const stdDevTarget2 = calculateStdDev(predT2, avgTarget2);
    const stdDevTarget3 = calculateStdDev(predT3, avgTarget3);

    // --- Time Distribution (usando TempoTotal se existir, senão T0498 como fallback) ---
    const timeCol =
      predictions.length > 0 &&
      predictions[0].original_data["TempoTotal"] !== undefined
        ? "TempoTotal"
        : "T0498"; // Usa T0498 se TempoTotal não existir
    const tempos = predictions
      .map((p) => p.original_data[timeCol])
      .filter((t): t is number => typeof t === "number" && !isNaN(t));

    let timeDistribution: DistributionBin[] = [];
    if (tempos.length > 0) {
      const maxTime = Math.max(...tempos);
      const binSize = Math.max(1, Math.ceil(maxTime / 6 / 10) * 10); // Evita binSize 0
      const timeBins: { [key: string]: number } = {};
      tempos.forEach((t) => {
        const binStart = Math.floor(t / binSize) * binSize;
        const range = `${binStart}-${binStart + binSize}s`;
        timeBins[range] = (timeBins[range] || 0) + 1;
      });
      timeDistribution = Object.entries(timeBins)
        .map(([range, count]) => ({ range, count }))
        .sort(
          (a, b) =>
            parseInt(a.range.split("-")[0]) - parseInt(b.range.split("-")[0])
        );
    }

    // ... (cálculos de colorDistribution e likertDistribution permanecem iguais) ...
    const colorFamilyCounts: { [key: string]: number } = {};
    predictions.forEach((p) => {
      Object.keys(p.original_data)
        .filter((k) => k.startsWith("Cor") && k.endsWith("_R"))
        .map((k) => k.slice(0, -2))
        .forEach((base) => {
          const [R, G, B] = [
            p.original_data[`${base}_R`],
            p.original_data[`${base}_G`],
            p.original_data[`${base}_B`],
          ];
          if (
            typeof R === "number" &&
            typeof G === "number" &&
            typeof B === "number"
          ) {
            const family = getColorFamily(R, G, B);
            colorFamilyCounts[family] = (colorFamilyCounts[family] || 0) + 1;
          }
        });
    });
    const colorDistribution: PieSliceData[] = Object.entries(colorFamilyCounts)
      .map(([family, count]) => ({
        id: family,
        label: family,
        value: count,
        details: colorFamilyDetails[family],
        color: colorFamilyDetails[family]?.color || "#64748b",
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
      "F0713",
    ];
    const likertCounts: { [metric: string]: { [res: string]: number } } = {};
    likertCols.forEach((col) => {
      if (predictions.length > 0 && col in predictions[0].original_data) {
        likertCounts[col] = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
        predictions.forEach((p) => {
          const res = String(p.original_data[col]);
          if (likertCounts[col][res] !== undefined) likertCounts[col][res]++;
        });
      }
    });
    const likertDistribution: LikertData[] = Object.entries(likertCounts).map(
      ([metric, counts]) => ({
        metric,
        "1": counts["1"],
        "2": counts["2"],
        "3": counts["3"],
        "4": counts["4"],
        "5": counts["5"],
      })
    );

    // ... (cálculo de scatterDataT1/2/3 para Predição vs Real permanece igual) ...
    let scatterDataT1: ScatterData[] | null = null;
    let scatterDataT2: ScatterData[] | null = null;
    let scatterDataT3: ScatterData[] | null = null;
    const hasRealTargets =
      predictions.length > 0 &&
      predictions[0].original_data["Target1"] !== undefined &&
      predictions[0].original_data["Target2"] !== undefined &&
      predictions[0].original_data["Target3"] !== undefined;
    if (hasRealTargets) {
      const dataT1: ScatterPoint[] = [];
      const dataT2: ScatterPoint[] = [];
      const dataT3: ScatterPoint[] = [];
      predictions.forEach((p) => {
        const realT1 = p.original_data["Target1"];
        const predT1 = p.PREDICAO_Target1;
        const realT2 = p.original_data["Target2"];
        const predT2 = p.PREDICAO_Target2;
        const realT3 = p.original_data["Target3"];
        const predT3 = p.PREDICAO_Target3;
        const player = String(p.original_data["Código de Acesso"] ?? "N/A");
        if (realT1 != null && predT1 != null) {
          dataT1.push({ x: realT1 as number, y: predT1 as number, player });
        }
        if (realT2 != null && predT2 != null) {
          dataT2.push({ x: realT2 as number, y: predT2 as number, player });
        }
        if (realT3 != null && predT3 != null) {
          dataT3.push({ x: realT3 as number, y: predT3 as number, player });
        }
      });
      if (dataT1.length > 0) scatterDataT1 = [{ id: "Target 1", data: dataT1 }];
      if (dataT2.length > 0) scatterDataT2 = [{ id: "Target 2", data: dataT2 }];
      if (dataT3.length > 0) scatterDataT3 = [{ id: "Target 3", data: dataT3 }];
    }

    // --- **INÍCIO DA CORREÇÃO** ---
    // --- Lógica para os 4 Cards e Gráfico TempoVsPerformance ---
    let avgTimeAll = 0;
    let percHits = 0;
    let percErrors = 0;
    let percOmissions = 0;
    let rawHits = 0;
    let rawErrors = 0;
    let rawOmissions = 0;
    const tempoVsPerformanceData: ScatterData[] = [];

    // **FIX 1: Flag separada para os 4 cards**
    const hasRoundData =
      predictions.length > 0 &&
      predictions[0].original_data["Q0413"] !== undefined && // Acertos Total
      predictions[0].original_data["Q0414"] !== undefined && // Erros Total
      predictions[0].original_data["Q0415"] !== undefined && // Omissões Total
      predictions[0].original_data["T0498"] !== undefined; // Tempo Total (para cards)

    // **FIX 2: Flag separada para o gráfico de performance**
    // (Depende das colunas dos cards + a coluna de Cluster)
    const hasTempoVsPerfData =
      hasRoundData && predictions[0].original_data["Cluster_0"] !== undefined; // Cluster (para cor do gráfico)

    // **FIX 3: Processar o loop se hasRoundData for true**
    // Os dados do TempoVsPerf serão preenchidos *dentro* do loop se hasTempoVsPerfData for true
    if (hasRoundData) {
      let totalTimeSumT0498 = 0; // Soma para a média do card
      const cluster0Points: ScatterPoint[] = [];
      const cluster1Points: ScatterPoint[] = [];

      predictions.forEach((p, index) => {
        try {
          // --- Lógica para os 4 Cards (Sempre executa se hasRoundData) ---
          rawHits += Number(p.original_data["Q0413"] ?? 0);
          rawErrors += Number(p.original_data["Q0414"] ?? 0);
          rawOmissions += Number(p.original_data["Q0415"] ?? 0);
          totalTimeSumT0498 += Number(p.original_data["T0498"] ?? 0);

          // --- Lógica para o gráfico (SÓ executa se hasTempoVsPerfData) ---
          if (hasTempoVsPerfData) {
            const tempo = Number(p.original_data["T0498"] ?? 0);
            const acertos = Number(p.original_data["Q0413"] ?? 0);
            const player = String(
              p.original_data["Código de Acesso"] ?? `Row_${index + 1}`
            );
            const isCluster0 = Number(p.original_data["Cluster_0"] ?? 0) === 1;

            if (tempo >= 0 && acertos >= 0) {
              const point = { x: tempo, y: acertos, player };
              if (isCluster0) {
                cluster0Points.push(point);
              } else {
                cluster1Points.push(point);
              }
            }
          }
        } catch (error) {
          console.error(`ERROR inside loop at index ${index}:`, error);
          console.error("Data at error:", p.original_data);
        }
      });

      // --- Cálculos Pós-Loop (para os 4 cards) ---
      const totalInteractions = rawHits + rawErrors + rawOmissions;
      avgTimeAll = playerCount > 0 ? totalTimeSumT0498 / playerCount : 0;

      if (totalInteractions > 0) {
        percHits = (rawHits / totalInteractions) * 100;
        percErrors = (rawErrors / totalInteractions) * 100;
        percOmissions = (rawOmissions / totalInteractions) * 100;
      }

      // --- Formatação Pós-Loop (para o gráfico) ---
      if (hasTempoVsPerfData) {
        if (cluster0Points.length > 0) {
          tempoVsPerformanceData.push({
            id: "Cluster 0",
            data: cluster0Points,
          });
        }
        if (cluster1Points.length > 0) {
          tempoVsPerformanceData.push({
            id: "Cluster 1",
            data: cluster1Points,
          });
        }
      }
    }

    const hasTempoVsPerformanceData =
      predictions.length > 0 &&
      predictions[0].original_data["TempoTotal"] !== undefined &&
      predictions[0].original_data["Q0413"] !== undefined;

    if (hasTempoVsPerformanceData) {
      const cluster0Points: ScatterPoint[] = [];
      const cluster1Points: ScatterPoint[] = [];
      const clusterNullPoints: ScatterPoint[] = [];

      predictions.forEach((p, index) => {
        const tempo = Number(p.original_data["TempoTotal"] ?? 0);
        const acertos = Number(p.original_data["Q0413"] ?? 0);
        const player = String(
          p.original_data["Código de Acesso"] ?? `Player_${index + 1}`
        );
        const target1 = p.PREDICAO_Target1;

        let cluster = -1;
        if (p.original_data["Cluster_0"] !== undefined) {
          cluster = Number(p.original_data["Cluster_0"]) === 1 ? 0 : 1;
        }

        if (tempo >= 0 && acertos >= 0) {
          const point: ScatterPoint = {
            x: tempo,
            y: acertos,
            player: player,
            target1: target1 ?? undefined,
            cluster: cluster !== -1 ? cluster : undefined,
          };

          if (cluster === 0) {
            cluster0Points.push(point);
          } else if (cluster === 1) {
            cluster1Points.push(point);
          } else {
            clusterNullPoints.push(point);
          }
        }
      });

      if (cluster0Points.length > 0) {
        tempoVsPerformanceData.push({ id: "Cluster 0", data: cluster0Points });
      }
      if (cluster1Points.length > 0) {
        tempoVsPerformanceData.push({ id: "Cluster 1", data: cluster1Points });
      }
      if (clusterNullPoints.length > 0) {
        tempoVsPerformanceData.push({
          id: "Sem Cluster",
          data: clusterNullPoints,
        });
      }
    }

    const performanceEvolutionData: PerformanceEvolutionData[] = [];

    // Verifica se as colunas de rodadas existem
    const hasPerformanceEvolutionData =
      predictions.length > 0 &&
      predictions[0].original_data["Q0301"] !== undefined &&
      predictions[0].original_data["Q0302"] !== undefined &&
      predictions[0].original_data["Q0303"] !== undefined &&
      predictions[0].original_data["Q0413"] !== undefined;

    if (hasPerformanceEvolutionData) {
      // Arrays para acumular dados por cluster
      const cluster0Data = { r1: 0, r2: 0, r3: 0, total: 0, count: 0 };
      const cluster1Data = { r1: 0, r2: 0, r3: 0, total: 0, count: 0 };
      const allData = { r1: 0, r2: 0, r3: 0, total: 0, count: 0 };

      predictions.forEach((p) => {
        // Pega os acertos de cada rodada (são porcentagens já)
        const r1 = Number(p.original_data["Q0301"] ?? 0);
        const r2 = Number(p.original_data["Q0302"] ?? 0);
        const r3 = Number(p.original_data["Q0303"] ?? 0);
        const totalAcertos = Number(p.original_data["Q0413"] ?? 0);

        // Calcula taxa de acerto total (assumindo 60 questões totais)
        const totalPercentage = (totalAcertos / 60) * 100;

        // Detecta o cluster
        let cluster = -1;
        if (p.original_data["Cluster_0"] !== undefined) {
          cluster = Number(p.original_data["Cluster_0"]) === 1 ? 0 : 1;
        }

        // Acumula por cluster
        if (cluster === 0) {
          cluster0Data.r1 += r1;
          cluster0Data.r2 += r2;
          cluster0Data.r3 += r3;
          cluster0Data.total += totalPercentage;
          cluster0Data.count += 1;
        } else if (cluster === 1) {
          cluster1Data.r1 += r1;
          cluster1Data.r2 += r2;
          cluster1Data.r3 += r3;
          cluster1Data.total += totalPercentage;
          cluster1Data.count += 1;
        }

        // Acumula total
        allData.r1 += r1;
        allData.r2 += r2;
        allData.r3 += r3;
        allData.total += totalPercentage;
        allData.count += 1;
      });

      // Calcula médias e formata para o gráfico
      if (cluster0Data.count > 0) {
        performanceEvolutionData.push({
          id: "Cluster 0",
          data: [
            { x: "Rodada 1", y: cluster0Data.r1 / cluster0Data.count },
            { x: "Rodada 2", y: cluster0Data.r2 / cluster0Data.count },
            { x: "Rodada 3", y: cluster0Data.r3 / cluster0Data.count },
            { x: "Total", y: cluster0Data.total / cluster0Data.count },
          ],
        });
      }

      if (cluster1Data.count > 0) {
        performanceEvolutionData.push({
          id: "Cluster 1",
          data: [
            { x: "Rodada 1", y: cluster1Data.r1 / cluster1Data.count },
            { x: "Rodada 2", y: cluster1Data.r2 / cluster1Data.count },
            { x: "Rodada 3", y: cluster1Data.r3 / cluster1Data.count },
            { x: "Total", y: cluster1Data.total / cluster1Data.count },
          ],
        });
      }

      // Adiciona linha "Todos" (média geral)
      if (allData.count > 0) {
        performanceEvolutionData.push({
          id: "Todos os Jogadores",
          data: [
            { x: "Rodada 1", y: allData.r1 / allData.count },
            { x: "Rodada 2", y: allData.r2 / allData.count },
            { x: "Rodada 3", y: allData.r3 / allData.count },
            { x: "Total", y: allData.total / allData.count },
          ],
        });
      }
    }

    return {
      avgTarget1,
      avgTarget2,
      avgTarget3,
      timeDistribution,
      colorDistribution,
      likertDistribution,
      clusterDistribution: [],
      clusterComparison: [],
      scatterDataT1,
      scatterDataT2,
      scatterDataT3,
      stdDevTarget1,
      stdDevTarget2,
      stdDevTarget3,
      heatmapData: results.correlation_heatmap_data || null,
      avgTimeAll,
      percHits,
      percErrors,
      percOmissions,
      rawHits,
      rawErrors,
      rawOmissions,
      hasRoundData: hasRoundData,
      tempoVsPerformanceData,
      performanceEvolutionData,
      timeCol,
    };
  }, [results]);

  const processedSuccessfully = results?.processed_rows ?? 0;
  const displayPredictions: ApiPredictionRow[] = results?.predictions ?? [];
  const target1Stats: TargetStatsData = {
    mean: processedData.avgTarget1,
    std: processedData.stdDevTarget1,
    distribution: "Média",
  };
  const target2Stats: TargetStatsData = {
    mean: processedData.avgTarget2,
    std: processedData.stdDevTarget2,
    distribution: "Média",
  };
  const target3Stats: TargetStatsData = {
    mean: processedData.avgTarget3,
    std: processedData.stdDevTarget3,
    distribution: "Média",
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-grow">
        <main className="max-w-7xl mx-auto px-8 py-8">
          {activeTab === "dashboard" && (
            <>
              {/* ... (renderização de erro, tela inicial, FileUpload) ... */}
              {error && (
                <div
                  className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md"
                  role="alert"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 mr-3" />
                    <div>
                      <p className="font-bold">Erro na Análise</p>
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
                      Visão geral das suas análises preditivas. Comece enviando
                      um arquivo CSV ou xlsl para análise.
                    </p>
                    <button
                      onClick={handleNewAnalysis}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
                    >
                      <Upload className="w-5 h-5 inline mr-2" /> Nova Análise
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
                  {/* ... (Header da análise: Título, nome do arquivo, botão Nova Análise) ... */}
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
                      <Upload className="w-5 h-5 inline mr-2" /> Nova Análise
                    </button>
                  </div>
                  {/* ... (Cards Total Linhas, Linhas Processadas) ... */}
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
                      icon={Users}
                      title="Linhas Processadas"
                      value={processedSuccessfully.toString()}
                      subtitle="Jogadores analisados pela API"
                      iconBg="bg-gradient-to-br from-purple-100 to-purple-200"
                      iconColor="text-purple-600"
                    />
                  </div>
                  <section>
                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
                        <Hourglass className="w-6 h-6 text-blue-500" />{" "}
                        Entendendo os Dados de Entrada
                      </h2>
                      <p className="text-gray-500 text-sm max-w-xl mx-auto">
                        Explorando as características dos dados enviados.
                      </p>
                    </div>

                    {/* --- GRADIENTES E HOVER RESTAURADOS AQUI --- */}
                    {processedData.hasRoundData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard
                          icon={Hourglass}
                          title="Tempo Médio Total"
                          value={`${processedData.avgTimeAll.toFixed(1)}s`}
                          subtitle={`Média da coluna T0498`}
                          iconBg="bg-gradient-to-r from-blue-500 to-blue-300 transition-transform duration-200 hover:scale-105"
                          iconColor="text-white"
                        />
                        <StatCard
                          icon={CheckCircle}
                          title="Total de Acertos"
                          value={`${processedData.percHits.toFixed(1)}%`}
                          subtitle={`${processedData.rawHits} acertos (Q0413)`}
                          iconBg="bg-gradient-to-r from-green-500 to-green-300 transition-transform duration-200 hover:scale-105"
                          iconColor="text-white"
                        />
                        <StatCard
                          icon={XCircle}
                          title="Total de Erros"
                          value={`${processedData.percErrors.toFixed(1)}%`}
                          subtitle={`${processedData.rawErrors} erros (Q0414)`}
                          iconBg="bg-gradient-to-r from-red-500 to-red-300 transition-transform duration-200 hover:scale-105"
                          iconColor="text-white"
                        />
                        <StatCard
                          icon={EyeOff}
                          title="Total Não Respondidas"
                          value={`${processedData.percOmissions.toFixed(1)}%`}
                          subtitle={`${processedData.rawOmissions} omissões (Q0415)`}
                          iconBg="bg-gradient-to-r from-orange-500 to-orange-300 transition-transform duration-200 hover:scale-105"
                          iconColor="text-white"
                        />
                      </div>
                    )}
                    {/* --- FIM DA RESTAURAÇÃO --- */}

                    {/* Gráficos de Distribuição Tempo e Cores */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
                      {processedData.timeDistribution.length > 0 ? (
                        <DistributionChart
                          data={processedData.timeDistribution}
                          title="Distribuição do Tempo Gasto"
                          xAxisLabel={`Tempo (${
                            processedData.timeCol === "TempoTotal"
                              ? "TempoTotal"
                              : "T0498"
                          })`}
                          yAxisLabel="Nº de Jogadores"
                        />
                      ) : (
                        // Só mostra placeholder se timeDistribution estiver vazio
                        // (Não depende mais de hasRoundData diretamente, pois o array estará vazio se não houver dados)
                        <div className="placeholder-card">
                          Dados de Tempo Indisponíveis
                        </div>
                      )}
                      {processedData.colorDistribution.length > 0 ? (
                        <GenericPieChart
                          data={processedData.colorDistribution}
                          title="Distribuição de Cores Escolhidas"
                          subtitle="Preferências visuais por família de cor"
                        />
                      ) : (
                        <div className="placeholder-card">
                          Dados de Cor Indisponíveis
                        </div>
                      )}
                    </div>

                    {/* Gráfico Tempo Vs Performance */}
                    {/* **FIX 5: A verificação da renderização deve ser no array, não em hasRoundData** */}
                    {processedData.tempoVsPerformanceData.length > 0 && (
                      <div className="mb-6">
                        <TempoVsPerformanceChart
                          data={processedData.tempoVsPerformanceData}
                        />
                      </div>
                    )}

                    {/* 🆕 Gráfico de Evolução de Performance */}
                    {processedData.performanceEvolutionData.length > 0 && (
                      <div className="mb-6">
                        <PerformanceEvolutionChart
                          data={processedData.performanceEvolutionData}
                        />
                      </div>
                    )}

                    {/* Gráfico Likert */}
                    {processedData.likertDistribution.length > 0 ? (
                      <LikertDistributionChart
                        data={processedData.likertDistribution}
                        title="Distribuição de Respostas (Ex: Emoções F07xx)"
                        subtitle="Feedback ou estado dos jogadores"
                      />
                    ) : (
                      <div className="placeholder-card">
                        Dados Likert Indisponíveis
                      </div>
                    )}
                  </section>

                  {/* ... (Seção Targets, Seção Predição vs Real, Seção Heatmap) ... */}
                  <section className="bg-white rounded-3xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center flex items-center justify-center gap-2">
                      <Target className="w-6 h-6 text-red-500" /> Os Targets: O
                      Que Estamos Prevendo?
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 text-center max-w-xl mx-auto">
                      A análise foca em prever três valores-chave (Targets).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TargetCard
                        title="Target 1 (Média)"
                        stats={target1Stats}
                        r2Score={results.r2_score_target1}
                      />
                      <TargetCard
                        title="Target 2 (Média)"
                        stats={target2Stats}
                        r2Score={results.r2_score_target2}
                      />
                      <TargetCard
                        title="Target 3 (Média)"
                        stats={target3Stats}
                        r2Score={results.r2_score_target3}
                      />
                    </div>
                  </section>
                  {processedData.scatterDataT1 && (
                    <section>
                      <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
                          <Users className="w-6 h-6 text-purple-500" /> Acurácia
                          da Predição (vs. Real)
                        </h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto">
                          Comparando os valores reais (do CSV) com os valores
                          preditos (pelo modelo).
                        </p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
                        {processedData.scatterDataT1 && (
                          <PredictionsVsRealChart
                            data={processedData.scatterDataT1}
                            targetName="Target 1"
                          />
                        )}
                        {processedData.scatterDataT2 && (
                          <PredictionsVsRealChart
                            data={processedData.scatterDataT2}
                            targetName="Target 2"
                          />
                        )}
                        {processedData.scatterDataT3 && (
                          <PredictionsVsRealChart
                            data={processedData.scatterDataT3}
                            targetName="Target 3"
                          />
                        )}
                      </div>
                    </section>
                  )}
                  {processedData.heatmapData &&
                    processedData.heatmapData.length > 0 && (
                      <section>
                        <CorrelationHeatmapChart
                          data={processedData.heatmapData}
                        />
                      </section>
                    )}

                  {/* ... (Botão Mostrar/Ocultar Detalhes e Tabela de Predições) ... */}
                  <div className="text-center mt-10 mb-4 pt-6 border-t border-purple-200">
                    <button
                      onClick={toggleDetailsTable}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-200 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                    >
                      {showDetailsTable ? (
                        <>
                          {" "}
                          <EyeOff className="w-5 h-5" /> Ocultar Detalhes{" "}
                        </>
                      ) : (
                        <>
                          {" "}
                          <Eye className="w-5 h-5" /> Mostrar Detalhes{" "}
                        </>
                      )}
                    </button>
                    {!showDetailsTable && (
                      <p className="text-xs text-gray-500 mt-2">
                        Clique para ver os resultados individuais.
                      </p>
                    )}
                  </div>
                  {showDetailsTable && (
                    <PredictionsTable predictions={displayPredictions} />
                  )}
                </div>
              ) : null}
            </>
          )}
          {/* ... (Renderização da aba Histórico) ... */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-purple-600" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Histórico de Análises
                  </h2>
                  <p className="text-gray-500 mt-1">
                    Selecione uma análise anterior para carregar.
                  </p>
                </div>
              </div>
              <HistoryList onLoadEntry={handleLoadFromHistory} />
            </div>
          )}
        </main>
        <style>{`.placeholder-card { background-color: white; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); padding: 2rem; text-align: center; color: #6b7280; display: flex; align-items: center; justify-content: center; min-height: 400px; font-style: italic; }`}</style>
      </div>
    </div>
  );
}
