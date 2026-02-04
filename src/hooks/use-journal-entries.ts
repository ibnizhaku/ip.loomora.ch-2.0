import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface JournalLine {
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
  costCenterId?: string;
}

interface JournalEntry {
  id: string;
  number: string;
  entryDate: string;
  postingDate?: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED';
  description: string;
  reference?: string;
  sourceType?: string;
  sourceId?: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
  reversedById?: string;
  reversesId?: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'journal-entries';

export function useJournalEntries(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  costCenterId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.accountId) searchParams.set('accountId', params.accountId);
      if (params?.costCenterId) searchParams.set('costCenterId', params.costCenterId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<JournalEntry>>(`/journal-entries${query ? `?${query}` : ''}`);
    },
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<JournalEntry>(`/journal-entries/${id}`),
    enabled: !!id,
  });
}

export function useTrialBalance(params: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'trial-balance', params],
    queryFn: () => api.get(`/journal-entries/trial-balance?startDate=${params.startDate}&endDate=${params.endDate}`),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useAccountBalance(accountId: string, params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'account-balance', accountId, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const query = searchParams.toString();
      return api.get(`/journal-entries/account-balance/${accountId}${query ? `?${query}` : ''}`);
    },
    enabled: !!accountId,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<JournalEntry>) => api.post<JournalEntry>('/journal-entries', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JournalEntry> }) =>
      api.put<JournalEntry>(`/journal-entries/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/journal-entries/${id}/post`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useReverseJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reversalDate: string; reason?: string } }) =>
      api.post(`/journal-entries/${id}/reverse`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/journal-entries/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
