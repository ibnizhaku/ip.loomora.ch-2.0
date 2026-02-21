import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, IsBoolean } from 'class-validator';

// Swiss 5-level dunning system
export enum ReminderLevel {
  LEVEL_1 = 1, // Zahlungserinnerung (Payment reminder)
  LEVEL_2 = 2, // 1. Mahnung (First reminder)
  LEVEL_3 = 3, // 2. Mahnung (Second reminder)
  LEVEL_4 = 4, // 3. Mahnung (Third reminder)
  LEVEL_5 = 5, // Letzte Mahnung vor Inkasso (Final reminder before collection)
}

export enum ReminderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum SendMethod {
  EMAIL = 'EMAIL',
  POST = 'POST',
  BOTH = 'BOTH',
}

// Mahngebühren nach Schweizer Praxis (synchronisiert mit Frontend)
export const REMINDER_FEES: Record<number, number> = {
  1: 0,    // Zahlungserinnerung - keine Gebühr
  2: 20,   // 1. Mahnung - CHF 20
  3: 30,   // 2. Mahnung - CHF 30
  4: 50,   // 3. Mahnung - CHF 50
  5: 100,  // Letzte Mahnung vor Inkasso - CHF 100
};

export const INKASSO_FEE = 100; // Inkasso-Bearbeitungsgebühr

export class CreateReminderDto {
  @IsString()
  invoiceId: string;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReminderDto {
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number;
}

export class SendReminderDto {
  @IsEnum(SendMethod)
  method: SendMethod;

  @IsOptional()
  @IsString()
  customMessage?: string;

  @IsOptional()
  @IsBoolean()
  includeQrInvoice?: boolean;
}

export class CreateBatchRemindersDto {
  @IsArray()
  @IsString({ each: true })
  invoiceIds: string[];

  @IsOptional()
  @IsEnum(SendMethod)
  sendMethod?: SendMethod;
}

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
