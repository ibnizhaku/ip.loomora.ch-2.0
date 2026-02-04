import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, SendPurchaseOrderDto } from './dto/purchase-order.dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
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

  @Get('statistics')
  @ApiOperation({ summary: 'Get purchase order statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.purchaseOrdersService.getStatistics(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new purchase order' })
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: any) {
    return this.purchaseOrdersService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase order' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseOrdersService.update(id, user.companyId, dto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send purchase order to supplier' })
  send(
    @Param('id') id: string,
    @Body() dto: SendPurchaseOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.purchaseOrdersService.send(id, user.companyId, dto.method, dto.recipientEmail);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete purchase order' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchaseOrdersService.delete(id, user.companyId);
  }
}
