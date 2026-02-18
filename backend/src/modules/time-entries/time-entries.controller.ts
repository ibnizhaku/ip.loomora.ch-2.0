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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto, UpdateTimeEntryDto, TimeEntryQueryDto, ApproveTimeEntriesDto } from './dto/time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Time Entries')
@Controller('time-entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeEntriesController {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all time entries for current user' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: TimeEntryQueryDto) {
    return this.timeEntriesService.findAll(user.companyId, user.userId, query);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all employees time entries (admin only)' })
  findAllEmployees(@CurrentUser() user: CurrentUserPayload, @Query() query: TimeEntryQueryDto) {
    return this.timeEntriesService.findAllEmployees(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get time tracking statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.timeEntriesService.getStats(user.companyId, user.userId);
  }

  @Get('approval-stats')
  @ApiOperation({ summary: 'Get approval statistics (admin only)' })
  getApprovalStats(@CurrentUser() user: CurrentUserPayload) {
    return this.timeEntriesService.getApprovalStats(user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new time entry' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(user.companyId, user.userId, dto);
  }

  @Post('approve')
  @ApiOperation({ summary: 'Approve or reject time entries (admin only)' })
  approveEntries(@CurrentUser() user: CurrentUserPayload, @Body() body: any) {
    console.log('APPROVE RAW BODY:', JSON.stringify(body));
    // Manuell aus body extrahieren um DTO-Validierungsfehler zu umgehen
    const dto: ApproveTimeEntriesDto = {
      ids: Array.isArray(body.ids) ? body.ids : [body.ids].filter(Boolean),
      status: body.status,
      reason: body.reason,
    };
    return this.timeEntriesService.approveEntries(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update time entry' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.timeEntriesService.update(id, user.companyId, user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete time entry' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.timeEntriesService.delete(id, user.companyId, user.userId);
  }
}
