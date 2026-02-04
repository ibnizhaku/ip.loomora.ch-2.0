import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export enum TransactionStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  RECONCILED = 'RECONCILED',
  IGNORED = 'IGNORED',
}

export enum TransactionType {
  CREDIT = 'CREDIT',   // Zahlungseingang
  DEBIT = 'DEBIT',     // Zahlungsausgang
}

export class BankTransactionDto {
  @IsString()
  id: string;

  @IsString()
  bankAccountId: string;

  @IsString()
  @IsOptional()
  entryReference?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsDateString()
  bookingDate: string;

  @IsDateString()
  valueDate: string;

  @IsString()
  @IsOptional()
  qrReference?: string;

  @IsString()
  @IsOptional()
  creditorReference?: string;

  @IsString()
  @IsOptional()
  endToEndId?: string;

  @IsString()
  @IsOptional()
  remittanceInfo?: string;

  @IsString()
  @IsOptional()
  debtorName?: string;

  @IsString()
  @IsOptional()
  debtorIban?: string;

  @IsString()
  @IsOptional()
  creditorName?: string;

  @IsString()
  @IsOptional()
  creditorIban?: string;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsString()
  @IsOptional()
  matchedInvoiceId?: string;

  @IsString()
  @IsOptional()
  matchedPaymentId?: string;
}

export class ImportCamtFileDto {
  @IsString()
  bankAccountId: string;

  @IsString()
  xmlContent: string;

  @IsBoolean()
  @IsOptional()
  autoReconcile?: boolean;
}

export class ReconcileTransactionDto {
  @IsString()
  transactionId: string;

  @IsString()
  @IsOptional()
  invoiceId?: string;

  @IsString()
  @IsOptional()
  purchaseInvoiceId?: string;

  @IsBoolean()
  @IsOptional()
  createPayment?: boolean;
}

export class MatchSuggestionDto {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  confidence: number; // 0-100
  matchReason: string;
}

// Parsed camt.054 structures
export interface CamtNotification {
  messageId: string;
  creationDateTime: string;
  account: {
    iban: string;
    currency: string;
  };
  entries: CamtEntry[];
}

export interface CamtEntry {
  entryReference: string;
  amount: number;
  currency: string;
  creditDebitIndicator: 'CRDT' | 'DBIT';
  status: string;
  bookingDate: string;
  valueDate: string;
  transactionDetails: CamtTransactionDetail[];
}

export interface CamtTransactionDetail {
  endToEndId?: string;
  creditorReference?: string;
  remittanceInfo?: string;
  debtor?: {
    name?: string;
    iban?: string;
  };
  creditor?: {
    name?: string;
    iban?: string;
  };
}
