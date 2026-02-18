import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ProjectMember {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    position?: string;
  };
}

interface ProjectTask {
  id: string;
  title?: string;
  name?: string;
  status: string;
  assignee?: string;
}

interface Project {
  id: string;
  number: string;
  name: string;
  description?: string;
  customerId?: string;
  customer?: { id: string; name: string; companyName?: string };
  client?: string;
  managerId?: string;
  manager?: { id: string; firstName: string; lastName: string };
  status: string;
  priority?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  team?: string[];
  members?: ProjectMember[];
  milestones?: any[];
  tasks?: ProjectTask[];
  taskCount?: number;
  timeEntryCount?: number;
  createdAt?: string;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'projects';

export function useProjects(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  customerId?: string;
  managerId?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.managerId) searchParams.set('managerId', params.managerId);
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Project>>(`/projects${query ? `?${query}` : ''}`);
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useProjectStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: () => api.get<ProjectStats>('/projects/stats'),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.post<Project>('/projects', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      api.put<Project>(`/projects/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Project>(`/projects/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, employeeId, role }: { projectId: string; employeeId: string; role?: string }) =>
      api.post(`/projects/${projectId}/members`, { employeeId, role }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      api.delete(`/projects/${projectId}/members/${memberId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export function useAddProjectMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, title, dueDate }: { projectId: string; title: string; dueDate?: string }) =>
      api.post<ProjectMilestone>(`/projects/${projectId}/milestones`, { title, dueDate }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}

export function useUpdateProjectMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, milestoneId, ...data }: { projectId: string; milestoneId: string; title?: string; dueDate?: string; completed?: boolean }) =>
      api.put<ProjectMilestone>(`/projects/${projectId}/milestones/${milestoneId}`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}

export interface ProjectActivity {
  id: string;
  type: string;
  description: string;
  user?: string;
  timestamp: string;
}

export function useProjectActivity(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId, 'activity'],
    queryFn: () => api.get<ProjectActivity[]>(`/projects/${projectId}/activity`),
    enabled: !!projectId,
  });
}

export function useRemoveProjectMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, milestoneId }: { projectId: string; milestoneId: string }) =>
      api.delete(`/projects/${projectId}/milestones/${milestoneId}`),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}
