import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray } from 'class-validator';

export enum FolderType {
  SYSTEM = 'SYSTEM',       // System folders (cannot be deleted)
  PROJECT = 'PROJECT',     // Project-related documents
  CUSTOMER = 'CUSTOMER',   // Customer documents
  INVOICE = 'INVOICE',     // Invoices and financial docs
  CONTRACT = 'CONTRACT',   // Contracts
  EMPLOYEE = 'EMPLOYEE',   // Employee documents
  GENERAL = 'GENERAL',     // General documents
}

export enum DocumentStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsEnum(FolderType)
  @IsOptional()
  type?: FolderType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  storageUrl?: string;

  @IsString()
  @IsOptional()
  storagePath?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  // Related entities
  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  invoiceId?: string;

  @IsString()
  @IsOptional()
  contractId?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}

export class MoveDocumentDto {
  @IsString()
  targetFolderId: string;
}

export class DocumentVersionDto {
  @IsString()
  documentId: string;

  @IsNumber()
  version: number;

  @IsString()
  storageUrl: string;

  @IsString()
  @IsOptional()
  storagePath?: string;

  @IsNumber()
  fileSize: number;

  @IsString()
  @IsOptional()
  changeNote?: string;
}

export class DocumentSearchDto {
  @IsString()
  @IsOptional()
  query?: string;

  @IsString()
  @IsOptional()
  folderId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
