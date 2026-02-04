import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export enum VatReturnStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum VatReturnPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum VatMethod {
  AGREED = 'AGREED',     // Vereinbart (invoice date)
  RECEIVED = 'RECEIVED', // Vereinnahmt (payment date)
}

// Swiss ESTV Form 050 fields
export class VatReturnDataDto {
  // Revenue (Umsatz)
  totalRevenue: number;           // Ziffer 200
  exportRevenue: number;          // Ziffer 220
  exemptRevenue: number;          // Ziffer 230
  otherDeductions: number;        // Ziffer 280

  // Taxable revenue
  taxableRevenue81: number;       // Ziffer 302 - 8.1%
  taxableRevenue26: number;       // Ziffer 312 - 2.6%
  taxableRevenue38: number;       // Ziffer 342 - 3.8% (accommodation)

  // Input tax (Vorsteuer)
  inputTaxMaterial: number;       // Ziffer 400
  inputTaxInvestments: number;    // Ziffer 405
  inputTaxServices: number;       // Ziffer 410

  // Corrections
  inputTaxCorrections: number;    // Ziffer 415
  subsidies: number;              // Ziffer 420
  mixedUseCorrection: number;     // Ziffer 475
}

export class CreateVatReturnDto {
  @IsNumber()
  year: number;

  @IsEnum(VatReturnPeriod)
  period: VatReturnPeriod;

  @IsOptional()
  @IsNumber()
  quarter?: number; // 1-4

  @IsOptional()
  @IsNumber()
  month?: number; // 1-12

  @IsOptional()
  @IsEnum(VatMethod)
  method?: VatMethod;
}

export class UpdateVatReturnDto {
  @IsOptional()
  @IsEnum(VatReturnStatus)
  status?: VatReturnStatus;

  @IsOptional()
  data?: Partial<VatReturnDataDto>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  submissionReference?: string;
}

export class SubmitVatReturnDto {
  @IsDateString()
  submissionDate: string;

  @IsOptional()
  @IsString()
  submissionMethod?: string; // PORTAL, PAPER, API

  @IsOptional()
  @IsString()
  reference?: string;
}
