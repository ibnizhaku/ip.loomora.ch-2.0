import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
}

export class JournalLineDto {
  @IsString()
  accountId: string;

  @IsNumber()
  debit: number;

  @IsNumber()
  credit: number;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string; // Invoice number, etc.

  @IsOptional()
  @IsString()
  documentType?: string; // INVOICE, PAYMENT, MANUAL, etc.

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines?: JournalLineDto[];
}

export class PostJournalEntryDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean; // Skip validation warnings
}

export class ReverseJournalEntryDto {
  @IsDateString()
  reversalDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
