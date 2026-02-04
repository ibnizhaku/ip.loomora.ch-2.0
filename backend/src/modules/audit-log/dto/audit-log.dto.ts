import { IsString, IsOptional, IsEnum, IsObject, IsDateString, IsNumber } from 'class-validator';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND = 'SEND',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
}

export enum AuditModule {
  AUTH = 'AUTH',
  CUSTOMERS = 'CUSTOMERS',
  SUPPLIERS = 'SUPPLIERS',
  PRODUCTS = 'PRODUCTS',
  QUOTES = 'QUOTES',
  ORDERS = 'ORDERS',
  INVOICES = 'INVOICES',
  PAYMENTS = 'PAYMENTS',
  EMPLOYEES = 'EMPLOYEES',
  PROJECTS = 'PROJECTS',
  FINANCE = 'FINANCE',
  DOCUMENTS = 'DOCUMENTS',
  CONTRACTS = 'CONTRACTS',
  SETTINGS = 'SETTINGS',
  USERS = 'USERS',
  SYSTEM = 'SYSTEM',
}

export class CreateAuditLogDto {
  @IsEnum(AuditAction)
  action: AuditAction;

  @IsEnum(AuditModule)
  module: AuditModule;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  entityName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  oldValues?: Record<string, any>;

  @IsObject()
  @IsOptional()
  newValues?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AuditLogQueryDto {
  @IsEnum(AuditAction)
  @IsOptional()
  action?: AuditAction;

  @IsEnum(AuditModule)
  @IsOptional()
  module?: AuditModule;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsString()
  @IsOptional()
  entityType?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}

export class AuditLogExportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(AuditModule)
  @IsOptional()
  module?: AuditModule;

  @IsString()
  @IsOptional()
  format?: 'json' | 'csv';
}

// Response types
export interface AuditLogEntry {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  module: AuditModule;
  entityId?: string;
  entityType?: string;
  entityName?: string;
  description?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  // Computed for compliance
  retentionUntil: Date; // 10 years from creation
}
