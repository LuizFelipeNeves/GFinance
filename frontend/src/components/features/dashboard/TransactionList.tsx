import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '../../../data/mock';
import { useNavigate } from 'react-router';
import { FormatCurrency } from '../../../utils/format';

export const TransactionList = ({ transactions }: any) => {
  const navigate = useNavigate();
  const gotoTransactions = () => {
    navigate('/transactions');
  }
  return (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
      <div className="p-4 sm:p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-900">Transações Recentes</h3>
        <button onClick={gotoTransactions} className="text-[10px] font-bold text-emerald-600 hover:underline uppercase tracking-wider">Ver todas</button>
      </div>

      <div className="divide-y divide-slate-50">
        {transactions?.map((t: Transaction, i: number) => (
          <div key={i} className="px-4 sm:px-6 py-3 sm:py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`p-2 rounded-xl shrink-0 ${t.type === 'in' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {t.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-tight truncate">{t.desc}</p>
                <p className="text-[10px] text-slate-400 font-medium">{t.cat} • {t.date}</p>
              </div>
            </div>
            <span className={`text-sm font-bold shrink-0 ml-2 ${t.type === 'in' ? 'text-emerald-600' : 'text-slate-900'}`}>
              {FormatCurrency(t.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}