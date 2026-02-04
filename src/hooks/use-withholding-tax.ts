import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface QstEmployee {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  status: 'ACTIVE' | 'INACTIVE';
  kanton: string;
  tarif: string;
  kirchensteuer: boolean;
  children?: number;
  maritalStatus?: string;
  permit?: string;
  validFrom: string;
  validTo?: string;
  monthlyDeductions?: number[];
  annualTotal?: number;
}

interface QstStatistics {
  totalEmployees: number;
  totalMonthlyTax: number;
  byKanton: { kanton: string; count: number; amount: number }[];
}

interface QstMonthlyReport {
  year: number;
  month: number;
  employees: QstEmployee[];
  totalTax: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'withholding-tax';

export function useQstEmployees(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  kanton?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.kanton) searchParams.set('kanton', params.kanton);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<QstEmployee>>(`/withholding-tax${query ? `?${query}` : ''}`);
    },
  });
}

export function useQstEmployee(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'employee', id],
    queryFn: () => api.get<QstEmployee>(`/withholding-tax/employee/${id}`),
    enabled: !!id,
  });
}

export function useQstStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<QstStatistics>('/withholding-tax/statistics'),
  });
}

export function useQstMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'report', year, month],
    queryFn: () => api.get<QstMonthlyReport>(`/withholding-tax/report/${year}/${month}`),
    enabled: !!year && !!month,
  });
}

export function useAssignQstData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      employeeId: string;
      kanton: string;
      tarif: string;
      kirchensteuer?: boolean;
      children?: number;
      maritalStatus?: string;
      permit?: string;
      validFrom: string;
    }) => api.post<QstEmployee>('/withholding-tax/employee', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateQstData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QstEmployee> }) =>
      api.put<QstEmployee>(`/withholding-tax/employee/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'employee', id] });
    },
  });
}

export function useCalculateQst() {
  return useMutation({
    mutationFn: (data: { employeeId: string; grossSalary: number; month: number; year: number }) =>
      api.post('/withholding-tax/calculate', data),
  });
}

export function useQstAnnualReconciliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { year: number; employeeIds?: string[] }) =>
      api.post('/withholding-tax/reconciliation', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
