import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, ApproveInvoiceDto } from './dto/purchase-invoice.dto';

@ApiTags('Purchase Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-invoices')
export class PurchaseInvoicesController {
  constructor(private readonly purchaseInvoicesService: PurchaseInvoicesService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get purchase invoice statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.purchaseInvoicesService.getStatistics(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase invoice by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseInvoicesService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new purchase invoice' })
  create(@Body() dto: CreatePurchaseInvoiceDto, @CurrentUser() user: any) {
    return this.purchaseInvoicesService.create(user.companyId, dto);
  }

  @Post('from-purchase-order/:purchaseOrderId')
  @ApiOperation({ summary: 'Create purchase invoice from purchase order' })
  createFromPurchaseOrder(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Query('externalNumber') externalNumber: string,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.createFromPurchaseOrder(purchaseOrderId, user.companyId, externalNumber);
  }

  @Post('extract-ocr')
  @ApiOperation({ summary: 'Extract data from uploaded PDF using OCR' })
  extractFromDocument(@Body('documentUrl') documentUrl: string) {
    return this.purchaseInvoicesService.extractFromDocument(documentUrl);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase invoice' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.update(id, user.companyId, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve purchase invoice for payment' })
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseInvoicesService.approve(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete purchase invoice' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseInvoicesService.delete(id, user.companyId);
  }
}
