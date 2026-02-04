import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface GavSettings {
  year: number;
  minRateA: number;
  minRateB: number;
  minRateC: number;
  minRateD: number;
  minRateE: number;
  minRateF: number;
  weeklyHours: number;
  schmutzzulage: number;
  hoehenzulage: number;
  essenszulage: number;
  unterkunftMax: number;
  ueberZeitProzent: number;
  nachtzulageProzent: number;
  sonntagProzent: number;
}

interface GavEmployee {
  id: string;
  employeeId: string;
  employee?: { id: string; firstName: string; lastName: string };
  gavClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  hourlyRate: number;
  isCompliant: boolean;
  validFrom: string;
  validTo?: string;
}

interface GavMinimumRates {
  year: number;
  rates: {
    [key: string]: {
      class: string;
      description: string;
      rate: number;
    };
  };
  weeklyHours: number;
  allowances: {
    schmutzzulage: number;
    hoehenzulage: number;
    essenszulage: number;
    unterkunftMax: number;
  };
  surcharges: {
    overtime: string;
    night: string;
    sunday: string;
  };
}

interface GavComplianceResult {
  compliant: boolean;
  employees: {
    employeeId: string;
    name: string;
    gavClass: string;
    currentRate: number;
    minimumRate: number;
    isCompliant: boolean;
    deviation?: number;
  }[];
  summary: {
    total: number;
    compliant: number;
    nonCompliant: number;
  };
}

interface GavSalaryCalculation {
  grossSalary: number;
  baseHours: number;
  overtimeHours: number;
  nightHours: number;
  sundayHours: number;
  allowances: {
    schmutzzulage?: number;
    hoehenzulage?: number;
    essenszulage?: number;
  };
  surcharges: {
    overtime?: number;
    night?: number;
    sunday?: number;
  };
  total: number;
}

const QUERY_KEY = 'gav-metallbau';

// Settings
export function useGavSettings(year: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'settings', year],
    queryFn: () => api.get<GavSettings>(`/gav-metallbau/settings/${year}`),
    enabled: !!year,
  });
}

export function useUpdateGavSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GavSettings>) => api.put<GavSettings>('/gav-metallbau/settings', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'settings'] }),
  });
}

// Employees
export function useGavEmployees() {
  return useQuery({
    queryKey: [QUERY_KEY, 'employees'],
    queryFn: () => api.get<GavEmployee[]>('/gav-metallbau/employees'),
  });
}

export function useGavEmployee(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, 'employees', id],
    queryFn: () => api.get<GavEmployee>(`/gav-metallbau/employees/${id}`),
    enabled: !!id,
  });
}

export function useAssignGavClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeId: string; gavClass: string; hourlyRate: number; validFrom: string }) =>
      api.post<GavEmployee>('/gav-metallbau/employees', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'employees'] }),
  });
}

export function useUpdateGavClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GavEmployee> }) =>
      api.put<GavEmployee>(`/gav-metallbau/employees/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'employees'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'employees', id] });
    },
  });
}

// Calculations
export function useCalculateGavSalary() {
  return useMutation({
    mutationFn: (data: {
      employeeId: string;
      baseHours: number;
      overtimeHours?: number;
      nightHours?: number;
      sundayHours?: number;
      schmutzzulage?: boolean;
      hoehenzulage?: boolean;
      essenszulage?: number;
    }) => api.post<GavSalaryCalculation>('/gav-metallbau/calculate-salary', data),
  });
}

// Compliance
export function useGavCompliance() {
  return useQuery({
    queryKey: [QUERY_KEY, 'compliance'],
    queryFn: () => api.get<GavComplianceResult>('/gav-metallbau/compliance'),
  });
}

// Info
export function useGavMinimumRates(year?: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'minimum-rates', year],
    queryFn: () => {
      const query = year ? `?year=${year}` : '';
      return api.get<GavMinimumRates>(`/gav-metallbau/minimum-rates${query}`);
    },
  });
}
