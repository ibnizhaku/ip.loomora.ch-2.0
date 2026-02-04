import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GavMetallbauService } from './gav-metallbau.service';
import { GavSettingsDto, CreateGavEmployeeDto, UpdateGavEmployeeDto, GavTimeEntryDto } from './dto/gav-metallbau.dto';

@ApiTags('GAV Metallbau')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gav-metallbau')
export class GavMetallbauController {
  constructor(private readonly gavService: GavMetallbauService) {}

  // Settings
  @Get('settings/:year')
  @ApiOperation({ summary: 'Get GAV settings for year' })
  getSettings(@Param('year') year: string, @CurrentUser() user: any) {
    return this.gavService.getSettings(user.companyId, parseInt(year));
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update GAV settings' })
  updateSettings(@Body() dto: GavSettingsDto, @CurrentUser() user: any) {
    return this.gavService.updateSettings(user.companyId, dto);
  }

  // Employees
  @Get('employees')
  @ApiOperation({ summary: 'Get all employees with GAV data' })
  findAllEmployees(@CurrentUser() user: any) {
    return this.gavService.findAllEmployees(user.companyId);
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get employee GAV data' })
  findOneEmployee(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gavService.findOneEmployee(id, user.companyId);
  }

  @Post('employees')
  @ApiOperation({ summary: 'Assign GAV class to employee' })
  assignGavClass(@Body() dto: CreateGavEmployeeDto, @CurrentUser() user: any) {
    return this.gavService.assignGavClass(user.companyId, dto);
  }

  @Put('employees/:id')
  @ApiOperation({ summary: 'Update employee GAV data' })
  updateGavClass(
    @Param('id') id: string,
    @Body() dto: UpdateGavEmployeeDto,
    @CurrentUser() user: any,
  ) {
    return this.gavService.updateGavClass(id, user.companyId, dto);
  }

  // Calculations
  @Post('calculate-salary')
  @ApiOperation({ summary: 'Calculate salary with GAV allowances' })
  calculateSalary(@Body() dto: GavTimeEntryDto, @CurrentUser() user: any) {
    return this.gavService.calculateSalary(user.companyId, dto);
  }

  // Compliance
  @Get('compliance')
  @ApiOperation({ summary: 'Check GAV compliance for all employees' })
  checkCompliance(@CurrentUser() user: any) {
    return this.gavService.checkCompliance(user.companyId);
  }

  // Info endpoints
  @Get('minimum-rates')
  @ApiOperation({ summary: 'Get minimum hourly rates by class' })
  async getMinimumRates(@CurrentUser() user: any, @Query('year') year?: string) {
    const settings = await this.gavService.getSettings(
      user.companyId, 
      year ? parseInt(year) : new Date().getFullYear()
    ) as GavSettingsDto;

    return {
      year: settings.year,
      rates: {
        A: { class: 'A', description: 'Ungelernte Arbeitnehmer', rate: settings.minRateA },
        B: { class: 'B', description: 'Angelernte (mind. 1 Jahr)', rate: settings.minRateB },
        C: { class: 'C', description: 'Facharbeiter mit EFZ', rate: settings.minRateC },
        D: { class: 'D', description: 'EFZ + Zusatzausbildung', rate: settings.minRateD },
        E: { class: 'E', description: 'Vorarbeiter / Gruppenleiter', rate: settings.minRateE },
        F: { class: 'F', description: 'Meister / Projektleiter', rate: settings.minRateF },
      },
      weeklyHours: settings.weeklyHours,
      allowances: {
        schmutzzulage: settings.schmutzzulage,
        hoehenzulage: settings.hoehenzulage,
        essenszulage: settings.essenszulage,
        unterkunftMax: settings.unterkunftMax,
      },
      surcharges: {
        overtime: `${settings.ueberZeitProzent}%`,
        night: `${settings.nachtzulageProzent}%`,
        sunday: `${settings.sonntagProzent}%`,
      },
    };
  }
}
