import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface CompanySettings {
  id: string;
  companyId: string;
  // Lokalisierung
  language?: string;
  timezone?: string;
  dateFormat?: string;
  // Währung
  currency?: string;
  // E-Mail/SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
  smtpFromName?: string;
  smtpSsl?: boolean;
  // Sicherheit
  twoFactorEnabled?: boolean;
  sessionTimeoutMin?: number;
  passwordMinLength?: number;
  // Nummernkreise
  invoicePrefix?: string;
  invoiceNextNumber?: number;
  quotePrefix?: string;
  quoteNextNumber?: number;
  orderPrefix?: string;
  orderNextNumber?: number;
  customerPrefix?: string;
  customerNextNumber?: number;
  projectPrefix?: string;
  projectNextNumber?: number;
  // Benachrichtigungen
  notifyOnNewInvoice?: boolean;
  notifyOnPaymentReceived?: boolean;
  notifyOnContractExpiring?: boolean;
  notifyDaysBeforeExpiry?: number;
  // PDF-Optionen
  pdfLogoPosition?: string;
  pdfShowBankDetails?: boolean;
  pdfFooterText?: string;
  pdfDefaultLanguage?: string;
  // API
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateSettingsInput = Partial<Omit<CompanySettings, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>;

const QUERY_KEY = 'settings';

export function useSettings() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<CompanySettings>('/settings'),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => api.put<CompanySettings>('/settings', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useTestSmtp() {
  return useMutation({
    mutationFn: () => api.post<{ success: boolean; message: string }>('/settings/smtp/test'),
  });
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ apiKey: string }>('/settings/generate-api-key'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
