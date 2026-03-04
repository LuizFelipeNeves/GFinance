export interface SummaryItem {
    label: string;
    val: number;
}

export type Summary = SummaryItem[];

export interface StatsItem {
    old: number;
    new: number;
}

export interface Stats {
    balance: StatsItem;
    income: StatsItem;
    expenses: StatsItem;
}

export interface Transaction {
    id: string;
    desc: string;
    cat: string;
    date: string;
    val: number;
    type: 'in' | 'out';
}
