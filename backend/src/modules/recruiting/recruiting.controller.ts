import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecruitingService } from './recruiting.service';
import { 
  CreateJobPostingDto, 
  UpdateJobPostingDto, 
  CreateCandidateDto, 
  UpdateCandidateDto,
  CreateInterviewDto,
  UpdateInterviewDto,
} from './dto/recruiting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Recruiting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recruiting')
export class RecruitingController {
  constructor(private recruitingService: RecruitingService) {}

  @Get()
  @ApiOperation({ summary: 'Get recruiting overview (candidates + jobs)' })
  getOverview(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string }) {
    return this.recruitingService.getOverview(user.companyId, query);
  }

  // ============== JOB POSTINGS ==============
  @Get('jobs')
  @ApiOperation({ summary: 'Get all job postings' })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAllJobPostings(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string }) {
    return this.recruitingService.findAllJobPostings(user.companyId, query);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job posting by ID' })
  findOneJobPosting(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.findOneJobPosting(id, user.companyId);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create new job posting' })
  createJobPosting(@Body() dto: CreateJobPostingDto, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.createJobPosting(user.companyId, dto);
  }

  @Put('jobs/:id')
  @ApiOperation({ summary: 'Update job posting' })
  updateJobPosting(
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.recruitingService.updateJobPosting(id, user.companyId, dto);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete job posting' })
  removeJobPosting(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.removeJobPosting(id, user.companyId);
  }

  @Post('jobs/:id/publish')
  @ApiOperation({ summary: 'Publish job posting' })
  publishJobPosting(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.publishJobPosting(id, user.companyId);
  }

  // ============== CANDIDATES ==============
  @Get('candidates')
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'jobPostingId', required: false, type: String })
  findAllCandidates(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; jobPostingId?: string }) {
    return this.recruitingService.findAllCandidates(user.companyId, query);
  }

  @Get('candidates/pipeline')
  @ApiOperation({ summary: 'Get candidate pipeline' })
  @ApiQuery({ name: 'jobPostingId', required: false, type: String })
  getCandidatePipeline(@CurrentUser() user: CurrentUserPayload, @Query('jobPostingId') jobPostingId?: string) {
    return this.recruitingService.getCandidatePipeline(user.companyId, jobPostingId);
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  findOneCandidate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.findOneCandidate(id, user.companyId);
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Create new candidate' })
  createCandidate(@Body() dto: CreateCandidateDto, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.createCandidate(user.companyId, dto);
  }

  @Put('candidates/:id')
  @ApiOperation({ summary: 'Update candidate' })
  updateCandidate(
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.recruitingService.updateCandidate(id, user.companyId, dto);
  }

  @Delete('candidates/:id')
  @ApiOperation({ summary: 'Delete candidate' })
  removeCandidate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.removeCandidate(id, user.companyId);
  }

  @Post('candidates/:id/hire')
  @ApiOperation({ summary: 'Hire candidate' })
  hireCandidate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.hireCandidate(id, user.companyId);
  }

  // ============== INTERVIEWS ==============
  @Post('interviews')
  @ApiOperation({ summary: 'Schedule interview' })
  createInterview(@Body() dto: CreateInterviewDto, @CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.createInterview(user.companyId, dto);
  }

  @Put('interviews/:id')
  @ApiOperation({ summary: 'Update interview' })
  updateInterview(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.recruitingService.updateInterview(id, user.companyId, dto);
  }

  // ============== STATS ==============
  @Get('stats')
  @ApiOperation({ summary: 'Get recruiting statistics' })
  getRecruitingStats(@CurrentUser() user: CurrentUserPayload) {
    return this.recruitingService.getRecruitingStats(user.companyId);
  }
}
