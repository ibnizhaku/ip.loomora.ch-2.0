import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface DashboardStats {
  totalRevenue: number;
  openInvoices: number;
  activeProjects: number;
  customerCount: number;
  employeeCount: number;
  revenueChange: string;
  utilizationRate: number;
}

interface RecentActivityData {
  invoices: Array<{
    id: string;
    number: string;
    status: string;
    createdAt: string;
    customer?: { name: string };
  }>;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    updatedAt: string;
  }>;
  tasks: Array<{
    id: string;
    title?: string;
    name?: string;
    status: string;
    updatedAt: string;
  }>;
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
    queryFn: () => api.get<RecentActivityData>('/dashboard/activity'),
  });
}
