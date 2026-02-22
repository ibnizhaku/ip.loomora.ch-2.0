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
      queryClient.invalidateQueries({ queryKey: ["/customers/debtors"] });
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

// Customer stats hook (server-side calculation)
export function useCustomerStats() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<{ total: number; active: number; prospects: number; totalRevenue: number }>('/customers/stats'),
  });

  return {
    total: data?.total ?? 0,
    active: data?.active ?? 0,
    prospects: data?.prospects ?? 0,
    totalRevenue: data?.totalRevenue ?? 0,
    isLoading,
  };
}

// Customer contacts
export interface CustomerContact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
}

export function useCustomerContacts(customerId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, customerId, 'contacts'],
    queryFn: () => api.get<CustomerContact[]>(`/customers/${customerId}/contacts`),
    enabled: !!customerId,
  });
}

export function useCreateCustomerContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: Partial<CustomerContact> }) =>
      api.post<CustomerContact>(`/customers/${customerId}/contacts`, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, customerId, 'contacts'] });
    },
  });
}

export function useUpdateCustomerContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, contactId, data }: { customerId: string; contactId: string; data: Partial<CustomerContact> }) =>
      api.put<CustomerContact>(`/customers/${customerId}/contacts/${contactId}`, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, customerId, 'contacts'] });
    },
  });
}

export function useDeleteCustomerContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, contactId }: { customerId: string; contactId: string }) =>
      api.delete(`/customers/${customerId}/contacts/${contactId}`),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, customerId, 'contacts'] });
    },
  });
}
