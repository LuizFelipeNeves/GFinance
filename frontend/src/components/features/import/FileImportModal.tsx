import { useUpload } from '../../../hooks/useUpload';
import { ModalHeader } from './ModalHeader';
import { DropZone } from './DropZone';
import { ProcessingState } from './ProcessingState';
import { SuccessState } from './SuccessState';
import { ModalFooter } from './ModalFooter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FileImportModal = ({ isOpen, onClose }: Props) => {
  const { step, progress, currentTask, file, startUpload, reset } = useUpload();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStartUpload = () => {
    if (file) startUpload(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <ModalHeader onClose={handleClose} />

        <div className="p-6 sm:p-8 flex-1 overflow-auto">
          {step === 'idle' && (
            <DropZone
              file={file}
              onFileSelect={startUpload}
              onRemove={reset}
            />
          )}
          {step === 'processing' && (
            <ProcessingState progress={progress} currentTask={currentTask} />
          )}
          {step === 'success' && <SuccessState />}
        </div>

        <ModalFooter
          step={step}
          file={file}
          onCancel={handleClose}
          onStartUpload={handleStartUpload}
        />
      </div>
    </div>
  );
};
