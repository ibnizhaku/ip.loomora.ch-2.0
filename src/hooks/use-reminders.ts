import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Reminder {
  id: string;
  number: string;
  invoiceId: string;
  invoice?: { id: string; number: string; total: number; dueDate: string };
  customerId: string;
  customer?: { id: string; name: string };
  status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
  level: number;
  fee: number;
  interestAmount?: number;
  totalAmount: number;
  dueDate: string;
  sentDate?: string;
  notes?: string;
  createdAt: string;
}

interface ReminderStatistics {
  totalReminders: number;
  pendingReminders: number;
  sentReminders: number;
  totalOutstanding: number;
  byLevel: { level: number; count: number; amount: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'reminders';

export function useReminders(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  level?: number;
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
      if (params?.level) searchParams.set('level', String(params.level));
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Reminder>>(`/reminders${query ? `?${query}` : ''}`);
    },
  });
}

export function useReminder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Reminder>(`/reminders/${id}`),
    enabled: !!id,
  });
}

export function useReminderStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<ReminderStatistics>('/reminders/statistics'),
  });
}

export function useOverdueInvoices() {
  return useQuery({
    queryKey: [QUERY_KEY, 'overdue-invoices'],
    queryFn: () => api.get('/reminders/overdue-invoices'),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { invoiceId: string; level?: number; fee?: number; dueDate?: string; notes?: string }) =>
      api.post<Reminder>('/reminders', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCreateBatchReminders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { invoiceIds: string[]; level?: number; fee?: number }) =>
      api.post<Reminder[]>('/reminders/batch', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reminder> }) =>
      api.put<Reminder>(`/reminders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useSendReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { method: 'EMAIL' | 'PDF' | 'PRINT'; recipientEmail?: string } }) =>
      api.post(`/reminders/${id}/send`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reminders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; paymentDate?: string; notes?: string } }) =>
      api.post<Reminder>(`/reminders/${id}/payment`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
