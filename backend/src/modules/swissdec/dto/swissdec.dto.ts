import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum SwissdecMessageType {
  SALARY_DECLARATION = 'SALARY_DECLARATION',    // Lohnmeldung
  ANNUAL_DECLARATION = 'ANNUAL_DECLARATION',    // Jahresmeldung
  CORRECTION = 'CORRECTION',                    // Korrektur
  TERMINATION = 'TERMINATION',                  // Austrittsmeldung
}

export enum SwissdecStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
}

export enum SwissdecRecipient {
  AHV = 'AHV',           // AHV-Ausgleichskasse
  FAK = 'FAK',           // Familienausgleichskasse
  UVG = 'UVG',           // Unfallversicherung
  KTG = 'KTG',           // Krankentaggeld
  BVG = 'BVG',           // Pensionskasse
  QUELLENSTEUER = 'QST', // Quellensteuer
  STATISTIK = 'BFS',     // Bundesamt für Statistik
}

// ELM Salary declaration data structure
export class SalaryDeclarationDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  year: number;

  @IsNumber()
  month: number;

  // Gross amounts
  @IsNumber()
  grossSalary: number;

  @IsOptional()
  @IsNumber()
  bonus?: number;

  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @IsOptional()
  @IsNumber()
  allowances?: number;

  // Deductions
  @IsNumber()
  ahvIvEo: number;        // AHV/IV/EO contribution

  @IsNumber()
  alv: number;            // ALV (unemployment insurance)

  @IsOptional()
  @IsNumber()
  alvZ?: number;          // ALV additional (over 148'200)

  @IsOptional()
  @IsNumber()
  nbuv?: number;          // NBUV (non-occupational accident)

  @IsOptional()
  @IsNumber()
  ktg?: number;           // KTG (daily sickness benefit)

  @IsOptional()
  @IsNumber()
  bvg?: number;           // BVG (pension fund)

  @IsOptional()
  @IsNumber()
  quellensteuer?: number; // Withholding tax

  @IsNumber()
  netSalary: number;
}

export class CreateSwissdecSubmissionDto {
  @IsEnum(SwissdecMessageType)
  messageType: SwissdecMessageType;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsArray()
  @IsEnum(SwissdecRecipient, { each: true })
  recipients: SwissdecRecipient[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  employeeIds?: string[]; // Specific employees, or all if empty
}

export class ValidateSubmissionDto {
  @IsOptional()
  @IsBoolean()
  strict?: boolean;
}

export class SubmitToSwissdecDto {
  @IsOptional()
  @IsString()
  testMode?: string; // 'test' or 'production'
}

// Annual salary certificate (Lohnausweis)
export class AnnualCertificateDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  year: number;

  // Box 1-15 of Lohnausweis
  grossSalary: number;            // Pos 1
  incidentalBenefits: number;     // Pos 2
  boardAndLodging: number;        // Pos 2.1
  companyCarPrivateUse: number;   // Pos 2.2
  otherBenefits: number;          // Pos 2.3
  totalGross: number;             // Pos 7
  deductionAhvIvEo: number;       // Pos 9
  deductionAlv: number;           // Pos 10
  deductionBvg: number;           // Pos 10.1
  deductionOther: number;         // Pos 10.2
  netSalary: number;              // Pos 11
  withholdingTax: number;         // Pos 12
  expenseReimbursements: number;  // Pos 13
}
