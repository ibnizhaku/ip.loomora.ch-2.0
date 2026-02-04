import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Training {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  provider?: string;
  instructor?: string;
  location?: string;
  isOnline: boolean;
  meetingUrl?: string;
  startDate: string;
  endDate?: string;
  duration: number;
  maxParticipants?: number;
  cost?: number;
  status: string;
  materials?: string[];
  prerequisites?: string;
  learningObjectives?: string[];
  participations?: TrainingParticipation[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingParticipation {
  id: string;
  trainingId: string;
  training?: Training;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  status: string;
  registeredAt: string;
  completedAt?: string;
  score?: number;
  certificateUrl?: string;
  feedback?: string;
  rating?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
  category?: string;
}

// Trainings
export function useTrainings(params?: ListParams) {
  return useQuery({
    queryKey: ['trainings', params],
    queryFn: async (): Promise<PaginatedResponse<Training>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.type) searchParams.set('type', params.type);
      if (params?.category) searchParams.set('category', params.category);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<Training>>(`/training${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useTraining(id: string | undefined) {
  return useQuery({
    queryKey: ['trainings', id],
    queryFn: async (): Promise<Training | null> => {
      if (!id) return null;
      return api.get<Training>(`/training/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Training>): Promise<Training> => {
      return api.post<Training>('/training', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Training> }): Promise<Training> => {
      return api.put<Training>(`/training/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['trainings', id] });
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/training/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
}

// Training Participations
export function useTrainingParticipations(params?: { trainingId?: string; employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: ['training-participations', params],
    queryFn: async (): Promise<PaginatedResponse<TrainingParticipation>> => {
      const searchParams = new URLSearchParams();
      if (params?.trainingId) searchParams.set('trainingId', params.trainingId);
      if (params?.employeeId) searchParams.set('employeeId', params.employeeId);
      if (params?.status) searchParams.set('status', params.status);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<TrainingParticipation>>(`/training/participations${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useRegisterForTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { trainingId: string; employeeId: string }): Promise<TrainingParticipation> => {
      return api.post<TrainingParticipation>(`/training/${data.trainingId}/register`, { employeeId: data.employeeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-participations'] });
    },
  });
}

export function useCompleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ participationId, data }: { participationId: string; data: { score?: number; certificateUrl?: string } }): Promise<TrainingParticipation> => {
      return api.put<TrainingParticipation>(`/training/participations/${participationId}/complete`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-participations'] });
    },
  });
}

export function useSubmitTrainingFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ participationId, data }: { participationId: string; data: { feedback: string; rating: number } }): Promise<TrainingParticipation> => {
      return api.put<TrainingParticipation>(`/training/participations/${participationId}/feedback`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['training-participations'] });
    },
  });
}

// Training Statistics
export function useTrainingStats() {
  return useQuery({
    queryKey: ['training', 'stats'],
    queryFn: async () => {
      return api.get<{
        totalTrainings: number;
        upcomingTrainings: number;
        completedThisYear: number;
        totalParticipants: number;
        averageRating: number;
        totalCost: number;
      }>('/training/stats');
    },
  });
}
