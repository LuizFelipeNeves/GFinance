export interface Transaction {
    id: string;
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
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

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export interface MockDataType {
    stats: Stats;
    transactions: Transaction[];
    summary: SummaryItem[];
}

export const mockUsers: User[] = [
    { id: '1', name: 'Luiz Felipe', email: 'androidfelipe23@gmail.com', password: 'androidfelipe23@gmail.com' }
];

export const mockData: MockDataType = {
    stats: {
        balance: { old: 14120.0, new: 15280.0 },
        income: { old: 7480.0, new: 8400.0 },
        expenses: { old: 2220.0, new: 2150.0 },
    },
    transactions: [
        { id: 't-0-0', desc: 'Pagamento de Serviço #1', cat: 'Software', date: '04/03/2026', val: 150.00, type: 'out' },
        { id: 't-0-1', desc: 'Freelance Projeto', cat: 'Consultoria', date: '03/03/2026', val: 2500.00, type: 'in' },
        { id: 't-0-2', desc: 'Supermercado', cat: 'Alimentação', date: '02/03/2026', val: -320.50, type: 'out' },
        { id: 't-0-3', desc: 'Uber', cat: 'Transporte', date: '02/03/2026', val: -45.90, type: 'out' },
        { id: 't-0-4', desc: 'Salário', cat: 'Renda', date: '01/03/2026', val: 8500.00, type: 'in' },
        { id: 't-0-5', desc: 'Netflix', cat: 'Lazer', date: '28/02/2026', val: -55.90, type: 'out' },
        { id: 't-0-6', desc: 'Farmácia', cat: 'Saúde', date: '27/02/2026', val: -89.90, type: 'out' },
        { id: 't-0-7', desc: 'Consultoria Tech', cat: 'Consultoria', date: '26/02/2026', val: 1200.00, type: 'in' },
    ],
    summary: [
        { label: 'Alimentação', val: 45 },
        { label: 'Transporte', val: 20 },
        { label: 'Lazer', val: 15 },
        { label: 'Outros', val: 20 },
    ],
};

export const fetchMoreTransactions = (page: number): Transaction[] => {
    return Array(12).fill(null).map((_, i) => ({
        id: `t-${page}-${i}-${Math.random()}`,
        desc: `Pagamento de Serviço #${page * 12 + i}`,
        cat: i % 2 === 0 ? 'Software' : 'Consultoria',
        date: '04/03/2026',
        val: Math.random() > 0.4 ? (Math.random() * 1000 + 100) : -(Math.random() * 500 + 50),
        type: Math.random() > 0.4 ? 'in' : 'out'
    }));
};

export interface ImportJob {
    id: string;
    rows: Record<string, unknown>[];
    status: 'processing' | 'complete';
    progress: number;
    total: number;
    imported?: number;
}

export const importJobs: Record<string, ImportJob> = {};
