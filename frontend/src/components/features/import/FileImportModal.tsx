import { useUpload } from '@/hooks/useUpload';
import { BaseModal } from '@/components/shared/BaseModal';
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      showHeader={false}
      size="lg"
    >
      <ModalHeader onClose={handleClose} />

      <div className="p-6 sm:p-8">
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
    </BaseModal>
  );
};
