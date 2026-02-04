import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'overdue', required: false, type: String })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationDto & { status?: string; customerId?: string; overdue?: string },
  ) {
    return this.invoicesService.findAll(user.companyId, query);
  }

  @Get('open-items')
  @ApiOperation({ summary: 'Get open items (debtors)' })
  getOpenItems(@CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.getOpenItems(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new invoice' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.update(id, user.companyId, dto);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Record payment for invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.recordPayment(id, user.companyId, user.userId, dto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Mark invoice as sent' })
  sendInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.sendInvoice(id, user.companyId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  cancelInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.cancelInvoice(id, user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.remove(id, user.companyId);
  }
}
