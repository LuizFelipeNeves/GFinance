import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';
import type { Summary } from '../../../data/types';
import { FormatCurrency } from '../../../utils/format';

const Colours = [
  '#10B981', '#0F172A', '#6366F1', '#F59E0B', '#34D399',
  '#64748B', '#818CF8', '#A7F3D0', '#94A3B8', '#FCD34D'
];

export const SummaryChart = ({ summary }: { summary: Summary | undefined }) => {
  const TOTAL = summary?.reduce((a, b) => a + b.val, 0);
  const chartData = summary?.map((item, i) => ({
    ...item,
    val: item.val || 0,
    fill: Colours[i % Colours.length]
  })) || [];

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900">Gastos por Categoria</h3>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Mensal</p>
      </div>

      <div className="relative flex-1 w-full min-h-[200px] sm:min-h-[280px] lg:min-h-[320px] flex items-center justify-center">
        <div className="absolute flex flex-col items-center justify-center pointer-events-none z-10">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Total Gasto</span>
          <span className="text-base sm:text-lg font-bold text-slate-900">
            {FormatCurrency(TOTAL || 0)}
          </span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={8}
              dataKey="val"
              stroke="none"
              cornerRadius={12}
              startAngle={90}
              endAngle={450}
              isAnimationActive={true}
            />
            <Tooltip
              formatter={(value) => FormatCurrency(Number(value) || 0)}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px rgba(0,0,0,0.05)',
                fontSize: '11px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-2 mt-2 sm:mt-4 pt-4 sm:pt-6 border-t border-slate-50">
        {chartData.map((item, i) => (
          <div key={`${item.label}-${i}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tight">
                {item.label}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-700 shrink-0">
              {FormatCurrency(item.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};