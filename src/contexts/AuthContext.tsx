import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, auth } from '@/lib/api';

// Types matching backend DTOs
export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: string;
}

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  isOwner: boolean;
}

export interface ActiveCompanyInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  planName: string;
  role: string;
  permissions: string[];
  isOwner: boolean;
}

export interface AuthState {
  user: UserInfo | null;
  activeCompany: ActiveCompanyInfo | null;
  availableCompanies: CompanySummary[];
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresCompanySelection: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  companySlug?: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ requiresCompanySelection: boolean; availableCompanies?: CompanySummary[] }>;
  register: (data: RegisterData) => Promise<{ requiresPayment: boolean; checkoutUrl?: string }>;
  logout: () => Promise<void>;
  selectCompany: (companyId: string) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    activeCompany: null,
    availableCompanies: [],
    isAuthenticated: false,
    isLoading: true,
    requiresCompanySelection: false,
  });

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userJson = localStorage.getItem('auth_user');
        const companyJson = localStorage.getItem('auth_company');
        const companiesJson = localStorage.getItem('auth_companies');

        if (token && userJson) {
          const user = JSON.parse(userJson) as UserInfo;
          const activeCompany = companyJson ? JSON.parse(companyJson) as ActiveCompanyInfo : null;
          const availableCompanies = companiesJson ? JSON.parse(companiesJson) as CompanySummary[] : [];

          setState({
            user,
            activeCompany,
            availableCompanies,
            isAuthenticated: true,
            isLoading: false,
            requiresCompanySelection: !activeCompany,
          });

          // Verify token is still valid by fetching current user
          try {
            const meResponse = await api.get<{
              userId: string;
              email: string;
              companyId: string;
              role: string;
              permissions: string[];
              isOwner: boolean;
            }>('/auth/me');
            
            // Token is valid, update company info if available
            if (meResponse.companyId && activeCompany) {
              setState(prev => ({
                ...prev,
                activeCompany: {
                  ...activeCompany,
                  role: meResponse.role,
                  permissions: meResponse.permissions,
                  isOwner: meResponse.isOwner,
                },
              }));
            }
          } catch {
            // Token invalid, clear auth
            clearAuthState();
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  const saveAuthState = (
    user: UserInfo,
    activeCompany: ActiveCompanyInfo | null,
    availableCompanies: CompanySummary[],
    accessToken: string,
    refreshToken: string
  ) => {
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
    if (activeCompany) {
      localStorage.setItem('auth_company', JSON.stringify(activeCompany));
    }
    if (availableCompanies.length > 0) {
      localStorage.setItem('auth_companies', JSON.stringify(availableCompanies));
    }
  };

  const clearAuthState = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_company');
    localStorage.removeItem('auth_companies');
    api.clearAuth();

    setState({
      user: null,
      activeCompany: null,
      availableCompanies: [],
      isAuthenticated: false,
      isLoading: false,
      requiresCompanySelection: false,
    });
  };

  const login = async (credentials: LoginCredentials): Promise<{ requiresCompanySelection: boolean; availableCompanies?: CompanySummary[] }> => {
    const response = await api.post<{
      accessToken?: string;
      refreshToken?: string;
      user: UserInfo;
      requiresCompanySelection?: boolean;
      availableCompanies?: CompanySummary[];
      activeCompany?: ActiveCompanyInfo;
    }>('/auth/login', credentials);

    if (response.requiresCompanySelection && response.availableCompanies) {
      // User needs to select a company
      // Save temporary token for company selection
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem('auth_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        localStorage.setItem('auth_companies', JSON.stringify(response.availableCompanies));
      }

      setState({
        user: response.user,
        activeCompany: null,
        availableCompanies: response.availableCompanies,
        isAuthenticated: false,
        isLoading: false,
        requiresCompanySelection: true,
      });

      return { requiresCompanySelection: true, availableCompanies: response.availableCompanies };
    }

    // Single company or auto-selected
    if (response.accessToken && response.refreshToken && response.activeCompany) {
      saveAuthState(
        response.user,
        response.activeCompany,
        response.availableCompanies || [],
        response.accessToken,
        response.refreshToken
      );

      setState({
        user: response.user,
        activeCompany: response.activeCompany,
        availableCompanies: response.availableCompanies || [],
        isAuthenticated: true,
        isLoading: false,
        requiresCompanySelection: false,
      });
    }

    return { requiresCompanySelection: false };
  };

  const register = async (data: RegisterData): Promise<{ requiresPayment: boolean; checkoutUrl?: string }> => {
    const response = await api.post<{
      user: UserInfo;
      company: { id: string; name: string; slug: string; status: string };
      requiresPayment: boolean;
      checkoutUrl?: string;
      temporaryToken?: string;
    }>('/auth/register', data);

    // After registration, user typically needs to pay or verify
    if (response.temporaryToken) {
      localStorage.setItem('temp_token', response.temporaryToken);
    }

    return {
      requiresPayment: response.requiresPayment,
      checkoutUrl: response.checkoutUrl,
    };
  };

  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout errors
    }
    clearAuthState();
  };

  const selectCompany = async (companyId: string): Promise<void> => {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: UserInfo;
      activeCompany: ActiveCompanyInfo;
    }>('/auth/select-company', { companyId });

    saveAuthState(
      response.user,
      response.activeCompany,
      state.availableCompanies,
      response.accessToken,
      response.refreshToken
    );

    setState(prev => ({
      ...prev,
      user: response.user,
      activeCompany: response.activeCompany,
      isAuthenticated: true,
      requiresCompanySelection: false,
    }));
  };

  const switchCompany = async (companyId: string): Promise<void> => {
    const response = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: UserInfo;
      activeCompany: ActiveCompanyInfo;
    }>('/auth/switch-company', { companyId });

    saveAuthState(
      response.user,
      response.activeCompany,
      state.availableCompanies,
      response.accessToken,
      response.refreshToken
    );

    setState(prev => ({
      ...prev,
      user: response.user,
      activeCompany: response.activeCompany,
    }));
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get<{
        userId: string;
        email: string;
        companyId: string;
        role: string;
        permissions: string[];
        isOwner: boolean;
      }>('/auth/me');

      if (state.activeCompany) {
        setState(prev => ({
          ...prev,
          activeCompany: prev.activeCompany ? {
            ...prev.activeCompany,
            role: response.role,
            permissions: response.permissions,
            isOwner: response.isOwner,
          } : null,
        }));
      }
    } catch {
      // If refresh fails, clear auth
      clearAuthState();
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    selectCompany,
    switchCompany,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
