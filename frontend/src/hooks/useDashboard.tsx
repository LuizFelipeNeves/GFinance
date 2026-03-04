import { MockData } from '@/data/mock';
import { useEffect, useState } from 'react';

export const useDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const shouldFail = Math.random() < 0.5; 
    if (shouldFail) {
        return { data: null, isLoading: false, error: 'Failed to load dashboard data' };
    }

    return { data: MockData, isLoading, error: null };
}