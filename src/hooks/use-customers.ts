import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Customer, CustomerCreateInput, CustomerUpdateInput, PaginatedResponse, ListParams } from '@/types/api';

const QUERY_KEY = 'customers';

// Build query string from params
const buildQueryString = (params?: ListParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  return searchParams.toString();
};

// Fetch all customers with pagination
export function useCustomers(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedResponse<Customer>> => {
      const queryString = buildQueryString(params);
      return api.get<PaginatedResponse<Customer>>(`/customers${queryString ? `?${queryString}` : ''}`);
    },
  });
}

// Fetch single customer by ID
export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<Customer | null> => {
      if (!id) return null;
      return api.get<Customer>(`/customers/${id}`);
    },
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CustomerCreateInput): Promise<Customer> => {
      return api.post<Customer>('/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerUpdateInput }): Promise<Customer> => {
      return api.put<Customer>(`/customers/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Customer stats hook
export function useCustomerStats() {
  const { data } = useCustomers({ pageSize: 1000 });
  
  const customers = data?.data || [];
  const total = customers.length;
  const active = customers.filter(c => c.isActive).length;
  const prospects = customers.filter(c => !c.totalRevenue || c.totalRevenue === 0).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
  
  return { total, active, prospects, totalRevenue };
}
