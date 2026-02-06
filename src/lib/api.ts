// API Client for backend communication
import { getMockData } from './mock-data';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock-Modus: Aktiviert wenn Backend nicht erreichbar
let useMockData = false;
let mockModeChecked = false;

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
  }

  getToken() {
    return this.accessToken;
  }

  getUser() {
    return this.user;
  }

  isMockMode() {
    return useMockData;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Bei Mock-Modus direkt Mock-Daten zurückgeben (nur für GET)
    if (useMockData && options.method === 'GET') {
      console.log(`[MockMode] Verwende Mock-Daten für: ${endpoint}`);
      return getMockData(endpoint) as T;
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token refresh on 401
      if (response.status === 401 && this.refreshToken && endpoint !== '/auth/refresh') {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry the original request
          (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          if (retryResponse.ok) {
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
        throw new Error(error.message || error.error);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      return JSON.parse(text);
    } catch (error) {
      // Bei Netzwerkfehler: Aktiviere Mock-Modus und versuche erneut
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        if (!mockModeChecked) {
          mockModeChecked = true;
          useMockData = true;
          console.warn('[API] Backend nicht erreichbar - Mock-Modus aktiviert');
        }
        
        // Nur für GET-Anfragen Mock-Daten zurückgeben
        if (options.method === 'GET' || !options.method) {
          console.log(`[MockMode] Verwende Mock-Daten für: ${endpoint}`);
          return getMockData(endpoint) as T;
        }
        
        // Für Schreiboperationen Fehler werfen
        throw new Error('Backend nicht erreichbar. Schreiboperationen sind im Mock-Modus nicht verfügbar.');
      }
      throw error;
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (!this.refreshToken || !this.user) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.user.id,
          refreshToken: this.refreshToken,
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
    return !!api.getToken();
  },

  getUser: () => {
    return api.getUser();
  },
};
