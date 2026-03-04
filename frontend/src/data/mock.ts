type SummaryItem = {
    label: string;
    val: number;
};

export type Summary = SummaryItem[];

export type StatsItem = {
    old: number;
    new: number;
};

export type Stats = {
    balance: StatsItem;
    income: StatsItem;
    expenses: StatsItem;
};

export type Transaction = {
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
};

export const MockData = {
    stats: {
        balance: { old: 14120.0, new: 15280.0 },
        income: { old: 7480.0, new: 8400.0 },
        expenses: { old: 2220.0, new: 2150.0 },
    } as Stats,
  transactions: Array(8).fill({
    desc: 'Transação Exemplo',
    cat: 'Categoria',
    date: '04 Mar, 2026',
    val: 150.00,
    type: 'out'
  }) as Transaction[],
  summary: [
    { label: 'Alimentação', val: 45 },
    { label: 'Transporte', val: 20 },
    { label: 'Lazer', val: 15 },
    { label: 'Outros', val: 20 },
  ] as Summary
};