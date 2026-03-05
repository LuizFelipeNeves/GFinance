import { useRef } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { api } from '@/services/api';

interface DropZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export const DropZone = ({ file, onFileSelect, onRemove }: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
    e.target.value = '';
  };

  const handleDownloadTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.transactions.downloadTemplate();
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if(e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
      }}
      className="group border-2 border-dashed border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl sm:rounded-[2rem] p-8 sm:p-12 transition-all cursor-pointer text-center"
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />

      {!file ? (
        <>
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={28} />
          </div>
          <p className="text-sm font-bold text-slate-900">Selecione seu arquivo</p>
          <p className="text-xs text-slate-400 mt-1">ou arraste e solte aqui</p>
          <button
            onClick={handleDownloadTemplate}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <Download size={14} />
            Baixar modelo CSV
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="p-3 sm:p-4 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl mb-3">
            <FileText size={32} />
          </div>
          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="mt-2 text-[10px] font-bold text-rose-500 uppercase hover:underline"
          >
            Remover
          </button>
        </div>
      )}
    </div>
  );
};
