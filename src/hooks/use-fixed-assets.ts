import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface FixedAsset {
  id: string;
  assetNumber: string;
  name: string;
  description?: string;
  category: string;
  status: 'ACTIVE' | 'DEPRECIATED' | 'DISPOSED' | 'SOLD';
  purchaseDate: string;
  purchasePrice: number;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE';
  currentValue: number;
  accumulatedDepreciation: number;
  accountCode?: string;
  location?: string;
  serialNumber?: string;
  supplier?: string;
  disposalDate?: string;
  disposalPrice?: number;
  createdAt: string;
}

interface FixedAssetStatistics {
  totalAssets: number;
  totalValue: number;
  totalDepreciation: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'fixed-assets';

export function useFixedAssets(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<FixedAsset>>(`/fixed-assets${query ? `?${query}` : ''}`);
    },
  });
}

export function useFixedAsset(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<FixedAsset>(`/fixed-assets/${id}`),
    enabled: !!id,
  });
}

export function useFixedAssetStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<FixedAssetStatistics>('/fixed-assets/statistics'),
  });
}

export function useDepreciationSchedule(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'depreciation-schedule'],
    queryFn: () => api.get(`/fixed-assets/${id}/depreciation-schedule`),
    enabled: !!id,
  });
}

export function useCreateFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FixedAsset>) => api.post<FixedAsset>('/fixed-assets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FixedAsset> }) =>
      api.put<FixedAsset>(`/fixed-assets/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useRunDepreciation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { year: number; month: number; postToJournal?: boolean }) =>
      api.post('/fixed-assets/run-depreciation', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDisposeFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { disposalDate: string; disposalPrice?: number; reason?: string } }) =>
      api.post(`/fixed-assets/${id}/dispose`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}
