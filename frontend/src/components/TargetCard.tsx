import { Target } from 'lucide-react';

interface TargetStats {
  mean: number;
  std: number;
  distribution: string;
}

interface TargetCardProps {
  title: string;
  stats: TargetStats;
}

export default function TargetCard({ title, stats }: TargetCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-purple-700 capitalize">{title}</h4>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Média</span>
          <span className="font-bold text-gray-800">{stats.mean}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Desvio Padrão</span>
          <span className="font-bold text-gray-800">{stats.std}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Distribuição</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {stats.distribution}
          </span>
        </div>
      </div>
    </div>
  );
}