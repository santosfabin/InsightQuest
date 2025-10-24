import { Users, TrendingDown } from 'lucide-react';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface CompletionFunnelChartProps {
  data: FunnelStage[];
  title?: string;
  subtitle?: string;
}

export default function CompletionFunnelChart({
  data,
  title = "Taxa de Conclusão por Etapa",
  subtitle = "Quantos jogadores completam cada fase do jogo"
}: CompletionFunnelChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-gray-500">
        Dados de funil não disponíveis
      </div>
    );
  }

  const maxCount = data[0].count;
  const dropOffTotal = data[0].count - data[data.length - 1].count;
  const dropOffPercentage = ((dropOffTotal / data[0].count) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-1">{subtitle}</p>
        
        {/* Estatística de Drop-off */}
        <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>Drop-off Total:</strong> {dropOffTotal} jogadores ({dropOffPercentage}%)
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Taxa de conclusão final: {data[data.length - 1].percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="space-y-3">
        {data.map((stage, index) => {
          const widthPercentage = (stage.count / maxCount) * 100;
          const isLastStage = index === data.length - 1;
          const previousCount = index > 0 ? data[index - 1].count : stage.count;
          const dropOff = previousCount - stage.count;
          const dropOffPercent = previousCount > 0 ? ((dropOff / previousCount) * 100).toFixed(1) : '0';

          return (
            <div key={index} className="relative">
              {/* Barra do Funil */}
              <div className="relative">
                <div
                  className="h-16 rounded-lg shadow-md transition-all duration-500 hover:shadow-lg flex items-center justify-between px-6"
                  style={{
                    width: `${widthPercentage}%`,
                    backgroundColor: stage.color,
                    minWidth: '200px', // Garante legibilidade mesmo em estágios pequenos
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-30 rounded-full px-3 py-1 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="font-bold text-white text-sm">{stage.stage}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-white text-lg">{stage.count}</div>
                    <div className="text-white text-opacity-90 text-xs">
                      {stage.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Indicador de Drop-off */}
                {index > 0 && dropOff > 0 && (
                  <div className="absolute -right-2 top-1/2 transform translate-x-full -translate-y-1/2 ml-4">
                    <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1 shadow-sm">
                      <p className="text-xs text-red-700 font-semibold whitespace-nowrap">
                        -{dropOff} (-{dropOffPercent}%)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Linha conectora (exceto último estágio) */}
              {!isLastStage && (
                <div className="flex justify-center my-2">
                  <div className="w-0.5 h-4 bg-gray-300"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda e Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-green-800 font-semibold mb-1">✅ Boa Retenção</p>
            <p className="text-green-700 text-xs">
              {data.length > 0 && data[data.length - 1].percentage > 90 
                ? 'Mais de 90% completam todas as etapas'
                : data[data.length - 1].percentage > 80
                ? '80-90% de taxa de conclusão'
                : 'Acima de 70% finalizam o jogo'}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-blue-800 font-semibold mb-1">📊 Total Analisado</p>
            <p className="text-blue-700 text-xs">
              {data[0].count} jogadores iniciaram a análise
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-purple-800 font-semibold mb-1">🎯 Concluintes</p>
            <p className="text-purple-700 text-xs">
              {data[data.length - 1].count} chegaram ao final ({data[data.length - 1].percentage.toFixed(1)}%)
            </p>
          </div>
        </div>

        {/* Alerta se drop-off alto */}
        {parseFloat(dropOffPercentage) > 20 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-xs">
              ⚠️ <strong>Atenção:</strong> Drop-off acima de 20% pode indicar problemas de engajamento, 
              dificuldade excessiva ou questões técnicas. Investigue as etapas com maior perda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}