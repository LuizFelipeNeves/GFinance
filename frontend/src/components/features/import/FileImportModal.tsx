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
          <ProcessingState progress={30} currentTask="Validando estrutura do arquivo..." />
        )}
        {(step === 'uploading' || step === 'processing') && (
          <ProcessingState progress={progress} currentTask={currentTask} />
        )}
        {step === 'success' && <SuccessState />}
        {step === 'error' && validationResult && !validationResult.isValid && validationResult.errors.length > 0 ? (
          <ErrorState
            errors={validationResult.errors}
            onRetry={handleRetry}
          />
        ) : step === 'error' && (
          <ErrorState
            errors={['Erro ao processar arquivo. Tente novamente.']}
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
