import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface SetupResponse {
  secret: string;
  qrCode: string;
  manualEntry: string;
}

interface VerifyResponse {
  success: boolean;
  recoveryCodes: string[];
  message: string;
}

interface AuthenticateResponse {
  accessToken: string;
  refreshToken: string;
  success: boolean;
  method: 'totp' | 'recovery';
  remainingRecoveryCodes?: number;
  user: any;
  activeCompany?: any;
  availableCompanies?: any[];
  requiresCompanySelection?: boolean;
}

interface StatusResponse {
  enabled: boolean;
  recoveryCodesRemaining: number;
}

export function use2FASetup() {
  return useMutation({
    mutationFn: () => api.post<SetupResponse>('/auth/2fa/setup'),
    onError: (error: Error) => {
      toast.error('2FA Setup fehlgeschlagen', { description: error.message });
    },
  });
}

export function use2FAVerify() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.post<VerifyResponse>('/auth/2fa/verify', { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      toast.success('2FA erfolgreich aktiviert');
    },
    onError: (error: Error) => {
      toast.error('Verifizierung fehlgeschlagen', { description: error.message });
    },
  });
}

export function use2FAAuthenticate() {
  return useMutation({
    mutationFn: ({ tempToken, code }: { tempToken: string; code: string }) =>
      api.post<AuthenticateResponse>('/auth/2fa/authenticate', { tempToken, code }),
    onError: (error: Error) => {
      toast.error('2FA-Code ungültig', { description: error.message });
    },
  });
}

export function use2FADisable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.post('/auth/2fa/disable', { code }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      toast.success('2FA deaktiviert');
    },
    onError: (error: Error) => {
      toast.error('Deaktivierung fehlgeschlagen', { description: error.message });
    },
  });
}

export function use2FAAdminReset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post(`/auth/2fa/admin-reset/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('2FA wurde zurückgesetzt');
    },
    onError: (error: Error) => {
      toast.error('Zurücksetzen fehlgeschlagen', { description: error.message });
    },
  });
}

export function use2FAStatus() {
  return useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => api.get<StatusResponse>('/auth/2fa/status'),
  });
}
