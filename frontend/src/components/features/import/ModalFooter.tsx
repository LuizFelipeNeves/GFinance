import type { UploadStep } from '@/hooks/useUpload';

interface ModalFooterProps {
  step: UploadStep;
  file: File | null;
  onCancel: () => void;
  onStartUpload: () => void;
}

export const ModalFooter = ({ step, file, onCancel, onStartUpload }: ModalFooterProps) => {
  if (step === 'validating' || step === 'uploading' || step === 'processing' || step === 'error') {
    return null;
  }

  return (
    <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-50 flex gap-3 shrink-0">
      {step === 'idle' && (
        <>
          <button
            onClick={onCancel}
            className="flex-1 py-3 sm:py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!file}
            onClick={onStartUpload}
            className="flex-1 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 disabled:hover:bg-emerald-500 text-white rounded-xl sm:rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all"
          >
            Iniciar Importação
          </button>
        </>
      )}
      {step === 'success' && (
        <button
          onClick={onCancel}
          className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-bold text-sm transition-all"
        >
          Fechar
        </button>
      )}
    </div>
  );
};
