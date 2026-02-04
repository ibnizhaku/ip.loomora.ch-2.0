import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto, UpdateCostCenterDto } from './dto/cost-center.dto';

@ApiTags('Cost Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get cost center hierarchy' })
  getHierarchy(@CurrentUser() user: any) {
    return this.costCentersService.getHierarchy(user.companyId);
  }

  @Get('report')
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
  @ApiOperation({ summary: 'Get cost center by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new cost center' })
  create(@Body() dto: CreateCostCenterDto, @CurrentUser() user: any) {
    return this.costCentersService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cost center' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
    @CurrentUser() user: any,
  ) {
    return this.costCentersService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cost center' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.delete(id, user.companyId);
  }
}
