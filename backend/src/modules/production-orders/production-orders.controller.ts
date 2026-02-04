import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductionOrdersService } from './production-orders.service';
import { CreateProductionOrderDto, UpdateProductionOrderDto, TimeBookingDto } from './dto/production-order.dto';

@ApiTags('Production Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production-orders')
export class ProductionOrdersController {
  constructor(private readonly productionOrdersService: ProductionOrdersService) {}

  @Get()
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

  @Get('statistics')
  @ApiOperation({ summary: 'Get production statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.productionOrdersService.getStatistics(user.companyId);
  }

  @Get('capacity')
  @ApiOperation({ summary: 'Get capacity overview by workstation' })
  getCapacityOverview(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.productionOrdersService.getCapacityOverview(user.companyId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get production order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productionOrdersService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new production order' })
  create(@Body() dto: CreateProductionOrderDto, @CurrentUser() user: any) {
    return this.productionOrdersService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update production order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductionOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.update(id, user.companyId, dto);
  }

  @Post(':id/book-time')
  @ApiOperation({ summary: 'Book time to an operation' })
  bookTime(
    @Param('id') id: string,
    @Body() dto: TimeBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.bookTime(id, user.companyId, dto);
  }

  @Post(':id/operations/:operationId/complete')
  @ApiOperation({ summary: 'Mark an operation as completed' })
  completeOperation(
    @Param('id') id: string,
    @Param('operationId') operationId: string,
    @CurrentUser() user: any,
  ) {
    return this.productionOrdersService.completeOperation(id, user.companyId, operationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete production order' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productionOrdersService.delete(id, user.companyId);
  }
}
