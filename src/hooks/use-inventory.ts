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
const PRODUCTS_KEY = 'products';

function mapProductToInventoryItem(p: any): InventoryItem {
  const stock = Number(p.stockQuantity ?? p.stock?.current ?? 0);
  const reserved = Number(p.reservedStock ?? p.stock?.reserved ?? 0);
  const min = Number(p.minStock ?? p.stock?.minimum ?? 0);
  const max = Number(p.maxStock ?? p.stock?.maximum ?? 100);
  const reorder = Number(p.reorderPoint ?? p.stock?.reorderPoint ?? p.minStock ?? min);
  return {
    id: p.id,
    name: p.name || 'Unbenannt',
    category: p.category?.name ?? p.category ?? '—',
    subcategory: p.subcategory ?? '—',
    status: stock > min ? 'Verfügbar' : stock > 0 ? 'Niedrig' : 'Nicht auf Lager',
    sku: p.sku || p.number || '—',
    ean: p.ean ?? '—',
    description: p.description ?? '',
    unit: p.unit || 'Stk',
    stock: {
      current: stock,
      reserved,
      available: stock - reserved,
      minimum: min,
      maximum: max,
      reorderPoint: reorder,
    },
    pricing: {
      purchasePrice: Number(p.purchasePrice ?? p.pricing?.purchasePrice ?? 0),
      sellingPrice: Number(p.salePrice ?? p.pricing?.sellingPrice ?? 0),
      margin: Number(p.margin ?? p.pricing?.margin ?? 0),
      lastPurchase: p.pricing?.lastPurchase ?? '—',
    },
    supplier: p.supplier ? { id: p.supplier.id, name: p.supplier.name, articleNo: p.supplier.articleNo } : undefined,
    movements: [],
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : '',
  };
}

export function useInventoryItems(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.category) searchParams.set('categoryId', params.category);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      const res = await api.get<PaginatedResponse<any>>(`/products${query ? `?${query}` : ''}`);
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      return {
        data: raw.map(mapProductToInventoryItem),
        total: (res as any)?.total ?? raw.length,
        page: (res as any)?.page ?? 1,
        pageSize: (res as any)?.pageSize ?? 20,
      } as PaginatedResponse<InventoryItem>;
    },
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const res = await api.get<any>(`/products/${id}`);
      const p = (res as any)?.data ?? res;
      if (!p) return null;
      return mapProductToInventoryItem(p) as InventoryItem | null;
    },
    enabled: !!id,
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => {
      const payload: any = {};
      if (data.name != null) payload.name = data.name;
      if (data.description != null) payload.description = data.description;
      if (data.sku != null) payload.sku = data.sku;
      if (data.unit != null) payload.unit = data.unit;
      if (data.stock != null) {
        payload.stockQuantity = data.stock.current;
        if (data.stock.minimum != null) payload.minStock = data.stock.minimum;
        if (data.stock.maximum != null) payload.maxStock = data.stock.maximum;
        if (data.stock.reorderPoint != null) payload.reorderPoint = data.stock.reorderPoint;
      }
      if (data.pricing != null) {
        payload.purchasePrice = data.pricing.purchasePrice;
        payload.salePrice = data.pricing.sellingPrice;
      }
      return api.put<any>(`/products/${id}`, payload);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { actualStock: number; reason: string; notes?: string } }) =>
      api.post(`/products/${id}/adjust-stock`, { quantity: data.actualStock, reason: data.reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}

export function useTransferInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; data: { targetWarehouse: string; quantity: number; notes?: string } }) => {
      throw new Error('Lagerübertrag wird derzeit nicht unterstützt. Bitte nutzen Sie die Bestandsanpassung.');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}
