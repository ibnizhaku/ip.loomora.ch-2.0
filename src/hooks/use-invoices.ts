import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedResponse, ListParams } from '@/types/api';

const QUERY_KEY = 'invoices';

// Invoice type matching backend response
export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
  };
  projectId?: string;
  project?: {
    id: string;
    name: string;
  };
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  vatAmount: number;
  total: number;
  paidAmount?: number;
  notes?: string;
  qrReference?: string;
  qrIban?: string;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface InvoiceCreateInput {
  customerId: string;
  projectId?: string;
  issueDate?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
  items: Omit<InvoiceItem, 'id'>[];
}

export interface InvoiceUpdateInput extends Partial<InvoiceCreateInput> {}

// Fetch all invoices with pagination
export function useInvoices(params?: ListParams & { status?: string; customerId?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Invoice>>(`/invoices${query ? `?${query}` : ''}`);
    },
  });
}

// Fetch single invoice by ID
export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InvoiceCreateInput) => 
      api.post<Invoice>('/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdateInput }) =>
      api.put<Invoice>(`/invoices/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete invoice
export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Invoice stats hook (server-side calculation)
export function useInvoiceStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', 'stats'],
    queryFn: () => api.get<{ total: number; paid: number; pending: number; overdue: number }>('/invoices/stats'),
  });

  return {
    total: data?.total ?? 0,
    paid: data?.paid ?? 0,
    pending: data?.pending ?? 0,
    overdue: data?.overdue ?? 0,
    isLoading,
  };
}
