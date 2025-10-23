import { Target, CheckCircle } from 'lucide-react';

interface TargetStats {
  mean: number;
  std: number;
  distribution: string;
}

interface TargetCardProps {
  title: string;
  stats: TargetStats;
  r2Score?: number | null;
}

export default function TargetCard({ title, stats, r2Score }: TargetCardProps) {
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
          <span className="font-bold text-gray-800">{stats.std.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Distribuição</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {stats.distribution}
          </span>
        </div>
        {r2Score !== null && r2Score !== undefined && (
          <div className="flex justify-between items-center pt-2 border-t border-purple-100">
            <span className="text-gray-600 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Score R² (vs Real)
            </span>
            <span className="font-bold text-green-600 text-lg">{r2Score.toFixed(4)}</span>
          </div>
        )}

      </div>
    </div>
  );
}