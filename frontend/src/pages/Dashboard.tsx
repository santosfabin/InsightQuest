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
  // Palette, // <-- REMOVIDO
  // Smile,   // <-- REMOVIDO
  Hourglass, // Mantido - Usado na Seção Introdutória
  Users,     // Mantido - Usado na Seção Clusters (Verifique se 'Users' é o nome correto em lucide-react, pode ser Users2)
} from "lucide-react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import FileUpload from "../components/FileUpload";
import TargetCard from "../components/TargetCard";
import PredictionsTable from "../components/PredictionsTable";
// Importa os componentes de gráfico que vamos usar AGORA no Dashboard
import {
  GenericPieChart, // Usado para Clusters e Cores
  DistributionChart, // Usado para Tempo
  LikertDistributionChart, // Novo para Likert
  PerformanceByClusterChart,
  // Adicione outros imports de AnalysisCharts aqui quando for usá-los
} from '../components/AnalysisCharts';
import PreviewCharts from '../components/PreviewCharts'; // Mantido por enquanto

import { uploadAndPredict } from "../services/api";
import type { ApiResponse, ApiPredictionRow } from "../services/api";

// --- Interfaces locais ---
interface PieSliceData { id: string | number; label: string; value: number; color?: string;}
interface DistributionBin { range: string; count: number; [key: string]: string | number; }
interface LikertData { metric: string; '1': number; '2': number; '3': number; '4': number; '5': number; [key: string]: string | number; }
interface TargetStatsData { mean: number; std: number; distribution: string; }
interface ClusterComparisonData { cluster: string; avgTarget1: number; avgTarget2: number; avgTarget3: number; [key: string]: string | number; }


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsTable, setShowDetailsTable] = useState(false);

  const handleProcess = async () => {
    if (!file) { setError("Nenhum arquivo selecionado."); return; }
    setIsProcessing(true); setError(null); setResults(null);
    setShowDetailsTable(false);
    try {
      const data = await uploadAndPredict(file);
      if (data?.predictions?.length > 0) { setResults(data); setShowUpload(false); }
      else { setError("A análise foi concluída, mas não retornou resultados."); setShowUpload(true); }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      setShowUpload(true);
    } finally { setIsProcessing(false); }
  };

  const handleNewAnalysis = () => {
    setShowUpload(true); setFile(null); setResults(null); setError(null);
    setShowDetailsTable(false);
  };

  const toggleDetailsTable = () => {
      setShowDetailsTable(prevState => !prevState);
  };

  // ===== PROCESSAMENTO DE DADOS PARA GRÁFICOS E CARDS (ATUALIZADO) =====
  const processedData = useMemo(() => {
    // Valores padrão
    const defaults = {
        avgTarget1: 0, avgTarget2: 0, avgTarget3: 0,
        timeDistribution: [] as DistributionBin[],
        colorDistribution: [] as PieSliceData[],
        likertDistribution: [] as LikertData[],
        clusterDistribution: [] as PieSliceData[],
        clusterComparison: [] as ClusterComparisonData[],
    };
    if (!results?.predictions) { return defaults; }
    const predictions = results.predictions;
    const numPredictions = predictions.length;
    if (numPredictions === 0) { return defaults; }

    // --- Médias Gerais ---
    const sumT1 = predictions.reduce((sum, p) => sum + (p.PREDICAO_Target1 || 0), 0);
    const sumT2 = predictions.reduce((sum, p) => sum + (p.PREDICAO_Target2 || 0), 0);
    const sumT3 = predictions.reduce((sum, p) => sum + (p.PREDICAO_Target3 || 0), 0);
    const avgTarget1 = sumT1 / numPredictions;
    const avgTarget2 = sumT2 / numPredictions;
    const avgTarget3 = sumT3 / numPredictions;

    // --- Dados para Gráfico de Tempo (Ex: TempoTotal) ---
    const tempos = predictions
      .map(p => p.original_data['TempoTotal'])
      .filter((t): t is number => typeof t === 'number' && !isNaN(t));
    const maxTime = tempos.length > 0 ? Math.max(...tempos) : 0;
    const binSize = maxTime > 0 ? Math.ceil(maxTime / 6 / 10) * 10 : 10;
    const timeBins: { [key: string]: number } = {};
    tempos.forEach(t => { const binStart = Math.floor(t / binSize) * binSize; const binEnd = binStart + binSize; const range = `${binStart}-${binEnd}s`; timeBins[range] = (timeBins[range] || 0) + 1; });
    const timeDistribution: DistributionBin[] = Object.entries(timeBins).map(([range, count]) => ({ range, count })).sort((a,b) => parseInt(a.range.split('-')[0]) - parseInt(b.range.split('-')[0]));

    // --- Dados para Gráfico de Cores (Ex: Cor0202) ---
    const colorCounts: { [key: string]: number } = {};
    const colorMap: { [key: string]: string } = {}; // Mapeamento opcional
    predictions.forEach(p => { const hex = p.original_data['Cor0202']; if (typeof hex === 'string' && hex.startsWith('#')) { colorCounts[hex] = (colorCounts[hex] || 0) + 1; } else { const defaultColor = 'Inválido/Outro'; colorCounts[defaultColor] = (colorCounts[defaultColor] || 0) + 1; } });
    const colorDistribution: PieSliceData[] = Object.entries(colorCounts).map(([hex, count]) => ({ id: hex, label: colorMap[hex] || hex, value: count })).sort((a, b) => b.value - a.value);

    // --- Dados para Gráfico Likert (Ex: F07xx - Emoção) ---
    const likertCols = ['F0705', 'F0706', 'F0707', 'F0708', 'F0709', 'F0710', 'F0711', 'F0712', 'F0713'];
    const likertCounts: { [metric: string]: { [response: string]: number } } = {};
    likertCols.forEach(col => { if (predictions.length > 0 && col in predictions[0].original_data) { likertCounts[col] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }; predictions.forEach(p => { const response = String(p.original_data[col]); if (likertCounts[col][response] !== undefined) { likertCounts[col][response]++; } }); } });
    const likertDistribution: LikertData[] = Object.entries(likertCounts).map(([metric, counts]) => ({ metric, '1': counts['1'], '2': counts['2'], '3': counts['3'], '4': counts['4'], '5': counts['5'], }));


    // --- Cálculos de Cluster ---
    const clusterCounts: { [key: number]: number } = {};
    let foundClusterData = false;
    predictions.forEach(p => { const clusterKey = Object.keys(p.original_data).find(key => key.startsWith('Cluster_') && p.original_data[key] === 1); const clusterNum = clusterKey ? parseInt(clusterKey.split('_')[1], 10) : -1; if (clusterNum !== -1) { clusterCounts[clusterNum] = (clusterCounts[clusterNum] || 0) + 1; foundClusterData = true; } });
    const clusterDistribution: PieSliceData[] = foundClusterData ? Object.entries(clusterCounts).map(([clusterId, count]) => ({ id: `Cluster ${clusterId}`, label: `Cluster ${clusterId}`, value: count, })).sort((a, b) => parseInt(a.label.split(' ')[1]) - parseInt(b.label.split(' ')[1])) : [];
    const clusterSums: { [key: number]: { sumT1: number; sumT2: number; sumT3: number; count: number } } = {};
    predictions.forEach(p => { const clusterKey = Object.keys(p.original_data).find(key => key.startsWith('Cluster_') && p.original_data[key] === 1); const clusterNum = clusterKey ? parseInt(clusterKey.split('_')[1], 10) : -1; if (clusterNum !== -1) { if (!clusterSums[clusterNum]) { clusterSums[clusterNum] = { sumT1: 0, sumT2: 0, sumT3: 0, count: 0 }; } if (!isNaN(p.PREDICAO_Target1)) clusterSums[clusterNum].sumT1 += p.PREDICAO_Target1; if (!isNaN(p.PREDICAO_Target2)) clusterSums[clusterNum].sumT2 += p.PREDICAO_Target2; if (!isNaN(p.PREDICAO_Target3)) clusterSums[clusterNum].sumT3 += p.PREDICAO_Target3; clusterSums[clusterNum].count++; } });
    const clusterComparison: ClusterComparisonData[] = foundClusterData ? Object.entries(clusterSums).map(([clusterId, data]) => ({ cluster: `Cluster ${clusterId}`, avgTarget1: data.count > 0 ? data.sumT1 / data.count : 0, avgTarget2: data.count > 0 ? data.sumT2 / data.count : 0, avgTarget3: data.count > 0 ? data.sumT3 / data.count : 0, })).sort((a, b) => parseInt(a.cluster.split(' ')[1]) - parseInt(b.cluster.split(' ')[1])) : [];

    // Retorna todos os dados processados
    return {
      avgTarget1, avgTarget2, avgTarget3,
      timeDistribution,
      colorDistribution,
      likertDistribution,
      clusterDistribution,
      clusterComparison
    };

  }, [results]);


  // --- Dados para passar aos componentes ---
  const processedSuccessfully = results?.processed_rows ?? 0;
  const modelAccuracyDisplay = "N/A";
  const displayPredictions: ApiPredictionRow[] = results?.predictions ?? [];
  const target1Stats: TargetStatsData = { mean: processedData.avgTarget1, std: 0, distribution: 'Média' };
  const target2Stats: TargetStatsData = { mean: processedData.avgTarget2, std: 0, distribution: 'Média' };
  const target3Stats: TargetStatsData = { mean: processedData.avgTarget3, std: 0, distribution: 'Média' };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "dashboard" && (
          <>
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
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
              // Empty State
              <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <BarChart3 className="w-12 h-12 text-purple-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3"> Dashboard </h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto"> Visão geral das suas análises preditivas. Comece enviando um arquivo CSV para análise. </p>
                  <button onClick={handleNewAnalysis} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40" >
                    <Upload className="w-5 h-5 inline mr-2" /> Nova Análise
                  </button>
                </div>
              </div>
            ) : showUpload ? (
              // Tela de Upload
              <FileUpload file={file} setFile={setFile} onProcess={handleProcess} isProcessing={isProcessing} onCancel={() => { setShowUpload(false); setError(null); setFile(null); }} />
            ) : results ? (
              // Resultados da Análise
              <div className="space-y-10">
                 {/* Título e Botão Nova Análise */}
                 <div className="flex items-center justify-between pb-6 border-b border-purple-200">
                   <div>
                     <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3"> <BarChart3 className="w-8 h-8 text-purple-600" /> Dashboard - Resultados da Análise </h2>
                     <p className="text-gray-500 mt-1"> Análise concluída para o arquivo: <span className="font-medium text-gray-700">{file?.name ?? 'Desconhecido'}</span> </p>
                   </div>
                   <button onClick={handleNewAnalysis} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/40" >
                     <Upload className="w-5 h-5 inline mr-2" /> Nova Análise
                   </button>
                 </div>

                 {/* Cards de Estatísticas Gerais */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <StatCard icon={FileSpreadsheet} title="Total de Linhas" value={results.total_rows.toString()} subtitle="No arquivo enviado" iconBg="bg-gradient-to-br from-blue-100 to-blue-200" iconColor="text-blue-600" />
                   <StatCard icon={TrendingUp} title="Linhas Processadas" value={processedSuccessfully.toString()} subtitle="Com sucesso pela API" iconBg="bg-gradient-to-br from-green-100 to-green-200" iconColor="text-green-600" />
                   <StatCard icon={Target} title="Acurácia (Placeholder)" value={modelAccuracyDisplay} subtitle="Métrica de exemplo" iconBg="bg-gradient-to-br from-purple-100 to-purple-200" iconColor="text-purple-600" />
                 </div>

                 {/* ===== SEÇÃO INTRODUTÓRIA: Entendendo os Dados ===== */}
                 <section>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2">
                            <Hourglass className="w-6 h-6 text-blue-500"/> Entendendo os Dados: Uma Jornada no Jogo
                        </h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto"> Antes de olhar as predições, vamos explorar as características dos dados enviados, confirmando o contexto de jogo. </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Gráfico de Tempo */}
                        {processedData.timeDistribution.length > 0 ? (
                           <DistributionChart data={processedData.timeDistribution} title="Distribuição do Tempo Total Gasto" xAxisLabel="Tempo Total (segundos)" yAxisLabel="Nº de Jogadores" />
                        ) : ( <div className="placeholder-card">Dados de Tempo Indisponíveis</div> )}

                        {/* Gráfico de Cores */}
                        {processedData.colorDistribution.length > 0 ? (
                           <GenericPieChart data={processedData.colorDistribution} title="Distribuição de Cores Escolhidas (Ex: Cor0202)" subtitle="Preferências visuais dos jogadores" />
                        ) : ( <div className="placeholder-card">Dados de Cor Indisponíveis</div> )}
                    </div>
                     {/* Gráfico Likert */}
                     {processedData.likertDistribution.length > 0 ? (
                        <LikertDistributionChart data={processedData.likertDistribution} title="Distribuição de Respostas (Ex: Emoções F07xx)" subtitle="Feedback ou estado dos jogadores" />
                     ) : ( <div className="placeholder-card">Dados Likert (F07xx) Indisponíveis</div> )}
                 </section>

                 {/* ===== SEÇÃO TARGETS E HIPÓTESE ===== */}
                 <section className="bg-white rounded-3xl shadow-lg p-8">
                     <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center flex items-center justify-center gap-2"> <Target className="w-6 h-6 text-red-500"/> Os Targets: O Que Estamos Prevendo? </h2>
                     <p className="text-gray-500 text-sm mb-6 text-center max-w-xl mx-auto"> A análise foca em prever três valores-chave (Targets). Com base nas features, há uma hipótese de que eles podem estar relacionados a aspectos de bem-estar ou saúde mental. </p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <TargetCard title="Target 1 (Média)" stats={target1Stats} />
                         <TargetCard title="Target 2 (Média)" stats={target2Stats} />
                         <TargetCard title="Target 3 (Média)" stats={target3Stats} />
                     </div>
                 </section>

                 {/* ===== SEÇÃO CLUSTERS ===== */}
                 <section>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center justify-center gap-2"> <Users className="w-6 h-6 text-purple-500"/> Identificando Perfis: Clusters de Jogadores </h2>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto"> Agrupamos os jogadores por similaridade para entender diferentes perfis de comportamento. </p>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Distribuição de Clusters */}
                        {processedData.clusterDistribution.length > 0 ? (
                           <GenericPieChart data={processedData.clusterDistribution} title="Distribuição dos Clusters" subtitle="Quantos jogadores em cada perfil?" />
                        ) : ( <div className="placeholder-card">Dados de Cluster Indisponíveis</div> )}

                        {/* Performance Média por Cluster */}
                        {processedData.clusterComparison.length > 0 ? (
                           <PerformanceByClusterChart data={processedData.clusterComparison} />
                        ) : ( <div className="placeholder-card">Dados de Comparação por Cluster Indisponíveis</div> )}
                    </div>
                     {/* Adicionar Gráfico de Características do Cluster aqui depois */}
                     <div className="mt-6 placeholder-card"> (Gráfico: Características Detalhadas por Cluster - a implementar) </div>
                 </section>

                 {/* ===== SEÇÃO FATORES DE INFLUÊNCIA (Placeholders) ===== */}
                 <section>
                     <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2"> Fatores de Influência (A Implementar) </h2>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="placeholder-card"> (Gráfico: Performance por Dia) </div>
                        <div className="placeholder-card"> (Gráfico: Comparação Cor Detalhada) </div>
                        <div className="placeholder-card"> (Gráfico: Análise de Desvio) </div>
                        <div className="placeholder-card"> (Gráfico: Importância Features) </div>
                    </div>
                 </section>

                 {/* --- Seção da Tabela Detalhada com Toggle --- */}
                 <div className="text-center mt-10 mb-4 pt-6 border-t border-purple-200">
                    <button onClick={toggleDetailsTable} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-200 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm" >
                        {showDetailsTable ? ( <> <EyeOff className="w-5 h-5" /> Ocultar Detalhes da Predição </> ) : ( <> <Eye className="w-5 h-5" /> Mostrar Detalhes da Predição </> )}
                    </button>
                    {!showDetailsTable && ( <p className="text-xs text-gray-500 mt-2">Clique para ver a tabela com os resultados individuais.</p> )}
                 </div>

                 {/* Tabela de Predições (Renderização Condicional) */}
                 {showDetailsTable && ( <PredictionsTable predictions={displayPredictions} /> )}

              </div>
            ) : null }
          </>
        )}

        {/* Mantém as outras abas */}
        {activeTab === "history" && (
           <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                 <Clock className="w-8 h-8 text-purple-600" />
                 <div> <h2 className="text-3xl font-bold text-gray-800">Histórico</h2> <p className="text-gray-500 mt-1">Acesse suas análises anteriores (via IndexedDB)</p> </div>
               </div>
               <div className="bg-white rounded-3xl shadow-lg p-8"> <p>Funcionalidade de histórico (IndexedDB) a ser implementada.</p> </div>
           </div>
        )}
        {activeTab === 'preview' && <PreviewCharts />}
      </main>

      {/* Estilo para placeholders */}
      <style>{`
        .placeholder-card { background-color: white; border-radius: 1.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); padding: 2rem; text-align: center; color: #6b7280; display: flex; align-items: center; justify-content: center; min-height: 400px; font-style: italic; }
      `}</style>
    </div>
  );
}

// Lembre-se de adicionar Users ao import do lucide-react no topo se ainda não o fez
// import { /*...,*/ Users } from "lucide-react";