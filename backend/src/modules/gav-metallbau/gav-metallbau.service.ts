import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  GavLohnklasse,
  GavSettingsDto,
  CreateGavEmployeeDto,
  UpdateGavEmployeeDto,
  GavTimeEntryDto 
} from './dto/gav-metallbau.dto';

@Injectable()
export class GavMetallbauService {
  constructor(private prisma: PrismaService) {}

  // GAV Metallbau Schweiz 2024 standard rates
  private readonly GAV_2024: GavSettingsDto = {
    year: 2024,
    weeklyHours: 42.5,
    // Minimum hourly rates by class (as of 2024)
    minRateA: 23.10,  // Ungelernt
    minRateB: 25.40,  // Angelernt
    minRateC: 28.85,  // EFZ
    minRateD: 31.20,  // EFZ + Zusatz
    minRateE: 34.50,  // Vorarbeiter
    minRateF: 38.00,  // Meister
    // Allowances
    schmutzzulage: 1.50,        // Per hour
    hoehenzulage: 2.00,         // Per hour (>5m)
    nachtzulageProzent: 25,     // 25% surcharge
    sonntagProzent: 50,         // 50% surcharge
    ueberZeitProzent: 25,       // 25% surcharge
    essenszulage: 18.00,        // Per day
    unterkunftMax: 80.00,       // Max per night
  };

  // Get GAV settings for a year
  async getSettings(companyId: string, year: number) {
    const settings = await this.prisma.gavSettings.findFirst({
      where: { companyId, year },
    });

    // Return stored settings or defaults
    return settings || this.GAV_2024;
  }

  // Update GAV settings
  async updateSettings(companyId: string, dto: GavSettingsDto) {
    return this.prisma.gavSettings.upsert({
      where: { companyId_year: { companyId, year: dto.year } },
      create: { companyId, ...dto },
      update: dto,
    });
  }

  // Get minimum rate for a class
  getMinimumRate(lohnklasse: GavLohnklasse, settings?: GavSettingsDto): number {
    const s = settings || this.GAV_2024;
    const rates: Record<GavLohnklasse, number> = {
      [GavLohnklasse.A]: s.minRateA,
      [GavLohnklasse.B]: s.minRateB,
      [GavLohnklasse.C]: s.minRateC,
      [GavLohnklasse.D]: s.minRateD,
      [GavLohnklasse.E]: s.minRateE,
      [GavLohnklasse.F]: s.minRateF,
    };
    return rates[lohnklasse];
  }

  // Get all employees with GAV data
  async findAllEmployees(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: {
        gavData: true,
      },
    });

    return employees.map(emp => ({
      ...emp,
      gavData: emp.gavData || {
        lohnklasse: null,
        hourlyRate: null,
        minimumRate: null,
      },
    }));
  }

  // Get single employee GAV data
  async findOneEmployee(employeeId: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId },
      include: { gavData: true },
    });

    if (!employee) {
      throw new NotFoundException('Mitarbeiter nicht gefunden');
    }

    const settings = await this.getSettings(companyId, new Date().getFullYear());
    const minimumRate = employee.gavData?.lohnklasse 
      ? this.getMinimumRate(employee.gavData.lohnklasse as GavLohnklasse, settings as GavSettingsDto)
      : null;

    return {
      employee,
      gavData: employee.gavData,
      minimumRate,
      isCompliant: employee.gavData?.hourlyRate 
        ? Number(employee.gavData.hourlyRate) >= (minimumRate || 0)
        : null,
    };
  }

  // Assign GAV class to employee
  async assignGavClass(companyId: string, dto: CreateGavEmployeeDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Mitarbeiter nicht gefunden');
    }

    const settings = await this.getSettings(companyId, new Date().getFullYear());
    const minimumRate = this.getMinimumRate(dto.lohnklasse, settings as GavSettingsDto);

    if (dto.hourlyRate < minimumRate) {
      throw new BadRequestException(
        `Stundenlohn CHF ${dto.hourlyRate.toFixed(2)} liegt unter GAV-Minimum CHF ${minimumRate.toFixed(2)} für Klasse ${dto.lohnklasse}`
      );
    }

    return this.prisma.gavEmployeeData.upsert({
      where: { employeeId: dto.employeeId },
      create: {
        employeeId: dto.employeeId,
        lohnklasse: dto.lohnklasse,
        hourlyRate: dto.hourlyRate,
        yearsExperience: dto.yearsExperience,
        hasEfz: dto.hasEfz,
        efzProfession: dto.efzProfession,
        efzDate: dto.efzDate ? new Date(dto.efzDate) : null,
      },
      update: {
        lohnklasse: dto.lohnklasse,
        hourlyRate: dto.hourlyRate,
        yearsExperience: dto.yearsExperience,
        hasEfz: dto.hasEfz,
        efzProfession: dto.efzProfession,
        efzDate: dto.efzDate ? new Date(dto.efzDate) : null,
      },
    });
  }

  // Update employee GAV data
  async updateGavClass(employeeId: string, companyId: string, dto: UpdateGavEmployeeDto) {
    const existing = await this.prisma.gavEmployeeData.findUnique({
      where: { employeeId },
    });
    if (!existing) {
      throw new NotFoundException('GAV-Daten nicht gefunden');
    }

    if (dto.lohnklasse && dto.hourlyRate) {
      const settings = await this.getSettings(companyId, new Date().getFullYear());
      const minimumRate = this.getMinimumRate(dto.lohnklasse, settings as GavSettingsDto);

      if (dto.hourlyRate < minimumRate) {
        throw new BadRequestException(
          `Stundenlohn liegt unter GAV-Minimum für Klasse ${dto.lohnklasse}`
        );
      }
    }

    return this.prisma.gavEmployeeData.update({
      where: { employeeId },
      data: dto,
    });
  }

  // Calculate salary with GAV allowances
  async calculateSalary(companyId: string, dto: GavTimeEntryDto) {
    const gavData = await this.prisma.gavEmployeeData.findUnique({
      where: { employeeId: dto.employeeId },
    });
    if (!gavData) {
      throw new NotFoundException('GAV-Daten für Mitarbeiter nicht gefunden');
    }

    const settings = await this.getSettings(companyId, new Date().getFullYear()) as GavSettingsDto;
    const hourlyRate = Number(gavData.hourlyRate);

    // Base salary
    const regularPay = dto.regularHours * hourlyRate;

    // Overtime (25% surcharge)
    const overtimePay = (dto.overtimeHours || 0) * hourlyRate * (1 + settings.ueberZeitProzent / 100);

    // Night work (25% surcharge)
    const nightPay = (dto.nightHours || 0) * hourlyRate * (1 + settings.nachtzulageProzent / 100);

    // Sunday/holiday (50% surcharge)
    const sundayPay = (dto.sundayHours || 0) * hourlyRate * (1 + settings.sonntagProzent / 100);

    // Height allowance
    const heightAllowance = (dto.heightHours || 0) * settings.hoehenzulage;

    // Dirty work allowance
    const dirtyAllowance = (dto.dirtyHours || 0) * settings.schmutzzulage;

    // Meal allowance
    const mealAllowance = (dto.mealAllowanceCount || 0) * settings.essenszulage;

    // Accommodation
    const accommodationAllowance = Math.min(
      dto.accommodationCost || 0, 
      settings.unterkunftMax
    );

    const totalAllowances = heightAllowance + dirtyAllowance + mealAllowance + accommodationAllowance;
    const totalGross = regularPay + overtimePay + nightPay + sundayPay + totalAllowances;

    return {
      employeeId: dto.employeeId,
      date: dto.date,
      hourlyRate,
      lohnklasse: gavData.lohnklasse,
      hours: {
        regular: dto.regularHours,
        overtime: dto.overtimeHours || 0,
        night: dto.nightHours || 0,
        sunday: dto.sundayHours || 0,
        height: dto.heightHours || 0,
        dirty: dto.dirtyHours || 0,
        total: dto.regularHours + (dto.overtimeHours || 0) + (dto.nightHours || 0) + (dto.sundayHours || 0),
      },
      earnings: {
        regularPay,
        overtimePay,
        nightPay,
        sundayPay,
        subtotal: regularPay + overtimePay + nightPay + sundayPay,
      },
      allowances: {
        heightAllowance,
        dirtyAllowance,
        mealAllowance,
        accommodationAllowance,
        total: totalAllowances,
      },
      totalGross,
    };
  }

  // Check GAV compliance for all employees
  async checkCompliance(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, status: 'ACTIVE' },
      include: { gavData: true },
    });

    const settings = await this.getSettings(companyId, new Date().getFullYear()) as GavSettingsDto;

    const results = employees.map(emp => {
      if (!emp.gavData) {
        return {
          employeeId: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          status: 'MISSING_DATA',
          message: 'Keine GAV-Daten hinterlegt',
        };
      }

      const minimumRate = this.getMinimumRate(emp.gavData.lohnklasse as GavLohnklasse, settings);
      const actualRate = Number(emp.gavData.hourlyRate);
      const isCompliant = actualRate >= minimumRate;

      return {
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        lohnklasse: emp.gavData.lohnklasse,
        hourlyRate: actualRate,
        minimumRate,
        status: isCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
        difference: isCompliant ? null : minimumRate - actualRate,
        message: isCompliant 
          ? 'GAV-konform' 
          : `Unterbezahlung: CHF ${(minimumRate - actualRate).toFixed(2)}/h`,
      };
    });

    const compliant = results.filter(r => r.status === 'COMPLIANT').length;
    const nonCompliant = results.filter(r => r.status === 'NON_COMPLIANT').length;
    const missingData = results.filter(r => r.status === 'MISSING_DATA').length;

    return {
      summary: {
        total: employees.length,
        compliant,
        nonCompliant,
        missingData,
        complianceRate: employees.length > 0 
          ? ((compliant / employees.length) * 100).toFixed(1) 
          : '0',
      },
      employees: results,
    };
  }

  // Get holiday entitlement based on GAV
  getHolidayEntitlement(age: number, yearsOfService: number): number {
    // GAV Metallbau holiday rules
    if (age < 20) return 25;      // Under 20: 25 days
    if (age >= 50) return 25;     // 50+: 25 days
    if (yearsOfService >= 10) return 23;  // 10+ years: 23 days
    return 20;                    // Standard: 20 days
  }

  // Calculate 13th month salary
  calculate13thMonth(annualGrossSalary: number): number {
    // GAV requires 13th month salary
    return annualGrossSalary / 12;
  }
}
