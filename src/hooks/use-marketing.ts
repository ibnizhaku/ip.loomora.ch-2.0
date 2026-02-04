import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  targetAudience?: string;
  channels: string[];
  goals?: string;
  kpis?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: string;
  score: number;
  notes?: string;
  lastContactDate?: string;
  expectedValue?: number;
  probability?: number;
  assignedToId?: string;
  assignedTo?: { id: string; firstName: string; lastName: string };
  campaignId?: string;
  campaign?: Campaign;
  activities?: LeadActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: string;
  subject: string;
  description?: string;
  date: string;
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
  createdById: string;
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  unsubscribeCount: number;
  campaignId?: string;
  campaign?: Campaign;
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
  type?: string;
}

const buildQueryString = (params?: ListParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.type) searchParams.set('type', params.type);
  return searchParams.toString();
};

// Campaigns
export function useCampaigns(params?: ListParams) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: async (): Promise<PaginatedResponse<Campaign>> => {
      const queryString = buildQueryString(params);
      return api.get<PaginatedResponse<Campaign>>(`/marketing/campaigns${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async (): Promise<Campaign | null> => {
      if (!id) return null;
      return api.get<Campaign>(`/marketing/campaigns/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Campaign>): Promise<Campaign> => {
      return api.post<Campaign>('/marketing/campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Campaign> }): Promise<Campaign> => {
      return api.put<Campaign>(`/marketing/campaigns/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/marketing/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

// Leads
export function useLeads(params?: ListParams & { assignedToId?: string; campaignId?: string }) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: async (): Promise<PaginatedResponse<Lead>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.assignedToId) searchParams.set('assignedToId', params.assignedToId);
      if (params?.campaignId) searchParams.set('campaignId', params.campaignId);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<Lead>>(`/marketing/leads${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async (): Promise<Lead | null> => {
      if (!id) return null;
      return api.get<Lead>(`/marketing/leads/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Lead>): Promise<Lead> => {
      return api.post<Lead>('/marketing/leads', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }): Promise<Lead> => {
      return api.put<Lead>(`/marketing/leads/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', id] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/marketing/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Lead Activities
export function useCreateLeadActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<LeadActivity>): Promise<LeadActivity> => {
      return api.post<LeadActivity>(`/marketing/leads/${data.leadId}/activities`, data);
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['leads', data.leadId] });
    },
  });
}

// Email Campaigns
export function useEmailCampaigns(params?: ListParams & { campaignId?: string }) {
  return useQuery({
    queryKey: ['email-campaigns', params],
    queryFn: async (): Promise<PaginatedResponse<EmailCampaign>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.campaignId) searchParams.set('campaignId', params.campaignId);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<EmailCampaign>>(`/marketing/email-campaigns${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EmailCampaign>): Promise<EmailCampaign> => {
      return api.post<EmailCampaign>('/marketing/email-campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    },
  });
}

export function useSendEmailCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<EmailCampaign> => {
      return api.post<EmailCampaign>(`/marketing/email-campaigns/${id}/send`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
    },
  });
}

// Marketing Statistics
export function useMarketingStats() {
  return useQuery({
    queryKey: ['marketing', 'stats'],
    queryFn: async () => {
      return api.get<{
        totalCampaigns: number;
        activeCampaigns: number;
        totalLeads: number;
        qualifiedLeads: number;
        totalBudget: number;
        totalSpent: number;
        conversionRate: number;
      }>('/marketing/stats');
    },
  });
}
