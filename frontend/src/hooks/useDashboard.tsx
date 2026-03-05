import { useQuery } from '@tanstack/react-query';
import { api, type DashboardData } from '@/services/api';

export const useDashboard = (period: string = 'monthly') => {
    const dashboardQuery = useQuery<DashboardData>({
        queryKey: ['dashboard', period],
        queryFn: () => api.dashboard.get(period),
    });

    return {
        data: dashboardQuery.data ?? null,
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        refetch: dashboardQuery.refetch,
    };
};
