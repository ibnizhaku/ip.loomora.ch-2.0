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
  // Nummernkreise
  invoicePrefix?: string;
  invoiceNextNumber?: number;
  quotePrefix?: string;
  quoteNextNumber?: number;
  orderPrefix?: string;
  orderNextNumber?: number;
  deliveryNotePrefix?: string;
  creditNotePrefix?: string;
  purchaseOrderPrefix?: string;
  customerPrefix?: string;
  customerNextNumber?: number;
  projectPrefix?: string;
  projectNextNumber?: number;
  // PDF-Optionen
  logoPosition?: string;
  pdfLogoPosition?: string;
  headerColor?: string;
  footerLeft?: string;
  footerRight?: string;
  pdfFooterText?: string;
  pdfShowBankDetails?: boolean;
  pdfDefaultLanguage?: string;
  enableQrInvoice?: boolean;
  enablePdfA?: boolean;
  defaultPaymentTerms?: number;
  // Benachrichtigungen
  emailNotifications?: boolean;
  invoiceReminders?: boolean;
  projectUpdates?: boolean;
  notifyOnNewInvoice?: boolean;
  notifyOnPaymentReceived?: boolean;
  notifyOnContractExpiring?: boolean;
  notifyDaysBeforeExpiry?: number;
  // Sicherheit
  twoFactorEnabled?: boolean;
  sessionTimeoutMin?: number;
  passwordMinLength?: number;
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

export function useGenerateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ apiKey: string }>('/settings/generate-api-key'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
