import { mockAnalysisData } from '../data/mockAnalysisData';
import {
  MissingValuesChart,
  DistributionChart,
  CorrelationChart,
  PredictionsVsRealChart,
  FeatureImportanceChart,
  OutliersScatterChart,
  ClustersScatterChart,
  ClustersDistributionChart,
  TimeSeriesChart
} from '../components/AnalysisCharts';

export default function PreviewCharts() {
  const { beforeTraining, afterTraining, outliers, clusters, timeSeries } = mockAnalysisData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Preview de Gráficos de Análise
          </h1>
          <p className="text-gray-600">
            Exemplos de visualizações que serão geradas após o processamento dos dados
          </p>
        </div>

        {/* ANTES DO TREINAMENTO */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-purple-700 mb-2">
              📊 Análise Antes do Treinamento
            </h2>
            <p className="text-gray-600">
              Visualizações da qualidade e distribuição dos dados brutos
            </p>
          </div>

          <div className="space-y-6">
            <MissingValuesChart data={beforeTraining.missingValues} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DistributionChart data={beforeTraining.distribution} />
              <CorrelationChart data={beforeTraining.correlation} />
            </div>
          </div>
        </section>

        {/* DEPOIS DO TREINAMENTO */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-2">
              🎯 Análise Depois do Treinamento
            </h2>
            <p className="text-gray-600">
              Performance e qualidade do modelo treinado
            </p>
          </div>

          <div className="space-y-6">
            {/* Métricas do Modelo */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Métricas do Modelo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Acurácia</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {(afterTraining.metrics.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Precisão</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {(afterTraining.metrics.precision * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">Recall</p>
                  <p className="text-3xl font-bold text-green-600">
                    {(afterTraining.metrics.recall * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">F1-Score</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {(afterTraining.metrics.f1Score * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PredictionsVsRealChart data={afterTraining.predictionsVsReal} />
              <FeatureImportanceChart data={afterTraining.featureImportance} />
            </div>
          </div>
        </section>

        {/* OUTLIERS */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-red-700 mb-2">
              ⚠️ Jogadores Fora do Padrão (Outliers)
            </h2>
            <p className="text-gray-600">
              Identificação de comportamentos anômalos e excepcionais
            </p>
          </div>

          <div className="space-y-6">
            <OutliersScatterChart data={outliers.scatterData} />

            {/* Tabela de Outliers */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Lista de Outliers Identificados</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">ID</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Jogador</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Razão</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Desvio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outliers.playersList.map((player) => (
                      <tr key={player.id} className="border-b border-gray-50 hover:bg-red-50 transition-colors">
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-800">#{player.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-700">{player.name}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-600 text-sm">{player.reason}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            Math.abs(player.deviation) > 2.5 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {player.deviation > 0 ? '+' : ''}{player.deviation}σ
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CLUSTERS */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-purple-700 mb-2">
              🎮 Clusters de Jogadores
            </h2>
            <p className="text-gray-600">
              Agrupamento automático de jogadores com perfis semelhantes
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClustersScatterChart data={clusters.scatterData} />
              <ClustersDistributionChart data={clusters.distribution} />
            </div>

            {/* Características dos Clusters */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Características de Cada Cluster</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Cluster</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Avg Kills</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Avg Deaths</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Avg Assists</th>
                      <th className="text-left text-gray-600 font-semibold py-4 px-4">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clusters.characteristics.map((cluster, idx) => (
                      <tr key={cluster.cluster} className="border-b border-gray-50 hover:bg-purple-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: idx === 0 ? '#7c3aed' : idx === 1 ? '#6b7c59' : '#ec4899' 
                              }}
                            />
                            <span className="font-semibold text-gray-800">{cluster.cluster}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{cluster.avgKills}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{cluster.avgDeaths}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{cluster.avgAssists}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {(cluster.avgWinRate * 100).toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* SÉRIES TEMPORAIS */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blue-700 mb-2">
              📈 Evolução Temporal
            </h2>
            <p className="text-gray-600">
              Acompanhamento de performance ao longo do tempo
            </p>
          </div>

          <div className="space-y-6">
            <TimeSeriesChart data={timeSeries.performance} />
          </div>
        </section>

        {/* Resumo Final */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl shadow-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              ✨ Resumo da Análise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-purple-100 text-sm mb-2">Total de Gráficos</p>
                <p className="text-5xl font-bold">9</p>
                <p className="text-purple-100 text-sm mt-2">Visualizações diferentes</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm mb-2">Insights Gerados</p>
                <p className="text-5xl font-bold">15+</p>
                <p className="text-purple-100 text-sm mt-2">Análises automáticas</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm mb-2">Tempo de Análise</p>
                <p className="text-5xl font-bold">~3s</p>
                <p className="text-purple-100 text-sm mt-2">Processamento rápido</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explicação Técnica */}
        <section>
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              🔧 Como Funciona
            </h3>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Backend Python Processa os Dados</p>
                  <p className="text-sm">FastAPI recebe o CSV, faz limpeza, normalização, clusterização e treinamento do modelo ML</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Gera JSON Estruturado</p>
                  <p className="text-sm">Python formata todos os resultados em JSON com a estrutura exata que o Nivo espera</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Frontend Renderiza com Nivo</p>
                  <p className="text-sm">React recebe o JSON e a biblioteca Nivo cria visualizações interativas e responsivas automaticamente</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
              <p className="text-sm text-gray-700">
                <strong className="text-purple-700">💡 Importante:</strong> Todos esses gráficos são gerados dinamicamente. 
                O backend Python faz TODA a análise e retorna apenas dados formatados. 
                O Nivo no frontend apenas renderiza de forma bonita e interativa.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}