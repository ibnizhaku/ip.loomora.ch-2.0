import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BudgetLine {
  accountId: string;
  accountCode?: string;
  accountName?: string;
  amount: number;
}

interface Budget {
  id: string;
  name: string;
  description?: string;
  year: number;
  period: 'YEARLY' | 'QUARTERLY' | 'MONTHLY';
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED';
  startDate: string;
  endDate: string;
  totalBudget: number;
  lines: BudgetLine[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'budgets';

export function useBudgets(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  year?: number;
  period?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.year) searchParams.set('year', String(params.year));
      if (params?.period) searchParams.set('period', params.period);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Budget>>(`/budgets${query ? `?${query}` : ''}`);
    },
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Budget>(`/budgets/${id}`),
    enabled: !!id,
  });
}

export function useBudgetComparison(id: string, includeDetails?: boolean) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'comparison', includeDetails],
    queryFn: () => api.get(`/budgets/${id}/comparison?includeDetails=${includeDetails || false}`),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Budget>) => api.post<Budget>('/budgets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      api.put<Budget>(`/budgets/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useApproveBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/budgets/${id}/approve`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useActivateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/budgets/${id}/activate`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
