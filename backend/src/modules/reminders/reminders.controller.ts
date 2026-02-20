import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto, SendReminderDto, CreateBatchRemindersDto } from './dto/reminder.dto';

@ApiTags('Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @RequirePermissions('reminders:read')
  @ApiOperation({ summary: 'List all reminders' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('level') level?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.remindersService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      level: level ? parseInt(level) : undefined,
      customerId,
      search,
    });
  }

  @Post('generate')
  @RequirePermissions('reminders:write')
  @ApiOperation({ summary: 'Auto-generate reminders for overdue invoices' })
  generateReminders(@CurrentUser() user: any) {
    return this.remindersService.generateReminders(user.companyId, user.userId);
  }

  @Get('statistics')
  @RequirePermissions('reminders:read')
  @ApiOperation({ summary: 'Get reminder statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.remindersService.getStatistics(user.companyId);
  }

  @Get('overdue-invoices')
  @RequirePermissions('reminders:read')
  @ApiOperation({ summary: 'Get overdue invoices for reminder creation' })
  getOverdueInvoices(@CurrentUser() user: any) {
    return this.remindersService.getOverdueInvoices(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('reminders:read')
  @ApiOperation({ summary: 'Get reminder by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.remindersService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('reminders:write')
  @ApiOperation({ summary: 'Create new reminder' })
  create(@Body() dto: CreateReminderDto, @CurrentUser() user: any) {
    return this.remindersService.create(user.companyId, dto, user.userId);
  }

  @Post('batch')
  @RequirePermissions('reminders:write')
  @ApiOperation({ summary: 'Create batch reminders for multiple invoices' })
  createBatch(@Body() dto: CreateBatchRemindersDto, @CurrentUser() user: any) {
    return this.remindersService.createBatchReminders(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('reminders:write')
  @ApiOperation({ summary: 'Update reminder' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @CurrentUser() user: any,
  ) {
    return this.remindersService.update(id, user.companyId, dto);
  }

  @Post(':id/send')
  @RequirePermissions('reminders:write')
  @ApiOperation({ summary: 'Send reminder to customer' })
  send(
    @Param('id') id: string,
    @Body() dto: SendReminderDto,
    @CurrentUser() user: any,
  ) {
    return this.remindersService.send(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('reminders:delete')
  @ApiOperation({ summary: 'Delete reminder' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.remindersService.delete(id, user.companyId);
  }
}
