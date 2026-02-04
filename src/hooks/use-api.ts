import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Dashboard KPIs type
interface DashboardKPIs {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    percentChange: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
  };
  invoices: {
    total: number;
    open: number;
    overdue: number;
    openAmount: number;
  };
  employees: {
    total: number;
    activeAbsences: number;
    totalHoursThisMonth: number;
  };
}

// Fetch dashboard KPIs (read-only)
export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => api.get<DashboardKPIs>('/dashboard/kpis'),
    staleTime: 60000, // Cache for 1 minute
  });
}

// Project type for projects list
interface Project {
  id: string;
  number: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  customer?: {
    id: string;
    name: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Fetch projects
export function useProjects(params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);

  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.get<PaginatedResponse<Project>>(`/projects?${searchParams.toString()}`),
  });
}

// Fetch single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.post<Project>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      api.put<Project>(`/projects/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Task type
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: string;
  assigneeId?: string;
}

// Fetch tasks
export function useTasks(params: { projectId?: string; status?: string; assigneeId?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.projectId) searchParams.set('projectId', params.projectId);
  if (params.status) searchParams.set('status', params.status);
  if (params.assigneeId) searchParams.set('assigneeId', params.assigneeId);

  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => api.get<PaginatedResponse<Task>>(`/tasks?${searchParams.toString()}`),
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Task>) => api.post<Task>('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      api.put<Task>(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Time entry type
interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description?: string;
  projectId?: string;
  taskId?: string;
  employeeId: string;
}

// Fetch time entries
export function useTimeEntries(params: { employeeId?: string; projectId?: string; startDate?: string; endDate?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.employeeId) searchParams.set('employeeId', params.employeeId);
  if (params.projectId) searchParams.set('projectId', params.projectId);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  return useQuery({
    queryKey: ['time-entries', params],
    queryFn: () => api.get<PaginatedResponse<TimeEntry>>(`/time-entries?${searchParams.toString()}`),
  });
}

// Create time entry
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<TimeEntry>) => api.post<TimeEntry>('/time-entries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Employee type
interface Employee {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  employmentType: string;
  workloadPercent: number;
  hireDate: string;
}

// Fetch employees
export function useEmployees(params: { department?: string; search?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.department) searchParams.set('department', params.department);
  if (params.search) searchParams.set('search', params.search);

  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api.get<PaginatedResponse<Employee>>(`/employees?${searchParams.toString()}`),
  });
}

// Fetch single employee
export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => api.get<Employee>(`/employees/${id}`),
    enabled: !!id,
  });
}

// Calendar event type
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  isAllDay: boolean;
}

// Fetch calendar events
export function useCalendarEvents(params: { startDate?: string; endDate?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  return useQuery({
    queryKey: ['calendar', params],
    queryFn: () => api.get<CalendarEvent[]>(`/calendar?${searchParams.toString()}`),
  });
}

// Create calendar event
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>('/calendar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
