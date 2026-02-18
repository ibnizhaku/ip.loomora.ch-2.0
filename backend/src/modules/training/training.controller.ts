import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { CreateTrainingDto, UpdateTrainingDto, AddParticipantDto, UpdateParticipantDto, TrainingReportDto } from './dto/training.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('training')
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  @Get()
  @RequirePermissions('training:read')
  @ApiOperation({ summary: 'Get all trainings' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; type?: string }) { return this.trainingService.findAll(user.companyId, query); }

  @Get('stats')
  @RequirePermissions('training:read')
  @ApiOperation({ summary: 'Get training statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) { return this.trainingService.getStats(user.companyId); }

  @Get('upcoming')
  @RequirePermissions('training:read')
  @ApiOperation({ summary: 'Get upcoming trainings' })
  getUpcomingTrainings(@CurrentUser() user: CurrentUserPayload, @Query('days') days?: number) { return this.trainingService.getUpcomingTrainings(user.companyId, days); }

  @Post('report')
  @RequirePermissions('training:read')
  @ApiOperation({ summary: 'Generate training report' })
  generateReport(@Body() dto: TrainingReportDto, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.generateReport(user.companyId, dto); }

  @Get('employee/:employeeId')
  @RequirePermissions('training:read')
  @ApiOperation({ summary: 'Get employee trainings' })
  getEmployeeTrainings(@Param('employeeId') employeeId: string, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.getEmployeeTrainings(employeeId, user.companyId); }

  @Get(':id')
  @RequirePermissions('training:read')
  @ApiOperation({ summary: 'Get training by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.findOne(id, user.companyId); }

  @Post()
  @RequirePermissions('training:write')
  @ApiOperation({ summary: 'Create new training' })
  create(@Body() dto: CreateTrainingDto, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.create(user.companyId, dto); }

  @Put(':id')
  @RequirePermissions('training:write')
  @ApiOperation({ summary: 'Update training' })
  update(@Param('id') id: string, @Body() dto: UpdateTrainingDto, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.update(id, user.companyId, dto); }

  @Delete(':id')
  @RequirePermissions('training:delete')
  @ApiOperation({ summary: 'Delete training' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.remove(id, user.companyId); }

  @Post(':id/complete')
  @RequirePermissions('training:write')
  @ApiOperation({ summary: 'Mark training as completed' })
  completeTraining(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.completeTraining(id, user.companyId); }

  @Post(':id/participants')
  @RequirePermissions('training:write')
  @ApiOperation({ summary: 'Add participant to training' })
  addParticipant(@Param('id') id: string, @Body() dto: AddParticipantDto, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.addParticipant(id, user.companyId, dto); }

  @Put(':id/participants/:participantId')
  @RequirePermissions('training:write')
  @ApiOperation({ summary: 'Update participant' })
  updateParticipant(@Param('id') id: string, @Param('participantId') participantId: string, @Body() dto: UpdateParticipantDto, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.updateParticipant(id, participantId, user.companyId, dto); }

  @Delete(':id/participants/:participantId')
  @RequirePermissions('training:delete')
  @ApiOperation({ summary: 'Remove participant from training' })
  removeParticipant(@Param('id') id: string, @Param('participantId') participantId: string, @CurrentUser() user: CurrentUserPayload) { return this.trainingService.removeParticipant(id, participantId, user.companyId); }
}
