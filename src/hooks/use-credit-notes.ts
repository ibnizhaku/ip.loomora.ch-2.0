import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CreditNoteItem {
  productId?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  vatRate?: number;
}

interface CreditNote {
  id: string;
  number: string;
  customerId: string;
  customer?: { id: string; name: string };
  invoiceId?: string;
  invoice?: { id: string; number: string };
  status: 'DRAFT' | 'ISSUED' | 'APPLIED' | 'CANCELLED';
  issueDate: string;
  reason?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  items: CreditNoteItem[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'credit-notes';

export function useCreditNotes(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
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
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<CreditNote>>(`/credit-notes${query ? `?${query}` : ''}`);
    },
  });
}

export function useCreditNote(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<CreditNote>(`/credit-notes/${id}`),
    enabled: !!id,
  });
}

export function useCreateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreditNote>) => api.post<CreditNote>('/credit-notes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCreateCreditNoteFromInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      invoiceId,
      reason,
      reasonText,
      items,
    }: {
      invoiceId: string;
      reason: string;
      reasonText?: string;
      items?: Array<{ invoiceItemId: string; quantity: number }>;
    }) =>
      api.post<CreditNote>(`/credit-notes/from-invoice/${invoiceId}`, { reason, reasonText, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreditNote> }) =>
      api.put<CreditNote>(`/credit-notes/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteCreditNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/credit-notes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
