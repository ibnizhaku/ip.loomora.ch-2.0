import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecruitingService } from './recruiting.service';
// #region agent log
const _dbgCtrl = (data: object) => { try { console.error('[DEBUG_CTRL]', JSON.stringify({ ...data, timestamp: Date.now() })); } catch {} };
// #endregion
import { CreateJobPostingDto, UpdateJobPostingDto, CreateCandidateDto, UpdateCandidateDto, CreateInterviewDto, UpdateInterviewDto } from './dto/recruiting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Recruiting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('recruiting')
export class RecruitingController {
  constructor(private recruitingService: RecruitingService) {}

  @Get()
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get recruiting overview' })
  getOverview(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string }) { return this.recruitingService.getOverview(user.companyId, query); }

  @Get('jobs')
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get all job postings' })
  findAllJobPostings(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string }) { return this.recruitingService.findAllJobPostings(user.companyId, query); }

  @Get('jobs/:id')
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get job posting by ID' })
  findOneJobPosting(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.findOneJobPosting(id, user.companyId); }

  @Post('jobs')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Create new job posting' })
  createJobPosting(@Body() dto: CreateJobPostingDto, @CurrentUser() user: CurrentUserPayload) {
    // #region agent log
    _dbgCtrl({ location: 'recruiting.controller.ts:createJobPosting', hypothesisId: 'H-B,H-C,H-D', message: 'DTO after ValidationPipe (validation PASSED)', data: { dto, dtoTypes: Object.fromEntries(Object.entries(dto as any).map(([k, v]) => [k, typeof v])) } });
    // #endregion
    return this.recruitingService.createJobPosting(user.companyId, dto);
  }

  @Put('jobs/:id')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Update job posting' })
  updateJobPosting(@Param('id') id: string, @Body() dto: UpdateJobPostingDto, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.updateJobPosting(id, user.companyId, dto); }

  @Delete('jobs/:id')
  @RequirePermissions('recruiting:delete')
  @ApiOperation({ summary: 'Delete job posting' })
  removeJobPosting(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.removeJobPosting(id, user.companyId); }

  @Post('jobs/:id/publish')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Publish job posting' })
  publishJobPosting(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.publishJobPosting(id, user.companyId); }

  @Get('candidates')
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get all candidates' })
  findAllCandidates(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; jobPostingId?: string }) { return this.recruitingService.findAllCandidates(user.companyId, query); }

  @Get('candidates/pipeline')
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get candidate pipeline' })
  getCandidatePipeline(@CurrentUser() user: CurrentUserPayload, @Query('jobPostingId') jobPostingId?: string) { return this.recruitingService.getCandidatePipeline(user.companyId, jobPostingId); }

  @Get('candidates/:id')
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get candidate by ID' })
  findOneCandidate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.findOneCandidate(id, user.companyId); }

  @Post('candidates')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Create new candidate' })
  createCandidate(@Body() dto: CreateCandidateDto, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.createCandidate(user.companyId, dto); }

  @Put('candidates/:id')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Update candidate' })
  updateCandidate(@Param('id') id: string, @Body() dto: UpdateCandidateDto, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.updateCandidate(id, user.companyId, dto); }

  @Patch('candidates/:id')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Partially update candidate' })
  patchCandidate(@Param('id') id: string, @Body() dto: UpdateCandidateDto, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.updateCandidate(id, user.companyId, dto); }

  @Delete('candidates/:id')
  @RequirePermissions('recruiting:delete')
  @ApiOperation({ summary: 'Delete candidate' })
  removeCandidate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.removeCandidate(id, user.companyId); }

  @Post('candidates/:id/hire')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Hire candidate' })
  hireCandidate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.hireCandidate(id, user.companyId); }

  @Post('interviews')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Schedule interview' })
  createInterview(@Body() dto: CreateInterviewDto, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.createInterview(user.companyId, dto); }

  @Put('interviews/:id')
  @RequirePermissions('recruiting:write')
  @ApiOperation({ summary: 'Update interview' })
  updateInterview(@Param('id') id: string, @Body() dto: UpdateInterviewDto, @CurrentUser() user: CurrentUserPayload) { return this.recruitingService.updateInterview(id, user.companyId, dto); }

  @Get('stats')
  @RequirePermissions('recruiting:read')
  @ApiOperation({ summary: 'Get recruiting statistics' })
  getRecruitingStats(@CurrentUser() user: CurrentUserPayload) { return this.recruitingService.getRecruitingStats(user.companyId); }
}
