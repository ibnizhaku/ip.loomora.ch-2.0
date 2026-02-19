import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Invoice types
interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string;
  };
  projectId?: string;
  orderId?: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  openAmount?: number;
  isOverdue?: boolean;
  qrReference?: string;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  position: number;
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Quote types
interface Quote {
  id: string;
  number: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
  };
  projectId?: string;
  status: string;
  issueDate: string;
  validUntil?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
}

// Order types
interface Order {
  id: string;
  number: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
  };
  projectId?: string;
  quoteId?: string;
  status: string;
  orderDate: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
}

// Fetch quotes
export function useQuotes(params: { status?: string; customerId?: string; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.customerId) searchParams.set('customerId', params.customerId);
  if (params.search) searchParams.set('search', params.search);

  return useQuery({
    queryKey: ['quotes', params],
    queryFn: () => api.get<PaginatedResponse<Quote>>(`/quotes?${searchParams.toString()}`),
  });
}

// Fetch single quote
export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => api.get<Quote>(`/quotes/${id}`),
    enabled: !!id,
  });
}

// Create quote
export function useCreateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Quote>) => api.post<Quote>('/quotes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

// Update quote
export function useUpdateQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quote> }) => 
      api.put<Quote>(`/quotes/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
    },
  });
}

// Convert quote to order
export function useConvertQuoteToOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post<Order>(`/quotes/${id}/convert-to-order`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Delete quote
export function useDeleteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quotes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
  });
}

// Send quote
export function useSendQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Quote>(`/quotes/${id}/send`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', id] });
    },
  });
}

// Quote statistics
export function useQuoteStats() {
  return useQuery({
    queryKey: ['quotes', 'stats'],
    queryFn: () => api.get<{ total: number; draft: number; sent: number; confirmed: number; rejected: number }>('/quotes/stats'),
  });
}

// Delete order
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

// Order statistics
export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => api.get<{ total: number; draft: number; sent: number; confirmed: number; cancelled: number; totalValue: number }>('/orders/stats'),
  });
}

// Create delivery note from order
export function useCreateDeliveryNoteFromOrderAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.post(`/orders/${orderId}/create-delivery-note`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    },
  });
}

// Fetch orders
export function useOrders(params: { status?: string; customerId?: string; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.customerId) searchParams.set('customerId', params.customerId);
  if (params.search) searchParams.set('search', params.search);

  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.get<PaginatedResponse<Order>>(`/orders?${searchParams.toString()}`),
  });
}

// Fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Order>) => api.post<Order>('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Update order
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) => 
      api.patch<Order>(`/orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}

// Create invoice from order
export function useCreateInvoiceFromOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => api.post<Invoice>(`/orders/${orderId}/create-invoice`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Fetch invoices
export function useInvoices(params: { status?: string; customerId?: string; overdue?: boolean; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.customerId) searchParams.set('customerId', params.customerId);
  if (params.overdue) searchParams.set('overdue', 'true');
  if (params.search) searchParams.set('search', params.search);

  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => api.get<PaginatedResponse<Invoice>>(`/invoices?${searchParams.toString()}`),
  });
}

// Fetch single invoice
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });
}

// Fetch open items (debtors)
export function useOpenItems() {
  return useQuery({
    queryKey: ['invoices', 'open-items'],
    queryFn: () => api.get<Invoice[]>('/invoices/open-items'),
  });
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Invoice>) => api.post<Invoice>('/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => 
      api.put<Invoice>(`/invoices/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Record payment
export function useRecordPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, amount, paymentDate, reference }: { 
      invoiceId: string; 
      amount: number; 
      paymentDate?: string;
      reference?: string;
    }) => api.post<Invoice>(`/invoices/${invoiceId}/payment`, { amount, paymentDate, reference }),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Send invoice
export function useSendInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post<Invoice>(`/invoices/${id}/send`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
}

// Cancel invoice
export function useCancelInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post<Invoice>(`/invoices/${id}/cancel`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
