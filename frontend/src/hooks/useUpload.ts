import { useState, useEffect, useCallback } from 'react';

type UploadStep = 'idle' | 'processing' | 'success';

interface UseUploadReturn {
    step: UploadStep;
    progress: number;
    currentTask: string;
    file: File | null;
    startUpload: (file: File) => void;
    reset: () => void;
}

const TASKS = [
    'Lendo dados do arquivo...',
    'Validando categorias...',
    'Salvando transações...'
];

export const useUpload = (onSuccess?: () => void): UseUploadReturn => {
    const [step, setStep] = useState<UploadStep>('idle');
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const reset = useCallback(() => {
        setStep('idle');
        setProgress(0);
        setCurrentTask('');
        setFile(null);
    }, []);

    const startUpload = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setStep('processing');
        setProgress(0);
    }, []);

    useEffect(() => {
        if (step === 'processing') {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setStep('success');
                        onSuccess?.();
                        return 100;
                    }

                    const next = prev + Math.random() * 15;

                    if (next < 40) setCurrentTask(TASKS[0]);
                    else if (next < 80) setCurrentTask(TASKS[1]);
                    else setCurrentTask(TASKS[2]);

                    return next;
                });
            }, 400);

            return () => clearInterval(interval);
        }
    }, [step, onSuccess]);

    return {
        step,
        progress,
        currentTask,
        file,
        startUpload,
        reset
    };
};
