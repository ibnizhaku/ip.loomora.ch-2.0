import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Account types
interface Account {
  id: string;
  number: string;
  name: string;
  description?: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId?: string;
  isActive: boolean;
  balance: number;
}

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  iban: string;
  bic?: string;
  accountNumber?: string;
  currency: string;
  balance: number;
  isDefault: boolean;
}

interface BalanceSheet {
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  totals: {
    assets: number;
    liabilities: number;
    equity: number;
    liabilitiesAndEquity: number;
  };
}

interface IncomeStatement {
  revenue: Account[];
  expenses: Account[];
  totals: {
    revenue: number;
    expenses: number;
    netIncome: number;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Fetch chart of accounts
export function useAccounts(params: { type?: string; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('type', params.type);
  if (params.search) searchParams.set('search', params.search);

  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => api.get<PaginatedResponse<Account>>(`/finance/accounts?${searchParams.toString()}`),
  });
}

// Fetch single account
export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => api.get<Account>(`/finance/accounts/${id}`),
    enabled: !!id,
  });
}

// Create account
export function useCreateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Account>) => api.post<Account>('/finance/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/finance/accounts'] });
    },
  });
}

// Update account
export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) => 
      api.put<Account>(`/finance/accounts/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', id] });
    },
  });
}

// Fetch bank accounts
export function useBankAccounts() {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => api.get<BankAccount[]>('/finance/bank-accounts'),
  });
}

// Fetch single bank account
export function useBankAccount(id: string) {
  return useQuery({
    queryKey: ['bank-accounts', id],
    queryFn: () => api.get<BankAccount>(`/finance/bank-accounts/${id}`),
    enabled: !!id,
  });
}

// Create bank account
export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<BankAccount>) => api.post<BankAccount>('/finance/bank-accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
}

// Update bank account
export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BankAccount> }) => 
      api.put<BankAccount>(`/finance/bank-accounts/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', id] });
    },
  });
}

// Fetch balance sheet
export function useBalanceSheet() {
  return useQuery({
    queryKey: ['finance', 'balance-sheet'],
    queryFn: () => api.get<BalanceSheet>('/finance/balance-sheet'),
  });
}

// Fetch income statement (P&L)
export function useIncomeStatement(params: { startDate?: string; endDate?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  return useQuery({
    queryKey: ['finance', 'income-statement', params],
    queryFn: () => api.get<IncomeStatement>(`/finance/income-statement?${searchParams.toString()}`),
  });
}

// Monthly summary (12 months income/expense)
interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export function useFinanceMonthlySummary(params?: { year?: number }) {
  return useQuery({
    queryKey: ['finance', 'monthly-summary', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.year) searchParams.set('year', String(params.year));
      const query = searchParams.toString();
      return api.get<MonthlySummary[]>(`/finance/monthly-summary${query ? `?${query}` : ''}`);
    },
  });
}
