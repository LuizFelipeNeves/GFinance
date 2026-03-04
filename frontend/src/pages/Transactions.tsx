import { useState } from 'react';
import { Plus, Download, FileDown } from 'lucide-react';
import { TransactionsTable } from '../components/features/transactions';
import { FileImportModal } from '../components/features/import';

const downloadTemplate = () => {
  const headers = ['data', 'tipo', 'valor', 'categoria', 'descricao'];
  const example = ['2026-03-04', 'entrada', '150.00', 'Software', 'Pagamento Exemplo'];
  const csvContent = [headers.join(','), example.join(',')].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'modelo_transacoes.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

export const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Transações</h1>
          <p className="text-xs text-slate-400 font-medium">Histórico financeiro consolidado.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={downloadTemplate} className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
            <FileDown size={14} />
            <span>Modelo</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
            <Download size={14} />
            <span>Exportar</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all">
            <Plus size={14} />
            <span>Importar</span>
          </button>
        </div>
      </header>
      <main className="w-full">
        <TransactionsTable />
      </main>
      <FileImportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};