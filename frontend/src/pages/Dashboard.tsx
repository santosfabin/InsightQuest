import { useState } from "react";
import {
  BarChart3,
  Clock,
  Upload,
  FileSpreadsheet,
  Target,
  TrendingUp,
} from "lucide-react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import FileUpload from "../components/FileUpload";
import TargetCard from "../components/TargetCard";
import PredictionsTable from "../components/PredictionsTable";
import ChartsSection from "../components/ChartsSection";
import PreviewCharts from '../components/PreviewCharts';

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

interface AnalysisResults {
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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const mockResults: AnalysisResults = {
    totalMatches: 156,
    processedSuccessfully: 154,
    modelAccuracy: 0.94,
    targets: {
      target1: { mean: 0.68, std: 0.12, distribution: "Normal" },
      target2: { mean: 2.34, std: 0.89, distribution: "Positiva" },
      target3: { mean: 45.6, std: 12.3, distribution: "Uniforme" },
    },
    predictions: [
      {
        match: 1,
        target1: 0.72,
        target2: 2.5,
        target3: 48.2,
        confidence: 0.94,
      },
      {
        match: 2,
        target1: 0.65,
        target2: 2.1,
        target3: 42.8,
        confidence: 0.91,
      },
      {
        match: 3,
        target1: 0.78,
        target2: 2.8,
        target3: 52.1,
        confidence: 0.96,
      },
      {
        match: 4,
        target1: 0.61,
        target2: 1.9,
        target3: 39.5,
        confidence: 0.88,
      },
      {
        match: 5,
        target1: 0.75,
        target2: 2.6,
        target3: 50.3,
        confidence: 0.93,
      },
    ],
    timeSeriesData: [
      { period: "Jan", target1: 0.65, target2: 2.1, target3: 42 },
      { period: "Fev", target1: 0.68, target2: 2.3, target3: 45 },
      { period: "Mar", target1: 0.72, target2: 2.5, target3: 48 },
      { period: "Abr", target1: 0.7, target2: 2.4, target3: 46 },
      { period: "Mai", target1: 0.75, target2: 2.7, target3: 51 },
      { period: "Jun", target1: 0.73, target2: 2.6, target3: 49 },
    ],
    targetDistribution: [
      { name: "Baixo", target1: 23, target2: 18, target3: 20 },
      { name: "Médio", target1: 89, target2: 95, target3: 92 },
      { name: "Alto", target1: 42, target2: 41, target3: 42 },
    ],
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);

    setTimeout(() => {
      setResults(mockResults);
      setIsProcessing(false);
      setShowUpload(false);
    }, 2500);
  };

  const handleNewAnalysis = () => {
    setShowUpload(true);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "dashboard" && (
          <>
            {!results && !showUpload ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BarChart3 className="w-12 h-12 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Dashboard
                  </h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Visão geral das suas análises preditivas. Comece enviando um
                    arquivo CSV para análise.
                  </p>
                  <button
                    onClick={handleNewAnalysis}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
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
                onCancel={() => setShowUpload(false)}
              />
            ) : results ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                      Dashboard
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Visão geral das suas análises preditivas
                    </p>
                  </div>
                  <button
                    onClick={handleNewAnalysis}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
                    Nova Análise
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    icon={FileSpreadsheet}
                    title="Total de Análises"
                    value="1"
                    subtitle="+12% este mês"
                    iconBg="bg-gradient-to-br from-blue-100 to-blue-200"
                    iconColor="text-blue-600"
                  />
                  <StatCard
                    icon={Target}
                    title="Acurácia Média"
                    value={`${(results.modelAccuracy * 100).toFixed(0)}%`}
                    subtitle="Excelente desempenho"
                    iconBg="bg-gradient-to-br from-purple-100 to-purple-200"
                    iconColor="text-purple-600"
                  />
                  <StatCard
                    icon={TrendingUp}
                    title="Linhas Processadas"
                    value={results.processedSuccessfully.toString()}
                    subtitle="Volume crescente"
                    iconBg="bg-gradient-to-br from-green-100 to-green-200"
                    iconColor="text-green-600"
                  />
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Estatísticas dos Targets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <TargetCard
                      title="Target 1"
                      stats={results.targets.target1}
                    />
                    <TargetCard
                      title="Target 2"
                      stats={results.targets.target2}
                    />
                    <TargetCard
                      title="Target 3"
                      stats={results.targets.target3}
                    />
                  </div>
                </div>

                <ChartsSection
                  timeSeriesData={results.timeSeriesData}
                  targetDistribution={results.targetDistribution}
                />

                <PredictionsTable predictions={results.predictions} />
              </div>
            ) : null}
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Histórico</h2>
                <p className="text-gray-500 mt-1">
                  Acesse suas análises anteriores
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Nenhum histórico disponível
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Você ainda não realizou nenhuma análise.
                  <br />
                  Faça sua primeira análise para ver o histórico aqui.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    handleNewAnalysis();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40"
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Fazer Nova Análise
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'preview' && <PreviewCharts />}
      </main>
    </div>
  );
}
