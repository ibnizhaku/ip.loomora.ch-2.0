import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  department?: string;
  location?: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  status: string;
  publishedAt?: string;
  closingDate?: string;
  applicationCount: number;
  candidates?: Candidate[];
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: string;
  rating?: number;
  notes?: string;
  source: string;
  currentPosition?: string;
  currentCompany?: string;
  expectedSalary?: number;
  availableFrom?: string;
  jobPostingId: string;
  jobPosting?: JobPosting;
  interviews?: Interview[];
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  type: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  meetingUrl?: string;
  interviewers: string[];
  status: string;
  feedback?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
}

// Job Postings
export function useJobPostings(params?: ListParams & { department?: string }) {
  return useQuery({
    queryKey: ['job-postings', params],
    queryFn: async (): Promise<PaginatedResponse<JobPosting>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.department) searchParams.set('department', params.department);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<JobPosting>>(`/recruiting/jobs${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useJobPosting(id: string | undefined) {
  return useQuery({
    queryKey: ['job-postings', id],
    queryFn: async (): Promise<JobPosting | null> => {
      if (!id) return null;
      return api.get<JobPosting>(`/recruiting/jobs/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<JobPosting>): Promise<JobPosting> => {
      return api.post<JobPosting>('/recruiting/jobs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    },
  });
}

export function useUpdateJobPosting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JobPosting> }): Promise<JobPosting> => {
      return api.put<JobPosting>(`/recruiting/jobs/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-postings', id] });
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/recruiting/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    },
  });
}

export function usePublishJobPosting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<JobPosting> => {
      return api.post<JobPosting>(`/recruiting/jobs/${id}/publish`, {});
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-postings', id] });
    },
  });
}

// Candidates
export function useCandidates(params?: ListParams & { jobPostingId?: string }) {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: async (): Promise<PaginatedResponse<Candidate>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.jobPostingId) searchParams.set('jobPostingId', params.jobPostingId);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<Candidate>>(`/recruiting/candidates${queryString ? `?${queryString}` : ''}`);
    },
  });
}

// Candidate Pipeline (Kanban view)
export function useCandidatePipeline(jobPostingId?: string) {
  return useQuery({
    queryKey: ['candidates', 'pipeline', jobPostingId],
    queryFn: async () => {
      const params = jobPostingId ? `?jobPostingId=${jobPostingId}` : '';
      return api.get<Record<string, Candidate[]>>(`/recruiting/candidates/pipeline${params}`);
    },
  });
}

// Hire Candidate
export function useHireCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Candidate> => {
      return api.post<Candidate>(`/recruiting/candidates/${id}/hire`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    },
  });
}

export function useCandidate(id: string | undefined) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: async (): Promise<Candidate | null> => {
      if (!id) return null;
      return api.get<Candidate>(`/recruiting/candidates/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Candidate>): Promise<Candidate> => {
      return api.post<Candidate>('/recruiting/candidates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Candidate> }): Promise<Candidate> => {
      return api.put<Candidate>(`/recruiting/candidates/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidates', id] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/recruiting/candidates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    },
  });
}

// Interviews - NOTE: Backend only has POST/PUT for interviews (no GET list endpoint)
// Interviews are fetched via candidate.interviews relation

export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Interview>): Promise<Interview> => {
      return api.post<Interview>('/recruiting/interviews', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Interview> }): Promise<Interview> => {
      return api.put<Interview>(`/recruiting/interviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

// Recruiting Statistics
export function useRecruitingStats() {
  return useQuery({
    queryKey: ['recruiting', 'stats'],
    queryFn: async () => {
      return api.get<{
        openPositions: number;
        totalCandidates: number;
        interviewsThisWeek: number;
        averageTimeToHire: number;
        offerAcceptanceRate: number;
      }>('/recruiting/stats');
    },
  });
}
