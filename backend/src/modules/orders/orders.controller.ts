import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get order statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.getStats(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.update(id, user.companyId, dto);
  }

  @Post(':id/create-invoice')
  @ApiOperation({ summary: 'Create invoice from order' })
  createInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.createInvoice(id, user.companyId, user.userId);
  }

  @Post(':id/create-delivery-note')
  @ApiOperation({ summary: 'Create delivery note from order' })
  createDeliveryNote(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.createDeliveryNote(id, user.companyId, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.remove(id, user.companyId);
  }
}
