import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateAccountDto, UpdateAccountDto, CreateBankAccountDto, UpdateBankAccountDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Get('accounts')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get chart of accounts' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllAccounts(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { type?: string }) {
    return this.financeService.findAllAccounts(user.companyId, query);
  }

  @Get('accounts/:id')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get account by ID' })
  findOneAccount(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findOneAccount(id, user.companyId);
  }

  @Post('accounts')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Create account' })
  createAccount(@Body() dto: CreateAccountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.createAccount(user.companyId, dto);
  }

  @Put('accounts/:id')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Update account' })
  updateAccount(@Param('id') id: string, @Body() dto: UpdateAccountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.updateAccount(id, user.companyId, dto);
  }

  @Get('bank-accounts')
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get all bank accounts' })
  findAllBankAccounts(@CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findAllBankAccounts(user.companyId);
  }

  @Get('bank-accounts/:id')
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get bank account by ID' })
  findOneBankAccount(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findOneBankAccount(id, user.companyId);
  }

  @Post('bank-accounts')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Create bank account' })
  createBankAccount(@Body() dto: CreateBankAccountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.createBankAccount(user.companyId, dto);
  }

  @Put('bank-accounts/:id')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Update bank account' })
  updateBankAccount(@Param('id') id: string, @Body() dto: UpdateBankAccountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.updateBankAccount(id, user.companyId, dto);
  }

  @Get()
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get recent financial transactions for Finance Dashboard' })
  getRecentTransactions(@CurrentUser() user: CurrentUserPayload) {
    return this.financeService.getRecentTransactions(user.companyId);
  }

  @Get('monthly-summary')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get monthly income/expense summary (last 12 months)' })
  getMonthlySummary(@CurrentUser() user: CurrentUserPayload) {
    return this.financeService.getMonthlySummary(user.companyId);
  }

  @Get('balance-sheet')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get balance sheet' })
  getBalanceSheet(@CurrentUser() user: CurrentUserPayload) {
    return this.financeService.getBalanceSheet(user.companyId);
  }

  @Get('income-statement')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get income statement (P&L)' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getIncomeStatement(@CurrentUser() user: CurrentUserPayload, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.financeService.getIncomeStatement(user.companyId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  }
}
