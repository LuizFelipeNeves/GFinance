import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangePickerProps {
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export const DateRangePicker = ({
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRange = dateFrom && dateTo
    ? { from: parseISO(dateFrom), to: parseISO(dateTo) }
    : undefined;

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      onDateFromChange(format(range.from, 'yyyy-MM-dd'));
    }
    if (range?.to) {
      onDateToChange(format(range.to, 'yyyy-MM-dd'));
    }
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateFromChange('');
    onDateToChange('');
  };

  const displayDate = dateFrom && dateTo
    ? `${format(parseISO(dateFrom), 'dd/MM/yy')} - ${format(parseISO(dateTo), 'dd/MM/yy')}`
    : dateFrom
    ? `De ${format(parseISO(dateFrom), 'dd/MM/yy')}`
    : dateTo
    ? `Até ${format(parseISO(dateTo), 'dd/MM/yy')}`
    : 'Período';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
          dateFrom || dateTo
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        <Calendar size={13} />
        <span className="hidden sm:inline">{displayDate}</span>
        <span className="sm:hidden">{displayDate.split(' - ')[0]}</span>
        {(dateFrom || dateTo) && (
          <X
            size={11}
            onClick={clearDates}
            className="ml-0.5 hover:text-emerald-900"
          />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-100 p-3 min-w-[280px]">
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleRangeSelect}
              locale={ptBR}
              numberOfMonths={1}
              className=""
              classNames={{
                root: 'text-xs',
                month_caption: 'font-semibold text-slate-700 text-sm mb-1',
                weekdays: 'flex gap-0.5 mb-1',
                weekday: 'text-slate-400 font-medium text-[10px] w-9 text-center',
                week: 'flex gap-0.5',
                day: 'p-0',
                day_button: 'w-9 h-8 text-xs rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors font-medium text-slate-600',
                selected: 'bg-emerald-500 text-white hover:bg-emerald-600 rounded-md',
                range_middle: 'bg-emerald-50 text-emerald-700 rounded-none',
                range_start: 'bg-emerald-500 text-white rounded-l-md rounded-r-none',
                range_end: 'bg-emerald-500 text-white rounded-r-md rounded-l-none',
                today: 'font-bold text-emerald-600',
                outside: 'text-slate-300',
                disabled: 'text-slate-200 cursor-not-allowed',
                hidden: 'invisible',
              }}
              components={{
                Chevron: ({ orientation }) => {
                  if (orientation === 'left') {
                    return (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    );
                  }
                  return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  );
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
