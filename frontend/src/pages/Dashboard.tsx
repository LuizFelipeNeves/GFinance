import { Wallet, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { StatCard } from '../components/features/dashboard/StatCard';
import { TransactionList } from '../components/features/dashboard/TransactionList';
import { SummaryChart } from '../components/features/dashboard/SummaryChart';
import { MockData } from '../data/mock';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const useDashboard = () => {
    return { data: MockData, isLoading: false, error: 'Esta é uma mensagem de erro de exemplo para demonstrar o toast.' };
}

export const Dashboard = () => {
    const { data, error } = useDashboard();
    const { stats, transactions, summary } = data || {};
    const toastShown = useRef(false);

    useEffect(() => {
        if (error && !toastShown.current) {
            toastShown.current = true;
            toast.error('Erro ao carregar dados do dashboard. Por favor, tente novamente mais tarde.', {
                description: 'Não foi possível obter as informações financeiras.',
                icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
            });
        }
    }, [error]);

    return (
        <div className="flex flex-col max-w-[1400px] mx-auto gap-4 sm:gap-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
                <p className="text-xs text-slate-400 font-medium">Relatório de desempenho financeiro atualizado.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                <StatCard title="Saldo em Conta" value={stats.balance.new || '0'} trend={stats.balance.trend || '0%'} icon={Wallet} />
                <StatCard title="Receitas" value={stats.income.new || '0'} trend={stats.income.trend || '0%'} icon={TrendingUp} variant="success" />
                <StatCard title="Despesas" value={stats.expenses.new || '0'} trend={stats.expenses.trend || '0%'} icon={TrendingDown} variant="danger" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <TransactionList transactions={transactions} />
                </div>
                <div className="lg:col-span-1">
                    <SummaryChart summary={summary} />
                </div>
            </div>
        </div>
    );
}