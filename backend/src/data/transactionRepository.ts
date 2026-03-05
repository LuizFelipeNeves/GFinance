import type { Transaction } from '../mock';
import { mockData, fetchMoreTransactions } from '../mock';

export interface TransactionFilter {
    type?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    hasMore: boolean;
    page: number;
    total: number;
}

class TransactionRepository {
    private pageSize = 10;

    getAll(): Transaction[] {
        return mockData.transactions;
    }

    getById(id: string): Transaction | undefined {
        return mockData.transactions.find(t => t.id === id);
    }

    create(transaction: Omit<Transaction, 'id'>): Transaction {
        const newTransaction: Transaction = {
            ...transaction,
            id: `t-${Date.now()}`
        };
        mockData.transactions.unshift(newTransaction);
        return newTransaction;
    }

    update(id: string, transaction: Partial<Transaction>): Transaction | undefined {
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            mockData.transactions[index] = { ...mockData.transactions[index], ...transaction };
            return mockData.transactions[index];
        }
        return undefined;
    }

    delete(id: string): boolean {
        const initialLength = mockData.transactions.length;
        mockData.transactions = mockData.transactions.filter(t => t.id !== id);
        return mockData.transactions.length < initialLength;
    }

    addBatch(transactions: Transaction[]): void {
        mockData.transactions = [...transactions, ...mockData.transactions];
    }

    filter(filter: TransactionFilter, transactions?: Transaction[]): Transaction[] {
        let filtered = [...(transactions || mockData.transactions)];

        if (filter.type && filter.type !== 'all') {
            filtered = filtered.filter(t => t.type === filter.type);
        }

        if (filter.dateFrom) {
            const fromDate = new Date(filter.dateFrom.split('/').reverse().join('-'));
            filtered = filtered.filter(t => {
                const tDate = new Date(t.date.split('/').reverse().join('-'));
                return tDate >= fromDate;
            });
        }

        if (filter.dateTo) {
            const toDate = new Date(filter.dateTo.split('/').reverse().join('-'));
            filtered = filtered.filter(t => {
                const tDate = new Date(t.date.split('/').reverse().join('-'));
                return tDate <= toDate;
            });
        }

        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.desc.toLowerCase().includes(searchLower) ||
                t.cat.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }

    paginate(page: number, filter: TransactionFilter = {}): PaginatedResult<Transaction> {
        const filtered = this.filter(filter);
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginatedData = filtered.slice(startIndex, endIndex);
        const hasMore = endIndex < filtered.length;

        if (page === 1 && !filter.search && !filter.dateFrom && !filter.dateTo && filter.type === 'all') {
            const moreTransactions = fetchMoreTransactions(1);
            mockData.transactions = [...mockData.transactions, ...moreTransactions];
        }

        return {
            data: paginatedData,
            hasMore,
            page,
            total: filtered.length
        };
    }

    getStats() {
        return mockData.stats;
    }

    getSummary() {
        return mockData.summary;
    }

    exportAsCsv(filter: TransactionFilter = {}): Record<string, unknown>[] {
        const filtered = this.filter(filter);
        return filtered.map(t => ({
            data: t.date,
            tipo: t.type,
            valor: t.val,
            categoria: t.cat,
            descricao: t.desc
        }));
    }
}

export const transactionRepository = new TransactionRepository();
