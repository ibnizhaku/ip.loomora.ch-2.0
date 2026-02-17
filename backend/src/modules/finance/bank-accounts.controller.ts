import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * Dedicated /bank-accounts controller
 * Frontend calls GET /bank-accounts, backend had it under /finance/bank-accounts.
 */
@ApiTags('Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private financeService: FinanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts' })
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findAllBankAccounts(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bank account by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.findOneBankAccount(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create bank account' })
  create(@Body() dto: CreateBankAccountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.financeService.createBankAccount(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bank account' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.financeService.updateBankAccount(id, user.companyId, dto);
  }
}
