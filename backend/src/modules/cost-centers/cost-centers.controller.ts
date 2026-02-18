import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto, UpdateCostCenterDto } from './dto/cost-center.dto';

@ApiTags('Cost Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Get()
  @RequirePermissions('cost-centers:read')
  @ApiOperation({ summary: 'List all cost centers' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.costCentersService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('hierarchy')
  @RequirePermissions('cost-centers:read')
  @ApiOperation({ summary: 'Get cost center hierarchy' })
  getHierarchy(@CurrentUser() user: any) {
    return this.costCentersService.getHierarchy(user.companyId);
  }

  @Get('report')
  @RequirePermissions('cost-centers:read')
  @ApiOperation({ summary: 'Get cost center report' })
  getReport(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('costCenterIds') costCenterIds?: string,
  ) {
    return this.costCentersService.getReport(user.companyId, {
      startDate,
      endDate,
      costCenterIds: costCenterIds?.split(','),
    });
  }

  @Get(':id')
  @RequirePermissions('cost-centers:read')
  @ApiOperation({ summary: 'Get cost center by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('cost-centers:write')
  @ApiOperation({ summary: 'Create new cost center' })
  create(@Body() body: any, @CurrentUser() user: any) {
    const dto: CreateCostCenterDto = {
      ...body,
      number: body.number ?? body.code,
      budgetAmount: body.budgetAmount ?? body.budget,
    };
    return this.costCentersService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('cost-centers:write')
  @ApiOperation({ summary: 'Update cost center' })
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    const dto: UpdateCostCenterDto = {
      ...body,
      ...(body.code !== undefined && { number: body.code }),
      ...(body.budget !== undefined && { budgetAmount: body.budget }),
    };
    return this.costCentersService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('cost-centers:delete')
  @ApiOperation({ summary: 'Delete cost center' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.delete(id, user.companyId);
  }
}
