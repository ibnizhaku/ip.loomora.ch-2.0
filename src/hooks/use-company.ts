import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Company {
  id: string;
  name: string;
  legalName?: string;
  vatNumber?: string;
  uid?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  bankName?: string;
  iban?: string;
  bic?: string;
  qrIban?: string;
  defaultCurrency?: string;
  fiscalYearStart?: number;
  timezone?: string;
  createdAt: string;
}

const QUERY_KEY = 'company';

export function useCompany() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<Company>('/company'),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Company>) => api.put<Company>('/company', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
