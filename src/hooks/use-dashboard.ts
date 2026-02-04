import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface DashboardStats {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  openInvoices: {
    count: number;
    amount: number;
  };
  overdueInvoices: {
    count: number;
    amount: number;
  };
  projects: {
    active: number;
    completed: number;
  };
  orders: {
    pending: number;
    completed: number;
  };
  cashPosition: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  entityType: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

const QUERY_KEY = 'dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<DashboardStats>('/dashboard/stats'),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: [QUERY_KEY, 'activity'],
    queryFn: () => api.get<RecentActivity[]>('/dashboard/activity'),
  });
}
