import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, SendPurchaseOrderDto } from './dto/purchase-order.dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @RequirePermissions('purchase-orders:read')
  @ApiOperation({ summary: 'List all purchase orders' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('projectId') projectId?: string,
    @Query('search') search?: string,
  ) {
    return this.purchaseOrdersService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      supplierId,
      projectId,
      search,
    });
  }

  @Get('stats')
  @RequirePermissions('purchase-orders:read')
  @ApiOperation({ summary: 'Get purchase order stats' })
  getStats(@CurrentUser() user: any) {
    return this.purchaseOrdersService.getStatistics(user.companyId);
  }

  @Get('statistics')
  @RequirePermissions('purchase-orders:read')
  @ApiOperation({ summary: 'Get purchase order statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.purchaseOrdersService.getStatistics(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('purchase-orders:read')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('purchase-orders:write')
  @ApiOperation({ summary: 'Create new purchase order' })
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    return this.purchaseOrdersService.create(user.companyId, dto, user.userId);
  }

  @Put(':id')
  @RequirePermissions('purchase-orders:write')
  @ApiOperation({ summary: 'Update purchase order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseOrdersService.update(id, user.companyId, dto, user.userId);
  }

  @Post(':id/send')
  @RequirePermissions('purchase-orders:write')
  @ApiOperation({ summary: 'Send purchase order to supplier' })
  send(
    @Param('id') id: string,
    @Body() dto: SendPurchaseOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseOrdersService.send(id, user.companyId, dto.method, dto.recipientEmail);
  }

  @Delete(':id')
  @RequirePermissions('purchase-orders:delete')
  @ApiOperation({ summary: 'Delete purchase order' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.delete(id, user.companyId, user.userId);
  }
}
