import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { QualityControlService } from './quality-control.service';
import { 
  CreateQualityChecklistDto, 
  CreateQualityCheckDto, 
  UpdateQualityCheckDto,
  CompleteQualityCheckDto,
} from './dto/quality-control.dto';

@ApiTags('Quality Control')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quality')
export class QualityControlController {
  constructor(private readonly qualityService: QualityControlService) {}

  // ============ CHECKLISTS ============

  @Get('checklists')
  @ApiOperation({ summary: 'List all quality checklists' })
  findAllChecklists(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.qualityService.findAllChecklists(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      type,
      category,
      search,
    });
  }

  @Get('checklists/templates')
  @ApiOperation({ summary: 'Get predefined checklist templates for Metallbau' })
  getChecklistTemplates() {
    return this.qualityService.getChecklistTemplates();
  }

  @Get('checklists/:id')
  @ApiOperation({ summary: 'Get checklist by ID' })
  findOneChecklist(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findOneChecklist(id, user.companyId);
  }

  @Post('checklists')
  @ApiOperation({ summary: 'Create new checklist' })
  createChecklist(@Body() body: any, @CurrentUser() user: any) {
    // Frontend sendet items[].order statt sortOrder
    const dto: CreateQualityChecklistDto = {
      ...body,
      items: (body.items || []).map((item: any, idx: number) => ({
        name: item.name,
        description: item.description,
        required: item.required ?? true,
        sortOrder: item.sortOrder ?? item.order ?? idx,
      })),
    };
    return this.qualityService.createChecklist(user.companyId, dto);
  }

  @Put('checklists/:id')
  @ApiOperation({ summary: 'Update checklist' })
  updateChecklist(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    const dto = {
      ...body,
      items: body.items ? body.items.map((item: any, idx: number) => ({
        name: item.name,
        description: item.description,
        required: item.required ?? true,
        sortOrder: item.sortOrder ?? item.order ?? idx,
      })) : undefined,
    };
    return this.qualityService.updateChecklist(id, user.companyId, dto);
  }

  @Delete('checklists/:id')
  @ApiOperation({ summary: 'Delete checklist' })
  deleteChecklist(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.deleteChecklist(id, user.companyId);
  }

  // ============ QUALITY CHECKS ============

  @Get('checks')
  @ApiOperation({ summary: 'List all quality checks' })
  findAllChecks(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('productionOrderId') productionOrderId?: string,
    @Query('search') search?: string,
  ) {
    return this.qualityService.findAllChecks(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      type,
      productionOrderId,
      search,
    });
  }

  @Get('checks/stats')
  @ApiOperation({ summary: 'Get quality check stats' })
  getStats(@CurrentUser() user: any) {
    return this.qualityService.getStatistics(user.companyId);
  }

  @Get('checks/statistics')
  @ApiOperation({ summary: 'Get quality check statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.qualityService.getStatistics(user.companyId);
  }

  @Get('checks/:id')
  @ApiOperation({ summary: 'Get quality check by ID' })
  findOneCheck(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findOneCheck(id, user.companyId);
  }

  @Post('checks')
  @ApiOperation({ summary: 'Create new quality check' })
  createCheck(@Body() dto: CreateQualityCheckDto, @CurrentUser() user: any) {
    return this.qualityService.createCheck(user.companyId, dto);
  }

  @Put('checks/:id')
  @ApiOperation({ summary: 'Update quality check' })
  updateCheck(
    @Param('id') id: string,
    @Body() dto: UpdateQualityCheckDto,
    @CurrentUser() user: any,
  ) {
    return this.qualityService.updateCheck(id, user.companyId, dto);
  }

  @Post('checks/:id/complete')
  @ApiOperation({ summary: 'Complete quality check with results' })
  completeCheck(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    // Frontend sendet overallStatus statt status, value statt measuredValue
    const dto: CompleteQualityCheckDto = {
      status: body.status ?? body.overallStatus,
      notes: body.notes ?? body.overallNotes,
      results: (body.results || []).map((r: any) => ({
        checklistItemId: r.checklistItemId,
        passed: r.passed,
        notes: r.notes,
        measuredValue: r.measuredValue ?? r.value,
        photoUrls: r.photoUrls || [],
      })),
    };
    return this.qualityService.completeCheck(id, user.companyId, dto);
  }

  @Delete('checks/:id')
  @ApiOperation({ summary: 'Delete quality check' })
  deleteCheck(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.deleteCheck(id, user.companyId);
  }
}
