import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { validateFileExtension, validateCsvStructure, type CsvValidationResult } from '@/utils/csv';

export type UploadStep = 'idle' | 'validating' | 'processing' | 'success' | 'error';

interface UseUploadReturn {
    step: UploadStep;
    progress: number;
    currentTask: string;
    file: File | null;
    validationResult: CsvValidationResult | null;
    startUpload: (file: File) => void;
    reset: () => void;
}

const TASKS = [
    'Lendo dados do arquivo...',
    'Validando estrutura do CSV...',
    'Salvando transações...'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useUpload = (onSuccess?: () => void): UseUploadReturn => {
    const [step, setStep] = useState<UploadStep>('idle');
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);

    const reset = useCallback(() => {
        setStep('idle');
        setProgress(0);
        setCurrentTask('');
        setFile(null);
        setValidationResult(null);
    }, []);

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

            setStep('processing');
        } catch {
            setStep('error');
            setValidationResult({
                isValid: false,
                errors: ['Erro ao processar arquivo. Tente novamente.'],
                rows: []
            });
        }
    }, []);

    useEffect(() => {
        if (step === 'processing' && validationResult?.isValid) {
            setCurrentTask(TASKS[0]);

            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep('success');
                        onSuccess?.();
                        return 100;
                    }

                    const next = prev + Math.random() * 15;

                    if (next < 30) setCurrentTask(TASKS[0]);
                    else if (next < 60) setCurrentTask(TASKS[1]);
                    else setCurrentTask(TASKS[2]);

                    return next;
                });
            }, 400);

            return () => clearInterval(interval);
        }
    }, [step, validationResult, onSuccess]);

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
