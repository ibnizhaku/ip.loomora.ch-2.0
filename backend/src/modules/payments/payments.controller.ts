import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, ReconcilePaymentDto } from './dto/payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('customerId') customerId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      type,
      status,
      method,
      customerId,
      supplierId,
      startDate,
      endDate,
      search,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get payment statistics' })
  getStatistics(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getStatistics(user.companyId, { startDate, endDate });
  }

  @Get('match-qr/:qrReference')
  @ApiOperation({ summary: 'Find payment or invoice by QR reference' })
  findByQrReference(
    @Param('qrReference') qrReference: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.findByQrReference(qrReference, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentsService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new payment' })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.update(id, user.companyId, dto);
  }

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Reconcile payment with invoice' })
  reconcile(
    @Param('id') id: string,
    @Body() dto: ReconcilePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.reconcile(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentsService.delete(id, user.companyId);
  }
}
