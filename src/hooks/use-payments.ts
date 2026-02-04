import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Payment {
  id: string;
  number: string;
  type: 'INCOMING' | 'OUTGOING';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  method: 'BANK_TRANSFER' | 'CASH' | 'CREDIT_CARD' | 'QR_BILL' | 'OTHER';
  amount: number;
  currency: string;
  paymentDate: string;
  reference?: string;
  qrReference?: string;
  customerId?: string;
  customer?: { id: string; name: string };
  supplierId?: string;
  supplier?: { id: string; name: string };
  invoiceId?: string;
  purchaseInvoiceId?: string;
  bankAccountId?: string;
  notes?: string;
  createdAt: string;
}

interface PaymentStatistics {
  totalIncoming: number;
  totalOutgoing: number;
  pendingPayments: number;
  completedThisMonth: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'payments';

export function usePayments(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
  method?: string;
  customerId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.type) searchParams.set('type', params.type);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.method) searchParams.set('method', params.method);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.supplierId) searchParams.set('supplierId', params.supplierId);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Payment>>(`/payments${query ? `?${query}` : ''}`);
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Payment>(`/payments/${id}`),
    enabled: !!id,
  });
}

export function usePaymentStatistics(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const query = searchParams.toString();
      return api.get<PaymentStatistics>(`/payments/statistics${query ? `?${query}` : ''}`);
    },
  });
}

export function useFindByQrReference(qrReference: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'qr', qrReference],
    queryFn: () => api.get(`/payments/match-qr/${encodeURIComponent(qrReference)}`),
    enabled: !!qrReference,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Payment>) => api.post<Payment>('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) =>
      api.put<Payment>(`/payments/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useReconcilePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { invoiceId?: string; purchaseInvoiceId?: string; amount?: number } }) =>
      api.post(`/payments/${id}/reconcile`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
