import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductionOrdersService } from './production-orders.service';
import { CreateProductionOrderDto, UpdateProductionOrderDto, TimeBookingDto } from './dto/production-order.dto';

@ApiTags('Production Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('production-orders')
export class ProductionOrdersController {
  constructor(private readonly productionOrdersService: ProductionOrdersService) {}

  @Get()
  @RequirePermissions('production-orders:read')
  @ApiOperation({ summary: 'List all production orders' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('projectId') projectId?: string,
    @Query('search') search?: string,
  ) {
    return this.productionOrdersService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      priority,
      projectId,
      search,
    });
  }

  @Get('stats')
  @RequirePermissions('production-orders:read')
  @ApiOperation({ summary: 'Get production stats' })
  getStats(@CurrentUser() user: any) {
    return this.productionOrdersService.getStatistics(user.companyId);
  }

  @Get('statistics')
  @RequirePermissions('production-orders:read')
  @ApiOperation({ summary: 'Get production statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.productionOrdersService.getStatistics(user.companyId);
  }

  @Get('capacity')
  @RequirePermissions('production-orders:read')
  @ApiOperation({ summary: 'Get capacity overview by workstation' })
  getCapacityOverview(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productionOrdersService.getCapacityOverview(user.companyId, startDate, endDate);
  }

  @Get(':id')
  @RequirePermissions('production-orders:read')
  @ApiOperation({ summary: 'Get production order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productionOrdersService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('production-orders:write')
  @ApiOperation({ summary: 'Create new production order' })
  create(@Body() dto: CreateProductionOrderDto, @CurrentUser() user: any) {
    return this.productionOrdersService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('production-orders:write')
  @ApiOperation({ summary: 'Update production order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductionOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.update(id, user.companyId, dto);
  }

  @Post(':id/book-time')
  @RequirePermissions('production-orders:write')
  @ApiOperation({ summary: 'Book time to an operation' })
  bookTime(
    @Param('id') id: string,
    @Body() dto: TimeBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.bookTime(id, user.companyId, dto);
  }

  @Post(':id/complete')
  @RequirePermissions('production-orders:write')
  @ApiOperation({ summary: 'Mark entire production order as completed' })
  complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.completeOrder(id, user.companyId);
  }

  @Post(':id/operations/:operationId/complete')
  @RequirePermissions('production-orders:write')
  @ApiOperation({ summary: 'Mark an operation as completed' })
  completeOperation(
    @Param('id') id: string,
    @Param('operationId') operationId: string,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.completeOperation(id, user.companyId, operationId);
  }

  @Delete(':id')
  @RequirePermissions('production-orders:delete')
  @ApiOperation({ summary: 'Delete production order' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productionOrdersService.delete(id, user.companyId);
  }
}
