import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface VatReturnLine {
  code: string;
  description: string;
  amount: number;
  taxAmount?: number;
}

interface VatReturn {
  id: string;
  period: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YEARLY';
  year: number;
  status: 'DRAFT' | 'CALCULATED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  startDate: string;
  endDate: string;
  totalRevenue: number;
  taxableRevenue: number;
  inputVat: number;
  outputVat: number;
  netVat: number;
  submissionDate?: string;
  submissionReference?: string;
  lines: VatReturnLine[];
  notes?: string;
  createdAt: string;
}

interface VatSummary {
  year: number;
  totalOutputVat: number;
  totalInputVat: number;
  netVat: number;
  quarters: { period: string; outputVat: number; inputVat: number; netVat: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'vat-returns';

export function useVatReturns(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  year?: number;
  period?: string;
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
      const query = searchParams.toString();
      return api.get<PaginatedResponse<VatReturn>>(`/vat-returns${query ? `?${query}` : ''}`);
    },
  });
}

export function useVatReturn(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<VatReturn>(`/vat-returns/${id}`),
    enabled: !!id,
  });
}

export function useVatSummary(year: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'summary', year],
    queryFn: () => api.get<VatSummary>(`/vat-returns/summary/${year}`),
    enabled: !!year,
  });
}

export function useExportVatXml(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'export-xml'],
    queryFn: () => api.get(`/vat-returns/${id}/export-xml`),
    enabled: false, // Only fetch manually
  });
}

export function useCreateVatReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { period: string; year: number; startDate: string; endDate: string }) =>
      api.post<VatReturn>('/vat-returns', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCalculateVatReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/vat-returns/${id}/calculate`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useSubmitVatReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { method?: string; notes?: string } }) =>
      api.post(`/vat-returns/${id}/submit`, data || {}),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useUpdateVatReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VatReturn> }) =>
      api.put<VatReturn>(`/vat-returns/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteVatReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vat-returns/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
