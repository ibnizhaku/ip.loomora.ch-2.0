import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  managerId?: string;
  manager?: Employee;
  hireDate: string;
  terminationDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  salary?: number;
  workHoursPerWeek?: number;
  vacationDays?: number;
  address?: string;
  socialSecurityNumber?: string;
  bankAccount?: string;
  createdAt: string;
}

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  newThisMonth: number;
  departmentBreakdown: { department: string; count: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'employees';

export function useEmployees(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.department) searchParams.set('department', params.department);
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Employee>>(`/employees${query ? `?${query}` : ''}`);
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Employee>(`/employees/${id}`),
    enabled: !!id,
  });
}

export function useEmployeeStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<EmployeeStats>('/employees/stats'),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: [QUERY_KEY, 'departments'],
    queryFn: () => api.get<string[]>('/employees/departments'),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Employee>) => api.post<Employee>('/employees', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      api.put<Employee>(`/employees/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
