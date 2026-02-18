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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @RequirePermissions('projects:read')
  @ApiOperation({ summary: 'Get all projects' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('projects:read')
  @ApiOperation({ summary: 'Get project statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.projectsService.getStats(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('projects:read')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.projectsService.findById(id, user.companyId);
  }

  @Post()
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Create new project' })
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Update project' })
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.companyId, dto);
  }

  @Post(':id/duplicate')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Duplicate project' })
  duplicate(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.projectsService.duplicate(id, user.companyId, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('projects:delete')
  @ApiOperation({ summary: 'Delete project' })
  delete(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.projectsService.delete(id, user.companyId);
  }

  @Post(':id/members')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Add member to project' })
  addMember(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: { employeeId: string; role?: string },
  ) {
    return this.projectsService.addMember(id, user.companyId, dto);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Remove member from project' })
  removeMember(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.projectsService.removeMember(id, user.companyId, memberId);
  }

  // --- Milestones ---

  @Get(':id/milestones')
  @RequirePermissions('projects:read')
  @ApiOperation({ summary: 'Get project milestones' })
  getMilestones(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.projectsService.getMilestones(id, user.companyId);
  }

  @Post(':id/milestones')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Add milestone to project' })
  addMilestone(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: { title: string; dueDate?: string },
  ) {
    return this.projectsService.addMilestone(id, user.companyId, dto);
  }

  @Put(':id/milestones/:milestoneId')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Update milestone' })
  updateMilestone(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: { title?: string; dueDate?: string; completed?: boolean },
  ) {
    return this.projectsService.updateMilestone(id, milestoneId, user.companyId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  @RequirePermissions('projects:write')
  @ApiOperation({ summary: 'Remove milestone from project' })
  removeMilestone(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    return this.projectsService.removeMilestone(id, milestoneId, user.companyId);
  }
}
