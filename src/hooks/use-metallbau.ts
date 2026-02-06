import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ============================================
// ENUMS (matching backend)
// ============================================

export enum TimeTypeCode {
  PROJECT = 'PROJECT',
  ORDER = 'ORDER',
  GENERAL = 'GENERAL',
  ADMIN = 'ADMIN',
  TRAINING = 'TRAINING',
  ABSENCE = 'ABSENCE',
}

export enum WorkLocation {
  WERKSTATT = 'WERKSTATT',
  BAUSTELLE = 'BAUSTELLE',
}

export enum ProjectType {
  WERKSTATT = 'WERKSTATT',
  MONTAGE = 'MONTAGE',
  KOMBINIERT = 'KOMBINIERT',
}

export enum ProjectPhaseType {
  PLANUNG = 'PLANUNG',
  FERTIGUNG = 'FERTIGUNG',
  MONTAGE = 'MONTAGE',
  ABSCHLUSS = 'ABSCHLUSS',
}

export enum MachineType {
  LASER = 'LASER',
  PLASMA = 'PLASMA',
  PRESSE = 'PRESSE',
  CNC = 'CNC',
  SAEGE = 'SAEGE',
  BIEGE = 'BIEGE',
  SCHWEISS = 'SCHWEISS',
  BOHR = 'BOHR',
  FRAES = 'FRAES',
  SCHLEIF = 'SCHLEIF',
  SONSTIGE = 'SONSTIGE',
}

export enum MachineStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export enum CostType {
  LABOR = 'LABOR',
  MACHINE = 'MACHINE',
  MATERIAL = 'MATERIAL',
  EXTERNAL = 'EXTERNAL',
  OVERHEAD = 'OVERHEAD',
}

export enum SurchargeType {
  MONTAGE = 'MONTAGE',
  NACHT = 'NACHT',
  SAMSTAG = 'SAMSTAG',
  SONNTAG = 'SONNTAG',
  FEIERTAG = 'FEIERTAG',
  HOEHE = 'HOEHE',
  SCHMUTZ = 'SCHMUTZ',
}

// ============================================
// INTERFACES
// ============================================

export interface TimeType {
  id: string;
  code: TimeTypeCode;
  name: string;
  description?: string;
  isProjectRelevant: boolean;
  isBillable: boolean;
  affectsCapacity: boolean;
}

export interface ActivityType {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  phaseType: ProjectPhaseType;
  sequence: number;
  budgetAmount: number;
  actualAmount: number;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  isCompleted: boolean;
}

export interface Machine {
  id: string;
  name: string;
  machineType: MachineType;
  costCenterId?: string;
  costCenter?: { id: string; name: string; number: string };
  hourlyRate: number;
  purchaseValue?: number;
  currentBookValue?: number;
  status: MachineStatus;
  notes?: string;
}

export interface ProjectCostEntry {
  id: string;
  projectId: string;
  projectPhaseId?: string;
  entryDate: string;
  costType: CostType;
  sourceType: string;
  sourceId: string;
  amount: number;
  isDirectCost: boolean;
  description?: string;
  project?: { id: string; name: string; number: string };
  projectPhase?: { id: string; name: string; phaseType: ProjectPhaseType };
}

export interface ProjectControlling {
  projectId: string;
  projectName: string;
  projectNumber: string;
  projectType: ProjectType;
  status: string;
  
  budgetTotal: number;
  actualCostTotal: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
  
  laborCosts: number;
  machineCosts: number;
  materialCosts: number;
  externalCosts: number;
  overheadCosts: number;
  
  revenueTotal: number;
  deckungsbeitrag: number;
  margin: number;
  marginPercent: number;
  
  status_color: 'green' | 'yellow' | 'red';
  warnings: string[];
  
  phases: Array<{
    id: string;
    name: string;
    phaseType: ProjectPhaseType;
    budgetAmount: number;
    actualAmount: number;
    isCompleted: boolean;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// QUERY KEYS
// ============================================

const KEYS = {
  timeTypes: ['metallbau', 'time-types'],
  activityTypes: ['metallbau', 'activity-types'],
  machines: ['metallbau', 'machines'],
  projectPhases: (projectId: string) => ['metallbau', 'project-phases', projectId],
  projectControlling: (projectId: string) => ['metallbau', 'controlling', projectId],
  costEntries: ['metallbau', 'cost-entries'],
  budgetLines: (projectId: string) => ['metallbau', 'budget-lines', projectId],
};

// ============================================
// TIME TYPES
// ============================================

export function useTimeTypes() {
  return useQuery({
    queryKey: KEYS.timeTypes,
    queryFn: () => api.get<TimeType[]>('/metallbau/time-types'),
  });
}

export function useSeedTimeTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<TimeType[]>('/metallbau/time-types/seed'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.timeTypes }),
  });
}

// ============================================
// ACTIVITY TYPES
// ============================================

export function useActivityTypes() {
  return useQuery({
    queryKey: KEYS.activityTypes,
    queryFn: () => api.get<ActivityType[]>('/metallbau/activity-types'),
  });
}

export function useSeedActivityTypes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ActivityType[]>('/metallbau/activity-types/seed'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.activityTypes }),
  });
}

// ============================================
// PROJECT PHASES
// ============================================

export function useProjectPhases(projectId: string) {
  return useQuery({
    queryKey: KEYS.projectPhases(projectId),
    queryFn: () => api.get<ProjectPhase[]>(`/metallbau/projects/${projectId}/phases`),
    enabled: !!projectId,
  });
}

export function useCreateProjectPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<ProjectPhase> }) =>
      api.post<ProjectPhase>(`/metallbau/projects/${projectId}/phases`, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: KEYS.projectPhases(projectId) });
    },
  });
}

export function useCreateDefaultPhases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, projectType }: { projectId: string; projectType: ProjectType }) =>
      api.post<ProjectPhase[]>(`/metallbau/projects/${projectId}/phases/default`, { projectType }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: KEYS.projectPhases(projectId) });
    },
  });
}

export function useUpdateProjectPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectPhase> }) =>
      api.put<ProjectPhase>(`/metallbau/phases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metallbau', 'project-phases'] });
    },
  });
}

// ============================================
// MACHINES
// ============================================

export function useMachines(params?: { machineType?: MachineType; status?: MachineStatus }) {
  return useQuery({
    queryKey: [...KEYS.machines, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.machineType) searchParams.set('machineType', params.machineType);
      if (params?.status) searchParams.set('status', params.status);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<Machine>>(`/metallbau/machines${query ? `?${query}` : ''}`);
    },
  });
}

export function useMachine(id: string) {
  return useQuery({
    queryKey: [...KEYS.machines, id],
    queryFn: () => api.get<Machine>(`/metallbau/machines/${id}`),
    enabled: !!id,
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Machine>) => api.post<Machine>('/metallbau/machines', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.machines }),
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Machine> }) =>
      api.put<Machine>(`/metallbau/machines/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.machines }),
  });
}

// ============================================
// MACHINE BOOKINGS
// ============================================

export interface CreateMachineBookingData {
  machineId: string;
  projectId: string;
  projectPhaseId?: string;
  bookingDate?: string;
  durationHours: number;
  operatorId?: string;
  description?: string;
}

export function useCreateMachineBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMachineBookingData) => api.post('/metallbau/machine-bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.costEntries });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============================================
// MATERIAL CONSUMPTION
// ============================================

export interface CreateMaterialConsumptionData {
  productId: string;
  projectId: string;
  projectPhaseId?: string;
  consumptionDate?: string;
  quantity: number;
  unit: string;
  consumptionType?: 'PRODUCTION' | 'SCRAP' | 'RETURN';
  scrapQuantity?: number;
  warehouseId?: string;
  description?: string;
}

export function useCreateMaterialConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterialConsumptionData) => api.post('/metallbau/material-consumptions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.costEntries });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============================================
// METALLBAU TIME ENTRIES (Duale Zeiterfassung)
// ============================================

export interface CreateMetallbauTimeEntryData {
  date: string;
  duration: number; // minutes
  timeTypeCode: TimeTypeCode;
  activityTypeId?: string;
  costCenterId: string;
  projectId?: string;
  projectPhaseId?: string;
  taskId?: string;
  workLocation?: WorkLocation;
  machineId?: string;
  baseHourlyRate?: number;
  description?: string;
  surcharges?: SurchargeType[];
}

export function useCreateMetallbauTimeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMetallbauTimeEntryData) => api.post('/metallbau/time-entries', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: KEYS.costEntries });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ============================================
// PROJECT COST ENTRIES
// ============================================

export function useProjectCostEntries(params?: {
  projectId?: string;
  costType?: CostType;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: [...KEYS.costEntries, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.projectId) searchParams.set('projectId', params.projectId);
      if (params?.costType) searchParams.set('costType', params.costType);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      const query = searchParams.toString();
      return api.get<PaginatedResponse<ProjectCostEntry>>(`/metallbau/cost-entries${query ? `?${query}` : ''}`);
    },
  });
}

// ============================================
// PROJECT CONTROLLING
// ============================================

export function useProjectControlling(projectId: string) {
  return useQuery({
    queryKey: KEYS.projectControlling(projectId),
    queryFn: () => api.get<ProjectControlling>(`/metallbau/projects/${projectId}/controlling`),
    enabled: !!projectId,
  });
}

// ============================================
// BUDGET LINES
// ============================================

export interface ProjectBudgetLine {
  id: string;
  projectId: string;
  projectPhaseId?: string;
  costType: CostType;
  description: string;
  plannedQuantity: number;
  plannedUnitPrice: number;
  plannedTotal: number;
  projectPhase?: { id: string; name: string };
}

export function useProjectBudgetLines(projectId: string) {
  return useQuery({
    queryKey: KEYS.budgetLines(projectId),
    queryFn: () => api.get<ProjectBudgetLine[]>(`/metallbau/projects/${projectId}/budget-lines`),
    enabled: !!projectId,
  });
}

export function useCreateBudgetLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ProjectBudgetLine, 'id' | 'plannedTotal' | 'projectPhase'>) =>
      api.post<ProjectBudgetLine>('/metallbau/budget-lines', data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: KEYS.budgetLines(data.projectId) });
    },
  });
}
