type SummaryItem = {
    label: string;
    val: number;
};

export type Summary = SummaryItem[];

export type Stats = {
    balance: { old: string; new: string; trend: string };
    income: { old: string; new: string; trend: string };
    expenses: { old: string; new: string; trend: string };
};

export type Transaction = {
    desc: string;
    cat: string;
    date: string;
    val: string;
    type: 'in' | 'out';
};

export const MockData = {
    stats: {
        balance: { old: 'R$ 14.120,00', new: 'R$ 15.280,00', trend: '+8.2%' },
        income: { old: 'R$ 7.480,00', new: 'R$ 8.400,00', trend: '+12.5%' },
        expenses: { old: 'R$ 2.220,00', new: 'R$ 2.150,00', trend: '-3.1%' },
    } as Stats,
  transactions: Array(8).fill({
    desc: 'Transação Exemplo',
    cat: 'Categoria',
    date: '04 Mar, 2026',
    val: 'R$ 150,00',
    type: 'out'
  }) as Transaction[],
  summary: [
    { label: 'Alimentação', val: 45 },
    { label: 'Transporte', val: 20 },
    { label: 'Lazer', val: 15 },
    { label: 'Outros', val: 20 },
  ] as Summary
};