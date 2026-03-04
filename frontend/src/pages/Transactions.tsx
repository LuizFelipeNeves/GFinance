import { useState } from 'react';
import { Plus, Download, FileDown, CirclePlus } from 'lucide-react';
import { TransactionsTable } from '@/components/features/transactions';
import { FileImportModal } from '@/components/features/import';
import { AddTransactionModal } from '@/components/features/transactions/AddTransactionModal';
import { generateSampleCsv } from '@/utils/csv';
import { api } from '@/services/api';

const downloadTemplate = () => {
  const csvContent = generateSampleCsv();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'modelo_transacoes.csv';
  link.click();
  URL.revokeObjectURL(link.href);
};

const handleExport = async () => {
  try {
    const response = await api.transactions.export();
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transacoes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar:', error);
  }
};

export const Transactions = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Transações</h1>
          <p className="text-xs text-slate-400 font-medium">Histórico financeiro consolidado.</p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all">
            <CirclePlus size={14} />
            <span>Adicionar</span>
          </button>
          <button onClick={downloadTemplate} className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
            <FileDown size={14} />
            <span>Modelo</span>
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
            <Plus size={14} />
            <span>Importar</span>
          </button>
          <button onClick={handleExport} className="flex-1 md:flex-none flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
            <Download size={14} />
            <span>Exportar</span>
          </button>
        </div>
      </header>
      <main className="w-full">
        <TransactionsTable />
      </main>
      <FileImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};