import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: CostCenter;
  children?: CostCenter[];
  managerId?: string;
  isActive: boolean;
  budget?: number;
  actualCost?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'cost-centers';

export function useCostCenters(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      const query = searchParams.toString();
      return api.get<PaginatedResponse<CostCenter>>(`/cost-centers${query ? `?${query}` : ''}`);
    },
  });
}

export function useCostCenter(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<CostCenter>(`/cost-centers/${id}`),
    enabled: !!id,
  });
}

export function useCostCenterHierarchy() {
  return useQuery({
    queryKey: [QUERY_KEY, 'hierarchy'],
    queryFn: () => api.get<CostCenter[]>('/cost-centers/hierarchy'),
  });
}

export function useCostCenterReport(params: { startDate: string; endDate: string; costCenterIds?: string[] }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'report', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('startDate', params.startDate);
      searchParams.set('endDate', params.endDate);
      if (params.costCenterIds?.length) searchParams.set('costCenterIds', params.costCenterIds.join(','));
      return api.get(`/cost-centers/report?${searchParams.toString()}`);
    },
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CostCenter>) => api.post<CostCenter>('/cost-centers', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CostCenter> }) =>
      api.put<CostCenter>(`/cost-centers/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cost-centers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
