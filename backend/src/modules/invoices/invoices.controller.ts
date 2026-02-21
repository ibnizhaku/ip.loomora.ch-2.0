import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PdfService } from '../../common/services/pdf.service';
import { EmailService } from '../../common/services/email.service';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private pdfService: PdfService,
    private emailService: EmailService,
  ) {}

  @Get()
  @RequirePermissions('invoices:read')
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

  @Post('from-time-entries')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Create invoice from billable time entries' })
  createFromTimeEntries(
    @Body() params: { projectId?: string; customerId: string; startDate: string; endDate: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.createFromTimeEntries(user.companyId, user.userId, params);
  }

  @Post('check-overdue')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Check and mark overdue invoices (run daily)' })
  checkOverdue(@CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.checkOverdue(user.companyId, user.userId);
  }

  @Post('backfill-qr-references')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Backfill missing QR references on existing invoices' })
  backfillQrReferences(@CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.backfillQrReferences();
  }

  @Post('regenerate-qr-references')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Re-generate all QR references based on current qrIban setting (QRR or SCOR)' })
  regenerateAllReferences(@CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.regenerateAllReferences(user.companyId);
  }

  @Get('stats')
  @RequirePermissions('invoices:read')
  @ApiOperation({ summary: 'Get invoice statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.getStats(user.companyId);
  }

  @Get('open-items')
  @RequirePermissions('invoices:read')
  @ApiOperation({ summary: 'Get open items (debtors)' })
  getOpenItems(@CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.getOpenItems(user.companyId);
  }

  @Get(':id/pdf')
  @RequirePermissions('invoices:read')
  @ApiOperation({ summary: 'Download invoice as PDF with Swiss QR-Bill' })
  async downloadPdf(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    const invoice = await this.invoicesService.findOne(id, user.companyId);
    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Rechnung_${invoice.number}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Get(':id')
  @RequirePermissions('invoices:read')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Create new invoice' })
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Update invoice' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.update(id, user.companyId, dto);
  }

  @Post(':id/payment')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Record payment for invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.invoicesService.recordPayment(id, user.companyId, user.userId, dto);
  }

  @Post(':id/send')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Mark invoice as sent, optionally send via email' })
  async sendInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    // 1. Status auf SENT setzen (Hauptoperation – darf nicht scheitern)
    const updated = await this.invoicesService.sendInvoice(id, user.companyId, user.userId);

    // 2. PDF generieren + E-Mail senden (optional, Fehler dürfen nicht den Status-Update blockieren)
    let emailSent = false;
    try {
      const invoice = await this.invoicesService.findOne(id, user.companyId);
      const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);
      emailSent = await this.emailService.sendInvoice(invoice, pdfBuffer);
    } catch (err) {
      // E-Mail-Fehler loggen, aber kein 500 zurückgeben
      console.warn(`[sendInvoice] PDF/E-Mail optional step failed: ${err?.message}`);
    }

    return {
      success: true,
      sentTo: (updated as any)?.customer?.email,
      sentAt: new Date().toISOString(),
      emailSent,
    };
  }

  @Post(':id/cancel')
  @RequirePermissions('invoices:write')
  @ApiOperation({ summary: 'Cancel invoice' })
  cancelInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.cancelInvoice(id, user.companyId);
  }

  @Delete(':id')
  @RequirePermissions('invoices:delete')
  @ApiOperation({ summary: 'Delete invoice' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.invoicesService.remove(id, user.companyId);
  }
}
