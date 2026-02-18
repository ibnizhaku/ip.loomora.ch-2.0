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
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Marketing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('marketing')
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  // ============== CAMPAIGNS ==============
  @Get('campaigns')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllCampaigns(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.marketingService.findAllCampaigns(user.companyId, query);
  }

  @Get('campaigns/stats')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get campaign statistics' })
  getCampaignStats(@CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.getCampaignStats(user.companyId);
  }

  @Get('campaigns/:id')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get campaign by ID' })
  findOneCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.findOneCampaign(id, user.companyId);
  }

  @Post('campaigns')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create new campaign' })
  createCampaign(@Body() dto: CreateCampaignDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createCampaign(user.companyId, dto);
  }

  @Put('campaigns/:id')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Update campaign' })
  updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.marketingService.updateCampaign(id, user.companyId, dto);
  }

  @Delete('campaigns/:id')
  @RequirePermissions('marketing:delete')
  @ApiOperation({ summary: 'Delete campaign' })
  removeCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.removeCampaign(id, user.companyId);
  }

  // ============== LEADS ==============
  @Get('leads')
  @RequirePermissions('marketing:read')
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
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get lead statistics' })
  getLeadStats(@CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.getLeadStats(user.companyId);
  }

  @Get('leads/:id')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get lead by ID' })
  findOneLead(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.findOneLead(id, user.companyId);
  }

  @Post('leads')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create new lead' })
  createLead(@Body() dto: CreateLeadDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createLead(user.companyId, dto);
  }

  @Put('leads/:id')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Update lead' })
  updateLead(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.marketingService.updateLead(id, user.companyId, dto);
  }

  @Delete('leads/:id')
  @RequirePermissions('marketing:delete')
  @ApiOperation({ summary: 'Delete lead' })
  removeLead(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.removeLead(id, user.companyId);
  }

  @Post('leads/convert')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Convert lead to customer' })
  convertLeadToCustomer(@Body() dto: ConvertLeadDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.convertLeadToCustomer(user.companyId, dto);
  }

  // ============== LEAD ACTIVITIES ==============
  @Get('leads/:id/activities')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get lead activities' })
  getLeadActivities(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.getLeadActivities(id, user.companyId);
  }

  @Post('leads/activities')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create lead activity' })
  createLeadActivity(@Body() dto: CreateLeadActivityDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createLeadActivity(user.companyId, dto);
  }

  // ============== EMAIL CAMPAIGNS ==============
  @Get('email-campaigns')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get all email campaigns' })
  findAllEmailCampaigns(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.marketingService.findAllEmailCampaigns(user.companyId, query);
  }

  @Get('email-campaigns/:id')
  @RequirePermissions('marketing:read')
  @ApiOperation({ summary: 'Get email campaign by ID' })
  findOneEmailCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.findOneEmailCampaign(id, user.companyId);
  }

  @Post('email-campaigns')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Create new email campaign' })
  createEmailCampaign(@Body() dto: CreateEmailCampaignDto, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.createEmailCampaign(user.companyId, dto);
  }

  @Put('email-campaigns/:id')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Update email campaign' })
  updateEmailCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateEmailCampaignDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.marketingService.updateEmailCampaign(id, user.companyId, dto);
  }

  @Delete('email-campaigns/:id')
  @RequirePermissions('marketing:delete')
  @ApiOperation({ summary: 'Delete email campaign' })
  removeEmailCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.removeEmailCampaign(id, user.companyId);
  }

  @Post('email-campaigns/:id/send')
  @RequirePermissions('marketing:write')
  @ApiOperation({ summary: 'Send email campaign' })
  sendEmailCampaign(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.marketingService.sendEmailCampaign(id, user.companyId);
  }
}
