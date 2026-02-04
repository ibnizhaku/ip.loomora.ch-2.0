import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SwissdecSubmission {
  id: string;
  reference: string;
  messageType: 'MONTHLY_REPORT' | 'ANNUAL_REPORT' | 'SALARY_CERTIFICATE' | 'CORRECTION';
  status: 'DRAFT' | 'VALIDATED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'ERROR';
  year: number;
  month?: number;
  submittedAt?: string;
  responseCode?: string;
  responseMessage?: string;
  xml?: string;
  createdAt: string;
}

interface SwissdecStatistics {
  year: number;
  totalSubmissions: number;
  accepted: number;
  rejected: number;
  pending: number;
  byMessageType: { type: string; count: number }[];
}

interface SalaryCertificate {
  employeeId: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  socialDeductions: { ahv: number; alv: number; nbu: number; bvg: number };
  otherDeductions: number;
  expenses: number;
  privateCarUsage?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'swissdec';

export function useSwissdecSubmissions(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
  year?: number;
  messageType?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.year) searchParams.set('year', String(params.year));
      if (params?.messageType) searchParams.set('messageType', params.messageType);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<SwissdecSubmission>>(`/swissdec${query ? `?${query}` : ''}`);
    },
  });
}

export function useSwissdecSubmission(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => api.get<SwissdecSubmission>(`/swissdec/${id}`),
    enabled: !!id,
  });
}

export function useSwissdecStatistics(year: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'statistics', year],
    queryFn: () => api.get<SwissdecStatistics>(`/swissdec/statistics/${year}`),
    enabled: !!year,
  });
}

export function useSwissdecXml(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'xml'],
    queryFn: () => api.get<{ xml: string; reference: string }>(`/swissdec/${id}/xml`),
    enabled: false, // Only fetch manually
  });
}

export function useAnnualCertificate(employeeId: string, year: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'certificate', employeeId, year],
    queryFn: () => api.get<SalaryCertificate>(`/swissdec/certificate/${employeeId}/${year}`),
    enabled: !!employeeId && !!year,
  });
}

export function useCreateSwissdecSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { messageType: string; year: number; month?: number; employeeIds?: string[] }) =>
      api.post<SwissdecSubmission>('/swissdec', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useValidateSwissdecSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/swissdec/${id}/validate`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useSubmitSwissdec() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, testMode = true }: { id: string; testMode?: boolean }) =>
      api.post(`/swissdec/${id}/submit?testMode=${testMode}`),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}
