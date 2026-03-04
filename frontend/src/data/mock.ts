import type { Stats, Transaction, Summary } from './types';

export type { SummaryItem, Summary, StatsItem, Stats, Transaction } from './types';

export const MockData = {
    stats: {
        balance: { old: 14120.0, new: 15280.0 },
        income: { old: 7480.0, new: 8400.0 },
        expenses: { old: 2220.0, new: 2150.0 },
    } as Stats,
  transactions: [
    { id: 't-0-0', desc: 'Pagamento de Serviço #1', cat: 'Software', date: '2026-03-04', val: 150.00, type: 'out' as const },
    { id: 't-0-1', desc: 'Freelance Projeto', cat: 'Consultoria', date: '2026-03-03', val: 2500.00, type: 'in' as const },
    { id: 't-0-2', desc: 'Supermercado', cat: 'Alimentação', date: '2026-03-02', val: -320.50, type: 'out' as const },
    { id: 't-0-3', desc: 'Uber', cat: 'Transporte', date: '2026-03-02', val: -45.90, type: 'out' as const },
    { id: 't-0-4', desc: 'Salário', cat: 'Renda', date: '2026-03-01', val: 8500.00, type: 'in' as const },
    { id: 't-0-5', desc: 'Netflix', cat: 'Lazer', date: '2026-02-28', val: -55.90, type: 'out' as const },
    { id: 't-0-6', desc: 'Farmácia', cat: 'Saúde', date: '2026-02-27', val: -89.90, type: 'out' as const },
    { id: 't-0-7', desc: 'Consultoria Tech', cat: 'Consultoria', date: '2026-02-26', val: 1200.00, type: 'in' as const },
  ] as Transaction[],
  summary: [
    { label: 'Alimentação', val: 45 },
    { label: 'Transporte', val: 20 },
    { label: 'Lazer', val: 15 },
    { label: 'Outros', val: 20 },
  ] as Summary
};

export const fetchMoreTransactions = (page: number): Transaction[] => {
    return Array(12).fill(null).map((_, i) => ({
        id: `t-${page}-${i}-${Math.random()}`,
        desc: `Pagamento de Serviço #${page * 12 + i}`,
        cat: i % 2 === 0 ? 'Software' : 'Consultoria',
        date: '2026-03-04',
        val: Math.random() > 0.4 ? (Math.random() * 1000 + 100) : -(Math.random() * 500 + 50),
        type: (Math.random() > 0.4 ? 'in' : 'out') as 'in' | 'out'
    }));
};
