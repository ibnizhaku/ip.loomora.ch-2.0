import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankImportService } from './bank-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ImportCamtFileDto, ReconcileTransactionDto, TransactionStatus, TransactionType } from './dto/bank-import.dto';

@ApiTags('Bank Import')
@ApiBearerAuth()
@Controller('bank-import')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
export class BankImportController {
  constructor(private readonly bankImportService: BankImportService) {}

  @Post('camt054')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Import CAMT.054 bank statement file' })
  async importCamtFile(
    @CurrentUser() user: any,
    @Body() dto: ImportCamtFileDto,
  ) {
    return this.bankImportService.importCamtFile(user.companyId, dto);
  }

  @Get('transactions')
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'List bank transactions' })
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
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get match suggestions for transaction' })
  async getMatchSuggestions(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankImportService.getMatchSuggestions(id, user.companyId);
  }

  @Get('transactions/:id')
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get transaction by ID' })
  async findOneTransaction(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankImportService.findOne(id, user.companyId);
  }

  @Post('auto-reconcile')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Auto-reconcile all transactions' })
  async autoReconcile(
    @CurrentUser() user: any,
    @Query('bankAccountId') bankAccountId?: string,
  ) {
    return this.bankImportService.autoReconcileAll(user.companyId, bankAccountId);
  }

  @Post('reconcile')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Reconcile a transaction' })
  async reconcile(
    @CurrentUser() user: any,
    @Body() dto: ReconcileTransactionDto,
  ) {
    return this.bankImportService.reconcile(user.companyId, dto);
  }

  @Patch('transactions/:id/ignore')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Ignore a transaction' })
  async ignore(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.bankImportService.ignore(id, user.companyId);
  }

  @Get('statistics')
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get bank import statistics' })
  async getStatistics(
    @CurrentUser() user: any,
    @Query('bankAccountId') bankAccountId?: string,
  ) {
    return this.bankImportService.getStatistics(user.companyId, bankAccountId);
  }
}
