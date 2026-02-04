import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ServiceReport {
  id?: string;
  workPerformed: string;
  partsUsed?: string;
  hoursWorked: number;
  travelTime?: number;
  findings?: string;
  recommendations?: string;
  customerSignature?: string;
  photoUrls?: string[];
  createdAt?: string;
}

interface ServiceTicket {
  id: string;
  number: string;
  customerId: string;
  customer?: { id: string; name: string };
  projectId?: string;
  assetId?: string;
  status: 'OPEN' | 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  serviceType: 'REPAIR' | 'MAINTENANCE' | 'INSPECTION' | 'INSTALLATION' | 'WARRANTY';
  title: string;
  description?: string;
  scheduledDate?: string;
  completedDate?: string;
  technicianId?: string;
  technician?: { id: string; firstName: string; lastName: string };
  estimatedHours?: number;
  actualHours?: number;
  billedAmount?: number;
  invoiceId?: string;
  reports: ServiceReport[];
  createdAt: string;
}

interface ServiceStatistics {
  totalTickets: number;
  openTickets: number;
  scheduledTickets: number;
  completedThisMonth: number;
  averageResolutionTime: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'service-tickets';

export function useServiceTickets(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  serviceType?: string;
  customerId?: string;
  technicianId?: string;
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
      if (params?.serviceType) searchParams.set('serviceType', params.serviceType);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.technicianId) searchParams.set('technicianId', params.technicianId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<ServiceTicket>>(`/service-tickets${query ? `?${query}` : ''}`);
    },
  });
}

export function useServiceTicket(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<ServiceTicket>(`/service-tickets/${id}`),
    enabled: !!id,
  });
}

export function useServiceStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics'],
    queryFn: () => api.get<ServiceStatistics>('/service-tickets/statistics'),
  });
}

export function useUpcomingMaintenance(days?: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'upcoming-maintenance', days],
    queryFn: () => api.get(`/service-tickets/upcoming-maintenance${days ? `?days=${days}` : ''}`),
  });
}

export function useTechnicianAvailability(technicianId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'technician-availability', technicianId, startDate, endDate],
    queryFn: () => api.get(`/service-tickets/technician-availability/${technicianId}?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!technicianId && !!startDate && !!endDate,
  });
}

export function useCreateServiceTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ServiceTicket>) => api.post<ServiceTicket>('/service-tickets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateServiceTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceTicket> }) =>
      api.put<ServiceTicket>(`/service-tickets/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useAddServiceReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceReport }) =>
      api.post(`/service-tickets/${id}/report`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useScheduleTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { technicianId: string; scheduledDate: string; estimatedHours?: number } }) =>
      api.post(`/service-tickets/${id}/schedule`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteServiceTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/service-tickets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
