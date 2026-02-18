import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CashBookService } from './cash-book.service';
import { CreateCashTransactionDto, UpdateCashTransactionDto, CashBookClosingDto, CreateCashRegisterDto } from './dto/cash-book.dto';

@ApiTags('Cash Book')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('cash-book')
export class CashBookController {
  constructor(private readonly cashBookService: CashBookService) {}

  // Cash Registers
  @Get('registers')
  @RequirePermissions('cash-book:read')
  @ApiOperation({ summary: 'List all cash registers' })
  findAllRegisters(@CurrentUser() user: any) {
    return this.cashBookService.findAllRegisters(user.companyId);
  }

  @Post('registers')
  @RequirePermissions('cash-book:write')
  @ApiOperation({ summary: 'Create new cash register' })
  createRegister(@Body() dto: CreateCashRegisterDto, @CurrentUser() user: any) {
    return this.cashBookService.createRegister(user.companyId, dto);
  }

  @Get()
  @RequirePermissions('cash-book:read')
  @ApiOperation({ summary: 'List cash transactions (Frontend alias for /transactions)' })
  async findAllMapped(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('registerId') registerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.cashBookService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      registerId,
      startDate,
      endDate,
      type,
      search,
    });

    const VAT_LABELS: Record<string, number> = {
      STANDARD: 8.1,
      REDUCED: 2.6,
      SPECIAL: 3.8,
      EXEMPT: 0,
    };

    return {
      ...result,
      data: result.data.map((t: any) => ({
        ...t,
        documentNumber: t.number,
        runningBalance: Number(t.balanceAfter) || 0,
        taxRate: VAT_LABELS[t.vatRate] ?? (parseFloat(t.vatRate) || 0),
        costCenter: t.costCenter?.name || null,
        type: t.type === 'RECEIPT' ? 'income' : 'expense',
        date: t.date ? new Date(t.date).toLocaleDateString('de-CH') : '',
        amount: Number(t.amount),
      })),
    };
  }

  @Get('transactions')
  @RequirePermissions('cash-book:read')
  @ApiOperation({ summary: 'List all cash transactions' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('registerId') registerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.cashBookService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      registerId,
      startDate,
      endDate,
      type,
      search,
    });
  }

  @Get('transactions/:id')
  @RequirePermissions('cash-book:read')
  @ApiOperation({ summary: 'Get cash transaction by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cashBookService.findOne(id, user.companyId);
  }

  @Post('registers/:registerId/transactions')
  @RequirePermissions('cash-book:write')
  @ApiOperation({ summary: 'Create new cash transaction' })
  create(
    @Param('registerId') registerId: string,
    @Body() dto: CreateCashTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.cashBookService.create(user.companyId, registerId, dto);
  }

  @Put('transactions/:id')
  @RequirePermissions('cash-book:write')
  @ApiOperation({ summary: 'Update cash transaction' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCashTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.cashBookService.update(id, user.companyId, dto);
  }

  @Delete('transactions/:id')
  @RequirePermissions('cash-book:delete')
  @ApiOperation({ summary: 'Delete cash transaction' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cashBookService.delete(id, user.companyId);
  }

  @Get('registers/:registerId/daily-summary')
  @RequirePermissions('cash-book:read')
  @ApiOperation({ summary: 'Get daily summary for register' })
  getDailySummary(
    @Param('registerId') registerId: string,
    @Query('date') date: string,
    @CurrentUser() user: any,
  ) {
    return this.cashBookService.getDailySummary(user.companyId, registerId, date);
  }

  @Post('registers/:registerId/closing')
  @RequirePermissions('cash-book:write')
  @ApiOperation({ summary: 'Perform daily closing' })
  performClosing(
    @Param('registerId') registerId: string,
    @Body() dto: CashBookClosingDto,
    @CurrentUser() user: any,
  ) {
    return this.cashBookService.performClosing(user.companyId, registerId, dto);
  }

  @Get(':id')
  @RequirePermissions('cash-book:read')
  @ApiOperation({ summary: 'Get cash book entry by ID' })
  findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cashBookService.findOne(id, user.companyId);
  }
}
