import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface PayrollRun {
  id: string;
  period: string;
  periodStart?: string;
  periodEnd?: string;
  status: string;
  employees?: number;
  grossTotal?: number;
  netTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payslip {
  id: string;
  payrollRunId?: string;
  employeeId: string;
  employee?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    ahvNumber?: string;
    birthDate?: string;
    entryDate?: string;
    department?: string;
    position?: string;
    salaryClass?: string;
    workload?: number;
  };
  employer?: {
    name: string;
    address?: string;
    uid?: string;
  };
  period: string;
  periodStart?: string;
  periodEnd?: string;
  paymentDate?: string;
  status: string;
  workingTime?: {
    targetHours: number;
    actualHours: number;
    overtime: number;
    holidays: number;
    sickDays: number;
    vacationDays: number;
  };
  earnings?: { description: string; amount: number; type?: string }[];
  deductions?: { description: string; amount: number; rate?: number | null; type?: string }[];
  employerContributions?: { description: string; amount: number }[];
  expenses?: { description: string; amount: number }[];
  grossSalary?: number;
  netSalary?: number;
  bankAccount?: { iban: string; bank?: string };
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const PAYROLL_KEY = 'payroll';
const PAYSLIP_KEY = 'payslips';

export function usePayrollRuns(params?: { page?: number; pageSize?: number; status?: string }) {
  return useQuery({
    queryKey: [PAYROLL_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<PayrollRun>>(`/payroll${query ? `?${query}` : ''}`);
    },
  });
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: [PAYROLL_KEY, id],
    queryFn: () => api.get<PayrollRun>(`/payroll/${id}`),
    enabled: !!id,
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PayrollRun>) => api.post<PayrollRun>('/payroll', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PAYROLL_KEY] }),
  });
}

export function useCompletePayrollRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<PayrollRun>(`/payroll/${id}/complete`, {}),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [PAYROLL_KEY] });
      queryClient.invalidateQueries({ queryKey: [PAYROLL_KEY, id] });
    },
  });
}

export function usePayslip(id: string) {
  return useQuery({
    queryKey: [PAYSLIP_KEY, id],
    queryFn: () => api.get<Payslip>(`/payslips/${id}`),
    enabled: !!id,
  });
}

export function usePayslips(params?: { employeeId?: string; period?: string }) {
  return useQuery({
    queryKey: [PAYSLIP_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      if (params?.period) searchParams.set('period', params.period);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Payslip>>(`/payslips${query ? `?${query}` : ''}`);
    },
  });
}

export function useSendPayslip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/payslips/${id}/send`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PAYSLIP_KEY] }),
  });
}

export function usePayrollStats() {
  return useQuery({
    queryKey: [PAYROLL_KEY, 'stats'],
    queryFn: () => api.get<{
      totalGross: number;
      totalNet: number;
      totalAHV: number;
      totalBVG: number;
      employeeCount: number;
    }>('/payroll/stats'),
  });
}
