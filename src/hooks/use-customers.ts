import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { 
  Customer, 
  CustomerCreateInput, 
  CustomerUpdateInput, 
  PaginatedResponse,
  ListParams 
} from '@/types/api';

const QUERY_KEY = 'customers';

// Fetch all customers with pagination
export function useCustomers(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Customer>>(`/customers${query ? `?${query}` : ''}`);
    },
  });
}

// Fetch single customer by ID
export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CustomerCreateInput) => 
      api.post<Customer>('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdateInput }) =>
      api.put<Customer>(`/customers/${id}`, data),
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
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
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
