import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto, EventQueryDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  @RequirePermissions('calendar:read')
  @ApiOperation({ summary: 'Get all calendar events' })
  async findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: EventQueryDto) {
    const events = await this.calendarService.findAll(user.companyId, query);
    return { data: events };
  }

  @Get(':id')
  @RequirePermissions('calendar:read')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.calendarService.findById(id, user.companyId);
  }

  @Post()
  @RequirePermissions('calendar:write')
  @ApiOperation({ summary: 'Create new event' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateEventDto) {
    return this.calendarService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('calendar:write')
  @ApiOperation({ summary: 'Update event' })
  update(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.calendarService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('calendar:delete')
  @ApiOperation({ summary: 'Delete event' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.calendarService.delete(id, user.companyId);
  }
}


@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get all calendar events' })
  async findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: EventQueryDto) {
    const events = await this.calendarService.findAll(user.companyId, query);
    return { data: events };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.calendarService.findById(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new event' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateEventDto) {
    return this.calendarService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.calendarService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.calendarService.delete(id, user.companyId);
  }
}
