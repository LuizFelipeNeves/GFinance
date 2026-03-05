import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  progress: number;
  currentTask: string;
}

export const ProcessingState = ({ progress, currentTask }: ProcessingStateProps) => {
  const roundedProgress = Math.round(progress);

  return (
    <div className="py-8 sm:py-10 flex flex-col items-center">
      <div className="relative w-24 h-24 mb-6">
        <Loader2 className="w-full h-full animate-spin text-emerald-500" strokeWidth={1.5} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{roundedProgress}%</span>
        </div>
      </div>
      <p className="text-sm font-bold text-slate-900 mb-4">{currentTask}</p>
      <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${roundedProgress}%` }}
        />
      </div>
    </div>
  );
};
