import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';

// Quellensteuer-Tarife (Swiss cantons + church tax)
export enum QstTarif {
  A = 'A',    // Single without children
  B = 'B',    // Married, single earner
  C = 'C',    // Married, dual earner
  D = 'D',    // Secondary income
  E = 'E',    // Reserved
  F = 'F',    // Cross-border workers (France)
  G = 'G',    // Cross-border workers (Germany)
  H = 'H',    // Single with children
  L = 'L',    // Single, no church tax
  M = 'M',    // Married single earner, no church tax
  N = 'N',    // Married dual earner, no church tax
  P = 'P',    // Secondary income, no church tax
  Q = 'Q',    // Cross-border, special
}

export enum QstKanton {
  AG = 'AG', AI = 'AI', AR = 'AR', BE = 'BE', BL = 'BL',
  BS = 'BS', FR = 'FR', GE = 'GE', GL = 'GL', GR = 'GR',
  JU = 'JU', LU = 'LU', NE = 'NE', NW = 'NW', OW = 'OW',
  SG = 'SG', SH = 'SH', SO = 'SO', SZ = 'SZ', TG = 'TG',
  TI = 'TI', UR = 'UR', VD = 'VD', VS = 'VS', ZG = 'ZG',
  ZH = 'ZH',
}

export enum QstStatus {
  ACTIVE = 'ACTIVE',
  EXEMPT = 'EXEMPT',            // Exempt (C permit with tax domicile)
  CROSS_BORDER = 'CROSS_BORDER', // Grenzgänger
}

export class CreateQstEmployeeDto {
  @IsString()
  employeeId: string;

  @IsEnum(QstStatus)
  status: QstStatus;

  @IsEnum(QstKanton)
  kanton: QstKanton;

  @IsEnum(QstTarif)
  tarif: QstTarif;

  @IsNumber()
  childCount: number; // 0.0, 0.5, 1.0, etc.

  @IsOptional()
  @IsBoolean()
  churchMember?: boolean;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  permitType?: string; // B, L, G, etc.

  @IsOptional()
  @IsDateString()
  permitValidUntil?: string;

  @IsOptional()
  @IsString()
  crossBorderCountry?: string; // For Grenzgänger
}

export class UpdateQstEmployeeDto {
  @IsOptional()
  @IsEnum(QstStatus)
  status?: QstStatus;

  @IsOptional()
  @IsEnum(QstKanton)
  kanton?: QstKanton;

  @IsOptional()
  @IsEnum(QstTarif)
  tarif?: QstTarif;

  @IsOptional()
  @IsNumber()
  childCount?: number;

  @IsOptional()
  @IsBoolean()
  churchMember?: boolean;
}

export class QstCalculationDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  grossSalary: number;

  @IsNumber()
  year: number;

  @IsNumber()
  month: number;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  otherIncome?: number;
}

export class QstAnnualReconciliationDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  year: number;

  @IsNumber()
  totalGrossIncome: number;

  @IsNumber()
  totalQstDeducted: number;

  @IsOptional()
  @IsNumber()
  adjustments?: number;
}
