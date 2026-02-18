import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * Dedicated /bank-accounts controller
 * Frontend calls GET /bank-accounts, backend had it under /finance/bank-accounts.
 */
@ApiTags('Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private financeService: FinanceService) {}

  @Get()
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get all bank accounts' })
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findAllBankAccounts(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('bank-accounts:read')
  @ApiOperation({ summary: 'Get bank account by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findOneBankAccount(id, user.companyId);
  }

  @Post()
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Create bank account' })
  create(@Body() dto: CreateBankAccountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.createBankAccount(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('bank-accounts:write')
  @ApiOperation({ summary: 'Update bank account' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.financeService.updateBankAccount(id, user.companyId, dto);
  }
}
