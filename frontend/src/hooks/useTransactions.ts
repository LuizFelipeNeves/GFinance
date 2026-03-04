import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type TransactionsResponse } from '@/services/api';
import type { Transaction } from '@/data/types';

export interface TransactionFilters {
    type?: string;
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
}

const TRANSACTIONS_KEY = ['transactions'];

export const useTransactions = (filters: TransactionFilters = {}) => {
    const queryClient = useQueryClient();

    const transactionsQuery = useInfiniteQuery<TransactionsResponse>({
        queryKey: [...TRANSACTIONS_KEY, filters],
        queryFn: ({ pageParam = 1 }) => api.transactions.list({
            page: pageParam as number,
            type: filters.type || 'all',
            search: filters.search || '',
            category: filters.category || '',
            dateFrom: filters.dateFrom || '',
            dateTo: filters.dateTo || '',
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
    });

    const transactions = transactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [];
    const isLoading = transactionsQuery.isLoading;
    const isFetchingNextPage = transactionsQuery.isFetchingNextPage;
    const hasMore = transactionsQuery.hasNextPage;

    const createMutation = useMutation({
        mutationFn: (transaction: Omit<Transaction, 'id'>) => api.transactions.create(transaction),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
            api.transactions.update(id, data as Omit<Transaction, 'id'>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.transactions.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
        },
    });

    return {
        transactions,
        isLoading,
        isFetchingNextPage,
        hasMore,
        loadMore: transactionsQuery.fetchNextPage,
        refetch: transactionsQuery.refetch,
        createTransaction: createMutation.mutateAsync,
        updateTransaction: updateMutation.mutateAsync,
        deleteTransaction: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
