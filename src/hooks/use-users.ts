import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  roleName?: string;
  status: string;
  lastLogin: string;
  twoFactor: boolean;
  avatar?: string;
  employeeId?: string;
  employeeNumber?: string;
  phone?: string;
  createdAt?: string;
  isOwner?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  createEmployee?: boolean;
  position?: string;
  departmentId?: string;
  hireDate?: string;
  password?: string;
  sendInvite?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}

const QUERY_KEY = 'users';

export function useUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.role) searchParams.set('role', params.role);
      if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
      const query = searchParams.toString();
      return api.get<PaginatedResponse<User>>(`/users${query ? `?${query}` : ''}`);
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => api.post<User>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Benutzer erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen', { description: error.message });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      api.put<User>(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Benutzer aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren', { description: error.message });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Benutzer erfolgreich gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen', { description: error.message });
    },
  });
}

export interface UserPermission {
  module: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  source: 'role' | 'override';
}

export interface UserPermissionsResponse {
  roleId: string;
  roleName: string;
  permissions: UserPermission[];
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, userId, 'permissions'],
    queryFn: () => api.get<UserPermissionsResponse>(`/users/${userId}/permissions`),
    enabled: !!userId,
  });
}

export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      api.put(`/users/${userId}/password`, { newPassword }),
    onSuccess: () => {
      toast.success('Passwort erfolgreich geändert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Ändern des Passworts', { description: error.message });
    },
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: UserPermission[] }) =>
      api.put(`/users/${userId}/permissions`, { permissions }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId, 'permissions'] });
      toast.success('Berechtigungen gespeichert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Speichern', { description: error.message });
    },
  });
}
