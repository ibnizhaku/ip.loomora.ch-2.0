import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto, UpdateTimeEntryDto, TimeEntryQueryDto, ApproveTimeEntriesDto } from './dto/time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Time Entries')
@Controller('time-entries')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class TimeEntriesController {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Get()
  @RequirePermissions('time-entries:read')
  @ApiOperation({ summary: 'Get all time entries for current user' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: TimeEntryQueryDto) {
    return this.timeEntriesService.findAll(user.companyId, user.userId, query);
  }

  @Get('all')
  @RequirePermissions('time-entries:read')
  @ApiOperation({ summary: 'Get all employees time entries (admin only)' })
  findAllEmployees(@CurrentUser() user: CurrentUserPayload, @Query() query: TimeEntryQueryDto) {
    return this.timeEntriesService.findAllEmployees(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('time-entries:read')
  @ApiOperation({ summary: 'Get time tracking statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.timeEntriesService.getStats(user.companyId, user.userId);
  }

  @Get('approval-stats')
  @RequirePermissions('time-entries:read')
  @ApiOperation({ summary: 'Get approval statistics (admin only)' })
  getApprovalStats(@CurrentUser() user: CurrentUserPayload) {
    return this.timeEntriesService.getApprovalStats(user.companyId);
  }

  @Post()
  @RequirePermissions('time-entries:write')
  @ApiOperation({ summary: 'Create new time entry' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTimeEntryDto) {
    const isTimerEntry = dto.fromTimer === true;

    if (!user.isOwner && !user.permissions.some(p => ['time-entries:admin', 'time-entries:write'].includes(p)) && !isTimerEntry) {
      throw new ForbiddenException('Mitarbeiter dürfen keine manuellen Zeiteinträge erstellen');
    }

    return this.timeEntriesService.create(user.companyId, user.userId, dto);
  }

  @Post('approve')
  @RequirePermissions('time-entries:write')
  @ApiOperation({ summary: 'Approve or reject time entries (admin only)' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }))
  approveEntries(@CurrentUser() user: CurrentUserPayload, @Body() dto: ApproveTimeEntriesDto) {
    return this.timeEntriesService.approveEntries(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @RequirePermissions('time-entries:write')
  @ApiOperation({ summary: 'Update time entry' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.timeEntriesService.update(id, user.companyId, user.userId, dto);
  }

  @Delete(':id')
  @RequirePermissions('time-entries:delete')
  @ApiOperation({ summary: 'Delete time entry' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    const isAdmin = user.isOwner || user.permissions.includes('time-entries:delete');
    return this.timeEntriesService.delete(id, user.companyId, user.userId, isAdmin);
  }
}
