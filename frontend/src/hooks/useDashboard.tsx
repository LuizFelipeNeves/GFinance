import { useQuery } from '@tanstack/react-query';
import { api, type DashboardData } from '@/services/api';

const DASHBOARD_KEY = ['dashboard'];

export const useDashboard = () => {
    const dashboardQuery = useQuery<DashboardData>({
        queryKey: DASHBOARD_KEY,
        queryFn: () => api.dashboard.get(),
    });

    return {
        data: dashboardQuery.data ?? null,
        isLoading: dashboardQuery.isLoading,
        error: dashboardQuery.error,
        refetch: dashboardQuery.refetch,
    };
};
