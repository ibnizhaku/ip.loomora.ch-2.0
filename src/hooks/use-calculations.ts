import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CalculationItem {
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  type: 'MATERIAL' | 'LABOR' | 'MACHINE' | 'SUBCONTRACT' | 'OTHER';
  margin?: number;
}

interface Calculation {
  id: string;
  number: string;
  name: string;
  customerId?: string;
  customer?: { id: string; name: string };
  projectId?: string;
  project?: { id: string; name: string };
  status: 'DRAFT' | 'FINALIZED' | 'CONVERTED';
  materialCost: number;
  laborCost: number;
  machineCost: number;
  subtotal: number;
  margin: number;
  total: number;
  items: CalculationItem[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'calculations';

export function useCalculations(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  projectId?: string;
  customerId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Calculation>>(`/calculations${query ? `?${query}` : ''}`);
    },
  });
}

export function useCalculation(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Calculation>(`/calculations/${id}`),
    enabled: !!id,
  });
}

export function useCreateCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Calculation>) => api.post<Calculation>('/calculations', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Calculation> }) =>
      api.put<Calculation>(`/calculations/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useTransferCalculationToQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/calculations/${id}/transfer-to-quote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useDeleteCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/calculations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
