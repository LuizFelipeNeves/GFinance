import { type LucideIcon } from 'lucide-react';
import { FormatCurrency } from '../../../utils/format';
import type { StatsItem } from '../../../data/types';

interface StatCardProps {
  title: string;
  stats: StatsItem | undefined;
  icon: LucideIcon;
  variant?: 'success' | 'danger' | 'neutral';
}

const calculateTrend = (oldVal: number, newVal: number) => {
  if (oldVal === 0) return '0%';
  const change = ((newVal - oldVal) / Math.abs(oldVal)) * 100;
  return `${change > 0 ? '+' : ''}${Math.round(change)}%`;
};

export const StatCard = ({ title, stats, icon: Icon, variant = 'neutral' }: StatCardProps) => {
  const trend = calculateTrend(stats?.old || 0, stats?.new || 0);

  return (
    <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400">
          <Icon size={20} />
        </div>
        <span className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-full ${variant === 'success' ? 'bg-emerald-50 text-emerald-600' :
            variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
          }`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{FormatCurrency(stats?.new || 0)}</h3>
      </div>
    </div>
  );
}