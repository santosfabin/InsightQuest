import { ArrowRight, Lightbulb, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface Recommendation {
  type: 'action' | 'improvement' | 'warning' | 'success';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

const priorityConfig = {
  high: {
    badge: 'bg-red-100 text-red-700 border-red-300',
    label: 'Alta Prioridade',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    label: 'Média Prioridade',
  },
  low: {
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    label: 'Baixa Prioridade',
  },
};

const typeConfig = {
  action: {
    icon: ArrowRight,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  improvement: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl p-8 border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Recomendações & Próximos Passos</h2>
          <p className="text-gray-600 text-sm">Ações sugeridas baseadas na análise</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((rec, index) => {
          const config = typeConfig[rec.type];
          const priorityBadge = priorityConfig[rec.priority];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className={`${config.color} bg-white rounded-lg p-2.5 shadow-sm flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-gray-900 font-bold text-lg">
                      {rec.title}
                    </h3>
                    <span className={`${priorityBadge.badge} border px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                      {priorityBadge.label}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-purple-200">
        <p className="text-center text-gray-600 text-sm">
          💡 <strong>Dica:</strong> Priorize as ações marcadas como "Alta Prioridade" para maximizar o impacto nos resultados.
        </p>
      </div>
    </div>
  );
}