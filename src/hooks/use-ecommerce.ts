import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface ShopOrder {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string;
  customerName?: string;
  shippingAddress: Record<string, any>;
  billingAddress?: Record<string, any>;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod?: string;
  paymentStatus: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  items: ShopOrderItem[];
  customerId?: string;
  discountId?: string;
  discount?: Discount;
  createdAt: string;
  updatedAt: string;
}

export interface ShopOrderItem {
  id: string;
  shopOrderId: string;
  productId: string;
  product?: { id: string; name: string; sku: string };
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Discount {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  product?: { id: string; name: string };
  customerName: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  response?: string;
  respondedAt?: string;
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

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

const buildQueryString = (params?: ListParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  return searchParams.toString();
};

// Shop Orders
export function useShopOrders(params?: ListParams & { paymentStatus?: string }) {
  return useQuery({
    queryKey: ['shop-orders', params],
    queryFn: async (): Promise<PaginatedResponse<ShopOrder>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<ShopOrder>>(`/ecommerce/orders${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useShopOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['shop-orders', id],
    queryFn: async (): Promise<ShopOrder | null> => {
      if (!id) return null;
      return api.get<ShopOrder>(`/ecommerce/orders/${id}`);
    },
    enabled: !!id,
  });
}

export function useUpdateShopOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShopOrder> }): Promise<ShopOrder> => {
      return api.put<ShopOrder>(`/ecommerce/orders/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shop-orders', id] });
    },
  });
}

export function useUpdateShopOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }): Promise<ShopOrder> => {
      return api.put<ShopOrder>(`/ecommerce/orders/${id}/status`, { status });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shop-orders', id] });
    },
  });
}

// Discounts
export function useDiscounts(params?: ListParams & { isActive?: boolean }) {
  return useQuery({
    queryKey: ['discounts', params],
    queryFn: async (): Promise<PaginatedResponse<Discount>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<Discount>>(`/ecommerce/discounts${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useDiscount(id: string | undefined) {
  return useQuery({
    queryKey: ['discounts', id],
    queryFn: async (): Promise<Discount | null> => {
      if (!id) return null;
      return api.get<Discount>(`/ecommerce/discounts/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Discount>): Promise<Discount> => {
      return api.post<Discount>('/ecommerce/discounts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Discount> }): Promise<Discount> => {
      return api.put<Discount>(`/ecommerce/discounts/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discounts', id] });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/ecommerce/discounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: async (code: string): Promise<Discount | null> => {
      return api.get<Discount | null>(`/ecommerce/discounts/validate/${code}`);
    },
  });
}

// Reviews
export function useReviews(params?: ListParams & { productId?: string; isApproved?: boolean }) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async (): Promise<PaginatedResponse<Review>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.productId) searchParams.set('productId', params.productId);
      if (params?.isApproved !== undefined) searchParams.set('isApproved', String(params.isApproved));
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<Review>>(`/ecommerce/reviews${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Review> => {
      return api.put<Review>(`/ecommerce/reviews/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useRespondToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }): Promise<Review> => {
      return api.put<Review>(`/ecommerce/reviews/${id}/respond`, { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/ecommerce/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

// E-Commerce Statistics
export function useEcommerceStats() {
  return useQuery({
    queryKey: ['ecommerce', 'stats'],
    queryFn: async () => {
      return api.get<{
        totalOrders: number;
        pendingOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        activeDiscounts: number;
        pendingReviews: number;
        averageRating: number;
      }>('/ecommerce/stats');
    },
  });
}
