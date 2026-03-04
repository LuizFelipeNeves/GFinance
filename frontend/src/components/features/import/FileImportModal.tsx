import { useUpload } from '@/hooks/useUpload';
import { BaseModal } from '@/components/shared/BaseModal';
import { ModalHeader } from './ModalHeader';
import { DropZone } from './DropZone';
import { ProcessingState } from './ProcessingState';
import { SuccessState } from './SuccessState';
import { ErrorState } from './ErrorState';
import { ModalFooter } from './ModalFooter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FileImportModal = ({ isOpen, onClose }: Props) => {
  const { step, progress, currentTask, file, validationResult, startUpload, reset } = useUpload();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStartUpload = () => {
    if (file) startUpload(file);
  };

  const handleRetry = () => {
    reset();
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
        {step === 'validating' && (
          <ProcessingState progress={50} currentTask="Validando estrutura do arquivo..." />
        )}
        {step === 'processing' && (
          <ProcessingState progress={progress} currentTask={currentTask} />
        )}
        {step === 'success' && <SuccessState />}
        {step === 'error' && validationResult && (
          <ErrorState
            errors={validationResult.errors}
            onRetry={handleRetry}
          />
        )}
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
