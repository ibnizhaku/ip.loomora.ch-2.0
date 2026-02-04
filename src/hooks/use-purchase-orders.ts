import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
interface PurchaseOrderItem {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  vatRate?: number;
  total?: number;
}

interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    companyName?: string;
  };
  projectId?: string;
  project?: {
    id: string;
    name: string;
  };
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  orderDate: string;
  expectedDate?: string;
  deliveryAddress?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PurchaseOrderStatistics {
  totalOrders: number;
  draftOrders: number;
  sentOrders: number;
  confirmedOrders: number;
  receivedOrders: number;
  totalValue: number;
  pendingValue: number;
}

const QUERY_KEY = 'purchase-orders';

// List purchase orders
export function usePurchaseOrders(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  supplierId?: string;
  projectId?: string;
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
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.search) searchParams.set('search', params.search);
      
      const query = searchParams.toString();
      return api.get<PaginatedResponse<PurchaseOrder>>(`/purchase-orders${query ? `?${query}` : ''}`);
    },
  });
}

// Get single purchase order
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<PurchaseOrder>(`/purchase-orders/${id}`),
    enabled: !!id,
  });
}

// Get statistics
export function usePurchaseOrderStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<PurchaseOrderStatistics>('/purchase-orders/statistics'),
  });
}

// Create purchase order
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      supplierId: string;
      projectId?: string;
      expectedDate?: string;
      notes?: string;
      deliveryAddress?: string;
      items: PurchaseOrderItem[];
    }) => api.post<PurchaseOrder>('/purchase-orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update purchase order
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        status?: string;
        expectedDate?: string;
        notes?: string;
        deliveryAddress?: string;
        items?: PurchaseOrderItem[];
      }
    }) => api.put<PurchaseOrder>(`/purchase-orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Send purchase order to supplier
export function useSendPurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, method, recipientEmail, message }: { 
      id: string; 
      method: 'EMAIL' | 'PDF' | 'PRINT';
      recipientEmail?: string;
      message?: string;
    }) => api.post<PurchaseOrder>(`/purchase-orders/${id}/send`, { method, recipientEmail, message }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete purchase order
export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/purchase-orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
