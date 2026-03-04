import { useEffect, useRef, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { TableHeader } from './TableHeader';
import { TransactionRow } from './TransactionRow';
import { TransactionRowSkeleton } from './TransactionRowSkeleton';

type FilterType = 'all' | 'in' | 'out';

export const TransactionsTable = () => {
  const { transactions, isLoading, loadMore } = useTransactions();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const loaderRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    return transactions.filter(item => {
      const matchesSearch = item.desc.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  const isInitialLoading = isLoading && transactions.length === 0;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && search === '') {
        loadMore();
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [isLoading, search, loadMore]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <TableHeader
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterChange={setFilterType}
      />

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[320px] text-left border-separate border-spacing-0">
          <thead className="bg-slate-50 z-10">
            <tr>
              <th className="px-4 md:px-8 py-3 md:py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Descrição / Categoria</th>
              <th className="px-4 md:px-8 py-3 md:py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isInitialLoading ? (
              [...Array(5)].map((_, i) => <TransactionRowSkeleton key={i} />)
            ) : (
              filteredItems.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))
            )}
          </tbody>
        </table>
        {!isInitialLoading && (
          <div ref={loaderRef} className="p-10 flex flex-col items-center justify-center border-t border-slate-50 bg-slate-50/10">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-emerald-500" size={20} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando dados...</span>
              </div>
            ) : (
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Fim do histórico</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
