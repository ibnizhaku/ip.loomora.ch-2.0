import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { 
  Supplier, 
  SupplierCreateInput, 
  SupplierUpdateInput, 
  PaginatedResponse,
  ListParams 
} from '@/types/api';

const QUERY_KEY = 'suppliers';

// Fetch all suppliers with pagination
export function useSuppliers(params?: ListParams) {
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
      return api.get<PaginatedResponse<Supplier>>(`/suppliers${query ? `?${query}` : ''}`);
    },
  });
}

// Fetch single supplier by ID
export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Supplier>(`/suppliers/${id}`),
    enabled: !!id,
  });
}

// Create supplier
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SupplierCreateInput) => 
      api.post<Supplier>('/suppliers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update supplier
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdateInput }) =>
      api.put<Supplier>(`/suppliers/${id}`, data),
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
    mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Supplier stats hook
export function useSupplierStats() {
  const { data } = useSuppliers({ pageSize: 1000 });
  
  const suppliers = data?.data || [];
  const total = suppliers.length;
  const active = suppliers.filter(s => s.isActive).length;
  const newSuppliers = suppliers.filter(s => {
    const created = new Date(s.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return created > thirtyDaysAgo;
  }).length;
  const totalValue = suppliers.reduce((sum, s) => sum + (s.totalValue || 0), 0);
  const avgRating = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length 
    : 0;
  
  return { total, active, newSuppliers, totalValue, avgRating };
}
