import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CashRegister {
  id: string;
  name: string;
  currency: string;
  currentBalance: number;
  isActive: boolean;
}

interface CashTransaction {
  id: string;
  registerId: string;
  register?: CashRegister;
  type: 'IN' | 'OUT';
  amount: number;
  description: string;
  reference?: string;
  category?: string;
  transactionDate: string;
  balanceAfter: number;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface DailySummary {
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  closingBalance: number;
  transactionCount: number;
}

const QUERY_KEY = 'cash-book';

export function useCashRegisters() {
  return useQuery({
    queryKey: [QUERY_KEY, 'registers'],
    queryFn: () => api.get<CashRegister[]>('/cash-book/registers'),
  });
}

export function useCreateCashRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; currency?: string; initialBalance?: number }) =>
      api.post<CashRegister>('/cash-book/registers', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'registers'] }),
  });
}

export function useCashTransactions(params?: {
  page?: number;
  pageSize?: number;
  registerId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'transactions', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.registerId) searchParams.set('registerId', params.registerId);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<CashTransaction>>(`/cash-book/transactions${query ? `?${query}` : ''}`);
    },
  });
}

export function useCashTransaction(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'transactions', id],
    queryFn: () => api.get<CashTransaction>(`/cash-book/transactions/${id}`),
    enabled: !!id,
  });
}

export function useCreateCashTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registerId, data }: { registerId: string; data: Partial<CashTransaction> }) =>
      api.post<CashTransaction>(`/cash-book/registers/${registerId}/transactions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateCashTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CashTransaction> }) =>
      api.put<CashTransaction>(`/cash-book/transactions/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteCashTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cash-book/transactions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCashDailySummary(registerId: string, date: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'daily-summary', registerId, date],
    queryFn: () => api.get<DailySummary>(`/cash-book/registers/${registerId}/daily-summary?date=${date}`),
    enabled: !!registerId && !!date,
  });
}

export function usePerformCashClosing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registerId, data }: { registerId: string; data: { date: string; countedAmount: number; notes?: string } }) =>
      api.post(`/cash-book/registers/${registerId}/closing`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
