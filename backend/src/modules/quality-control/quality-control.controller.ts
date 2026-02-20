import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
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
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('quality')
export class QualityControlController {
  constructor(private readonly qualityService: QualityControlService) {}

  @Get('checklists')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'List all quality checklists' })
  findAllChecklists(@CurrentUser() user: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('type') type?: string, @Query('category') category?: string, @Query('search') search?: string) {
    return this.qualityService.findAllChecklists(user.companyId, { page: page ? parseInt(page) : undefined, pageSize: pageSize ? parseInt(pageSize) : undefined, type, category, search });
  }

  @Get('checklists/templates')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'Get predefined checklist templates for Metallbau' })
  getChecklistTemplates() { return this.qualityService.getChecklistTemplates(); }

  @Get('checklists/:id')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'Get checklist by ID' })
  findOneChecklist(@Param('id') id: string, @CurrentUser() user: any) { return this.qualityService.findOneChecklist(id, user.companyId); }

  @Post('checklists')
  @RequirePermissions('quality-control:write')
  @ApiOperation({ summary: 'Create new checklist' })
  createChecklist(@Body() body: any, @CurrentUser() user: any) {
    const dto: CreateQualityChecklistDto = { ...body, items: (body.items || []).map((item: any, idx: number) => ({ name: item.name, description: item.description, required: item.required ?? true, sortOrder: item.sortOrder ?? item.order ?? idx })) };
    return this.qualityService.createChecklist(user.companyId, dto);
  }

  @Put('checklists/:id')
  @RequirePermissions('quality-control:write')
  @ApiOperation({ summary: 'Update checklist' })
  updateChecklist(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    const dto = { ...body, items: body.items ? body.items.map((item: any, idx: number) => ({ name: item.name, description: item.description, required: item.required ?? true, sortOrder: item.sortOrder ?? item.order ?? idx })) : undefined };
    return this.qualityService.updateChecklist(id, user.companyId, dto);
  }

  @Delete('checklists/:id')
  @RequirePermissions('quality-control:delete')
  @ApiOperation({ summary: 'Delete checklist' })
  deleteChecklist(@Param('id') id: string, @CurrentUser() user: any) { return this.qualityService.deleteChecklist(id, user.companyId); }

  @Get('checks')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'List all quality checks' })
  findAllChecks(@CurrentUser() user: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('status') status?: string, @Query('type') type?: string, @Query('productionOrderId') productionOrderId?: string, @Query('search') search?: string) {
    return this.qualityService.findAllChecks(user.companyId, { page: page ? parseInt(page) : undefined, pageSize: pageSize ? parseInt(pageSize) : undefined, status, type, productionOrderId, search });
  }

  @Get('checks/stats')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'Get quality check stats' })
  getStats(@CurrentUser() user: any) { return this.qualityService.getStatistics(user.companyId); }

  @Get('checks/statistics')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'Get quality check statistics' })
  getStatistics(@CurrentUser() user: any) { return this.qualityService.getStatistics(user.companyId); }

  @Get('checks/:id/pdf')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'Download quality check as PDF report' })
  async downloadPdf(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const check = await this.qualityService.findOneCheck(id, user.companyId);
    const lines: string[] = [
      `QS-Prüfbericht: ${check.number || id}`,
      `Status: ${check.status}`,
      `Typ: ${check.type || '–'}`,
      `Datum: ${check.createdAt ? new Date(check.createdAt).toLocaleDateString('de-CH') : '–'}`,
      '',
      'Ergebnisse:',
      ...(check.results || []).map((r: any) => `  - ${r.checklistItem?.name || ''}: ${r.passed ? '✓ Bestanden' : '✗ Nicht bestanden'} ${r.notes ? '(' + r.notes + ')' : ''}`),
      '',
      `Notizen: ${check.notes || '–'}`,
    ];
    const content = lines.join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="QS-${check.number || id}.txt"`);
    res.send(content);
  }

  @Get('checks/:id')
  @RequirePermissions('quality-control:read')
  @ApiOperation({ summary: 'Get quality check by ID' })
  findOneCheck(@Param('id') id: string, @CurrentUser() user: any) { return this.qualityService.findOneCheck(id, user.companyId); }

  @Post('checks')
  @RequirePermissions('quality-control:write')
  @ApiOperation({ summary: 'Create new quality check' })
  createCheck(@Body() dto: CreateQualityCheckDto, @CurrentUser() user: any) { return this.qualityService.createCheck(user.companyId, dto); }

  @Put('checks/:id')
  @RequirePermissions('quality-control:write')
  @ApiOperation({ summary: 'Update quality check' })
  updateCheck(@Param('id') id: string, @Body() dto: UpdateQualityCheckDto, @CurrentUser() user: any) { return this.qualityService.updateCheck(id, user.companyId, dto); }

  @Post('checks/:id/complete')
  @RequirePermissions('quality-control:write')
  @ApiOperation({ summary: 'Complete quality check with results' })
  completeCheck(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    const dto: CompleteQualityCheckDto = { status: body.status ?? body.overallStatus, notes: body.notes ?? body.overallNotes, results: (body.results || []).map((r: any) => ({ checklistItemId: r.checklistItemId, passed: r.passed, notes: r.notes, measuredValue: r.measuredValue ?? r.value, photoUrls: r.photoUrls || [] })) };
    return this.qualityService.completeCheck(id, user.companyId, dto);
  }

  @Delete('checks/:id')
  @RequirePermissions('quality-control:delete')
  @ApiOperation({ summary: 'Delete quality check' })
  deleteCheck(@Param('id') id: string, @CurrentUser() user: any) { return this.qualityService.deleteCheck(id, user.companyId); }
}
