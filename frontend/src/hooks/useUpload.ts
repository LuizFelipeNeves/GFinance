import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type UploadProgress } from '@/services/api';
import { useEventSource, type SseMessage } from '@/hooks/useEventSource';
import { validateFileExtension, validateCsvStructure, type CsvValidationResult } from '@/utils/csv';

export type UploadStep = 'idle' | 'validating' | 'uploading' | 'processing' | 'success' | 'error';

interface UseUploadReturn {
    step: UploadStep;
    progress: number;
    currentTask: string;
    file: File | null;
    validationResult: CsvValidationResult | null;
    startUpload: (file: File) => void;
    reset: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useUpload = (onSuccess?: () => void): UseUploadReturn => {
    const [step, setStep] = useState<UploadStep>('idle');
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
    const queryClient = useQueryClient();

    const handleSseProgress = useCallback((data: SseMessage) => {
        if (data.progress !== undefined) {
            setProgress(data.progress);
        }
        if (data.message) {
            setCurrentTask(data.message);
        }
    }, []);

    const handleSseComplete = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        setStep('success');
        onSuccess?.();
    }, [onSuccess, queryClient]);

    const handleSseError = useCallback((error: string) => {
        setStep('error');
        toast.error('Erro ao processar arquivo', {
            description: error,
        });
    }, []);

    const { connect: connectSse, disconnect: disconnectSse } = useEventSource({
        onProgress: handleSseProgress,
        onComplete: handleSseComplete,
        onError: handleSseError,
    });

    const reset = useCallback(() => {
        setStep('idle');
        setProgress(0);
        setCurrentTask('');
        setFile(null);
        setValidationResult(null);
        disconnectSse();
    }, [disconnectSse]);

    const startUpload = useCallback(async (selectedFile: File) => {
        if (!validateFileExtension(selectedFile.name)) {
            toast.error('Tipo de arquivo inválido', {
                description: 'Use arquivos .csv',
            });
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error('Arquivo muito grande', {
                description: 'O arquivo deve ter no máximo 5MB',
            });
            return;
        }

        setFile(selectedFile);
        setStep('validating');
        setProgress(0);
        setCurrentTask('Validando arquivo...');
        setValidationResult(null);

        try {
            const result = await validateCsvStructure(selectedFile);
            setValidationResult(result);

            if (!result.isValid) {
                setStep('error');
                return;
            }

            setStep('uploading');
            setProgress(0);
            setCurrentTask('Enviando arquivo...');

            const response = await api.transactions.importFile(selectedFile, (uploadProgress: UploadProgress) => {
                setProgress(uploadProgress.percent);
            });

            if (!response.success) {
                setStep('error');
                toast.error('Erro ao processar arquivo', {
                    description: response.message || 'Tente novamente',
                });
                return;
            }

            setProgress(90);
            setStep('processing');
            setCurrentTask('Processando transações...');

            if (response.jobId) {
                connectSse(`http://localhost:3001/api/transactions/import/stream?jobId=${response.jobId}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setStep('error');
            toast.error('Erro ao enviar arquivo', {
                description: 'Tente novamente mais tarde.',
            });
        }
    }, [connectSse]);

    return {
        step,
        progress,
        currentTask,
        file,
        validationResult,
        startUpload,
        reset
    };
};
