import { Search, Calendar } from 'lucide-react';

type FilterType = 'all' | 'in' | 'out';

interface TableHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: FilterType;
  onFilterChange: (value: FilterType) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Saídas' },
];

export const TableHeader = ({
  search,
  onSearchChange,
  filterType,
  onFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: TableHeaderProps) => {
  return (
    <div className="p-4 sm:p-6 border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por descrição..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterType === filter.value
                    ? filter.value === 'in' ? 'bg-emerald-500 text-white shadow-sm' :
                      filter.value === 'out' ? 'bg-rose-500 text-white shadow-sm' :
                      'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={14} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-500 uppercase outline-none cursor-pointer"
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
            />
          </div>
          <span className="text-slate-300 text-xs shrink-0">-</span>
          <div className="relative flex-1">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full pl-3 pr-2 py-1.5 bg-slate-50 border-none rounded-xl text-[10px] font-bold text-slate-500 uppercase outline-none cursor-pointer"
              onClick={(e) => (e.target as HTMLInputElement).showPicker()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
