import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BomItem {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  type: 'MATERIAL' | 'LABOR' | 'SUBCONTRACT' | 'OTHER';
}

interface Bom {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  project?: { id: string; name: string };
  isTemplate: boolean;
  category?: string;
  subtotal: number;
  laborCost: number;
  materialCost: number;
  total: number;
  items: BomItem[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'bom';

export function useBoms(params?: {
  page?: number;
  pageSize?: number;
  projectId?: string;
  isTemplate?: boolean;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.isTemplate !== undefined) searchParams.set('isTemplate', String(params.isTemplate));
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Bom>>(`/bom${query ? `?${query}` : ''}`);
    },
  });
}

export function useBom(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Bom>(`/bom/${id}`),
    enabled: !!id,
  });
}

export function useBomTemplates() {
  return useQuery({
    queryKey: [QUERY_KEY, 'templates'],
    queryFn: () => api.get<Bom[]>('/bom/templates'),
  });
}

export function useCreateBom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Bom>) => api.post<Bom>('/bom', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDuplicateBom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.post<Bom>(`/bom/${id}/duplicate?name=${encodeURIComponent(name)}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateBom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bom> }) =>
      api.put<Bom>(`/bom/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteBom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bom/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
