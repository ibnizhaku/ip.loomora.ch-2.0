import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Contract {
  id: string;
  number: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  customerId: string;
  customer?: { id: string; name: string; companyName?: string };
  startDate: string;
  endDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  value: number;
  billingCycle?: string;
  paymentTerms?: string;
  autoRenew: boolean;
  renewalPeriodMonths?: number;
  noticePeriodDays?: number;
  terms?: string;
  attachments?: string[];
  renewalHistory?: ContractRenewal[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractRenewal {
  id: string;
  contractId: string;
  previousEndDate: string;
  newEndDate: string;
  newValue?: number;
  notes?: string;
  renewedAt: string;
  renewedById: string;
  renewedBy?: { id: string; firstName: string; lastName: string };
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
  customerId?: string;
}

// Contracts
export function useContracts(params?: ListParams) {
  return useQuery({
    queryKey: ['contracts', params],
    queryFn: async (): Promise<PaginatedResponse<Contract>> => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      const queryString = searchParams.toString();
      return api.get<PaginatedResponse<Contract>>(`/contracts${queryString ? `?${queryString}` : ''}`);
    },
  });
}

export function useContract(id: string | undefined) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: async (): Promise<Contract | null> => {
      if (!id) return null;
      return api.get<Contract>(`/contracts/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Contract>): Promise<Contract> => {
      return api.post<Contract>('/contracts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contract> }): Promise<Contract> => {
      return api.put<Contract>(`/contracts/${id}`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useRenewContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { newEndDate: string; newValue?: number; notes?: string } }): Promise<Contract> => {
      return api.post<Contract>(`/contracts/${id}/renew`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
    },
  });
}

export function useTerminateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { terminationDate: string; terminationReason?: string } }): Promise<Contract> => {
      return api.post<Contract>(`/contracts/${id}/terminate`, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', id] });
    },
  });
}

// Expiring Contracts
export function useExpiringContracts(days: number = 30) {
  return useQuery({
    queryKey: ['contracts', 'expiring', days],
    queryFn: async (): Promise<Contract[]> => {
      return api.get<Contract[]>(`/contracts/expiring?days=${days}`);
    },
  });
}

// Contract Statistics
export function useContractStats() {
  return useQuery({
    queryKey: ['contracts', 'stats'],
    queryFn: async () => {
      return api.get<{
        totalContracts: number;
        activeContracts: number;
        expiringThisMonth: number;
        totalValue: number;
        monthlyRecurring: number;
      }>('/contracts/stats');
    },
  });
}

// Duplicate contract
export function useDuplicateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Contract>(`/contracts/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}
