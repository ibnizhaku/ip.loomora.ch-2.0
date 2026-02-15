import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface InventoryMovement {
  id?: string;
  date: string;
  type: string;
  quantity: number;
  reference: string;
  balance: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  status: string;
  sku: string;
  ean?: string;
  description?: string;
  unit: string;
  stock: {
    current: number;
    reserved: number;
    available: number;
    minimum: number;
    maximum: number;
    reorderPoint: number;
  };
  pricing: {
    purchasePrice: number;
    sellingPrice: number;
    margin: number;
    lastPurchase?: string;
  };
  supplier?: {
    id: string;
    name: string;
    articleNo?: string;
    deliveryTime?: string;
  };
  location?: {
    warehouse: string;
    rack?: string;
    shelf?: string;
    bin?: string;
  };
  movements: InventoryMovement[];
  sales?: {
    last30Days: number;
    last90Days: number;
    lastYear: number;
    avgPerMonth: number;
  };
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'inventory';

export function useInventoryItems(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.category) searchParams.set('category', params.category);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<InventoryItem>>(`/inventory${query ? `?${query}` : ''}`);
    },
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<InventoryItem>(`/inventory/${id}`),
    enabled: !!id,
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      api.put<InventoryItem>(`/inventory/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { actualStock: number; reason: string; notes?: string } }) =>
      api.post(`/inventory/${id}/adjust`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useTransferInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { targetWarehouse: string; quantity: number; notes?: string } }) =>
      api.post(`/inventory/${id}/transfer`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
