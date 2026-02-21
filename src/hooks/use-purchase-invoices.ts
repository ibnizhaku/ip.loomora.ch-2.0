import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
interface PurchaseInvoiceItem {
  id?: string;
  productId?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  vatRate?: number;
  accountCode?: string;
  total?: number;
}

interface PurchaseInvoice {
  id: string;
  number: string;
  externalNumber: string;
  supplierId: string;
  supplier?: {
    id: string;
    name: string;
    companyName?: string;
  };
  purchaseOrderId?: string;
  purchaseOrder?: {
    id: string;
    number: string;
  };
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  invoiceDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  openAmount?: number;
  isOverdue?: boolean;
  notes?: string;
  documentUrl?: string;
  items: PurchaseInvoiceItem[];
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

interface PurchaseInvoiceStatistics {
  totalInvoices: number;
  pendingInvoices: number;
  approvedInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalValue: number;
  pendingValue: number;
  overdueValue: number;
}

interface OcrExtractedData {
  supplierName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: number;
  vatAmount?: number;
  totalAmount?: number;
  iban?: string;
  qrReference?: string;
  items?: {
    description: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
  }[];
  confidence: number;
}

const QUERY_KEY = 'purchase-invoices';

// List purchase invoices
export function usePurchaseInvoices(params?: {
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
      return api.get<PaginatedResponse<PurchaseInvoice>>(`/purchase-invoices${query ? `?${query}` : ''}`);
    },
  });
}

// Get single purchase invoice
export function usePurchaseInvoice(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<PurchaseInvoice>(`/purchase-invoices/${id}`),
    enabled: !!id,
  });
}

// Get statistics
export function usePurchaseInvoiceStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<PurchaseInvoiceStatistics>('/purchase-invoices/statistics'),
  });
}

// Create purchase invoice
export function useCreatePurchaseInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      supplierId: string;
      externalNumber: string;
      purchaseOrderId?: string;
      invoiceDate: string;
      dueDate: string;
      notes?: string;
      documentUrl?: string;
      items: PurchaseInvoiceItem[];
    }) => api.post<PurchaseInvoice>('/purchase-invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Create from purchase order
export function useCreatePurchaseInvoiceFromOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ purchaseOrderId, externalNumber }: { 
      purchaseOrderId: string; 
      externalNumber: string;
    }) => api.post<PurchaseInvoice>(
      `/purchase-invoices/from-purchase-order/${purchaseOrderId}?externalNumber=${encodeURIComponent(externalNumber)}`
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
}

// Extract data from PDF using OCR
export function useExtractOcrData() {
  return useMutation({
    mutationFn: (documentUrl: string) => 
      api.post<OcrExtractedData>('/purchase-invoices/extract-ocr', { documentUrl }),
  });
}

// Update purchase invoice
export function useUpdatePurchaseInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        status?: string;
        externalNumber?: string;
        invoiceDate?: string;
        dueDate?: string;
        notes?: string;
        documentUrl?: string;
        items?: PurchaseInvoiceItem[];
      }
    }) => api.put<PurchaseInvoice>(`/purchase-invoices/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Approve purchase invoice
export function useApprovePurchaseInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data?: {
        approvalNote?: string;
        schedulePayment?: boolean;
        paymentDate?: string;
      }
    }) => api.post<PurchaseInvoice>(`/purchase-invoices/${id}/approve`, data || {}),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Record a payment for a purchase invoice
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: { amount: number; paymentDate: string; method: string; note?: string; bankAccountId?: string };
    }) => api.post(`/purchase-invoices/${id}/record-payment`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete purchase invoice
export function useDeletePurchaseInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/purchase-invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
