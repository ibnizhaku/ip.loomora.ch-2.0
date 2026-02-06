import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetallbauService } from './metallbau.service';
import {
  CreateTimeTypeDto,
  CreateProjectPhaseDto,
  UpdateProjectPhaseDto,
  CreateMachineDto,
  UpdateMachineDto,
  MachineQueryDto,
  CreateMachineBookingDto,
  CreateMaterialConsumptionDto,
  ProjectCostQueryDto,
  CreateProjectBudgetLineDto,
  CreateActivityTypeDto,
  CreateMetallbauTimeEntryDto,
  ProjectType,
} from './dto/metallbau.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Metallbau')
@Controller('metallbau')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MetallbauController {
  constructor(private metallbauService: MetallbauService) {}

  // ============================================
  // TIME TYPES
  // ============================================

  @Get('time-types')
  @ApiOperation({ summary: 'Get all time types' })
  getTimeTypes(@CurrentUser() user: CurrentUserPayload) {
    return this.metallbauService.getTimeTypes(user.companyId);
  }

  @Post('time-types')
  @ApiOperation({ summary: 'Create time type' })
  createTimeType(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateTimeTypeDto) {
    return this.metallbauService.createTimeType(user.companyId, dto);
  }

  @Post('time-types/seed')
  @ApiOperation({ summary: 'Seed default time types' })
  seedTimeTypes(@CurrentUser() user: CurrentUserPayload) {
    return this.metallbauService.seedDefaultTimeTypes(user.companyId);
  }

  // ============================================
  // ACTIVITY TYPES
  // ============================================

  @Get('activity-types')
  @ApiOperation({ summary: 'Get all activity types' })
  getActivityTypes(@CurrentUser() user: CurrentUserPayload) {
    return this.metallbauService.getActivityTypes(user.companyId);
  }

  @Post('activity-types')
  @ApiOperation({ summary: 'Create activity type' })
  createActivityType(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateActivityTypeDto) {
    return this.metallbauService.createActivityType(user.companyId, dto);
  }

  @Post('activity-types/seed')
  @ApiOperation({ summary: 'Seed default activity types' })
  seedActivityTypes(@CurrentUser() user: CurrentUserPayload) {
    return this.metallbauService.seedDefaultActivityTypes(user.companyId);
  }

  // ============================================
  // PROJECT PHASES
  // ============================================

  @Get('projects/:projectId/phases')
  @ApiOperation({ summary: 'Get project phases' })
  getProjectPhases(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
  ) {
    return this.metallbauService.getProjectPhases(projectId, user.companyId);
  }

  @Post('projects/:projectId/phases')
  @ApiOperation({ summary: 'Create project phase' })
  createProjectPhase(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
    @Body() dto: Omit<CreateProjectPhaseDto, 'projectId'>,
  ) {
    return this.metallbauService.createProjectPhase(user.companyId, { ...dto, projectId } as CreateProjectPhaseDto);
  }

  @Put('phases/:id')
  @ApiOperation({ summary: 'Update project phase' })
  updateProjectPhase(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProjectPhaseDto,
  ) {
    return this.metallbauService.updateProjectPhase(id, user.companyId, dto);
  }

  @Post('projects/:projectId/phases/default')
  @ApiOperation({ summary: 'Create default phases for project type' })
  createDefaultPhases(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
    @Body() body: { projectType: ProjectType },
  ) {
    return this.metallbauService.createDefaultPhases(projectId, user.companyId, body.projectType);
  }

  // ============================================
  // MACHINES
  // ============================================

  @Get('machines')
  @ApiOperation({ summary: 'Get all machines' })
  getMachines(@CurrentUser() user: CurrentUserPayload, @Query() query: MachineQueryDto) {
    return this.metallbauService.getMachines(user.companyId, query);
  }

  @Get('machines/:id')
  @ApiOperation({ summary: 'Get machine by ID' })
  getMachineById(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.metallbauService.getMachineById(id, user.companyId);
  }

  @Post('machines')
  @ApiOperation({ summary: 'Create machine' })
  createMachine(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateMachineDto) {
    return this.metallbauService.createMachine(user.companyId, dto);
  }

  @Put('machines/:id')
  @ApiOperation({ summary: 'Update machine' })
  updateMachine(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMachineDto,
  ) {
    return this.metallbauService.updateMachine(id, user.companyId, dto);
  }

  // ============================================
  // MACHINE BOOKINGS
  // ============================================

  @Post('machine-bookings')
  @ApiOperation({ summary: 'Create machine booking (auto-creates cost entry)' })
  createMachineBooking(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateMachineBookingDto) {
    return this.metallbauService.createMachineBooking(user.companyId, dto);
  }

  // ============================================
  // MATERIAL CONSUMPTION
  // ============================================

  @Post('material-consumptions')
  @ApiOperation({ summary: 'Create material consumption (auto-creates cost entry)' })
  createMaterialConsumption(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateMaterialConsumptionDto) {
    return this.metallbauService.createMaterialConsumption(user.companyId, dto);
  }

  // ============================================
  // TIME ENTRIES (Metallbau-erweitert)
  // ============================================

  @Post('time-entries')
  @ApiOperation({ summary: 'Create time entry with Metallbau logic (dual tracking, surcharges, auto cost entry)' })
  createTimeEntry(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateMetallbauTimeEntryDto,
  ) {
    return this.metallbauService.createMetallbauTimeEntry(user.companyId, user.userId, dto);
  }

  // ============================================
  // PROJECT COST ENTRIES (Controlling)
  // ============================================

  @Get('cost-entries')
  @ApiOperation({ summary: 'Get project cost entries' })
  getCostEntries(@CurrentUser() user: CurrentUserPayload, @Query() query: ProjectCostQueryDto) {
    return this.metallbauService.getProjectCostEntries(user.companyId, query);
  }

  // ============================================
  // PROJECT CONTROLLING
  // ============================================

  @Get('projects/:projectId/controlling')
  @ApiOperation({ summary: 'Get project controlling dashboard (KPIs, costs, margin, status)' })
  getProjectControlling(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
  ) {
    return this.metallbauService.getProjectControlling(projectId, user.companyId);
  }

  // ============================================
  // BUDGET LINES
  // ============================================

  @Get('projects/:projectId/budget-lines')
  @ApiOperation({ summary: 'Get project budget lines' })
  getBudgetLines(
    @CurrentUser() user: CurrentUserPayload,
    @Param('projectId') projectId: string,
  ) {
    return this.metallbauService.getProjectBudgetLines(projectId, user.companyId);
  }

  @Post('budget-lines')
  @ApiOperation({ summary: 'Create budget line' })
  createBudgetLine(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateProjectBudgetLineDto) {
    return this.metallbauService.createProjectBudgetLine(user.companyId, dto);
  }
}
