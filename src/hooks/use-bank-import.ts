import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface BankTransaction {
  id: string;
  bankAccountId: string;
  bankAccount?: { id: string; name: string; iban: string };
  transactionId: string;
  bookingDate: string;
  valueDate: string;
  amount: number;
  currency: string;
  creditorName?: string;
  creditorIban?: string;
  debtorName?: string;
  debtorIban?: string;
  reference?: string;
  remittanceInfo?: string;
  qrReference?: string;
  status: string;
  matchedInvoiceId?: string;
  matchedInvoice?: { id: string; number: string; totalGross: number };
  matchedPaymentId?: string;
  matchedPayment?: { id: string; reference: string };
  importedAt: string;
  reconciledAt?: string;
  reconciledById?: string;
  reconciledBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface BankImportResult {
  imported: number;
  duplicates: number;
  errors: number;
  transactions: BankTransaction[];
}

export interface ReconciliationSuggestion {
  transaction: BankTransaction;
  suggestions: Array<{
    type: 'invoice' | 'payment';
    id: string;
    number: string;
    amount: number;
    confidence: number;
  }>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  page?: number;
  pageSize?: number;
  bankAccountId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Bank Transactions
export function useBankTransactions(params?: ListParams) {
  return useQuery({
    queryKey: ['bank-transactions', params],
    queryFn: async (): Promise<PaginatedResponse<BankTransaction>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.bankAccountId) searchParams.set('bankAccountId', params.bankAccountId);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<BankTransaction>>(`/bank-import/transactions${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useBankTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['bank-transactions', id],
    queryFn: async (): Promise<BankTransaction | null> => {
      if (!id) return null;
      return api.get<BankTransaction>(`/bank-import/transactions/${id}`);
    },
    enabled: !!id,
  });
}

// Import camt.054
export function useImportCamt054() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bankAccountId: string; fileContent: string }): Promise<BankImportResult> => {
      return api.post<BankImportResult>('/bank-import/camt054', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bank-import', 'stats'] });
    },
  });
}

// Reconciliation
export function useReconciliationSuggestions(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['bank-transactions', transactionId, 'suggestions'],
    queryFn: async (): Promise<ReconciliationSuggestion | null> => {
      if (!transactionId) return null;
      return api.get<ReconciliationSuggestion>(`/bank-import/transactions/${transactionId}/suggestions`);
    },
    enabled: !!transactionId,
  });
}

export function useReconcileTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ transactionId, data }: { transactionId: string; data: { invoiceId?: string; paymentId?: string; createPayment?: boolean } }): Promise<BankTransaction> => {
      return api.post<BankTransaction>(`/bank-import/transactions/${transactionId}/reconcile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useAutoReconcile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bankAccountId?: string): Promise<{ reconciled: number; failed: number }> => {
      const params = bankAccountId ? `?bankAccountId=${bankAccountId}` : '';
      return api.post<{ reconciled: number; failed: number }>(`/bank-import/auto-reconcile${params}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useIgnoreTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string): Promise<BankTransaction> => {
      return api.put<BankTransaction>(`/bank-import/transactions/${transactionId}/ignore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
    },
  });
}

// Bank Import Statistics
export function useBankImportStats() {
  return useQuery({
    queryKey: ['bank-import', 'stats'],
    queryFn: async () => {
      return api.get<{
        pendingTransactions: number;
        reconciledToday: number;
        totalImported: number;
        lastImportDate?: string;
      }>('/bank-import/stats');
    },
  });
}
