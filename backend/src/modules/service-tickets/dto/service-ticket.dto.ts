import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export enum ServiceTicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',        // Waiting for parts/customer
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ServiceTicketPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum ServiceType {
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  INSTALLATION = 'INSTALLATION',
  INSPECTION = 'INSPECTION',
  WARRANTY = 'WARRANTY',
}

export class CreateServiceTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsEnum(ServiceTicketPriority)
  priority?: ServiceTicketPriority;

  @IsOptional()
  @IsString()
  assignedTechnicianId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  location?: string;  // Service location address

  @IsOptional()
  @IsString()
  equipmentInfo?: string;  // What needs to be serviced

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateServiceTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ServiceTicketStatus)
  status?: ServiceTicketStatus;

  @IsOptional()
  @IsEnum(ServiceTicketPriority)
  priority?: ServiceTicketPriority;

  @IsOptional()
  @IsString()
  assignedTechnicianId?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class ServiceReportDto {
  @IsDateString()
  serviceDate: string;

  @IsNumber()
  hoursWorked: number;

  @IsOptional()
  @IsNumber()
  travelTime?: number;

  @IsString()
  workPerformed: string;

  @IsOptional()
  @IsString()
  partsUsed?: string;

  @IsOptional()
  @IsNumber()
  materialCost?: number;

  @IsOptional()
  @IsString()
  customerSignature?: string;  // Base64 signature

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  followUpNeeded?: string;

  @IsOptional()
  @IsArray()
  photoUrls?: string[];
}

export class ScheduleTechnicianDto {
  @IsString()
  technicianId: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsString()
  timeSlot?: string;  // morning, afternoon, etc.

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;
}
