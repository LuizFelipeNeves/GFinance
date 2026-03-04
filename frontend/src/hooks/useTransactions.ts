import { MockData, fetchMoreTransactions } from '../data/mock';
import type { Transaction } from '../data/types';
import { useEffect, useState, useCallback } from 'react';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const loadInitial = async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            setTransactions(MockData.transactions);
            setIsLoading(false);
        };
        loadInitial();
    }, []);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const newTransactions = fetchMoreTransactions(page);

        if (newTransactions.length === 0) {
            setHasMore(false);
        } else {
            setTransactions(prev => [...prev, ...newTransactions]);
            setPage(prev => prev + 1);
        }
        setIsLoading(false);
    }, [page, isLoading, hasMore]);

    const refresh = useCallback(() => {
        setTransactions(MockData.transactions);
        setPage(1);
        setHasMore(true);
    }, []);

    return {
        transactions,
        isLoading,
        hasMore,
        loadMore,
        refresh
    };
};
