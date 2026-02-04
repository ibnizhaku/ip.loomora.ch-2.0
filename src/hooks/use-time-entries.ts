import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TimeEntry {
  id: string;
  employeeId: string;
  projectId?: string;
  project?: { id: string; name: string };
  taskId?: string;
  task?: { id: string; title: string };
  date: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  description?: string;
  billable: boolean;
  billed?: boolean;
  invoiceId?: string;
  createdAt: string;
}

interface TimeEntryStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  billableHours: number;
  projectBreakdown: { projectId: string; projectName: string; hours: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'time-entries';

export function useTimeEntries(params?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  taskId?: string;
  billable?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.taskId) searchParams.set('taskId', params.taskId);
      if (params?.billable !== undefined) searchParams.set('billable', String(params.billable));
      const query = searchParams.toString();
      return api.get<PaginatedResponse<TimeEntry>>(`/time-entries${query ? `?${query}` : ''}`);
    },
  });
}

export function useTimeEntryStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<TimeEntryStats>('/time-entries/stats'),
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TimeEntry>) => api.post<TimeEntry>('/time-entries', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntry> }) =>
      api.put<TimeEntry>(`/time-entries/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/time-entries/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
