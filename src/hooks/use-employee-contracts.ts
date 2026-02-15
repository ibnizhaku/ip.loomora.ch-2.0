import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface EmployeeContract {
  id: string;
  employeeId: string;
  employeeName?: string;
  employee?: { id: string; firstName: string; lastName: string; department?: string; position?: string };
  contractType: string;
  gavClass?: string;
  startDate: string;
  endDate?: string;
  probationEnd?: string;
  workload: number;
  weeklyHours: number;
  baseSalary: number;
  status: string;
  department?: string;
  noticePeriod?: string;
  vacationDays?: number;
  position?: string;
  workLocation?: string;
  gav?: string;
  salaryClassDescription?: string;
  annualHours?: number;
  hourlyRate?: number;
  thirteenthMonth?: boolean;
  publicHolidays?: number;
  ahvNumber?: string;
  supervisor?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  gavClass?: string;
  employeeId?: string;
}

const QUERY_KEY = 'employee-contracts';

export function useEmployeeContracts(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.gavClass) searchParams.set('gavClass', params.gavClass);
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<EmployeeContract>>(`/employee-contracts${query ? `?${query}` : ''}`);
    },
  });
}

export function useEmployeeContract(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<EmployeeContract>(`/employee-contracts/${id}`),
    enabled: !!id,
  });
}

export function useEmployeeContractStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<{
      total: number;
      active: number;
      expiring: number;
      expired: number;
      totalSalary: number;
    }>('/employee-contracts/stats'),
  });
}

export function useCreateEmployeeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeContract>) => api.post<EmployeeContract>('/employee-contracts', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateEmployeeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmployeeContract> }) =>
      api.put<EmployeeContract>(`/employee-contracts/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteEmployeeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employee-contracts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRenewEmployeeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<EmployeeContract>(`/employee-contracts/${id}/renew`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useTerminateEmployeeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { terminationDate?: string; reason?: string } }) =>
      api.post<EmployeeContract>(`/employee-contracts/${id}/terminate`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}
