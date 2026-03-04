import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const BaseModal = ({ isOpen, onClose, title, children, size = 'md', showHeader = true }: BaseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white w-full ${sizeClasses[size]} rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col`}>
        {showHeader && (
          <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
