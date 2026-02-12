import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Company {
  id: string;
  name: string;
  slug?: string;
  legalName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  vatNumber?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  logoUrl?: string;
  qrIban?: string;
  defaultCurrency?: string;
  fiscalYearStart?: number;
  timezone?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
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
