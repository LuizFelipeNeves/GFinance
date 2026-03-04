import { AlertCircle, FileWarning } from 'lucide-react';

interface ErrorStateProps {
  errors: string[];
  onRetry: () => void;
}

export const ErrorState = ({ errors, onRetry }: ErrorStateProps) => {
  const hasManyErrors = errors.length > 5;
  const displayErrors = hasManyErrors ? errors.slice(0, 5) : errors;

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="text-rose-500" size={28} />
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-2">
        {hasManyErrors ? 'Arquivo com erros' : 'Erro na validação'}
      </h3>

      <p className="text-xs text-slate-500 mb-4">
        {hasManyErrors
          ? `Encontramos ${errors.length} problemas no arquivo. Corrija e tente novamente.`
          : 'Verifique os erros abaixo e tente novamente.'}
      </p>

      <div className="w-full bg-rose-50 rounded-xl p-4 text-left max-h-48 overflow-auto">
        <div className="flex items-start gap-2 mb-2">
          <FileWarning size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <span className="text-xs font-medium text-rose-600">Erros encontrados:</span>
        </div>
        <ul className="space-y-1">
          {displayErrors.map((error, index) => (
            <li key={index} className="text-[11px] text-rose-500 pl-5 break-words">
              {error}
            </li>
          ))}
          {hasManyErrors && (
            <li className="text-[11px] text-rose-500 pl-5 font-medium">
              + {errors.length - 5} outros erros...
            </li>
          )}
        </ul>
      </div>

      <button
        onClick={onRetry}
        className="mt-5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
};
