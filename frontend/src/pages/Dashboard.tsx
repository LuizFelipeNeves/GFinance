import { Wallet, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard, StatCardSkeleton, TransactionList, TransactionListSkeleton, SummaryChart, SummaryChartSkeleton } from '../components/features/dashboard';

export const Dashboard = () => {
    const { data, isLoading, error } = useDashboard();
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
                <div className={`text-lg sm:text-xl font-bold text-slate-900 tracking-tight transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Visão Geral
                </div>
                <div className={`text-xs text-slate-400 font-medium transition-opacity duration-500 delay-100 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    Relatório de desempenho financeiro atualizado.
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Saldo em Conta" stats={stats?.balance} icon={Wallet} />
                        <StatCard title="Receitas" stats={stats?.income} icon={TrendingUp} variant="success" />
                        <StatCard title="Despesas" stats={stats?.expenses} icon={TrendingDown} variant="danger" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    {isLoading ? <TransactionListSkeleton /> : <TransactionList transactions={transactions} />}
                </div>
                <div className="lg:col-span-1">
                    {isLoading ? <SummaryChartSkeleton /> : <SummaryChart summary={summary} />}
                </div>
            </div>
        </div>
    );
}