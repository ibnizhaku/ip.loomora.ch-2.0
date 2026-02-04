import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { 
  Product, 
  ProductCreateInput, 
  ProductUpdateInput, 
  ProductCategory,
  PaginatedResponse,
  ListParams 
} from '@/types/api';

const QUERY_KEY = 'products';
const CATEGORIES_KEY = 'product-categories';

// Fetch all products with pagination
export function useProducts(params?: ListParams & { categoryId?: string; isService?: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
      if (params?.isService !== undefined) searchParams.set('isService', String(params.isService));
      
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Product>>(`/products${query ? `?${query}` : ''}`);
    },
  });
}

// Fetch single product by ID
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

// Fetch product categories
export function useProductCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: () => api.get<ProductCategory[]>('/products/categories'),
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProductCreateInput) => 
      api.post<Product>('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateInput }) =>
      api.put<Product>(`/products/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// Adjust stock - matches backend POST /products/:id/adjust-stock
export function useAdjustStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; type: 'IN' | 'OUT' | 'ADJUSTMENT'; reason?: string } }) =>
      api.post(`/products/${id}/adjust-stock`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// Create product category
export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<ProductCategory>('/products/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

// Product stats hook
export function useProductStats() {
  const { data } = useProducts({ pageSize: 1000 });
  
  const products = data?.data || [];
  const total = products.length;
  const active = products.filter(p => p.isActive).length;
  const inactive = products.filter(p => !p.isActive).length;
  const services = products.filter(p => p.isService).length;
  const lowStock = products.filter(p => !p.isService && p.stockQuantity <= p.minStock).length;
  
  return { total, active, inactive, services, lowStock };
}
