import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { VatReturnsService } from './vat-returns.service';
import { CreateVatReturnDto, UpdateVatReturnDto, SubmitVatReturnDto } from './dto/vat-return.dto';

@ApiTags('VAT Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('vat-returns')
export class VatReturnsController {
  constructor(private readonly vatReturnsService: VatReturnsService) {}

  @Get()
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'List all VAT returns' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('year') year?: string,
    @Query('period') period?: string,
  ) {
    return this.vatReturnsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      year: year ? parseInt(year) : undefined,
      period,
    });
  }

  @Get('summary/:year')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get VAT summary for year' })
  getSummary(@Param('year') year: string, @CurrentUser() user: any) {
    return this.vatReturnsService.getSummary(user.companyId, parseInt(year));
  }

  @Get(':id')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get VAT return by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.findOne(id, user.companyId);
  }

  @Get(':id/export-xml')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Export VAT return as eCH-0217 XML' })
  exportXml(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.exportXml(id, user.companyId);
  }

  @Post()
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Create new VAT return' })
  create(@Body() dto: CreateVatReturnDto, @CurrentUser() user: any) {
    return this.vatReturnsService.create(user.companyId, dto);
  }

  @Post(':id/calculate')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Calculate VAT return from transactions' })
  calculate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.calculate(id, user.companyId);
  }

  @Post(':id/submit')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Submit VAT return to ESTV' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitVatReturnDto,
    @CurrentUser() user: any,
  ) {
    return this.vatReturnsService.submit(id, user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Update VAT return' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVatReturnDto,
    @CurrentUser() user: any,
  ) {
    return this.vatReturnsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('finance:delete')
  @ApiOperation({ summary: 'Delete VAT return (draft only)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.delete(id, user.companyId);
  }
}
