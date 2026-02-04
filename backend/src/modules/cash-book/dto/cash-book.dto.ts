import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export enum CashTransactionType {
  RECEIPT = 'RECEIPT',      // Eingang
  PAYMENT = 'PAYMENT',      // Ausgang
  OPENING = 'OPENING',      // Anfangsbestand
  CLOSING = 'CLOSING',      // Tagesabschluss
}

export class CreateCashTransactionDto {
  @IsDateString()
  date: string;

  @IsEnum(CashTransactionType)
  type: CashTransactionType;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string; // Receipt number, etc.

  @IsOptional()
  @IsString()
  accountId?: string; // Contra account for booking

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsString()
  category?: string; // Sales, Supplies, etc.

  @IsOptional()
  @IsString()
  vatRate?: string; // STANDARD, REDUCED, EXEMPT

  @IsOptional()
  @IsNumber()
  vatAmount?: number;
}

export class UpdateCashTransactionDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  vatRate?: string;

  @IsOptional()
  @IsNumber()
  vatAmount?: number;
}

export class CashBookClosingDto {
  @IsDateString()
  date: string;

  @IsNumber()
  countedAmount: number; // Physical count

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCashRegisterDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  openingBalance: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
