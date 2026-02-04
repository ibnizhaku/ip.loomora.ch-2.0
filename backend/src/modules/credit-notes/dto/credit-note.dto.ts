import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum CreditNoteStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  APPLIED = 'APPLIED',
  CANCELLED = 'CANCELLED',
}

export enum CreditNoteReason {
  RETURN = 'RETURN',
  PRICE_ADJUSTMENT = 'PRICE_ADJUSTMENT',
  QUANTITY_DIFFERENCE = 'QUANTITY_DIFFERENCE',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  GOODWILL = 'GOODWILL',
  OTHER = 'OTHER',
}

export class CreditNoteItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  vatRate?: number;
}

export class CreateCreditNoteDto {
  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsEnum(CreditNoteReason)
  reason: CreditNoteReason;

  @IsOptional()
  @IsString()
  reasonText?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreditNoteItemDto)
  items: CreditNoteItemDto[];
}

export class UpdateCreditNoteDto {
  @IsOptional()
  @IsEnum(CreditNoteStatus)
  status?: CreditNoteStatus;

  @IsOptional()
  @IsEnum(CreditNoteReason)
  reason?: CreditNoteReason;

  @IsOptional()
  @IsString()
  reasonText?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreditNoteItemDto)
  items?: CreditNoteItemDto[];
}
