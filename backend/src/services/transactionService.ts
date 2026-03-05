import { transactionRepository, type TransactionFilter } from '../data/transactionRepository';
import { importJobRepository } from '../data/importJobRepository';
import { toCsv, generateTemplate, getRowValue, parseType, parseValue, parseCsv, readFile, deleteFile } from '../utils';
import type { Transaction } from '../mock';

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
    stats: ReturnType<typeof transactionRepository.getStats>;
    transactions: Transaction[];
    summary: ReturnType<typeof transactionRepository.getSummary>;
}

class TransactionService {
    getDashboard(): DashboardData {
        const stats = transactionRepository.getStats();
        const transactions = transactionRepository.getAll().slice(0, 8);
        const summary = transactionRepository.getSummary();
        return { stats, transactions, summary };
    }

    getTransactions(page: number, filter: TransactionFilter) {
        return transactionRepository.paginate(page, filter);
    }

    getTransactionById(id: string) {
        return transactionRepository.getById(id);
    }

    createTransaction(input: CreateTransactionInput) {
        return transactionRepository.create({
            desc: input.desc,
            cat: input.cat,
            date: input.date,
            val: input.val,
            type: input.type
        });
    }

    updateTransaction(id: string, input: UpdateTransactionInput) {
        return transactionRepository.update(id, input);
    }

    deleteTransaction(id: string) {
        return transactionRepository.delete(id);
    }

    processImport(jobId: string): void {
        const job = importJobRepository.getById(jobId);
        if (!job) return;

        try {
            const fileContent = readFile(job.filePath);
            const rows = parseCsv(fileContent);
            const total = rows.length;

            importJobRepository.update(jobId, { total });

            let processed = 0;

            const processNext = () => {
                if (processed >= total) {
                    const newTransactions: Transaction[] = rows.map((r, i) => ({
                        id: `t-import-${Date.now()}-${i}`,
                        desc: getRowValue(r, 'descricao', 'desc', 'description'),
                        cat: getRowValue(r, 'categoria', 'cat', 'category'),
                        date: getRowValue(r, 'data', 'date'),
                        val: parseValue(getRowValue(r, 'valor', 'val', 'value')),
                        type: parseType(getRowValue(r, 'tipo', 'type'))
                    }));

                    transactionRepository.addBatch(newTransactions);
                    importJobRepository.update(jobId, { status: 'complete', progress: 100, imported: newTransactions.length });
                    return;
                }

                processed += 1;
                importJobRepository.update(jobId, { progress: Math.round((processed / total) * 100) });
                setTimeout(processNext, 100);
            };

            setTimeout(processNext, 500);
        } finally {
            deleteFile(job.filePath);
        }
    }

    exportToCsv(filter: TransactionFilter = {}): string {
        const data = transactionRepository.exportAsCsv(filter);
        return toCsv(data);
    }

    getTemplateCsv(): string {
        return generateTemplate();
    }
}

export const transactionService = new TransactionService();
