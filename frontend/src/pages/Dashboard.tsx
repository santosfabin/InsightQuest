import { useState, useMemo } from "react";
import {
  BarChart3,
  Clock,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Hourglass,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import FileUpload from "../components/FileUpload";
import TargetCard from "../components/TargetCard";
import PredictionsTable from "../components/PredictionsTable";
import InsightCard from "../components/InsightCard";
import NarrativeSection from "../components/NarrativeSection";
import ExecutiveSummary from "../components/ExecutiveSummary";
import KeyFindings from "../components/KeyFindings";
import CompletionFunnelChart from "../components/CompletionFunnelChart";
import TopBottomPerformersChart from "../components/TopBottomPerformersChart";
import ColorPreferencesChart from "../components/ColorPreferencesChartInteractive";
import {
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

// ... (interfaces permanecem iguais) ...
interface ColorFamilyDetails {
  color: string;
  rule: string;
  example: string;
}
interface ColorDistributionData {
  id: string;
  label: string;
  value: number;
  color: string;
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
interface ScatterPoint {
  x: number;
  y: number;
  player: string;
  target1?: number;
  cluster?: number;
}
interface ScatterData {
  id: string;
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

// ... (funções getColorFamily, rgbToHsl, colorFamilyDetails permanecem iguais) ...
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

  // ... (handlers permanecem iguais) ...
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
      type: "text/csv",
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
      colorDistribution: [] as ColorDistributionData[],
      likertDistribution: [] as LikertData[],
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
      funnelData: [] as Array<{
        stage: string;
        count: number;
        percentage: number;
        color: string;
      }>,
    };

    if (!results?.predictions) return defaults;
    const { predictions } = results;
    const playerCount = predictions.length;
    if (playerCount === 0) return defaults;

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

    const timeCol =
      predictions.length > 0 &&
      predictions[0].original_data["TempoTotal"] !== undefined
        ? "TempoTotal"
        : "T0498";
    const tempos = predictions
      .map((p) => p.original_data[timeCol])
      .filter((t): t is number => typeof t === "number" && !isNaN(t));

    let timeDistribution: DistributionBin[] = [];
    if (tempos.length > 0) {
      const maxTime = Math.max(...tempos);
      const binSize = Math.max(1, Math.ceil(maxTime / 6 / 10) * 10);
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
    const colorDistribution: ColorDistributionData[] = Object.entries(
      colorFamilyCounts
    )
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
          dataT1.push({
            x: realT1 as number,
            y: predT1 as number,
            player,
          });
        }
        if (realT2 != null && predT2 != null) {
          dataT2.push({
            x: realT2 as number,
            y: predT2 as number,
            player,
          });
        }
        if (realT3 != null && predT3 != null) {
          dataT3.push({
            x: realT3 as number,
            y: predT3 as number,
            player,
          });
        }
      });
      if (dataT1.length > 0) scatterDataT1 = [{ id: "Target 1", data: dataT1 }];
      if (dataT2.length > 0) scatterDataT2 = [{ id: "Target 2", data: dataT2 }];
      if (dataT3.length > 0) scatterDataT3 = [{ id: "Target 3", data: dataT3 }];
    }

    let avgTimeAll = 0;
    let percHits = 0;
    let percErrors = 0;
    let percOmissions = 0;
    let rawHits = 0;
    let rawErrors = 0;
    let rawOmissions = 0;
    const tempoVsPerformanceData: ScatterData[] = [];

    const hasRoundData =
      predictions.length > 0 &&
      predictions[0].original_data["Q0413"] !== undefined &&
      predictions[0].original_data["Q0414"] !== undefined &&
      predictions[0].original_data["Q0415"] !== undefined &&
      predictions[0].original_data["T0498"] !== undefined;

    const hasTempoVsPerfData =
      hasRoundData && predictions[0].original_data["Cluster_0"] !== undefined;

    if (hasRoundData) {
      let totalTimeSumT0498 = 0;
      const cluster0Points: ScatterPoint[] = [];
      const cluster1Points: ScatterPoint[] = [];

      predictions.forEach((p, index) => {
        try {
          rawHits += Number(p.original_data["Q0413"] ?? 0);
          rawErrors += Number(p.original_data["Q0414"] ?? 0);
          rawOmissions += Number(p.original_data["Q0415"] ?? 0);
          totalTimeSumT0498 += Number(p.original_data["T0498"] ?? 0);

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
        }
      });

      const totalInteractions = rawHits + rawErrors + rawOmissions;
      avgTimeAll = playerCount > 0 ? totalTimeSumT0498 / playerCount : 0;

      if (totalInteractions > 0) {
        percHits = (rawHits / totalInteractions) * 100;
        percErrors = (rawErrors / totalInteractions) * 100;
        percOmissions = (rawOmissions / totalInteractions) * 100;
      }

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

    const performanceEvolutionData: PerformanceEvolutionData[] = [];

    const hasPerformanceEvolutionData =
      predictions.length > 0 &&
      predictions[0].original_data["Q0401"] !== undefined && // Acertos R1
      predictions[0].original_data["Q0405"] !== undefined && // Acertos R2
      predictions[0].original_data["Q0409"] !== undefined && // Acertos R3
      predictions[0].original_data["Q0413"] !== undefined; // Total acertos

    if (hasPerformanceEvolutionData) {
      // 🎯 CALCULAR DINAMICAMENTE O MÁXIMO (= número de questões)
      const maxR1 = Math.max(
        ...predictions.map((p) => Number(p.original_data["Q0401"] ?? 0))
      );
      const maxR2 = Math.max(
        ...predictions.map((p) => Number(p.original_data["Q0405"] ?? 0))
      );
      const maxR3 = Math.max(
        ...predictions.map((p) => Number(p.original_data["Q0409"] ?? 0))
      );
      const maxTotal = Math.max(
        ...predictions.map((p) => Number(p.original_data["Q0413"] ?? 0))
      );

      // Usar os máximos como referência para o número de questões
      const QUESTIONS_R1 = maxR1 > 0 ? maxR1 : 20; // fallback para 20
      const QUESTIONS_R2 = maxR2 > 0 ? maxR2 : 20;
      const QUESTIONS_R3 = maxR3 > 0 ? maxR3 : 20;
      const TOTAL_QUESTIONS = maxTotal > 0 ? maxTotal : 60;

      console.log("📊 Questões detectadas:", {
        R1: QUESTIONS_R1,
        R2: QUESTIONS_R2,
        R3: QUESTIONS_R3,
        Total: TOTAL_QUESTIONS,
      });

      // Estruturas para acumular dados
      const cluster0Data = { r1: 0, r2: 0, r3: 0, total: 0, count: 0 };
      const cluster1Data = { r1: 0, r2: 0, r3: 0, total: 0, count: 0 };
      const allData = { r1: 0, r2: 0, r3: 0, total: 0, count: 0 };

      predictions.forEach((p) => {
        // Pegar ACERTOS de cada rodada
        const acertosR1 = Number(p.original_data["Q0401"] ?? 0);
        const acertosR2 = Number(p.original_data["Q0405"] ?? 0);
        const acertosR3 = Number(p.original_data["Q0409"] ?? 0);
        const totalAcertos = Number(p.original_data["Q0413"] ?? 0);

        // Calcular percentuais usando os máximos detectados
        const percR1 = (acertosR1 / QUESTIONS_R1) * 100;
        const percR2 = (acertosR2 / QUESTIONS_R2) * 100;
        const percR3 = (acertosR3 / QUESTIONS_R3) * 100;
        const percTotal = (totalAcertos / TOTAL_QUESTIONS) * 100;

        // Identificar cluster
        let cluster = -1;
        if (p.original_data["Cluster_0"] !== undefined) {
          cluster = Number(p.original_data["Cluster_0"]) === 1 ? 0 : 1;
        } else if (p.original_data["Cluster"] !== undefined) {
          cluster = Number(p.original_data["Cluster"]);
        }

        // Acumular nos clusters
        if (cluster === 0) {
          cluster0Data.r1 += percR1;
          cluster0Data.r2 += percR2;
          cluster0Data.r3 += percR3;
          cluster0Data.total += percTotal;
          cluster0Data.count += 1;
        } else if (cluster === 1) {
          cluster1Data.r1 += percR1;
          cluster1Data.r2 += percR2;
          cluster1Data.r3 += percR3;
          cluster1Data.total += percTotal;
          cluster1Data.count += 1;
        }

        // Sempre acumular em "todos"
        allData.r1 += percR1;
        allData.r2 += percR2;
        allData.r3 += percR3;
        allData.total += percTotal;
        allData.count += 1;
      });

      // Adicionar clusters (se tiver dados significativos)
      if (
        cluster0Data.count > 0 &&
        cluster0Data.count > predictions.length * 0.05
      ) {
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

      if (
        cluster1Data.count > 0 &&
        cluster1Data.count > predictions.length * 0.05
      ) {
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

      // Sempre adicionar "Todos os Jogadores"
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

      console.log("📈 Performance Evolution Data:", performanceEvolutionData);
    }

    const funnelData: Array<{
      stage: string;
      count: number;
      percentage: number;
      color: string;
    }> = [];

    if (hasRoundData && predictions.length > 0) {
      const totalIniciaram = predictions.length;

      const completedR1 = predictions.filter(
        (p) =>
          p.original_data["Q0401"] !== undefined &&
          p.original_data["Q0402"] !== undefined &&
          p.original_data["Q0403"] !== undefined &&
          Number(p.original_data["Q0401"]) +
            Number(p.original_data["Q0402"]) +
            Number(p.original_data["Q0403"]) >
            0
      ).length;

      const completedR2 = predictions.filter(
        (p) =>
          p.original_data["Q0405"] !== undefined &&
          p.original_data["Q0406"] !== undefined &&
          p.original_data["Q0407"] !== undefined &&
          Number(p.original_data["Q0405"]) +
            Number(p.original_data["Q0406"]) +
            Number(p.original_data["Q0407"]) >
            0
      ).length;

      const completedR3 = predictions.filter(
        (p) =>
          p.original_data["Q0409"] !== undefined &&
          p.original_data["Q0410"] !== undefined &&
          p.original_data["Q0411"] !== undefined &&
          Number(p.original_data["Q0409"]) +
            Number(p.original_data["Q0410"]) +
            Number(p.original_data["Q0411"]) >
            0
      ).length;

      funnelData.push(
        {
          stage: "Iniciaram",
          count: totalIniciaram,
          percentage: 100,
          color: "#3b82f6", // Azul
        },
        {
          stage: "Completaram Rodada 1",
          count: completedR1,
          percentage: (completedR1 / totalIniciaram) * 100,
          color: "#8b5cf6", // Roxo
        },
        {
          stage: "Completaram Rodada 2",
          count: completedR2,
          percentage: (completedR2 / totalIniciaram) * 100,
          color: "#ec4899", // Rosa
        },
        {
          stage: "Completaram Rodada 3",
          count: completedR3,
          percentage: (completedR3 / totalIniciaram) * 100,
          color: "#10b981", // Verde
        }
      );
    }

    return {
      avgTarget1,
      avgTarget2,
      avgTarget3,
      timeDistribution,
      colorDistribution,
      likertDistribution,
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
      funnelData,
    };
  }, [results]);

  const generateInsights = useMemo(() => {
    if (!results) return [];

    const insights: string[] = [];

    // Calcular R² médio
    const avgR2 =
      [
        results.r2_score_target1,
        results.r2_score_target2,
        results.r2_score_target3,
      ]
        .filter((r): r is number => r !== null && r !== undefined)
        .reduce((sum, r) => sum + r, 0) / 3;

    // Insight 1: Qualidade do Modelo
    if (avgR2 > 0.8) {
      insights.push(
        `O modelo apresenta alta capacidade de previsão, com score R² médio de ${avgR2.toFixed(
          3
        )}.`
      );
    } else if (avgR2 > 0.6) {
      insights.push(
        `O modelo apresenta boa capacidade de previsão, com score R² médio de ${avgR2.toFixed(
          3
        )}.`
      );
    } else if (avgR2 > 0.4) {
      insights.push(
        `O modelo apresenta capacidade moderada de previsão, com score R² médio de ${avgR2.toFixed(
          3
        )}.`
      );
    } else {
      insights.push(
        `O modelo tem capacidade limitada de previsão, com score R² médio de ${avgR2.toFixed(
          3
        )}.`
      );
    }

    // Insight 2: Performance Geral
    if (processedData.hasRoundData) {
      const percHits = processedData.percHits;

      if (percHits > 75) {
        insights.push(
          `Taxa de acerto de ${percHits.toFixed(
            1
          )}% indica desempenho forte do grupo analisado.`
        );
      } else if (percHits > 60) {
        insights.push(
          `Taxa de acerto de ${percHits.toFixed(
            1
          )}% indica desempenho adequado do grupo analisado.`
        );
      } else if (percHits > 40) {
        insights.push(
          `Taxa de acerto de ${percHits.toFixed(
            1
          )}% indica espaço para melhoria no grupo analisado.`
        );
      } else {
        insights.push(
          `Taxa de acerto de ${percHits.toFixed(
            1
          )}% sugere dificuldades significativas no grupo analisado.`
        );
      }
    } else {
      // Se não tiver dados de rodadas
      insights.push(
        `Foram analisados ${results.processed_rows} registros com múltiplas variáveis de comportamento e performance.`
      );
    }

    // Insight 3: Evolução ao Longo das Rodadas
    if (processedData.performanceEvolutionData.length > 0) {
      const allPlayersData = processedData.performanceEvolutionData.find(
        (d) => d.id === "Todos os Jogadores"
      );

      if (allPlayersData && allPlayersData.data.length >= 3) {
        const r1 = allPlayersData.data[0].y;
        const r3 = allPlayersData.data[2].y;
        const improvement = r3 - r1;

        if (improvement > 5) {
          insights.push(
            `Evolução positiva de ${improvement.toFixed(
              1
            )}% da primeira para a última rodada demonstra progressão consistente.`
          );
        } else if (improvement < -5) {
          insights.push(
            `Queda de ${Math.abs(improvement).toFixed(
              1
            )}% entre rodadas pode indicar aumento de dificuldade ou fadiga.`
          );
        } else {
          insights.push(
            `Performance manteve-se estável ao longo das rodadas (variação de ${Math.abs(
              improvement
            ).toFixed(1)}%).`
          );
        }
      } else {
        insights.push(
          `Dados de evolução ao longo das rodadas disponíveis para análise detalhada.`
        );
      }
    } else {
      // Insight alternativo se não tiver dados de evolução
      if (processedData.hasRoundData) {
        const percOmissions = processedData.percOmissions;
        if (percOmissions > 20) {
          insights.push(
            `Taxa de omissão de ${percOmissions.toFixed(
              1
            )}% indica que muitas questões não foram respondidas.`
          );
        } else if (percOmissions > 10) {
          insights.push(
            `Taxa de omissão de ${percOmissions.toFixed(
              1
            )}% está dentro do esperado para este tipo de análise.`
          );
        } else {
          insights.push(
            `Baixa taxa de omissão (${percOmissions.toFixed(
              1
            )}%) indica alto engajamento dos participantes.`
          );
        }
      } else {
        insights.push(
          `Análise detalhada de múltiplas dimensões de comportamento e performance disponível.`
        );
      }
    }

    // Garantir que temos exatamente 3 insights
    while (insights.length < 3) {
      insights.push(
        `Sistema processou ${results.processed_rows} registros de ${results.total_rows} no total.`
      );
    }

    // Limitar a 3 insights
    return insights.slice(0, 3);
  }, [results, processedData]);

  // Gerar recomendações baseadas nos dados
  // Gerar descobertas baseadas nos dados (adaptado para contexto de jogo)
  const generateKeyFindings = useMemo(() => {
    if (!results) return [];

    const findings: Array<{
      type: "insight" | "pattern" | "achievement" | "discovery";
      title: string;
      description: string;
      highlight?: string;
    }> = [];

    // Descoberta 1: Perfis de Jogadores
    if (processedData.performanceEvolutionData.length >= 2) {
      const cluster0 = processedData.performanceEvolutionData.find(
        (d) => d.id === "Cluster 0"
      );
      const cluster1 = processedData.performanceEvolutionData.find(
        (d) => d.id === "Cluster 1"
      );

      if (cluster0 && cluster1) {
        const avgC0 = cluster0.data[3].y; // Total
        const avgC1 = cluster1.data[3].y;
        const diff = Math.abs(avgC0 - avgC1);

        if (diff > 10) {
          findings.push({
            type: "pattern",
            title: "Perfis Distintos de Jogadores Identificados",
            highlight: `${diff.toFixed(1)}% de diferença`,
            description: `Cluster 0 (${cluster0.data[3].y.toFixed(
              1
            )}% acertos) vs Cluster 1 (${cluster1.data[3].y.toFixed(
              1
            )}% acertos) mostram estratégias significativamente diferentes. Ambos são válidos, indicando que o jogo aceita múltiplos estilos de gameplay.`,
          });
        } else {
          findings.push({
            type: "achievement",
            title: "Balanceamento Excelente Entre Perfis",
            description: `Clusters apresentam performance similar (diferença de apenas ${diff.toFixed(
              1
            )}%), indicando que diferentes estratégias são igualmente viáveis. Isto demonstra excelente design de gameplay.`,
          });
        }
      }
    }

    // Descoberta 2: Curva de Aprendizado
    if (processedData.performanceEvolutionData.length > 0) {
      const allPlayersData = processedData.performanceEvolutionData.find(
        (d) => d.id === "Todos os Jogadores"
      );
      if (allPlayersData) {
        const r1 = allPlayersData.data[0].y;
        const r3 = allPlayersData.data[2].y;
        const improvement = r3 - r1;

        if (improvement > 5) {
          findings.push({
            type: "achievement",
            title: "Curva de Aprendizado Positiva Confirmada",
            highlight: `+${improvement.toFixed(1)}% de melhoria`,
            description: `Jogadores melhoraram ${improvement.toFixed(
              1
            )}% da Rodada 1 para Rodada 3, demonstrando que a progressão de dificuldade está bem calibrada e permite aprendizado efetivo.`,
          });
        } else if (improvement < -5) {
          findings.push({
            type: "discovery",
            title: "Fadiga ou Aumento Brusco de Dificuldade",
            highlight: `${improvement.toFixed(1)}% de queda`,
            description: `Performance caiu ${Math.abs(improvement).toFixed(
              1
            )}% da Rodada 1 para Rodada 3. Isto pode indicar fadiga dos jogadores ou aumento desproporcional de dificuldade na última rodada.`,
          });
        } else {
          findings.push({
            type: "insight",
            title: "Performance Consistente Ao Longo das Rodadas",
            description: `Taxa de acerto se manteve estável (variação de apenas ${Math.abs(
              improvement
            ).toFixed(
              1
            )}%), indicando dificuldade uniforme ou que jogadores já dominavam o conteúdo desde o início.`,
          });
        }
      }
    }

    // Descoberta 3: Performance Geral
    if (processedData.hasRoundData) {
      if (processedData.percHits > 75) {
        findings.push({
          type: "achievement",
          title: "Taxa de Acerto Excelente",
          highlight: `${processedData.percHits.toFixed(1)}%`,
          description: `Taxa de acerto acima de 75% indica que os jogadores estão dominando bem o conteúdo. O jogo está acessível mas ainda oferece desafio adequado.`,
        });
      } else if (processedData.percHits > 60) {
        findings.push({
          type: "insight",
          title: "Nível de Dificuldade no Sweet Spot",
          highlight: `${processedData.percHits.toFixed(1)}%`,
          description: `Taxa de acerto entre 60-75% indica equilíbrio ideal entre desafio e frustração. Jogadores sentem-se desafiados mas conseguem progredir.`,
        });
      } else {
        findings.push({
          type: "discovery",
          title: "Dificuldade Pode Estar Elevada",
          highlight: `${processedData.percHits.toFixed(1)}%`,
          description: `Taxa de acerto abaixo de 60% sugere que o jogo pode estar muito difícil para o público-alvo. Considere analisar as questões com maior taxa de erro.`,
        });
      }
    }

    // Descoberta 4: Tempo vs Performance (se houver dados)
    if (processedData.tempoVsPerformanceData.length > 0) {
      findings.push({
        type: "pattern",
        title: "Relação Entre Velocidade e Precisão",
        description: `O gráfico Tempo vs Performance revela como diferentes estratégias de velocidade impactam os resultados. Jogadores mais rápidos não necessariamente têm pior desempenho, indicando que habilidade compensa pela pressa.`,
      });
    }

    // Descoberta 5: Taxa de Omissão
    if (processedData.hasRoundData && processedData.percOmissions > 15) {
      findings.push({
        type: "discovery",
        title: "Taxa de Omissões Elevada",
        highlight: `${processedData.percOmissions.toFixed(1)}%`,
        description: `Mais de 15% das questões não foram respondidas. Isto pode indicar: tempo insuficiente, questões confusas ou falta de feedback claro sobre como responder. Revisar UI/UX das questões.`,
      });
    }

    // Descoberta 6: Preferência de Cores (se houver dados)
    if (processedData.colorDistribution.length > 0) {
      const topColor = processedData.colorDistribution[0];
      const topColorPerc =
        (topColor.value /
          processedData.colorDistribution.reduce((s, c) => s + c.value, 0)) *
        100;

      if (topColorPerc > 40) {
        findings.push({
          type: "insight",
          title: "Forte Preferência por Cor Específica",
          highlight: `${topColor.label}: ${topColorPerc.toFixed(1)}%`,
          description: `Jogadores têm clara preferência por ${
            topColor.label
          } (${topColorPerc.toFixed(
            1
          )}% das escolhas). Isto pode refletir: design visual mais atraente desta cor, associação psicológica, ou viés cultural do público.`,
        });
      }
    }

    // Se tudo está ótimo e não há descobertas negativas
    if (findings.filter((f) => f.type === "achievement").length >= 3) {
      findings.push({
        type: "achievement",
        title: "Gameplay Bem Projetado",
        description: `Múltiplos indicadores positivos (curva de aprendizado, balanceamento, taxa de acerto) confirmam que o design de gameplay está funcionando conforme o esperado. Jogadores estão engajados e progredindo adequadamente.`,
      });
    }

    // Limitar a 6 descobertas mais relevantes
    return findings.slice(0, 6);
  }, [results, processedData]);

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
    <div className="flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-grow">
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
                      Dashboard Analítico
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                      Transforme seus dados em insights acionáveis através de
                      Machine Learning
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
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Resultados da Análise
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Análise do arquivo:{" "}
                        <span className="font-medium text-gray-700">
                          {file?.name ?? "Desconhecido"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={handleNewAnalysis}
                      className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-md mt-4 sm:mt-0 flex-shrink-0"
                    >
                      <Upload className="w-5 h-5 inline mr-2" />
                      Realizar Nova Análise
                    </button>
                  </div>
                  <div className="space-y-12"></div>
                  <div className="space-y-12">
                    {/* RESUMO EXECUTIVO */}
                    <ExecutiveSummary
                      fileName={file?.name ?? "Arquivo Desconhecido"}
                      totalRows={results.total_rows}
                      processedRows={processedSuccessfully}
                      avgTarget1={processedData.avgTarget1}
                      avgTarget2={processedData.avgTarget2}
                      avgTarget3={processedData.avgTarget3}
                      r2_target1={results.r2_score_target1}
                      r2_target2={results.r2_score_target2}
                      r2_target3={results.r2_score_target3}
                      keyInsights={generateInsights}
                    />

                    {/* SEÇÃO 1: CONTEXTO DOS DADOS */}
                    <NarrativeSection
                      id="context"
                      number="1"
                      title="Contexto dos Dados de Entrada"
                      subtitle="Entendendo o perfil do dataset analisado"
                      summary={`Analisamos ${processedSuccessfully} registros com múltiplas variáveis comportamentais e de performance.`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InsightCard
                          type="info"
                          title="Volume de Dados Analisados"
                          metric={`${processedSuccessfully} registros`}
                          description="Quantidade de linhas que foram processadas e analisadas pelo sistema. Quanto mais dados, mais confiáveis tendem a ser os resultados estatísticos."
                          context={`${(
                            (processedSuccessfully / results.total_rows) *
                            100
                          ).toFixed(1)}% do total foi processado com sucesso`}
                        />

                        {processedData.hasRoundData && (
                          <InsightCard
                            type={
                              processedData.percHits > 70
                                ? "success"
                                : processedData.percHits > 50
                                ? "info"
                                : "warning"
                            }
                            title="Performance Geral do Grupo"
                            metric={`${processedData.percHits.toFixed(1)}%`}
                            description="Percentual médio de acertos do grupo analisado. Este número resume o desempenho geral em todas as questões."
                            context={`${processedData.rawHits} acertos de ${
                              processedData.rawHits +
                              processedData.rawErrors +
                              processedData.rawOmissions
                            } interações totais`}
                          />
                        )}
                      </div>

                      {processedData.hasRoundData && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <StatCard
                            icon={Hourglass}
                            title="Tempo Médio Total"
                            value={`${processedData.avgTimeAll.toFixed(1)}s`}
                            subtitle={`Medido na coluna ${processedData.timeCol}`}
                            iconBg="bg-gradient-to-r from-blue-500 to-blue-300"
                            iconColor="text-white"
                          />
                          <StatCard
                            icon={CheckCircle}
                            title="Total de Acertos"
                            value={`${processedData.percHits.toFixed(1)}%`}
                            subtitle={`${processedData.rawHits} acertos totais`}
                            iconBg="bg-gradient-to-r from-green-500 to-green-300"
                            iconColor="text-white"
                          />
                          <StatCard
                            icon={XCircle}
                            title="Total de Erros"
                            value={`${processedData.percErrors.toFixed(1)}%`}
                            subtitle={`${processedData.rawErrors} erros totais`}
                            iconBg="bg-gradient-to-r from-red-500 to-red-300"
                            iconColor="text-white"
                          />
                          <StatCard
                            icon={EyeOff}
                            title="Não Respondidas"
                            value={`${processedData.percOmissions.toFixed(1)}%`}
                            subtitle={`${processedData.rawOmissions} omissões`}
                            iconBg="bg-gradient-to-r from-orange-500 to-orange-300"
                            iconColor="text-white"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {processedData.timeDistribution.length > 0 && (
                          <DistributionChart
                            data={processedData.timeDistribution}
                            title="Distribuição do Tempo Gasto"
                            xAxisLabel={`Tempo (${processedData.timeCol})`}
                            yAxisLabel="Nº de Jogadores"
                          />
                        )}
                        {processedData.colorDistribution.length > 0 && (
                          <ColorPreferencesChart
                            data={processedData.colorDistribution}
                          />
                        )}
                      </div>
                    </NarrativeSection>

                    {/* SEÇÃO 2: EVOLUÇÃO E COMPORTAMENTO */}
                    {(processedData.tempoVsPerformanceData.length > 0 ||
                      processedData.performanceEvolutionData.length > 0) && (
                      <NarrativeSection
                        id="behavior"
                        number="2"
                        title="Evolução e Padrões Comportamentais"
                        subtitle="Como o desempenho evolui ao longo do tempo"
                        summary="Análise da curva de aprendizado e relação entre velocidade e precisão."
                      >
                        {processedData.performanceEvolutionData.length > 0 && (
                          <>
                            <InsightCard
                              type="insight"
                              title="Curva de Aprendizado"
                              description="Este gráfico mostra como o desempenho muda ao longo das rodadas. Linhas subindo indicam melhora progressiva. Linhas descendo podem indicar cansaço ou aumento de dificuldade. Linhas estáveis mostram consistência de performance."
                              context="Cada linha representa um grupo diferente de participantes (clusters)"
                            />
                            <PerformanceEvolutionChart
                              data={processedData.performanceEvolutionData}
                            />
                          </>
                        )}

                        {processedData.tempoVsPerformanceData.length > 0 && (
                          <>
                            <InsightCard
                              type="insight"
                              title="Relação Entre Tempo e Acertos"
                              description="Este gráfico mostra se participantes mais rápidos acertam mais ou menos. Cada ponto é uma pessoa. Pontos no canto superior esquerdo representam quem acertou muito gastando pouco tempo. Pontos no canto inferior direito são quem gastou muito tempo mas acertou pouco."
                              context="Cores diferentes podem representar grupos com estratégias distintas"
                            />
                            <TempoVsPerformanceChart
                              data={processedData.tempoVsPerformanceData}
                            />
                          </>
                        )}
                      </NarrativeSection>
                    )}
                    {processedData.funnelData.length > 0 && (
                      <>
                        <InsightCard
                          type="insight"
                          title="Funil de Conclusão"
                          description="Este gráfico mostra quantos participantes completaram cada etapa. Cada barra representa uma fase, e o número indica quantas pessoas chegaram até ali. A diferença entre barras consecutivas revela onde houve maior desistência."
                          context="Uma queda brusca em alguma fase específica pode indicar um ponto de dificuldade ou problema"
                        />
                        <CompletionFunnelChart
                          data={processedData.funnelData}
                        />
                      </>
                    )}

                    {/* SEÇÃO 3: QUALIDADE PREDITIVA */}
                    <NarrativeSection
                      id="predictions"
                      number="3"
                      title="Qualidade das Predições do Modelo"
                      subtitle="Avaliando a confiabilidade das previsões geradas"
                      summary="Análise do R² e comparação entre valores reais e preditos para validar o modelo."
                    >
                      <div className="mb-6">
                        <InsightCard
                          type="info"
                          title="Sobre o Score R²"
                          description="O R² é uma métrica que mede a qualidade das previsões do modelo. Varia de 0 a 1, onde 1 significa previsões perfeitas. Valores acima de 0.8 indicam previsões muito confiáveis. Entre 0.6 e 0.8 são boas. Abaixo de 0.4 são previsões pouco confiáveis."
                          context="Este número resume o quão bem o modelo consegue prever os resultados"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <TargetCard
                          title="Target 1"
                          stats={target1Stats}
                          r2Score={results.r2_score_target1}
                        />
                        <TargetCard
                          title="Target 2"
                          stats={target2Stats}
                          r2Score={results.r2_score_target2}
                        />
                        <TargetCard
                          title="Target 3"
                          stats={target3Stats}
                          r2Score={results.r2_score_target3}
                        />
                      </div>

                      <div className="mb-8">
                        <TopBottomPerformersChart
                          predictions={results.predictions}
                        />
                      </div>

                      {processedData.scatterDataT1 && (
                        <>
                          <InsightCard
                            type="insight"
                            title="Validação: Predições vs Valores Reais"
                            description="Estes gráficos comparam o que o modelo previu (eixo Y) com o que realmente aconteceu (eixo X). Quanto mais próximos os pontos estiverem da linha vermelha diagonal, mais precisa foi a previsão."
                            context="Pontos espalhados longe da linha indicam previsões menos precisas"
                          />
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        </>
                      )}
                    </NarrativeSection>

                    {/* SEÇÃO 4: FEATURES IMPORTANTES */}
                    {processedData.heatmapData &&
                      processedData.heatmapData.length > 0 && (
                        <NarrativeSection
                          id="features"
                          number="4"
                          title="Fatores Que Mais Influenciam as Predições"
                          subtitle="Identificando as variáveis mais relevantes"
                          summary="Heatmap de correlação revela quais features têm maior poder preditivo."
                        >
                          <InsightCard
                            type="insight"
                            title="Interpretando o Heatmap de Correlação"
                            description="As cores mostram o quanto cada variável se relaciona com os resultados. Azul indica relação positiva (quando uma sobe, a outra também tende a subir). Vermelho indica relação negativa (quando uma sobe, a outra tende a cair). Cores mais intensas representam relações mais fortes."
                            context="Variáveis com cores mais intensas têm maior influência nos resultados"
                          />
                          <CorrelationHeatmapChart
                            data={processedData.heatmapData}
                          />
                        </NarrativeSection>
                      )}

                    {/* SEÇÃO 5: DISTRIBUIÇÕES COMPLEMENTARES */}
                    {processedData.likertDistribution.length > 0 && (
                      <NarrativeSection
                        id="distributions"
                        number="5"
                        title="Distribuições Complementares"
                        subtitle="Análise de respostas qualitativas e feedback"
                        collapsible={true}
                        defaultExpanded={false}
                      >
                        <LikertDistributionChart
                          data={processedData.likertDistribution}
                          title="Distribuição de Respostas Likert (F07xx)"
                          subtitle="Feedback emocional e perceptual dos participantes"
                        />
                      </NarrativeSection>
                    )}

                    {/* SEÇÃO 6: RECOMENDAÇÕES */}
                    <NarrativeSection
                      id="key-findings"
                      number="6"
                      title="Principais Descobertas"
                      subtitle="Insights-chave sobre o comportamento e performance dos jogadores"
                      summary="Análise automática dos padrões identificados nos dados do jogo."
                    >
                      <KeyFindings findings={generateKeyFindings} />
                    </NarrativeSection>

                    {/* DETALHES TÉCNICOS (Colapsável) */}
                    <div className="text-center mt-12 mb-4 pt-6 border-t-2 border-purple-200">
                      <button
                        onClick={toggleDetailsTable}
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-200 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                      >
                        {showDetailsTable ? (
                          <>
                            <EyeOff className="w-5 h-5" /> Ocultar Detalhes
                            Técnicos
                          </>
                        ) : (
                          <>
                            <Eye className="w-5 h-5" /> Mostrar Detalhes
                            Técnicos
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        {showDetailsTable
                          ? "Tabela com todos os valores preditos e dados originais"
                          : "Clique para ver os resultados individuais detalhados"}
                      </p>
                    </div>

                    {showDetailsTable && (
                      <PredictionsTable predictions={displayPredictions} />
                    )}

                    {/* Botão para Nova Análise no Final */}
                    <div className="text-center py-12 border-t-2 border-gray-200">
                      <button
                        onClick={handleNewAnalysis}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
                      >
                        <Upload className="w-5 h-5 inline mr-2" /> Realizar Nova
                        Análise
                      </button>
                    </div>
                  </div>
                </>
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
                    Selecione uma análise anterior para revisar os insights
                  </p>
                </div>
              </div>
              <HistoryList onLoadEntry={handleLoadFromHistory} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
