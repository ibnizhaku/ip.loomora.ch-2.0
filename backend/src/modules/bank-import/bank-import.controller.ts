import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { BankImportService } from './bank-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ImportCamtFileDto, ReconcileTransactionDto, TransactionStatus, TransactionType } from './dto/bank-import.dto';

@Controller('bank-import')
@UseGuards(JwtAuthGuard)
export class BankImportController {
  constructor(private readonly bankImportService: BankImportService) {}

  @Post('camt054')
  async importCamtFile(
    @CurrentUser() user: any,
    @Body() dto: ImportCamtFileDto,
  ) {
    return this.bankImportService.importCamtFile(user.companyId, dto);
  }

  @Get('transactions')
  async findAll(
    @CurrentUser() user: any,
    @Query('bankAccountId') bankAccountId?: string,
    @Query('status') status?: TransactionStatus,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.bankImportService.findAll(user.companyId, {
      bankAccountId,
      status,
      type,
      startDate,
      endDate,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  @Get('transactions/:id/suggestions')
  async getMatchSuggestions(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankImportService.getMatchSuggestions(id, user.companyId);
  }

  @Get('transactions/:id')
  async findOneTransaction(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankImportService.findOne(id, user.companyId);
  }

  @Post('auto-reconcile')
  async autoReconcile(
    @CurrentUser() user: any,
    @Query('bankAccountId') bankAccountId?: string,
  ) {
    return this.bankImportService.autoReconcileAll(user.companyId, bankAccountId);
  }

  @Post('reconcile')
  async reconcile(
    @CurrentUser() user: any,
    @Body() dto: ReconcileTransactionDto,
  ) {
    return this.bankImportService.reconcile(user.companyId, dto);
  }

  @Patch('transactions/:id/ignore')
  async ignore(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankImportService.ignore(id, user.companyId);
  }

  @Get('statistics')
  async getStatistics(
    @CurrentUser() user: any,
    @Query('bankAccountId') bankAccountId?: string,
  ) {
    return this.bankImportService.getStatistics(user.companyId, bankAccountId);
  }
}
