import type { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  iconBg, 
  iconColor 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-sm`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-4xl font-bold text-gray-800 mb-2">{value}</p>
      {subtitle && (
        <p className="text-sm font-medium text-green-600 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {subtitle}
        </p>
      )}
    </div>
  );
}