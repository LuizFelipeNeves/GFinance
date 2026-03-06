import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
    it('renders title correctly', () => {
        render(
            <StatCard
                title="Receitas"
                stats={{ old: 1000, new: 1500 }}
                icon={TrendingUp}
            />
        );

        expect(screen.getByText('Receitas')).toBeInTheDocument();
    });

    it('renders formatted value', () => {
        render(
            <StatCard
                title="Receitas"
                stats={{ old: 1000, new: 1500 }}
                icon={TrendingUp}
            />
        );

        expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
    });

    it('renders zero value correctly', () => {
        render(
            <StatCard
                title="Saldo"
                stats={{ old: 0, new: 0 }}
                icon={TrendingUp}
            />
        );

        expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
    });

    it('renders trend percentage', () => {
        render(
            <StatCard
                title="Receitas"
                stats={{ old: 1000, new: 1500 }}
                icon={TrendingUp}
            />
        );

        expect(screen.getByText('+50%')).toBeInTheDocument();
    });

    it('renders negative trend correctly', () => {
        render(
            <StatCard
                title="Despesas"
                stats={{ old: 1000, new: 500 }}
                icon={TrendingUp}
            />
        );

        expect(screen.getByText('-50%')).toBeInTheDocument();
    });

    it('renders variant classes', () => {
        const { container } = render(
            <StatCard
                title="Receitas"
                stats={{ old: 1000, new: 1500 }}
                icon={TrendingUp}
                variant="success"
            />
        );

        expect(container.querySelector('.bg-emerald-50')).toBeInTheDocument();
    });
});
