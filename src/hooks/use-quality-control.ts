import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ============ Checklists ============

interface ChecklistItem {
  id?: string;
  name: string;
  description?: string;
  required: boolean;
  order: number;
}

interface QualityChecklist {
  id: string;
  name: string;
  description?: string;
  type: 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'MAINTENANCE';
  category?: string;
  isActive: boolean;
  items: ChecklistItem[];
  createdAt: string;
}

// ============ Quality Checks ============

interface QualityCheckResult {
  checklistItemId: string;
  passed: boolean;
  value?: string;
  notes?: string;
  photoUrls?: string[];
}

interface QualityCheck {
  id: string;
  number: string;
  checklistId: string;
  checklist?: QualityChecklist;
  productionOrderId?: string;
  goodsReceiptId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CONDITIONAL';
  type: string;
  scheduledDate?: string;
  completedDate?: string;
  inspectorId?: string;
  inspector?: { id: string; firstName: string; lastName: string };
  results: QualityCheckResult[];
  overallNotes?: string;
  createdAt: string;
}

interface QualityStatistics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  passRate: number;
  pendingChecks: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const CHECKLIST_KEY = 'quality-checklists';
const CHECK_KEY = 'quality-checks';

// ============ Checklist Hooks ============

export function useQualityChecklists(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [CHECKLIST_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.type) searchParams.set('type', params.type);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<QualityChecklist>>(`/quality/checklists${query ? `?${query}` : ''}`);
    },
  });
}

export function useQualityChecklist(id: string) {
  return useQuery({
    queryKey: [CHECKLIST_KEY, id],
    queryFn: () => api.get<QualityChecklist>(`/quality/checklists/${id}`),
    enabled: !!id,
  });
}

export function useChecklistTemplates() {
  return useQuery({
    queryKey: [CHECKLIST_KEY, 'templates'],
    queryFn: () => api.get('/quality/checklists/templates'),
  });
}

export function useCreateQualityChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<QualityChecklist>) => api.post<QualityChecklist>('/quality/checklists', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CHECKLIST_KEY] }),
  });
}

export function useUpdateQualityChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QualityChecklist> }) =>
      api.put<QualityChecklist>(`/quality/checklists/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CHECKLIST_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHECKLIST_KEY, id] });
    },
  });
}

export function useDeleteQualityChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quality/checklists/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CHECKLIST_KEY] }),
  });
}

// ============ Quality Check Hooks ============

export function useQualityChecks(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  productionOrderId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: [CHECK_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.productionOrderId) searchParams.set('productionOrderId', params.productionOrderId);
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<QualityCheck>>(`/quality/checks${query ? `?${query}` : ''}`);
    },
  });
}

export function useQualityCheck(id: string) {
  return useQuery({
    queryKey: [CHECK_KEY, id],
    queryFn: () => api.get<QualityCheck>(`/quality/checks/${id}`),
    enabled: !!id,
  });
}

export function useQualityStatistics() {
  return useQuery({
    queryKey: [CHECK_KEY, 'statistics'],
    queryFn: () => api.get<QualityStatistics>('/quality/checks/statistics'),
  });
}

export function useCreateQualityCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<QualityCheck>) => api.post<QualityCheck>('/quality/checks', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CHECK_KEY] }),
  });
}

export function useUpdateQualityCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QualityCheck> }) =>
      api.put<QualityCheck>(`/quality/checks/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CHECK_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHECK_KEY, id] });
    },
  });
}

export function useCompleteQualityCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { results: QualityCheckResult[]; overallStatus: string; notes?: string } }) =>
      api.post(`/quality/checks/${id}/complete`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CHECK_KEY] });
      queryClient.invalidateQueries({ queryKey: [CHECK_KEY, id] });
    },
  });
}

export function useDeleteQualityCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quality/checks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CHECK_KEY] }),
  });
}
