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
  login: (credentials: LoginCredentials) => Promise<{ requiresCompanySelection: boolean; availableCompanies?: CompanySummary[]; requires2FA?: boolean; tempToken?: string }>;
  register: (data: RegisterData) => Promise<{ requiresPayment: boolean; checkoutUrl?: string }>;
  logout: () => Promise<void>;
  selectCompany: (companyId: string) => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateActiveCompanyName: (name: string) => void;
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
          // First verify token is still valid by fetching current user
          try {
            const meResponse = await api.get<{
              userId: string;
              email: string;
              companyId: string;
              role: string;
              permissions: string[];
              isOwner: boolean;
            }>('/auth/me');
            
            // Token is valid - load stored data
            const user = JSON.parse(userJson) as UserInfo;
            const activeCompany = companyJson ? JSON.parse(companyJson) as ActiveCompanyInfo : null;
            const availableCompanies = companiesJson ? JSON.parse(companiesJson) as CompanySummary[] : [];

            // Update company info with fresh data from backend
            const updatedCompany = activeCompany && meResponse.companyId ? {
              ...activeCompany,
              role: meResponse.role,
              permissions: meResponse.permissions,
              isOwner: meResponse.isOwner,
            } : activeCompany;

            setState({
              user,
              activeCompany: updatedCompany,
              availableCompanies,
              isAuthenticated: true,
              isLoading: false,
              requiresCompanySelection: !updatedCompany,
            });
          } catch {
            // Token invalid, clear auth and redirect
            clearAuthState();
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        clearAuthState();
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

  const login = async (credentials: LoginCredentials): Promise<{ requiresCompanySelection: boolean; availableCompanies?: CompanySummary[]; requires2FA?: boolean; tempToken?: string }> => {
    const response = await api.post<{
      // Support both old server format (token) and new backend format (accessToken/refreshToken)
      token?: string;
      accessToken?: string;
      refreshToken?: string;
      requires2FA?: boolean;
      tempToken?: string;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        avatarUrl?: string;
        company?: {
          id: string;
          name: string;
        };
      };
      requiresCompanySelection?: boolean;
      availableCompanies?: CompanySummary[];
      activeCompany?: ActiveCompanyInfo;
    }>('/auth/login', credentials);

    // Handle 2FA requirement
    if (response.requires2FA && response.tempToken) {
      return { requiresCompanySelection: false, requires2FA: true, tempToken: response.tempToken };
    }

    // Handle old server format (single token + user with embedded company)
    const accessToken = response.accessToken || response.token;
    const refreshToken = response.refreshToken || response.token; // Use same token if no refresh
    
    if (!accessToken) {
      throw new Error('Login fehlgeschlagen: Kein Token erhalten');
    }

    // Map user info
    const userInfo: UserInfo = {
      id: response.user.id,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      avatarUrl: response.user.avatarUrl,
      status: 'ACTIVE',
    };

    // Map active company from user.company if not provided separately
    const activeCompany: ActiveCompanyInfo | null = response.activeCompany || (response.user.company ? {
      id: response.user.company.id,
      name: response.user.company.name,
      slug: response.user.company.id,
      status: 'ACTIVE',
      subscriptionStatus: 'ACTIVE',
      planName: 'Pro',
      role: response.user.role,
      permissions: ['*'], // Full access for now
      isOwner: response.user.role === 'ADMIN',
    } : null);

    if (response.requiresCompanySelection && response.availableCompanies) {
      // User needs to select a company
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(userInfo));
      localStorage.setItem('auth_companies', JSON.stringify(response.availableCompanies));

      setState({
        user: userInfo,
        activeCompany: null,
        availableCompanies: response.availableCompanies,
        isAuthenticated: false,
        isLoading: false,
        requiresCompanySelection: true,
      });

      return { requiresCompanySelection: true, availableCompanies: response.availableCompanies };
    }

    // Single company or auto-selected - save and authenticate
    saveAuthState(
      userInfo,
      activeCompany,
      response.availableCompanies || [],
      accessToken,
      refreshToken
    );

    setState({
      user: userInfo,
      activeCompany,
      availableCompanies: response.availableCompanies || [],
      isAuthenticated: true,
      isLoading: false,
      requiresCompanySelection: false,
    });

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

  const updateActiveCompanyName = (name: string) => {
    setState(prev => {
      if (!prev.activeCompany) return prev;
      const updated = { ...prev.activeCompany, name };
      localStorage.setItem('auth_company', JSON.stringify(updated));
      return { ...prev, activeCompany: updated };
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    selectCompany,
    switchCompany,
    refreshUser,
    updateActiveCompanyName,
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
