import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTransactions, type TransactionFilters } from '@/hooks/useTransactions';
import { TableHeader } from './TableHeader';
import { TransactionRow } from './TransactionRow';
import { TransactionRowSkeleton } from './TransactionRowSkeleton';
import { AddTransactionModal } from './AddTransactionModal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import type { Transaction } from '@/data/types';

type FilterType = 'all' | 'in' | 'out';

export const TransactionsTable = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({
    isOpen: false,
    transaction: null,
  });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({
    isOpen: false,
    transaction: null,
  });

  const { ref: loadMoreRef, inView } = useInView();

  const filters: TransactionFilters = {
    type: filterType,
    search: search,
    dateFrom,
    dateTo,
  };

  const {
    transactions,
    isLoading,
    isFetchingNextPage,
    hasMore,
    loadMore,
    deleteTransaction,
  } = useTransactions(filters);

  const isInitialLoading = isLoading && transactions.length === 0;

  useEffect(() => {
    if (inView && !isLoading && !isFetchingNextPage && hasMore) {
      loadMore();
    }
  }, [inView, isLoading, isFetchingNextPage, hasMore, loadMore]);

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteModal({ isOpen: true, transaction });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.transaction) {
      try {
        await deleteTransaction(deleteModal.transaction.id);
        toast.success('Transação excluída com sucesso!');
      } catch {
        toast.error('Erro ao excluir transação');
      }
    }
    setDeleteModal({ isOpen: false, transaction: null });
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditModal({ isOpen: true, transaction });
  };

  const handleEditSuccess = () => {
    setEditModal({ isOpen: false, transaction: null });
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <TableHeader
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterChange={setFilterType}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
      />

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[320px] text-left border-separate border-spacing-0">
          <thead className="bg-slate-50 z-10">
            <tr>
              <th className="px-4 md:px-8 py-3 md:py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Descrição / Categoria</th>
              <th className="hidden md:table-cell px-4 md:px-8 py-3 md:py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right w-32 md:w-40">Valor</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right w-20">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isInitialLoading ? (
              [...Array(5)].map((_, i) => <TransactionRowSkeleton key={i} />)
            ) : (
              transactions.map((transaction: Transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </tbody>
        </table>
        {!isInitialLoading && transactions.length === 0 && (
          <div className="p-10 flex flex-col items-center justify-center border-t border-slate-50 bg-slate-50/10">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Nenhuma transação encontrada</span>
          </div>
        )}
        <div ref={loadMoreRef} className="p-10 flex flex-col items-center justify-center border-t border-slate-50 bg-slate-50/10">
          {isFetchingNextPage ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-emerald-500" size={20} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sincronizando dados...</span>
            </div>
          ) : !hasMore && transactions.length > 0 ? (
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Fim do histórico</span>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Excluir Transação"
        message={`Tem certeza que deseja excluir "${deleteModal.transaction?.desc}"?`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, transaction: null })}
        variant="danger"
      />

      <AddTransactionModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, transaction: null })}
        transaction={editModal.transaction}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};
