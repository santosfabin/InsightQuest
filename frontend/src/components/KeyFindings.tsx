import { Lightbulb, Zap, Target, Eye } from 'lucide-react';

interface Finding {
  type: 'insight' | 'pattern' | 'achievement' | 'discovery';
  title: string;
  description: string;
  highlight?: string;
}

interface KeyFindingsProps {
  findings: Finding[];
}

const findingConfig = {
  insight: {
    icon: Lightbulb,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700',
    label: '💡 Insight',
  },
  pattern: {
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700',
    label: '🔍 Padrão',
  },
  achievement: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-700',
    label: '✅ Conquista',
  },
  discovery: {
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-700',
    label: '⚡ Descoberta',
  },
};

export default function KeyFindings({ findings }: KeyFindingsProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-3xl p-8 border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🔍 Principais Descobertas da Análise</h2>
          <p className="text-gray-600 text-sm">Insights-chave sobre o comportamento dos jogadores</p>
        </div>
      </div>

      <div className="space-y-4">
        {findings.map((finding, index) => {
          const config = findingConfig[finding.type];
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
                      {finding.title}
                    </h3>
                    <span className={`${config.badgeColor} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                      {config.label}
                    </span>
                  </div>
                  
                  {finding.highlight && (
                    <div className={`${config.color} text-2xl font-bold mb-2`}>
                      {finding.highlight}
                    </div>
                  )}
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {finding.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t-2 border-purple-200">
        <p className="text-center text-gray-600 text-sm">
          💡 Estes insights foram gerados automaticamente com base nos dados analisados.
        </p>
      </div>
    </div>
  );
}