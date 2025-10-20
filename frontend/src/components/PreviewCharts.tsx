// frontend/src/components/PreviewCharts.tsx

// Importa os dados MOCK PRÉ-PROCESSADOS
import {
  mockClusterDistribution,
  //   mockClusterCharacteristics, // Comentado - Componente ausente
  mockPerformanceByCluster,
  //   mockPerformanceByDay,       // Comentado - Componente ausente
  //   mockPerformanceByColor,     // Comentado - Componente ausente
  //   mockDeviationScatter        // Comentado - Componente ausente
  // Importe aqui dados para outros gráficos se os adicionar de volta
} from "../data/mockAnalysisData";

// Importa APENAS os componentes de gráfico que EXISTEM em AnalysisCharts.tsx
import {
  GenericPieChart,
  // ClustersDistributionChart,
  //   ClusterCharacteristicsChart, // Comentado - Componente ausente
  PerformanceByClusterChart,
  //   PerformanceByDayChart,       // Comentado - Componente ausente
  //   PerformanceByColorChart,     // Comentado - Componente ausente
  //   DeviationScatterChart,       // Comentado - Componente ausente
  // Importe aqui outros gráficos se os adicionar de volta (MissingValues, etc.)
} from "../components/AnalysisCharts";

// Importa componentes de Card que são usados
import StatCard from "./StatCard";
import TargetCard from "./TargetCard";
import { FileSpreadsheet, Target, TrendingUp } from "lucide-react";

// Importa dados mock para os cards (se não foram comentados em mockAnalysisData)
import { mockSummaryData, mockTargetAverages } from "../data/mockAnalysisData";

export default function PreviewCharts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-12 text-center border-b pb-8 border-purple-200">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            📊 Preview da Análise e Storytelling
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Este é um exemplo de como os resultados da análise preditiva podem
            ser apresentados. (Usando dados simulados - Alguns gráficos
            comentados temporariamente)
          </p>
        </div>

        {/* --- SEÇÃO 1: VISÃO GERAL (CARDS) --- */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
            Visão Geral da Análise
          </h2>
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={FileSpreadsheet}
              title="Total de Linhas"
              value={mockSummaryData.totalRows.toString()}
              subtitle="No arquivo enviado"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={TrendingUp}
              title="Linhas Processadas"
              value={mockSummaryData.processedRows.toString()}
              subtitle="Com sucesso pela API"
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <StatCard
              icon={Target}
              title="Acurácia (Exemplo)"
              value={`${(mockSummaryData.accuracy * 100).toFixed(0)}%`}
              subtitle="Qualidade do Modelo"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>
          {/* Target Cards */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Médias Gerais das Predições
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TargetCard
                title="Target 1 (Média)"
                stats={mockTargetAverages.target1}
              />
              <TargetCard
                title="Target 2 (Média)"
                stats={mockTargetAverages.target2}
              />
              <TargetCard
                title="Target 3 (Média)"
                stats={mockTargetAverages.target3}
              />
            </div>
          </div>
        </section>

        {/* --- INÍCIO DO STORYTELLING (Gráficos Ativos) --- */}

        {/* 1. Distribuição de Clusters */}
        <section className="mb-16">
          {mockClusterDistribution.length > 0 ? (
            <GenericPieChart
              data={mockClusterDistribution}
              title="1. Distribuição de Clusters"
              subtitle="Quantos jogadores em cada perfil?"
            />
          ) : (
            <div className="text-center text-gray-500 bg-white p-8 rounded-3xl shadow-lg">
              Dados de Distribuição de Cluster indisponíveis.
            </div>
          )}
        </section>

        {/* 3. Performance por Cluster */}
        <section className="mb-16">
          {mockPerformanceByCluster.length > 0 ? (
            <PerformanceByClusterChart data={mockPerformanceByCluster} />
          ) : (
            <div className="text-center text-gray-500 bg-white p-8 rounded-3xl shadow-lg">
              Dados de Performance por Cluster indisponíveis.
            </div>
          )}
        </section>

        {/* --- SEÇÕES COMENTADAS (Gráficos Ausentes) --- */}

        {/* 2. Características dos Clusters - COMENTADO */}
        {/*
        <section className="mb-16">
            {mockClusterCharacteristics.length > 0 ? (
                // <ClusterCharacteristicsChart data={mockClusterCharacteristics} /> // Componente ausente
                <div className="text-center text-gray-400 bg-gray-100 p-8 rounded-3xl shadow-inner">Gráfico 'Características dos Clusters' (Comentado)</div>
            ) : (
                 <div className="text-center text-gray-500 bg-white p-8 rounded-3xl shadow-lg">Dados de Características de Cluster indisponíveis.</div>
            )}
        </section>
        */}

        {/* 4. Performance por Dia - COMENTADO */}
        {/*
        <section className="mb-16">
             {mockPerformanceByDay.length > 0 ? (
                // <PerformanceByDayChart data={mockPerformanceByDay} /> // Componente ausente
                <div className="text-center text-gray-400 bg-gray-100 p-8 rounded-3xl shadow-inner">Gráfico 'Performance por Dia' (Comentado)</div>
             ) : (
                  <div className="text-center text-gray-500 bg-white p-8 rounded-3xl shadow-lg">Dados de Performance por Dia indisponíveis.</div>
             )}
        </section>
        */}

        {/* 5. Comparação por Cor - COMENTADO */}
        {/*
        <section className="mb-16">
             {mockPerformanceByColor.length > 0 ? (
                // <PerformanceByColorChart data={mockPerformanceByColor} /> // Componente ausente
                <div className="text-center text-gray-400 bg-gray-100 p-8 rounded-3xl shadow-inner">Gráfico 'Comparação por Cor' (Comentado)</div>
             ) : (
                  <div className="text-center text-gray-500 bg-white p-8 rounded-3xl shadow-lg">Dados de Performance por Cor indisponíveis.</div>
             )}
        </section>
        */}

        {/* 6. Análise de Desvio - COMENTADO */}
        {/*
        <section className="mb-16">
             {mockDeviationScatter[0]?.data.length > 0 ? (
                // <DeviationScatterChart data={mockDeviationScatter} /> // Componente ausente
                <div className="text-center text-gray-400 bg-gray-100 p-8 rounded-3xl shadow-inner">Gráfico 'Análise de Desvio' (Comentado)</div>
             ) : (
                  <div className="text-center text-gray-500 bg-white p-8 rounded-3xl shadow-lg">Dados de Desvio indisponíveis.</div>
             )}
        </section>
        */}

        {/* --- FIM DAS SEÇÕES COMENTADAS --- */}

        {/* Explicação Técnica (Mantida) */}
        <section>
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {" "}
              🔧 Como Funciona{" "}
            </h3>
            <div className="space-y-4 text-gray-600">
              {/* ... Explicações 1, 2, 3 ... */}
              <div className="flex items-start gap-3">
                {" "}
                <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </span>{" "}
                <div>
                  {" "}
                  <p className="font-semibold text-gray-800 mb-1">
                    Backend Python Processa os Dados
                  </p>{" "}
                  <p className="text-sm">
                    FastAPI recebe o CSV, aplica pipeline V2 (limpeza, FE,
                    cluster, predição)
                  </p>{" "}
                </div>{" "}
              </div>
              <div className="flex items-start gap-3">
                {" "}
                <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </span>{" "}
                <div>
                  {" "}
                  <p className="font-semibold text-gray-800 mb-1">
                    Gera JSON Estruturado
                  </p>{" "}
                  <p className="text-sm">
                    Python formata predições e dados originais/derivados em JSON
                  </p>{" "}
                </div>{" "}
              </div>
              <div className="flex items-start gap-3">
                {" "}
                <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </span>{" "}
                <div>
                  {" "}
                  <p className="font-semibold text-gray-800 mb-1">
                    Frontend Renderiza com Nivo
                  </p>{" "}
                  <p className="text-sm">
                    React recebe o JSON, processa para storytelling e Nivo cria
                    visualizações
                  </p>{" "}
                </div>{" "}
              </div>
            </div>
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <p className="text-sm text-gray-700">
                {" "}
                <strong className="text-purple-700">💡 Importante:</strong> Este
                preview usa dados MOCK. No dashboard real, os gráficos serão
                gerados dinamicamente com os dados retornados pela API.{" "}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
