import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Lightbulb, Target, Zap } from 'lucide-react';

type InsightType = 'success' | 'warning' | 'info' | 'insight' | 'positive' | 'negative' | 'neutral';

interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  metric?: string;
  context?: string;
  actionable?: string;
}

const insightConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    accentColor: 'text-green-700',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    accentColor: 'text-amber-700',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    accentColor: 'text-blue-700',
  },
  insight: {
    icon: Lightbulb,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-900',
    accentColor: 'text-purple-700',
  },
  positive: {
    icon: TrendingUp,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-900',
    accentColor: 'text-emerald-700',
  },
  negative: {
    icon: TrendingDown,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    accentColor: 'text-red-700',
  },
  neutral: {
    icon: Target,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600',
    titleColor: 'text-gray-900',
    accentColor: 'text-gray-700',
  },
};

export default function InsightCard({ 
  type, 
  title, 
  description, 
  metric, 
  context,
  actionable 
}: InsightCardProps) {
  const config = insightConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start gap-4">
        <div className={`${config.iconColor} bg-white rounded-xl p-3 shadow-sm flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-grow">
          <h3 className={`${config.titleColor} text-lg font-bold mb-2`}>
            {title}
          </h3>
          
          {metric && (
            <div className={`${config.accentColor} text-3xl font-bold mb-3`}>
              {metric}
            </div>
          )}
          
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            {description}
          </p>
          
          {context && (
            <p className="text-gray-600 text-xs italic mt-2 border-l-2 border-gray-300 pl-3">
              {context}
            </p>
          )}
          
          {actionable && (
            <div className="mt-4 flex items-start gap-2">
              <Zap className={`${config.iconColor} w-4 h-4 mt-0.5 flex-shrink-0`} />
              <p className={`${config.accentColor} text-sm font-medium`}>
                {actionable}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}