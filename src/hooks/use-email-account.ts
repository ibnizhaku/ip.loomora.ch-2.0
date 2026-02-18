import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface MailAccount {
  id: string;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSsl: boolean;
  isActive: boolean;
}

export interface UpsertMailAccountInput {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword?: string;
  fromName: string;
  fromEmail: string;
  smtpSsl: boolean;
}

const QUERY_KEY = 'mail-account';

export function useEmailAccount() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<MailAccount>('/mail/account'),
    retry: false,
    throwOnError: false,
  });

  return {
    account: data,
    hasEmailAccount: !!(data?.isActive),
    fromEmail: data?.fromEmail ?? '',
    fromName: data?.fromName ?? '',
    isLoading,
  };
}

export function useUpsertMailAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertMailAccountInput) =>
      api.post<MailAccount>('/mail/account', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useTestMailConnection() {
  return useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; message: string }>('/mail/test'),
  });
}
