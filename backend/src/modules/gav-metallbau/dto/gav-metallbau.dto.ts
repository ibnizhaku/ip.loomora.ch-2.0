import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';

// GAV Metallbau Schweiz - Lohnklassen
export enum GavLohnklasse {
  A = 'A',  // Ungelernte Arbeitnehmer
  B = 'B',  // Angelernte Arbeitnehmer (mind. 1 Jahr)
  C = 'C',  // Facharbeiter mit EFZ
  D = 'D',  // Facharbeiter mit Zusatzausbildung
  E = 'E',  // Vorarbeiter / Gruppenleiter
  F = 'F',  // Meister / Projektleiter
}

// GAV Zulagen-Typen
export enum GavZulageTyp {
  SCHMUTZZULAGE = 'SCHMUTZZULAGE',           // Dirty work allowance
  HOEHENZULAGE = 'HOEHENZULAGE',             // Height allowance
  NACHTZULAGE = 'NACHTZULAGE',               // Night shift allowance
  SONNTAG_FEIERTAG = 'SONNTAG_FEIERTAG',     // Sunday/holiday allowance
  MONTAGE_AUSWARTS = 'MONTAGE_AUSWARTS',     // Off-site assembly
  UNTERKUNFT = 'UNTERKUNFT',                 // Accommodation allowance
  ESSENSZULAGE = 'ESSENSZULAGE',             // Meal allowance
}

export class GavSettingsDto {
  @IsNumber()
  year: number;

  // Standard work hours per week
  @IsNumber()
  weeklyHours: number; // Default: 42.5

  // Minimum hourly rates by class (CHF)
  @IsNumber()
  minRateA: number;

  @IsNumber()
  minRateB: number;

  @IsNumber()
  minRateC: number;

  @IsNumber()
  minRateD: number;

  @IsNumber()
  minRateE: number;

  @IsNumber()
  minRateF: number;

  // Allowances
  @IsNumber()
  schmutzzulage: number;        // Per hour

  @IsNumber()
  hoehenzulage: number;         // Per hour (work above 5m)

  @IsNumber()
  nachtzulageProzent: number;   // % surcharge (night work)

  @IsNumber()
  sonntagProzent: number;       // % surcharge (Sunday/holiday)

  @IsNumber()
  ueberZeitProzent: number;     // % surcharge (overtime)

  @IsNumber()
  essenszulage: number;         // Per day

  @IsNumber()
  unterkunftMax: number;        // Max per night
}

export class CreateGavEmployeeDto {
  @IsString()
  employeeId: string;

  @IsEnum(GavLohnklasse)
  lohnklasse: GavLohnklasse;

  @IsNumber()
  hourlyRate: number;

  @IsOptional()
  @IsNumber()
  yearsExperience?: number;

  @IsOptional()
  @IsBoolean()
  hasEfz?: boolean;  // EFZ = Eidgenössisches Fähigkeitszeugnis

  @IsOptional()
  @IsString()
  efzProfession?: string;  // Which profession

  @IsOptional()
  @IsDateString()
  efzDate?: string;
}

export class UpdateGavEmployeeDto {
  @IsOptional()
  @IsEnum(GavLohnklasse)
  lohnklasse?: GavLohnklasse;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  yearsExperience?: number;
}

export class GavTimeEntryDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  regularHours: number;

  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @IsOptional()
  @IsNumber()
  nightHours?: number;

  @IsOptional()
  @IsNumber()
  sundayHours?: number;

  @IsOptional()
  @IsNumber()
  heightHours?: number;      // Hours at height > 5m

  @IsOptional()
  @IsNumber()
  dirtyHours?: number;       // Hours with dirty work

  @IsOptional()
  @IsBoolean()
  isOffSite?: boolean;       // Montage auswärts

  @IsOptional()
  @IsNumber()
  mealAllowanceCount?: number;

  @IsOptional()
  @IsNumber()
  accommodationCost?: number;
}
