import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { VatReturnsService } from './vat-returns.service';
import { CreateVatReturnDto, UpdateVatReturnDto, SubmitVatReturnDto } from './dto/vat-return.dto';

@ApiTags('VAT Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vat-returns')
export class VatReturnsController {
  constructor(private readonly vatReturnsService: VatReturnsService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get VAT summary for year' })
  getSummary(@Param('year') year: string, @CurrentUser() user: any) {
    return this.vatReturnsService.getSummary(user.companyId, parseInt(year));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get VAT return by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.findOne(id, user.companyId);
  }

  @Get(':id/export-xml')
  @ApiOperation({ summary: 'Export VAT return as eCH-0217 XML' })
  exportXml(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.exportXml(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new VAT return' })
  create(@Body() dto: CreateVatReturnDto, @CurrentUser() user: any) {
    return this.vatReturnsService.create(user.companyId, dto);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate VAT return from transactions' })
  calculate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.calculate(id, user.companyId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit VAT return to ESTV' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitVatReturnDto,
    @CurrentUser() user: any,
  ) {
    return this.vatReturnsService.submit(id, user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update VAT return' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVatReturnDto,
    @CurrentUser() user: any,
  ) {
    return this.vatReturnsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete VAT return (draft only)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vatReturnsService.delete(id, user.companyId);
  }
}
