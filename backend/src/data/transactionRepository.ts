import { TransactionModel, type ITransaction, type Transaction } from '../models/transactionModel';

export type TransactionInput = Omit<Transaction, 'id'>;

export interface TransactionFilter {
    userId: string;
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

export interface Stats {
    balance: { old: number; new: number };
    income: { old: number; new: number };
    expenses: { old: number; new: number };
}

export interface SummaryItem {
    label: string;
    val: number;
}

class TransactionRepository {
    private pageSize = 10;

    private toPlainTransaction(doc: ITransaction): Transaction {
        return {
            id: doc._id.toString(),
            userId: doc.userId,
            desc: doc.desc,
            cat: doc.cat,
            date: doc.date,
            val: doc.val,
            type: doc.type
        };
    }

    async getAll(userId: string): Promise<Transaction[]> {
        const docs = await TransactionModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return docs.map(this.toPlainTransaction);
    }

    async getById(id: string, userId: string): Promise<Transaction | undefined> {
        try {
            const doc = await TransactionModel.findOne({ _id: id, userId }).lean();
            if (!doc) return;
            return this.toPlainTransaction(doc);
        } catch {
        }
    }

    async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
        const doc = await TransactionModel.create(transaction);
        return this.toPlainTransaction(doc);
    }

    async update(id: string, userId: string, transaction: Partial<Transaction>): Promise<Transaction | undefined> {
        try {
            const doc = await TransactionModel.findOneAndUpdate(
                { _id: id, userId },
                transaction,
                { returnDocument: 'after' }
            ).lean();
            if (!doc) return;
            return this.toPlainTransaction(doc);
        } catch {
        }
    }

    async delete(id: string, userId: string): Promise<boolean> {
        try {
            const result = await TransactionModel.findOneAndDelete({ _id: id, userId });
            return result !== null;
        } catch {
            return false;
        }
    }

    async addBatch(transactions: TransactionInput[]): Promise<void> {
        if (transactions.length === 0) return;
        await TransactionModel.insertMany(transactions, { ordered: false });
    }

    async clear(): Promise<void> {
    }

    private buildFilterQuery(filter: TransactionFilter): Record<string, unknown> {
        const query: Record<string, unknown> = { userId: filter.userId };

        if (filter.type && filter.type !== 'all') {
            query.type = filter.type;
        }

        if (filter.search) {
            query.$or = [
                { desc: { $regex: filter.search, $options: 'i' } },
                { cat: { $regex: filter.search, $options: 'i' } }
            ];
        }

        if (filter.dateFrom || filter.dateTo) {
            query.date = {};
            if (filter.dateFrom) {
                const fromDate = filter.dateFrom.split('/').reverse().join('-');
                (query.date as Record<string, string>).$gte = fromDate;
            }
            if (filter.dateTo) {
                const toDate = filter.dateTo.split('/').reverse().join('-');
                (query.date as Record<string, string>).$lte = toDate;
            }
        }

        return query;
    }

    async paginate(page: number, filter: TransactionFilter): Promise<PaginatedResult<Transaction>> {
        const query = this.buildFilterQuery(filter);
        const skip = (page - 1) * this.pageSize;

        const [data, total] = await Promise.all([
            TransactionModel.find(query).sort({ date: -1 }).skip(skip).limit(this.pageSize).lean(),
            TransactionModel.countDocuments(query)
        ]);

        return {
            data: data.map(this.toPlainTransaction),
            hasMore: skip + data.length < total,
            page,
            total
        };
    }

    async getDashboardFull(userId: string, limit = 8, period: string = 'monthly'): Promise<{
        stats: Stats;
        transactions: Transaction[];
        summary: SummaryItem[];
    }> {
        const query = { userId };
        const totalDocs = await TransactionModel.countDocuments(query);

        if (totalDocs === 0) {
            return {
                stats: {
                    balance: { old: 0, new: 0 },
                    income: { old: 0, new: 0 },
                    expenses: { old: 0, new: 0 }
                },
                transactions: [],
                summary: []
            };
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const formatDate = (month: number, year: number) => {
            const m = String(month + 1).padStart(2, '0');
            return `${year}-${m}-01`;
        };

        let currentPeriodStart: string;
        let previousPeriodStart: string;
        let nextPeriodStart: string;
        let summaryMatch: Record<string, unknown>;

        if (period === 'yearly') {
            previousPeriodStart = formatDate(0, currentYear - 1);
            currentPeriodStart = formatDate(0, currentYear);
            nextPeriodStart = formatDate(0, currentYear + 1);
            summaryMatch = { userId, type: 'out', date: { $gte: currentPeriodStart, $lt: nextPeriodStart } };
        } else if (period === 'quarterly') {
            const currentQuarter = Math.floor(currentMonth / 3);
            const previousQuarter = currentQuarter === 0 ? 3 : currentQuarter;
            const previousQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;
            const currentQuarterMonthStart = currentQuarter * 3;
            const previousQuarterMonthStart = (previousQuarter - 1) * 3;

            previousPeriodStart = formatDate(previousQuarterMonthStart, previousQuarterYear);
            currentPeriodStart = formatDate(currentQuarterMonthStart, currentYear);
            nextPeriodStart = formatDate((currentQuarter + 1) * 3, currentYear);
            summaryMatch = { userId, type: 'out', date: { $gte: currentPeriodStart, $lt: nextPeriodStart } };
        } else {
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

            previousPeriodStart = formatDate(lastMonth, lastMonthYear);
            currentPeriodStart = formatDate(currentMonth, currentYear);
            nextPeriodStart = formatDate((currentMonth + 1) % 12, currentMonth + 1 > 11 ? currentYear + 1 : currentYear);
            summaryMatch = { userId, type: 'out', date: { $gte: currentPeriodStart, $lt: nextPeriodStart } };
        }

        const userQuery = { userId };

        const result = await TransactionModel.aggregate([
            {
                $facet: {
                    oldStats: [
                        { $match: { ...userQuery, date: { $gte: previousPeriodStart, $lt: currentPeriodStart } } },
                        {
                            $group: {
                                _id: null,
                                income: { $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$val', 0] } },
                                expenses: { $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$val', 0] } }
                            }
                        }
                    ],
                    newStats: [
                        { $match: { ...userQuery, date: { $gte: currentPeriodStart, $lt: nextPeriodStart } } },
                        {
                            $group: {
                                _id: null,
                                income: { $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$val', 0] } },
                                expenses: { $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$val', 0] } }
                            }
                        }
                    ],
                    oldBalance: [
                        { $match: { ...userQuery, date: { $lt: currentPeriodStart } } },
                        {
                            $group: {
                                _id: null,
                                income: { $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$val', 0] } },
                                expenses: { $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$val', 0] } }
                            }
                        }
                    ],
                    newBalance: [
                        { $match: { ...userQuery, date: { $lt: nextPeriodStart } } },
                        {
                            $group: {
                                _id: null,
                                income: { $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$val', 0] } },
                                expenses: { $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$val', 0] } }
                            }
                        }
                    ],
                    summary: [
                        { $match: summaryMatch },
                        { $group: { _id: '$cat', val: { $sum: '$val' } } },
                        { $sort: { val: -1 } },
                        { $project: { label: '$_id', val: 1, _id: 0 } }
                    ],
                    transactions: [
                        { $match: { ...userQuery, date: { $gte: currentPeriodStart, $lt: nextPeriodStart } } },
                        { $sort: { date: -1 } },
                        { $limit: limit },
                        { $project: { _id: 0, id: { $toString: '$_id' }, userId: 1, desc: 1, cat: 1, date: 1, val: 1, type: 1 } }
                    ]
                }
            }
        ]);

        const { oldStats, newStats, oldBalance, newBalance, summary, transactions } = result[0];

        const old = oldStats[0] || { income: 0, expenses: 0 };
        const newData = newStats[0] || { income: 0, expenses: 0 };
        const oldBal = oldBalance[0] || { income: 0, expenses: 0 };
        const newBal = newBalance[0] || { income: 0, expenses: 0 };

        return {
            stats: {
                balance: {
                    old: oldBal.income - oldBal.expenses,
                    new: newBal.income - newBal.expenses
                },
                income: { old: old.income, new: newData.income },
                expenses: { old: old.expenses, new: newData.expenses }
            },
            transactions: transactions as Transaction[],
            summary: summary as SummaryItem[]
        };
    }

    async exportAsCsv(filter: TransactionFilter): Promise<Record<string, unknown>[]> {
        const query = this.buildFilterQuery(filter);
        const docs = await TransactionModel.find(query).sort({ date: -1 }).lean();

        return docs.map(t => ({
            data: t.date,
            tipo: t.type,
            valor: t.val,
            categoria: t.cat,
            descricao: t.desc
        }));
    }
}

export const transactionRepository = new TransactionRepository();
