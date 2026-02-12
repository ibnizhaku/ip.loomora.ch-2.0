import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export function useCompanyTeam() {
  return useQuery({
    queryKey: ['company-team'],
    queryFn: () => api.get<TeamMember[]>('/company/team'),
  });
}

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; role: string }) => api.post<TeamMember>('/company/team', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-team'] }),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/company/team/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-team'] }),
  });
}
