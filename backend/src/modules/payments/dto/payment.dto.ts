import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export enum PaymentType {
  INCOMING = 'INCOMING', // Debitorenzahlung
  OUTGOING = 'OUTGOING', // Kreditorenzahlung
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  TWINT = 'TWINT',
  QR_INVOICE = 'QR_INVOICE',
  SEPA = 'SEPA',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class CreatePaymentDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  purchaseInvoiceId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  qrReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReconcilePaymentDto {
  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsBoolean()
  markInvoicePaid?: boolean;
}

// For camt.054 bank import matching
export class BankImportEntryDto {
  @IsDateString()
  valueDate: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  qrReference?: string;

  @IsOptional()
  @IsString()
  debitorName?: string;

  @IsOptional()
  @IsString()
  debitorIban?: string;
}

export class MatchBankImportDto {
  @IsString()
  entryId: string;

  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsBoolean()
  createPayment?: boolean;
}
