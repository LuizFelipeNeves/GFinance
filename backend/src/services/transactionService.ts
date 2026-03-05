import { transactionRepository, type TransactionFilter, type Stats, type SummaryItem } from '../data/transactionRepository';
import { toCsv, generateTemplate } from '../utils';
import type { Transaction } from '../models/transactionModel';

export interface CreateTransactionInput {
    userId: string;
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
}

export interface UpdateTransactionInput {
    desc?: string;
    cat?: string;
    date?: string;
    val?: number;
    type?: 'in' | 'out';
}

export interface DashboardData {
    stats: Stats;
    transactions: Transaction[];
    summary: SummaryItem[];
}

class TransactionService {
    async getDashboard(userId: string, period: string = 'monthly'): Promise<DashboardData> {
        return transactionRepository.getDashboardFull(userId, 8, period);
    }

    async getTransactions(userId: string, page: number, filter: Omit<TransactionFilter, 'userId'>) {
        return transactionRepository.paginate(page, { ...filter, userId });
    }

    async getTransactionById(id: string, userId: string) {
        return transactionRepository.getById(id, userId);
    }

    async createTransaction(input: CreateTransactionInput) {
        return transactionRepository.create({
            userId: input.userId,
            desc: input.desc,
            cat: input.cat,
            date: input.date,
            val: input.val,
            type: input.type
        });
    }

    async updateTransaction(id: string, userId: string, input: UpdateTransactionInput) {
        return transactionRepository.update(id, userId, input);
    }

    async deleteTransaction(id: string, userId: string) {
        return transactionRepository.delete(id, userId);
    }

    async exportToCsv(userId: string, filter: Omit<TransactionFilter, 'userId'> = {}): Promise<string> {
        const data = await transactionRepository.exportAsCsv({ ...filter, userId });
        return toCsv(data);
    }

    getTemplateCsv(): string {
        return generateTemplate();
    }
}

export const transactionService = new TransactionService();
