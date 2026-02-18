import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'List all budgets' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('year') year?: string,
    @Query('period') period?: string,
    @Query('search') search?: string,
  ) {
    return this.budgetsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      year: year ? parseInt(year) : undefined,
      period,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get budget by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.budgetsService.findOne(id, user.companyId);
  }

  @Get(':id/comparison')
  @RequirePermissions('finance:read')
  @ApiOperation({ summary: 'Get budget vs actual comparison' })
  getComparison(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('includeDetails') includeDetails?: string,
  ) {
    return this.budgetsService.getComparison(user.companyId, {
      budgetId: id,
      includeDetails: includeDetails === 'true',
    });
  }

  @Post()
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Create new budget' })
  create(@Body() dto: CreateBudgetDto, @CurrentUser() user: any) {
    return this.budgetsService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Update budget' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
    @CurrentUser() user: any,
  ) {
    return this.budgetsService.update(id, user.companyId, dto);
  }

  @Post(':id/approve')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Approve budget' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.budgetsService.approve(id, user.companyId);
  }

  @Post(':id/activate')
  @RequirePermissions('finance:write')
  @ApiOperation({ summary: 'Activate approved budget' })
  activate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.budgetsService.activate(id, user.companyId);
  }

  @Delete(':id')
  @RequirePermissions('finance:delete')
  @ApiOperation({ summary: 'Delete budget (draft only)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.budgetsService.delete(id, user.companyId);
  }
}
