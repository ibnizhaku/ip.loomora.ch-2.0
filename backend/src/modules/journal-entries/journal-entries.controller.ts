import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto, ReverseJournalEntryDto } from './dto/journal-entry.dto';

@ApiTags('Journal Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Get()
  @RequirePermissions('journal-entries:read')
  @ApiOperation({ summary: 'List all journal entries' })
  findAll(@CurrentUser() user: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('status') status?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Query('accountId') accountId?: string, @Query('costCenterId') costCenterId?: string, @Query('search') search?: string) {
    return this.journalEntriesService.findAll(user.companyId, { page: page ? parseInt(page) : undefined, pageSize: pageSize ? parseInt(pageSize) : undefined, status, startDate, endDate, accountId, costCenterId, search });
  }

  @Get('trial-balance')
  @RequirePermissions('journal-entries:read')
  @ApiOperation({ summary: 'Get trial balance (Saldenliste)' })
  getTrialBalance(@CurrentUser() user: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.journalEntriesService.getTrialBalance(user.companyId, { startDate, endDate });
  }

  @Get('account-balance/:accountId')
  @RequirePermissions('journal-entries:read')
  @ApiOperation({ summary: 'Get balance for specific account' })
  getAccountBalance(@Param('accountId') accountId: string, @CurrentUser() user: any, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.journalEntriesService.getAccountBalance(user.companyId, accountId, { startDate, endDate });
  }

  @Get(':id')
  @RequirePermissions('journal-entries:read')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) { return this.journalEntriesService.findOne(id, user.companyId); }

  @Post()
  @RequirePermissions('journal-entries:write')
  @ApiOperation({ summary: 'Create new journal entry' })
  create(@Body() dto: CreateJournalEntryDto, @CurrentUser() user: any) { return this.journalEntriesService.create(user.companyId, dto); }

  @Put(':id')
  @RequirePermissions('journal-entries:write')
  @ApiOperation({ summary: 'Update journal entry' })
  update(@Param('id') id: string, @Body() dto: UpdateJournalEntryDto, @CurrentUser() user: any) { return this.journalEntriesService.update(id, user.companyId, dto); }

  @Post(':id/post')
  @RequirePermissions('journal-entries:write')
  @ApiOperation({ summary: 'Post journal entry' })
  post(@Param('id') id: string, @CurrentUser() user: any) { return this.journalEntriesService.post(id, user.companyId); }

  @Post(':id/reverse')
  @RequirePermissions('journal-entries:write')
  @ApiOperation({ summary: 'Reverse posted journal entry' })
  reverse(@Param('id') id: string, @Body() dto: ReverseJournalEntryDto, @CurrentUser() user: any) { return this.journalEntriesService.reverse(id, user.companyId, dto); }

  @Delete(':id')
  @RequirePermissions('journal-entries:delete')
  @ApiOperation({ summary: 'Delete journal entry (draft only)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) { return this.journalEntriesService.delete(id, user.companyId); }
}
