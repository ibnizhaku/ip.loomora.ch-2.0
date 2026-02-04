import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface GoodsReceiptItem {
  productId?: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unit?: string;
  qualityStatus?: 'PENDING' | 'PASSED' | 'FAILED';
  notes?: string;
}

interface GoodsReceipt {
  id: string;
  number: string;
  purchaseOrderId?: string;
  purchaseOrder?: { id: string; number: string };
  supplierId: string;
  supplier?: { id: string; name: string };
  status: 'DRAFT' | 'RECEIVED' | 'QUALITY_CHECK' | 'COMPLETED' | 'REJECTED';
  receiptDate: string;
  deliveryNoteNumber?: string;
  notes?: string;
  items: GoodsReceiptItem[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'goods-receipts';

export function useGoodsReceipts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.supplierId) searchParams.set('supplierId', params.supplierId);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<GoodsReceipt>>(`/goods-receipts${query ? `?${query}` : ''}`);
    },
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<GoodsReceipt>(`/goods-receipts/${id}`),
    enabled: !!id,
  });
}

export function useGoodsReceiptStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get('/goods-receipts/statistics'),
  });
}

export function usePendingGoodsReceipts() {
  return useQuery({
    queryKey: [QUERY_KEY, 'pending'],
    queryFn: () => api.get('/goods-receipts/pending'),
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GoodsReceipt>) => api.post<GoodsReceipt>('/goods-receipts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

export function useUpdateGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GoodsReceipt> }) =>
      api.put<GoodsReceipt>(`/goods-receipts/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function usePerformQualityCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { itemId: string; status: string; notes?: string } }) =>
      api.post(`/goods-receipts/${id}/quality-check`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteGoodsReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/goods-receipts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
