import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface MailAccount {
  id: string;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  isActive: boolean;
}

export function useEmailAccount() {
  const { data, isLoading } = useQuery({
    queryKey: ['mail-account'],
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
