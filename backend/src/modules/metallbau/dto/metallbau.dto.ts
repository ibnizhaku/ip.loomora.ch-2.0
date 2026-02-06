import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean, IsEnum, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

// ============================================
// ENUMS (matching Prisma schema)
// ============================================

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

export enum ConsumptionType {
  PRODUCTION = 'PRODUCTION',
  SCRAP = 'SCRAP',
  RETURN = 'RETURN',
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
// TIME TYPE DTOs
// ============================================

export class CreateTimeTypeDto {
  @ApiProperty({ enum: TimeTypeCode })
  @IsEnum(TimeTypeCode)
  code: TimeTypeCode;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isProjectRelevant?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  affectsCapacity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultCostCenterId?: string;
}

// ============================================
// PROJECT PHASE DTOs
// ============================================

export class CreateProjectPhaseDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ProjectPhaseType })
  @IsEnum(ProjectPhaseType)
  phaseType: ProjectPhaseType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  sequence?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  plannedStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  plannedEnd?: string;
}

export class UpdateProjectPhaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  plannedStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  plannedEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

// ============================================
// MACHINE DTOs
// ============================================

export class CreateMachineDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: MachineType, default: MachineType.SONSTIGE })
  @IsOptional()
  @IsEnum(MachineType)
  machineType?: MachineType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  costCenterId?: string;

  @ApiProperty({ description: 'Maschinenstundensatz in CHF' })
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usefulLifeYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maintenanceCostYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  energyCostHour?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMachineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: MachineType })
  @IsOptional()
  @IsEnum(MachineType)
  machineType?: MachineType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ enum: MachineStatus })
  @IsOptional()
  @IsEnum(MachineStatus)
  status?: MachineStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  currentBookValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MachineQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: MachineType })
  @IsOptional()
  @IsEnum(MachineType)
  machineType?: MachineType;

  @ApiPropertyOptional({ enum: MachineStatus })
  @IsOptional()
  @IsEnum(MachineStatus)
  status?: MachineStatus;
}

// ============================================
// MACHINE BOOKING DTOs
// ============================================

export class CreateMachineBookingDto {
  @ApiProperty()
  @IsString()
  machineId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectPhaseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @ApiProperty({ description: 'Duration in hours' })
  @IsNumber()
  @Min(0.1)
  durationHours: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

// ============================================
// MATERIAL CONSUMPTION DTOs
// ============================================

export class CreateMaterialConsumptionDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectPhaseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  consumptionDate?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiPropertyOptional({ enum: ConsumptionType, default: ConsumptionType.PRODUCTION })
  @IsOptional()
  @IsEnum(ConsumptionType)
  consumptionType?: ConsumptionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  scrapQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

// ============================================
// PROJECT COST ENTRY DTOs
// ============================================

export class ProjectCostQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: CostType })
  @IsOptional()
  @IsEnum(CostType)
  costType?: CostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// ============================================
// PROJECT BUDGET LINE DTOs
// ============================================

export class CreateProjectBudgetLineDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectPhaseId?: string;

  @ApiProperty({ enum: CostType })
  @IsEnum(CostType)
  costType: CostType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  plannedQuantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  plannedUnitPrice: number;
}

// ============================================
// ACTIVITY TYPE DTOs
// ============================================

export class CreateActivityTypeDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'FERTIGUNG, MONTAGE, PLANUNG' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

// ============================================
// EXTENDED TIME ENTRY DTO (für duale Zeiterfassung)
// ============================================

export class CreateMetallbauTimeEntryDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ enum: TimeTypeCode })
  @IsEnum(TimeTypeCode)
  timeTypeCode: TimeTypeCode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  activityTypeId?: string;

  @ApiProperty({ description: 'Kostenstelle - immer erforderlich' })
  @IsString()
  costCenterId: string;

  @ApiPropertyOptional({ description: 'Projekt-ID - nur bei projektwirksamen Zeittypen' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectPhaseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({ enum: WorkLocation })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  machineId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseHourlyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Array of surcharge types to apply' })
  @IsOptional()
  @IsArray()
  @IsEnum(SurchargeType, { each: true })
  surcharges?: SurchargeType[];
}

// ============================================
// PROJEKT CONTROLLING DTOs
// ============================================

export class ProjectControllingDto {
  projectId: string;
  projectName: string;
  projectNumber: string;
  projectType: ProjectType;
  status: string;
  
  // Budget
  budgetTotal: number;
  actualCostTotal: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
  
  // Kosten nach Kategorien
  laborCosts: number;
  machineCosts: number;
  materialCosts: number;
  externalCosts: number;
  overheadCosts: number;
  
  // Erlöse & Marge
  revenueTotal: number;
  deckungsbeitrag: number;
  margin: number;
  marginPercent: number;
  
  // Ampelsystem
  status_color: 'green' | 'yellow' | 'red';
  warnings: string[];
}
