import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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
  approvalStatus: ApprovalStatus;
  employeeName?: string;
}

interface TimeEntryStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  billableHours: number;
  projectBreakdown: { projectId: string; projectName: string; hours: number }[];
}

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
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
  approvalStatus?: ApprovalStatus;
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
      if (params?.approvalStatus) searchParams.set('approvalStatus', params.approvalStatus);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<TimeEntry>>(`/time-entries${query ? `?${query}` : ''}`);
    },
  });
}

export function useAllTimeEntries(params?: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  approvalStatus?: ApprovalStatus;
  employeeId?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, 'all', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.approvalStatus) searchParams.set('approvalStatus', params.approvalStatus);
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<TimeEntry>>(`/time-entries/all${query ? `?${query}` : ''}`);
    },
  });
}

export function useTimeEntryStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<TimeEntryStats>('/time-entries/stats'),
  });
}

export function useApprovalStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'approval-stats'],
    queryFn: () => api.get<ApprovalStats>('/time-entries/approval-stats'),
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

export function useApproveTimeEntries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { ids: string[]; status: ApprovalStatus; reason?: string }) =>
      api.post('/time-entries/approve', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
