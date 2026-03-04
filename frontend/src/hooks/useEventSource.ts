import { useEffect, useRef, useCallback } from 'react';

export interface SseMessage {
    type: 'progress' | 'complete' | 'error' | 'connected';
    progress?: number;
    message?: string;
    imported?: number;
}

interface UseEventSourceOptions {
    onProgress?: (data: SseMessage) => void;
    onComplete?: (data: SseMessage) => void;
    onError?: (error: string) => void;
    onConnect?: () => void;
}

interface UseEventSourceReturn {
    connect: (url: string) => void;
    disconnect: () => void;
    isConnected: boolean;
}

export const useEventSource = (options: UseEventSourceOptions = {}): UseEventSourceReturn => {
    const eventSourceRef = useRef<EventSource | null>(null);
    const isConnectedRef = useRef(false);
    const isCompletedRef = useRef(false);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            isConnectedRef.current = false;
        }
    }, []);

    const connect = useCallback((url: string) => {
        disconnect();
        isCompletedRef.current = false;

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;
        isConnectedRef.current = true;

        eventSource.onopen = () => {
            options.onConnect?.();
        };

        eventSource.onmessage = (event) => {
            try {
                const data: SseMessage = JSON.parse(event.data);

                if (data.type === 'progress') {
                    options.onProgress?.(data);
                } else if (data.type === 'complete') {
                    isCompletedRef.current = true;
                    options.onComplete?.(data);
                } else if (data.type === 'error') {
                    options.onError?.(data.message || 'Erro desconhecido');
                }
            } catch (e) {
                console.error('Failed to parse SSE message:', e);
            }
        };

        eventSource.onerror = () => {
            if (isCompletedRef.current) {
                disconnect();
                return;
            }
            disconnect();
            options.onError?.('Conexão perdida');
        };
    }, [disconnect, options]);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        connect,
        disconnect,
        isConnected: isConnectedRef.current,
    };
};
