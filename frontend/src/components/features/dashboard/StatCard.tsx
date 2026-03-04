import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  variant?: 'success' | 'danger' | 'neutral';
}

export const StatCard = ({ title, value, trend, icon: Icon, variant = 'neutral' }: StatCardProps) => (
  <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-3 sm:mb-4">
      <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400">
        <Icon size={20} />
      </div>
      <span className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-full ${
        variant === 'success' ? 'bg-emerald-50 text-emerald-600' :
        variant === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
      }`}>
        {trend}
      </span>
    </div>
    <div>
      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  </div>
);