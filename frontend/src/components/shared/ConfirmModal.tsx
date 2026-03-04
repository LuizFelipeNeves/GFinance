import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-rose-100' : 'bg-slate-100'
          }`}>
            {variant === 'danger' ? (
              <AlertTriangle className="text-rose-500" size={24} />
            ) : (
              <div className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>

        <div className="flex border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              variant === 'danger'
                ? 'text-rose-500 hover:bg-rose-50'
                : 'text-emerald-500 hover:bg-emerald-50'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
