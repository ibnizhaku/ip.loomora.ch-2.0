import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  userId: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  retentionUntil: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AuditLogParams {
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Audit Logs (read-only)
export function useAuditLogs(params?: AuditLogParams) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async (): Promise<PaginatedResponse<AuditLog>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.action) searchParams.set('action', params.action);
      if (params?.entityType) searchParams.set('entityType', params.entityType);
      if (params?.entityId) searchParams.set('entityId', params.entityId);
      if (params?.userId) searchParams.set('userId', params.userId);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<AuditLog>>(`/audit-log${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: ['audit-logs', id],
    queryFn: async (): Promise<AuditLog | null> => {
      if (!id) return null;
      return api.get<AuditLog>(`/audit-log/${id}`);
    },
    enabled: !!id,
  });
}

// Entity History
export function useEntityHistory(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['audit-logs', 'entity', entityType, entityId],
    queryFn: async (): Promise<AuditLog[]> => {
      return api.get<AuditLog[]>(`/audit-log/entity/${entityType}/${entityId}`);
    },
    enabled: !!entityType && !!entityId,
  });
}

// User Activity
export function useUserActivity(userId: string, params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['audit-logs', 'user', userId, params],
    queryFn: async (): Promise<PaginatedResponse<AuditLog>> => {
      const searchParams = new URLSearchParams();
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<AuditLog>>(`/audit-log/user/${userId}${queryString ? `?${queryString}` : ''}`);
    },
    enabled: !!userId,
  });
}

// Audit Log Statistics
export function useAuditLogStats() {
  return useQuery({
    queryKey: ['audit-log', 'stats'],
    queryFn: async () => {
      return api.get<{
        totalEntries: number;
        todayEntries: number;
        topActions: Array<{ action: string; count: number }>;
        topUsers: Array<{ userId: string; userName: string; count: number }>;
        topEntities: Array<{ entityType: string; count: number }>;
      }>('/audit-log/stats');
    },
  });
}

// Available Actions (for filters)
export function useAuditLogActions() {
  return useQuery({
    queryKey: ['audit-log', 'actions'],
    queryFn: async (): Promise<string[]> => {
      return api.get<string[]>('/audit-log/actions');
    },
    staleTime: 300000, // Cache for 5 minutes
  });
}

// Available Entity Types (for filters)
export function useAuditLogEntityTypes() {
  return useQuery({
    queryKey: ['audit-log', 'entity-types'],
    queryFn: async (): Promise<string[]> => {
      return api.get<string[]>('/audit-log/entity-types');
    },
    staleTime: 300000, // Cache for 5 minutes
  });
}
