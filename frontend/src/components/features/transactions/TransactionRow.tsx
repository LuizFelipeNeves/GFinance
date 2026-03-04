import { ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from 'lucide-react';
import { FormatCurrencySigned } from '@/utils/format';
import type { Transaction } from '@/data/types';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export const TransactionRow = ({ transaction, onEdit, onDelete }: TransactionRowProps) => {
  const isIncome = transaction.type === 'in';

  return (
    <tr className="group hover:bg-slate-50/40 transition-colors">
      <td className="px-4 md:px-8 py-3 md:py-4 align-middle">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
            isIncome ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
          }`}>
            {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs md:text-[13px] font-bold text-slate-900 truncate leading-none mb-1">{transaction.desc}</span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none">{transaction.cat} • {transaction.date}</span>
            <div className="md:hidden mt-2">
              <span className={`text-xs font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                {FormatCurrencySigned(transaction.val)}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell px-4 md:px-8 py-3 md:py-4 align-middle text-right">
        <span className={`text-xs md:text-[13px] font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
          {FormatCurrencySigned(transaction.val)}
        </span>
      </td>
      <td className="px-2 md:px-4 py-3 md:py-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction)}
              className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors"
              aria-label="Excluir"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
