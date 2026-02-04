import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SwissdecService } from './swissdec.service';
import { CreateSwissdecSubmissionDto } from './dto/swissdec.dto';

@ApiTags('Swissdec')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('swissdec')
export class SwissdecController {
  constructor(private readonly swissdecService: SwissdecService) {}

  @Get()
  @ApiOperation({ summary: 'List all Swissdec submissions' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('year') year?: string,
    @Query('messageType') messageType?: string,
  ) {
    return this.swissdecService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      year: year ? parseInt(year) : undefined,
      messageType,
    });
  }

  @Get('statistics/:year')
  @ApiOperation({ summary: 'Get submission statistics for year' })
  getStatistics(@Param('year') year: string, @CurrentUser() user: any) {
    return this.swissdecService.getStatistics(user.companyId, parseInt(year));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Swissdec submission by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.swissdecService.findOne(id, user.companyId);
  }

  @Get(':id/xml')
  @ApiOperation({ summary: 'Get generated ELM XML' })
  async getXml(@Param('id') id: string, @CurrentUser() user: any) {
    const submission = await this.swissdecService.findOne(id, user.companyId);
    const xml = await this.swissdecService.generateElmXml(submission, user.companyId);
    return { xml, reference: submission.reference };
  }

  @Get('certificate/:employeeId/:year')
  @ApiOperation({ summary: 'Generate annual salary certificate (Lohnausweis)' })
  getAnnualCertificate(
    @Param('employeeId') employeeId: string,
    @Param('year') year: string,
    @CurrentUser() user: any,
  ) {
    return this.swissdecService.generateAnnualCertificate(user.companyId, employeeId, parseInt(year));
  }

  @Post()
  @ApiOperation({ summary: 'Create new Swissdec submission' })
  create(@Body() dto: CreateSwissdecSubmissionDto, @CurrentUser() user: any) {
    return this.swissdecService.create(user.companyId, dto);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate submission data' })
  validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.swissdecService.validate(id, user.companyId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit to Swissdec distributor' })
  submit(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('testMode') testMode?: string,
  ) {
    return this.swissdecService.submit(id, user.companyId, testMode !== 'false');
  }
}
