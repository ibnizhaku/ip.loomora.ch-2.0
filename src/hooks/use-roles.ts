import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  isSystem: boolean;
  userCount: number;
  color: string;
  permissions: string[];
  users?: RoleUser[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface RoleUser {
  id: string;
  name: string;
  email: string;
  department?: string;
}

export interface RolePermission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  admin: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'roles';

export function useRoles(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Role>>(`/roles${query ? `?${query}` : ''}`);
    },
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Role>(`/roles/${id}`),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDto) => api.post<Role>('/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Rolle erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen', { description: error.message });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      api.put<Role>(`/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Rolle aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren', { description: error.message });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Rolle erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen', { description: error.message });
    },
  });
}
