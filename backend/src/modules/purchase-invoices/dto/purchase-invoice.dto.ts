import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum PurchaseInvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',    // Awaiting approval
  APPROVED = 'APPROVED',  // Approved for payment
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export class PurchaseInvoiceItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  vatRate?: number;

  @IsOptional()
  @IsString()
  accountCode?: string;  // For booking to specific account
}

export class CreatePurchaseInvoiceDto {
  @IsString()
  supplierId: string;

  @IsString()
  externalNumber: string;  // Supplier's invoice number

  @IsOptional()
  @IsString()
  purchaseOrderId?: string;

  @IsDateString()
  invoiceDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;  // URL to uploaded PDF

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseInvoiceItemDto)
  items: PurchaseInvoiceItemDto[];
}

export class UpdatePurchaseInvoiceDto extends PartialType(CreatePurchaseInvoiceDto) {
  @IsOptional()
  @IsEnum(PurchaseInvoiceStatus)
  status?: PurchaseInvoiceStatus;
}

// OCR Import result structure
export class OcrExtractedDataDto {
  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  vatAmount?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  qrReference?: string;

  @IsOptional()
  @IsArray()
  items?: {
    description: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
  }[];

  @IsNumber()
  confidence: number;  // 0-100 OCR confidence score
}

export class ApproveInvoiceDto {
  @IsOptional()
  @IsString()
  approvalNote?: string;

  @IsOptional()
  @IsBoolean()
  schedulePayment?: boolean;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsEnum(['BANK_TRANSFER', 'DIRECT_DEBIT', 'CASH'])
  method: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
