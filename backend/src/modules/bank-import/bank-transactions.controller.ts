import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BankImportService } from './bank-import.service';

/**
 * /bank-transactions – Alias-Controller fuer das Frontend.
 * Mappt bank-import Transaktionen auf die vom Frontend erwarteten Felder:
 * id, date, amount, description, reference, status
 */
@ApiTags('Bank Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bank-transactions')
export class BankTransactionsController {
  constructor(private readonly bankImportService: BankImportService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated bank transactions (mapped for frontend)' })
  async findAll(
    @CurrentUser() user: any,
    @Query('bankAccountId') bankAccountId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.bankImportService.findAll(user.companyId, {
      bankAccountId,
      status: status as any,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      startDate,
      endDate,
    });

    const mapped = (result.data || []).map((tx: any) => ({
      id: tx.id,
      date: tx.bookingDate || tx.valueDate || tx.createdAt,
      amount: Number(tx.amount),
      description: tx.creditorName || tx.debtorName || tx.remittanceInfo || tx.reference || '-',
      reference: tx.reference || tx.qrReference || tx.remittanceInfo || null,
      status: this.mapStatus(tx.status),
      bankAccountId: tx.bankAccountId,
      currency: tx.currency,
      creditorName: tx.creditorName,
      debtorName: tx.debtorName,
      matchedInvoiceId: tx.matchedInvoiceId,
      matchedPaymentId: tx.matchedPaymentId,
    }));

    return { ...result, data: mapped };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single bank transaction' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const tx: any = await this.bankImportService.findOne(id, user.companyId);
    return {
      ...tx,
      date: tx.bookingDate || tx.valueDate || tx.createdAt,
      description: tx.creditorName || tx.debtorName || tx.remittanceInfo || '-',
      reference: tx.reference || tx.qrReference || null,
      status: this.mapStatus(tx.status),
    };
  }

  private mapStatus(status: string): string {
    const map: Record<string, string> = {
      IMPORTED: 'imported',
      MATCHED: 'matched',
      RECONCILED: 'reconciled',
      IGNORED: 'unmatched',
      PENDING: 'pending',
    };
    return map[status] ?? status?.toLowerCase() ?? 'pending';
  }
}
