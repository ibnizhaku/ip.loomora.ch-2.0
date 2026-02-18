import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SwissdecService } from './swissdec.service';
import { CreateSwissdecSubmissionDto } from './dto/swissdec.dto';

@ApiTags('Swissdec')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('swissdec')
export class SwissdecController {
  constructor(private readonly swissdecService: SwissdecService) {}

  @Get()
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'List all Swissdec submissions' })
  findAll(@CurrentUser() user: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('status') status?: string, @Query('year') year?: string, @Query('messageType') messageType?: string) {
    return this.swissdecService.findAll(user.companyId, { page: page ? parseInt(page) : undefined, pageSize: pageSize ? parseInt(pageSize) : undefined, status, year: year ? parseInt(year) : undefined, messageType });
  }

  @Get('statistics/:year')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get submission statistics for year' })
  getStatistics(@Param('year') year: string, @CurrentUser() user: any) { return this.swissdecService.getStatistics(user.companyId, parseInt(year)); }

  @Get(':id')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get Swissdec submission by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.swissdecService.findOne(id, user.companyId); }

  @Get(':id/xml')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Get generated ELM XML' })
  async getXml(@Param('id') id: string, @CurrentUser() user: any) {
    const submission = await this.swissdecService.findOne(id, user.companyId);
    const xml = await this.swissdecService.generateElmXml(submission, user.companyId);
    return { xml, reference: submission.reference };
  }

  @Get('certificate/:employeeId/:year')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Generate annual salary certificate (Lohnausweis)' })
  getAnnualCertificate(@Param('employeeId') employeeId: string, @Param('year') year: string, @CurrentUser() user: any) {
    return this.swissdecService.generateAnnualCertificate(user.companyId, employeeId, parseInt(year));
  }

  @Post()
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Create new Swissdec submission' })
  create(@Body() dto: CreateSwissdecSubmissionDto, @CurrentUser() user: any) { return this.swissdecService.create(user.companyId, dto); }

  @Post(':id/validate')
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Validate submission data' })
  validate(@Param('id') id: string, @CurrentUser() user: any) { return this.swissdecService.validate(id, user.companyId); }

  @Post(':id/submit')
  @RequirePermissions('payroll:write')
  @ApiOperation({ summary: 'Submit to Swissdec distributor' })
  submit(@Param('id') id: string, @CurrentUser() user: any, @Query('testMode') testMode?: string) {
    return this.swissdecService.submit(id, user.companyId, testMode !== 'false');
  }
}
