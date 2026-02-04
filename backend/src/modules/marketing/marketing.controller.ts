import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { 
  CreateCampaignDto, 
  UpdateCampaignDto, 
  CreateLeadDto, 
  UpdateLeadDto,
  ConvertLeadDto,
  CreateEmailCampaignDto,
  UpdateEmailCampaignDto,
  CreateLeadActivityDto,
} from './dto/marketing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Marketing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketing')
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  // ============== CAMPAIGNS ==============
  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllCampaigns(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.marketingService.findAllCampaigns(user.companyId, query);
  }

  @Get('campaigns/stats')
  @ApiOperation({ summary: 'Get campaign statistics' })
  getCampaignStats(@CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.getCampaignStats(user.companyId);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  findOneCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.findOneCampaign(id, user.companyId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create new campaign' })
  createCampaign(@Body() dto: CreateCampaignDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createCampaign(user.companyId, dto);
  }

  @Put('campaigns/:id')
  @ApiOperation({ summary: 'Update campaign' })
  updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.marketingService.updateCampaign(id, user.companyId, dto);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete campaign' })
  removeCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.removeCampaign(id, user.companyId);
  }

  // ============== LEADS ==============
  @Get('leads')
  @ApiOperation({ summary: 'Get all leads' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  findAllLeads(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; source?: string }) {
    return this.marketingService.findAllLeads(user.companyId, query);
  }

  @Get('leads/stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  getLeadStats(@CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.getLeadStats(user.companyId);
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get lead by ID' })
  findOneLead(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.findOneLead(id, user.companyId);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create new lead' })
  createLead(@Body() dto: CreateLeadDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createLead(user.companyId, dto);
  }

  @Put('leads/:id')
  @ApiOperation({ summary: 'Update lead' })
  updateLead(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.marketingService.updateLead(id, user.companyId, dto);
  }

  @Delete('leads/:id')
  @ApiOperation({ summary: 'Delete lead' })
  removeLead(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.removeLead(id, user.companyId);
  }

  @Post('leads/convert')
  @ApiOperation({ summary: 'Convert lead to customer' })
  convertLeadToCustomer(@Body() dto: ConvertLeadDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.convertLeadToCustomer(user.companyId, dto);
  }

  // ============== LEAD ACTIVITIES ==============
  @Get('leads/:id/activities')
  @ApiOperation({ summary: 'Get lead activities' })
  getLeadActivities(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.getLeadActivities(id, user.companyId);
  }

  @Post('leads/activities')
  @ApiOperation({ summary: 'Create lead activity' })
  createLeadActivity(@Body() dto: CreateLeadActivityDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createLeadActivity(user.companyId, dto);
  }

  // ============== EMAIL CAMPAIGNS ==============
  @Get('email-campaigns')
  @ApiOperation({ summary: 'Get all email campaigns' })
  findAllEmailCampaigns(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.marketingService.findAllEmailCampaigns(user.companyId, query);
  }

  @Get('email-campaigns/:id')
  @ApiOperation({ summary: 'Get email campaign by ID' })
  findOneEmailCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.findOneEmailCampaign(id, user.companyId);
  }

  @Post('email-campaigns')
  @ApiOperation({ summary: 'Create new email campaign' })
  createEmailCampaign(@Body() dto: CreateEmailCampaignDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createEmailCampaign(user.companyId, dto);
  }

  @Put('email-campaigns/:id')
  @ApiOperation({ summary: 'Update email campaign' })
  updateEmailCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateEmailCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.marketingService.updateEmailCampaign(id, user.companyId, dto);
  }

  @Delete('email-campaigns/:id')
  @ApiOperation({ summary: 'Delete email campaign' })
  removeEmailCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.removeEmailCampaign(id, user.companyId);
  }

  @Post('email-campaigns/:id/send')
  @ApiOperation({ summary: 'Send email campaign' })
  sendEmailCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.sendEmailCampaign(id, user.companyId);
  }
}
