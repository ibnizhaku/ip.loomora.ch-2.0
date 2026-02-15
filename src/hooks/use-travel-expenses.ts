import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface TravelExpense {
  id: string;
  number?: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string; name?: string; department?: string };
  purpose: string;
  destination?: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  items?: TravelExpenseItem[];
  documents?: { id: string; name: string; url?: string }[];
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  approvalHistory?: { action: string; date: string; user: string; note?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TravelExpenseItem {
  id?: string;
  category: string;
  description: string;
  date?: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  hasReceipt?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  employeeId?: string;
}

const QUERY_KEY = 'travel-expenses';

export function useTravelExpenses(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<TravelExpense>>(`/travel-expenses${query ? `?${query}` : ''}`);
    },
  });
}

export function useTravelExpense(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<TravelExpense>(`/travel-expenses/${id}`),
    enabled: !!id,
  });
}

export function useCreateTravelExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TravelExpense>) => api.post<TravelExpense>('/travel-expenses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateTravelExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TravelExpense> }) =>
      api.put<TravelExpense>(`/travel-expenses/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteTravelExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/travel-expenses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useApproveTravelExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post<TravelExpense>(`/travel-expenses/${id}/approve`, { note }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useRejectTravelExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<TravelExpense>(`/travel-expenses/${id}/reject`, { reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useMarkTravelExpensePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<TravelExpense>(`/travel-expenses/${id}/mark-paid`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useTravelExpenseStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<{
      totalAmount: number;
      pendingCount: number;
      approvedCount: number;
      totalCount: number;
    }>('/travel-expenses/stats'),
  });
}
