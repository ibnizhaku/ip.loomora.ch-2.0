import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, ApproveInvoiceDto, RecordPaymentDto } from './dto/purchase-invoice.dto';

@ApiTags('Purchase Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('purchase-invoices')
export class PurchaseInvoicesController {
  constructor(private readonly purchaseInvoicesService: PurchaseInvoicesService) {}

  @Get()
  @RequirePermissions('purchase-invoices:read')
  @ApiOperation({ summary: 'List all purchase invoices' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.purchaseInvoicesService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      supplierId,
      startDate,
      endDate,
      search,
    });
  }

  @Get('statistics')
  @RequirePermissions('purchase-invoices:read')
  @ApiOperation({ summary: 'Get purchase invoice statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.purchaseInvoicesService.getStatistics(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('purchase-invoices:read')
  @ApiOperation({ summary: 'Get purchase invoice by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseInvoicesService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Create new purchase invoice' })
  create(@Body() dto: CreatePurchaseInvoiceDto, @CurrentUser() user: any) {
    return this.purchaseInvoicesService.create(user.companyId, dto);
  }

  @Post('from-purchase-order/:purchaseOrderId')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Create purchase invoice from purchase order' })
  createFromPurchaseOrder(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Query('externalNumber') externalNumber: string,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.createFromPurchaseOrder(purchaseOrderId, user.companyId, externalNumber, user.userId);
  }

  @Post('extract-ocr')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Extract data from uploaded PDF using OCR' })
  extractFromDocument(@Body('documentUrl') documentUrl: string) {
    return this.purchaseInvoicesService.extractFromDocument(documentUrl);
  }

  @Put(':id')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Update purchase invoice' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.update(id, user.companyId, dto);
  }

  @Post(':id/approve')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Approve purchase invoice for payment' })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.approve(id, user.companyId, dto);
  }

  // Prompt 1: Zahlung erfassen
  @Post(':id/record-payment')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Record a payment for purchase invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.recordPayment(id, user.companyId, dto);
  }

  // Prompt 2: Stornieren
  @Post(':id/cancel')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Cancel purchase invoice' })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.cancel(id, user.companyId, reason);
  }

  // Prompt 5: Ablehnen
  @Post(':id/reject')
  @RequirePermissions('purchase-invoices:write')
  @ApiOperation({ summary: 'Reject purchase invoice' })
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.reject(id, user.companyId, reason);
  }

  // Prompt 6: PDF Download
  @Get(':id/pdf')
  @RequirePermissions('purchase-invoices:read')
  @ApiOperation({ summary: 'Download PDF for purchase invoice' })
  async getPdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const invoice = await this.purchaseInvoicesService.findOne(id, user.companyId);
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Einkaufsrechnung-${(invoice as any).number || id}.pdf"`,
    });
    doc.pipe(res);
    doc.fontSize(18).text(`Einkaufsrechnung ${(invoice as any).number || id}`, { align: 'left' });
    doc.moveDown();
    doc.fontSize(10).text(`Lieferant: ${(invoice as any).supplier?.name || '–'}`);
    doc.text(`Datum: ${(invoice as any).date ? new Date((invoice as any).date).toLocaleDateString('de-CH') : '–'}`);
    doc.text(`Fällig: ${(invoice as any).dueDate ? new Date((invoice as any).dueDate).toLocaleDateString('de-CH') : '–'}`);
    doc.text(`Status: ${(invoice as any).status}`);
    doc.moveDown();
    doc.text(`Subtotal: CHF ${Number((invoice as any).subtotal || 0).toFixed(2)}`);
    doc.text(`MwSt: CHF ${Number((invoice as any).vatAmount || 0).toFixed(2)}`);
    doc.fontSize(12).text(`Total: CHF ${Number((invoice as any).totalAmount || 0).toFixed(2)}`, { bold: true });
    doc.end();
  }

  @Delete(':id')
  @RequirePermissions('purchase-invoices:delete')
  @ApiOperation({ summary: 'Delete purchase invoice' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseInvoicesService.delete(id, user.companyId);
  }
}
