import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Supplier, SupplierCreateInput, SupplierUpdateInput, PaginatedResponse, ListParams } from '@/types/api';

const QUERY_KEY = 'suppliers';

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

// Fetch all suppliers with pagination
export function useSuppliers(params?: ListParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async (): Promise<PaginatedResponse<Supplier>> => {
      const queryString = buildQueryString(params);
      return api.get<PaginatedResponse<Supplier>>(`/suppliers${queryString ? `?${queryString}` : ''}`);
    },
  });
}

// Fetch single supplier by ID
export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<Supplier | null> => {
      if (!id) return null;
      return api.get<Supplier>(`/suppliers/${id}`);
    },
    enabled: !!id,
  });
}

// Create supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SupplierCreateInput): Promise<Supplier> => {
      return api.post<Supplier>('/suppliers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["/suppliers/creditors"] });
    },
  });
}

// Update supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SupplierUpdateInput }): Promise<Supplier> => {
      return api.put<Supplier>(`/suppliers/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete supplier
export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Supplier stats hook (server-side calculation)
export function useSupplierStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', 'stats'],
    queryFn: () => api.get<{ total: number; active: number; newSuppliers: number; totalValue: number; avgRating: number }>('/suppliers/stats'),
  });

  return {
    total: data?.total ?? 0,
    active: data?.active ?? 0,
    newSuppliers: data?.newSuppliers ?? 0,
    totalValue: data?.totalValue ?? 0,
    avgRating: data?.avgRating ?? 0,
    isLoading,
  };
}
