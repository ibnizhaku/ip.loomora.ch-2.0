import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  projectId?: string;
  customerId?: string;
  employeeId?: string;
  color?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

const QUERY_KEY = 'calendar';

export function useCalendarEvents(params?: {
  startDate?: string;
  endDate?: string;
  type?: string;
  projectId?: string;
  employeeId?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<CalendarEvent>>(`/calendar${query ? `?${query}` : ''}`);
    },
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<CalendarEvent>(`/calendar/${id}`),
    enabled: !!id,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>('/calendar', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) =>
      api.put<CalendarEvent>(`/calendar/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/calendar/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
