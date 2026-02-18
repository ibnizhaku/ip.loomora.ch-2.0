// API Client for backend communication
// Default to relative /api so it works on the deployed domain (e.g. https://app.loomora.ch)
// and can be proxied in development/preview to avoid CORS.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  companyName: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    this.accessToken = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    const userJson = localStorage.getItem('auth_user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
      } catch {
        this.user = null;
      }
    }
  }

  setAuth(data: AuthResponse) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = data.user;
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }

  clearAuth() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_company');
    localStorage.removeItem('auth_companies');
  }

  getToken() {
    return this.accessToken;
  }

  getUser() {
    return this.user;
  }

  /**
   * Prüft ob ein JWT-Token abgelaufen ist (oder in den nächsten `bufferSeconds` abläuft).
   * Dekodiert nur den Payload (Base64), keine Signaturprüfung nötig (Sicherheit liegt beim Backend).
   */
  private isTokenExpiredOrExpiringSoon(token: string, bufferSeconds = 60): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const payload = JSON.parse(atob(payloadBase64));
      if (!payload.exp) return true;
      return Date.now() >= (payload.exp * 1000) - bufferSeconds * 1000;
    } catch {
      return true;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Always read the latest token from localStorage (AuthContext may have updated it)
    let token = this.accessToken || localStorage.getItem('auth_token');
    const currentRefreshToken = this.refreshToken || localStorage.getItem('refresh_token');

    // Proaktiver Token-Refresh: Token abgelaufen oder läuft in <60s ab → vor dem Request erneuern
    if (token && currentRefreshToken && endpoint !== '/auth/refresh' && this.isTokenExpiredOrExpiringSoon(token)) {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        token = this.accessToken;
      } else {
        this.clearAuth();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch {
      // Most common cause in preview/dev is CORS or the backend being unreachable.
      throw new Error('Backend nicht erreichbar. Bitte prüfen Sie die Verbindung oder versuchen Sie es später erneut.');
    }

    // Reaktiver Fallback: Falls trotzdem 401 kommt (Race Condition, etc.)
    if (response.status === 401 && currentRefreshToken && endpoint !== '/auth/refresh') {
      const refreshed = await this.tryRefreshToken();
      if (refreshed) {
        // Retry the original request
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(url, { ...options, headers }).catch(() => null);
        if (retryResponse?.ok) {
          return retryResponse.json();
        }
      }
      // Refresh failed, clear auth
      this.clearAuth();
      window.location.href = '/login';
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Unknown error',
        message: response.statusText,
      }));
      const msg = error.message || error.error;
      const err = new Error(msg) as Error & { statusCode?: number };
      err.statusCode = response.status;
      throw err;
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text);
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.refreshToken || localStorage.getItem('refresh_token');
    const userJson = localStorage.getItem('auth_user');
    const user = this.user || (userJson ? JSON.parse(userJson) : null);
    if (!refreshToken || !user) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.setAuth(data);
        return true;
      }
    } catch {
      // Refresh failed
    }
    return false;
  }

  // GET request
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // UPLOAD request (multipart/form-data – browser sets Content-Type with boundary)
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.accessToken || localStorage.getItem('auth_token');

    const headers: Record<string, string> = {};
    // Do NOT set Content-Type – the browser will set it with the correct boundary
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
    } catch {
      throw new Error('Backend nicht erreichbar. Bitte prüfen Sie die Verbindung oder versuchen Sie es später erneut.');
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Unknown error',
        message: response.statusText,
      }));
      throw new Error(error.message || error.error);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth helpers
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    api.setAuth(response);
    return response;
  },

  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName: string;
  }) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    api.setAuth(response);
    return response;
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    api.clearAuth();
  },
  
  isAuthenticated: () => {
    return !!(api.getToken() || localStorage.getItem('auth_token'));
  },

  getUser: () => {
    return api.getUser();
  },
};

// PDF & E-Mail helpers
export async function downloadPdf(
  entityType: 'invoices' | 'quotes' | 'credit-notes' | 'delivery-notes' | 'reminders',
  entityId: string,
  filename?: string
) {
  const token = api.getToken() || localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/${entityType}/${entityId}/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error('PDF-Generierung fehlgeschlagen');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${entityType}-${entityId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function sendEmail(
  entityType: 'invoices' | 'quotes' | 'reminders',
  entityId: string
) {
  const token = api.getToken() || localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/${entityType}/${entityId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'E-Mail-Versand fehlgeschlagen');
  }
  
  return response.json();
}
