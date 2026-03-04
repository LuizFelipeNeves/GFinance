import { CheckCircle2 } from 'lucide-react';

export const SuccessState = () => (
  <div className="py-8 sm:py-10 text-center animate-in zoom-in-95">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
      <CheckCircle2 size={40} />
    </div>
    <h4 className="text-base sm:text-lg font-bold text-slate-900">Sucesso!</h4>
    <p className="text-xs sm:text-sm text-slate-400 mt-2">Suas transações foram importadas e categorizadas automaticamente.</p>
  </div>
);
