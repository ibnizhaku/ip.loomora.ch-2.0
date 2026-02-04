import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ProductionOperation {
  id: string;
  sequence: number;
  name: string;
  workstation?: string;
  estimatedHours: number;
  actualHours?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
}

interface ProductionOrder {
  id: string;
  number: string;
  name: string;
  description?: string;
  projectId?: string;
  project?: { id: string; name: string };
  bomId?: string;
  bom?: { id: string; name: string };
  status: 'DRAFT' | 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  quantity: number;
  completedQuantity?: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours: number;
  actualHours?: number;
  operations: ProductionOperation[];
  createdAt: string;
}

interface ProductionStatistics {
  totalOrders: number;
  inProgress: number;
  completed: number;
  utilizationRate: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'production-orders';

export function useProductionOrders(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
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
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<ProductionOrder>>(`/production-orders${query ? `?${query}` : ''}`);
    },
  });
}

export function useProductionOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<ProductionOrder>(`/production-orders/${id}`),
    enabled: !!id,
  });
}

export function useProductionStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<ProductionStatistics>('/production-orders/statistics'),
  });
}

export function useCapacityOverview(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'capacity', startDate, endDate],
    queryFn: () => api.get(`/production-orders/capacity?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!startDate && !!endDate,
  });
}

export function useCreateProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProductionOrder>) => api.post<ProductionOrder>('/production-orders', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductionOrder> }) =>
      api.put<ProductionOrder>(`/production-orders/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useBookProductionTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { operationId: string; hours: number; employeeId?: string; notes?: string } }) =>
      api.post(`/production-orders/${id}/book-time`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useCompleteProductionOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, operationId }: { id: string; operationId: string }) =>
      api.post(`/production-orders/${id}/operations/${operationId}/complete`),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteProductionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/production-orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
