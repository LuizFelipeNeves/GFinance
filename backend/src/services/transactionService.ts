import { transactionRepository, type TransactionFilter, type Stats, type SummaryItem } from '../data/transactionRepository';
import { toCsv, generateTemplate } from '../utils';
import type { Transaction } from '../models/transactionModel';

export interface CreateTransactionInput {
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
    async getDashboard(period: string = 'monthly'): Promise<DashboardData> {
        return transactionRepository.getDashboardFull(8, period);
    }

    async getTransactions(page: number, filter: TransactionFilter) {
        return transactionRepository.paginate(page, filter);
    }

    async getTransactionById(id: string) {
        return transactionRepository.getById(id);
    }

    async createTransaction(input: CreateTransactionInput) {
        return transactionRepository.create({
            desc: input.desc,
            cat: input.cat,
            date: input.date,
            val: input.val,
            type: input.type
        });
    }

    async updateTransaction(id: string, input: UpdateTransactionInput) {
        return transactionRepository.update(id, input);
    }

    async deleteTransaction(id: string) {
        return transactionRepository.delete(id);
    }

    async exportToCsv(filter: TransactionFilter = {}): Promise<string> {
        const data = await transactionRepository.exportAsCsv(filter);
        return toCsv(data);
    }

    getTemplateCsv(): string {
        return generateTemplate();
    }
}

export const transactionService = new TransactionService();
