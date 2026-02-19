import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
interface DeliveryNoteItem {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unit?: string;
  deliveredQuantity?: number;
}

interface DeliveryNote {
  id: string;
  number: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
  };
  orderId?: string;
  order?: {
    id: string;
    number: string;
  };
  status: 'DRAFT' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  deliveryDate: string;
  shippedDate?: string;
  deliveryAddress?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  items: DeliveryNoteItem[];
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

const QUERY_KEY = 'delivery-notes';

// List delivery notes
export function useDeliveryNotes(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  customerId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.search) searchParams.set('search', params.search);
      
      const query = searchParams.toString();
      return api.get<PaginatedResponse<DeliveryNote>>(`/delivery-notes${query ? `?${query}` : ''}`);
    },
  });
}

// Get single delivery note
export function useDeliveryNote(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<DeliveryNote>(`/delivery-notes/${id}`),
    enabled: !!id,
  });
}

// Create delivery note
export function useCreateDeliveryNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      customerId: string;
      orderId?: string;
      deliveryDate: string;
      deliveryAddress?: string;
      carrier?: string;
      notes?: string;
      items: DeliveryNoteItem[];
    }) => api.post<DeliveryNote>('/delivery-notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Create delivery note from order
export function useCreateDeliveryNoteFromOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, itemIds }: { orderId: string; itemIds?: string[] }) => 
      api.post<DeliveryNote>(`/delivery-notes/from-order/${orderId}`, { itemIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Update delivery note
export function useUpdateDeliveryNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        status?: string;
        deliveryDate?: string;
        shippedDate?: string;
        deliveryAddress?: string;
        trackingNumber?: string;
        carrier?: string;
        notes?: string;
        items?: DeliveryNoteItem[];
      }
    }) => api.put<DeliveryNote>(`/delivery-notes/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete delivery note
export function useDeleteDeliveryNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/delivery-notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Delivery note statistics
export function useDeliveryNoteStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<{ total: number; draft: number; shipped: number; delivered: number }>('/delivery-notes/stats'),
  });
}
