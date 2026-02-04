import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Report types matching backend
export type ReportType =
  | 'PROFIT_LOSS'
  | 'BALANCE_SHEET'
  | 'CASH_FLOW'
  | 'VAT_SUMMARY'
  | 'BUDGET_COMPARISON'
  | 'COST_CENTER_ANALYSIS'
  | 'OPEN_ITEMS'
  | 'PAYROLL_SUMMARY'
  | 'GAV_COMPLIANCE'
  | 'WITHHOLDING_TAX'
  | 'EMPLOYEE_COSTS'
  | 'ABSENCE_OVERVIEW'
  | 'PROJECT_PROFITABILITY'
  | 'PRODUCTION_OVERVIEW'
  | 'INVENTORY_VALUATION'
  | 'SALES_ANALYSIS'
  | 'PURCHASE_ANALYSIS';

export type ReportFormat = 'JSON' | 'PDF' | 'CSV' | 'EXCEL';
export type ReportPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';

export interface GenerateReportParams {
  type: ReportType;
  period?: ReportPeriod;
  year: number;
  month?: number;
  quarter?: number;
  startDate?: string;
  endDate?: string;
  format?: ReportFormat;
  costCenterId?: string;
  projectId?: string;
  includeDetails?: boolean;
  compareWithPrevious?: boolean;
}

export interface ReportMetadata {
  type: ReportType;
  title: string;
  period: string;
  generatedAt: string;
  companyName: string;
  currency: string;
}

export interface AvailableReport {
  type: ReportType;
  name: string;
  description: string;
  category: 'financial' | 'hr' | 'operations';
  supportedFormats: ReportFormat[];
}

// Report category definitions
export const reportCategories = {
  financial: {
    label: 'Finanzbuchhaltung',
    description: 'Finanzielle Berichte und Analysen',
  },
  hr: {
    label: 'Personal / HR',
    description: 'Lohnwesen und Personalberichte',
  },
  operations: {
    label: 'Betrieb',
    description: 'Projekt- und Betriebsberichte',
  },
} as const;

// Static report definitions (can be fetched from backend)
export const availableReports: AvailableReport[] = [
  // Financial Reports
  {
    type: 'PROFIT_LOSS',
    name: 'Erfolgsrechnung',
    description: 'Gewinn- und Verlustrechnung nach KMU-Standard',
    category: 'financial',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'BALANCE_SHEET',
    name: 'Bilanz',
    description: 'Vermögensübersicht und Kapitalstruktur',
    category: 'financial',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'VAT_SUMMARY',
    name: 'MWST-Zusammenfassung',
    description: 'Mehrwertsteuer-Abrechnung nach ESTV',
    category: 'financial',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'BUDGET_COMPARISON',
    name: 'Budget-Vergleich',
    description: 'Soll-Ist-Vergleich nach Kostenstellen',
    category: 'financial',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'COST_CENTER_ANALYSIS',
    name: 'Kostenstellenanalyse',
    description: 'Aufwand und Ertrag nach Kostenstellen',
    category: 'financial',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'OPEN_ITEMS',
    name: 'Offene Posten',
    description: 'Debitoren und Kreditoren OP-Liste',
    category: 'financial',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  // HR Reports
  {
    type: 'PAYROLL_SUMMARY',
    name: 'Lohnauswertung',
    description: 'Lohnsummen mit AHV/IV/EO, ALV, BVG Beiträgen',
    category: 'hr',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'GAV_COMPLIANCE',
    name: 'GAV Metallbau',
    description: 'Mindestlohn-Compliance nach Lohnklasse',
    category: 'hr',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'WITHHOLDING_TAX',
    name: 'Quellensteuer',
    description: 'Quellensteuer nach Kanton und Tarif',
    category: 'hr',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'EMPLOYEE_COSTS',
    name: 'Personalkosten',
    description: 'Gesamtkosten pro Mitarbeiter inkl. Arbeitgeberbeiträge',
    category: 'hr',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'ABSENCE_OVERVIEW',
    name: 'Absenzenübersicht',
    description: 'Ferien, Krankheit und andere Abwesenheiten',
    category: 'hr',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  // Operations Reports
  {
    type: 'PROJECT_PROFITABILITY',
    name: 'Projektrentabilität',
    description: 'Umsatz, Kosten und Marge pro Projekt',
    category: 'operations',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'PRODUCTION_OVERVIEW',
    name: 'Produktionsübersicht',
    description: 'Werkstattaufträge und Auslastung',
    category: 'operations',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'INVENTORY_VALUATION',
    name: 'Lagerbewertung',
    description: 'Bestandswert und Umschlagshäufigkeit',
    category: 'operations',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'SALES_ANALYSIS',
    name: 'Verkaufsanalyse',
    description: 'Umsatz nach Kunde, Produkt und Region',
    category: 'operations',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
  {
    type: 'PURCHASE_ANALYSIS',
    name: 'Einkaufsanalyse',
    description: 'Beschaffung nach Lieferant und Kategorie',
    category: 'operations',
    supportedFormats: ['JSON', 'PDF', 'CSV'],
  },
];

// Fetch available reports
export function useAvailableReports() {
  return useQuery({
    queryKey: ['reports', 'available'],
    queryFn: async () => {
      try {
        const data = await api.get<AvailableReport[]>('/reports/available');
        return data;
      } catch {
        // Return static data if API not available
        return availableReports;
      }
    },
    staleTime: 300000, // Cache for 5 minutes
  });
}

// Generate report mutation
export function useGenerateReport() {
  return useMutation({
    mutationFn: async (params: GenerateReportParams) => {
      const response = await api.post('/reports/generate', params);
      return response;
    },
  });
}

// Quick access hooks for specific reports
export function useProfitLossReport(year: number, month?: number) {
  return useQuery({
    queryKey: ['reports', 'profit-loss', year, month],
    queryFn: () => {
      const params = new URLSearchParams({ year: String(year) });
      if (month) params.set('month', String(month));
      return api.get(`/reports/profit-loss?${params.toString()}`);
    },
    enabled: !!year,
  });
}

export function useBalanceSheetReport(year: number) {
  return useQuery({
    queryKey: ['reports', 'balance-sheet', year],
    queryFn: () => api.get(`/reports/balance-sheet?year=${year}`),
    enabled: !!year,
  });
}

export function usePayrollSummaryReport(year: number, month?: number) {
  return useQuery({
    queryKey: ['reports', 'payroll-summary', year, month],
    queryFn: () => {
      const params = new URLSearchParams({ year: String(year) });
      if (month) params.set('month', String(month));
      return api.get(`/reports/payroll-summary?${params.toString()}`);
    },
    enabled: !!year,
  });
}

export function useGavComplianceReport() {
  return useQuery({
    queryKey: ['reports', 'gav-compliance'],
    queryFn: () => api.get('/reports/gav-compliance'),
  });
}

export function useProjectProfitabilityReport(year: number) {
  return useQuery({
    queryKey: ['reports', 'project-profitability', year],
    queryFn: () => api.get(`/reports/project-profitability?year=${year}`),
    enabled: !!year,
  });
}

export function useOpenItemsReport() {
  return useQuery({
    queryKey: ['reports', 'open-items'],
    queryFn: () => api.get('/reports/open-items'),
  });
}

export function useBudgetComparisonReport(year: number) {
  return useQuery({
    queryKey: ['reports', 'budget-comparison', year],
    queryFn: () => api.get(`/reports/budget-comparison?year=${year}`),
    enabled: !!year,
  });
}

export function useSalesAnalysisReport(year: number) {
  return useQuery({
    queryKey: ['reports', 'sales-analysis', year],
    queryFn: () => api.get(`/reports/sales-analysis?year=${year}`),
    enabled: !!year,
  });
}

export function useWithholdingTaxReport(year: number, month?: number) {
  return useQuery({
    queryKey: ['reports', 'withholding-tax', year, month],
    queryFn: () => {
      const params = new URLSearchParams({ year: String(year) });
      if (month) params.set('month', String(month));
      return api.get(`/reports/withholding-tax?${params.toString()}`);
    },
    enabled: !!year,
  });
}
