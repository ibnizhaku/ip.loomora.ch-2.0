import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @RequirePermissions('orders:read')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationDto & { status?: string; customerId?: string },
  ) {
    return this.ordersService.findAll(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('orders:read')
  @ApiOperation({ summary: 'Get order statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.getStats(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('orders:read')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('orders:write')
  @ApiOperation({ summary: 'Create new order' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @RequirePermissions('orders:write')
  @ApiOperation({ summary: 'Update order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.update(id, user.companyId, dto);
  }

  @Post(':id/create-invoice')
  @RequirePermissions('orders:write')
  @ApiOperation({ summary: 'Create invoice from order' })
  createInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.createInvoice(id, user.companyId, user.userId);
  }

  @Post(':id/create-delivery-note')
  @RequirePermissions('orders:write')
  @ApiOperation({ summary: 'Create delivery note from order' })
  createDeliveryNote(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.createDeliveryNote(id, user.companyId, user.userId);
  }

  @Post(':id/duplicate')
  @RequirePermissions('orders:write')
  @ApiOperation({ summary: 'Duplicate order' })
  duplicate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.duplicate(id, user.companyId, user.userId);
  }

  @Patch(':id/status')
  @RequirePermissions('orders:write')
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.updateStatus(id, user.companyId, body.status as any, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('orders:delete')
  @ApiOperation({ summary: 'Delete order' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.remove(id, user.companyId);
  }
}
