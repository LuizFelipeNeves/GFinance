import { X } from 'lucide-react';

interface ModalHeaderProps {
  onClose: () => void;
}

export const ModalHeader = ({ onClose }: ModalHeaderProps) => (
  <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
    <div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900">Importar Extrato</h3>
      <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-bold">Apenas arquivos .csv, .ofx ou .txt</p>
    </div>
    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
      <X size={20} />
    </button>
  </div>
);
