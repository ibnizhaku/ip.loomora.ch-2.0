import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto, UpdateGoodsReceiptDto, QualityCheckDto } from './dto/goods-receipt.dto';

@ApiTags('Goods Receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'List all goods receipts' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.goodsReceiptsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      supplierId,
      startDate,
      endDate,
      search,
    });
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get goods receipt statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.goodsReceiptsService.getStatistics(user.companyId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending purchase orders awaiting receipt' })
  getPendingReceipts(@CurrentUser() user: any) {
    return this.goodsReceiptsService.getPendingReceipts(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goods receipt by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.goodsReceiptsService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new goods receipt' })
  create(@Body() dto: CreateGoodsReceiptDto, @CurrentUser() user: any) {
    return this.goodsReceiptsService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update goods receipt' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGoodsReceiptDto,
    @CurrentUser() user: any,
  ) {
    return this.goodsReceiptsService.update(id, user.companyId, dto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm goods receipt and update inventory' })
  confirm(@Param('id') id: string, @CurrentUser() user: any) {
    return this.goodsReceiptsService.confirm(id, user.companyId);
  }

  @Post(':id/quality-check')
  @ApiOperation({ summary: 'Perform quality check on receipt item' })
  qualityCheck(
    @Param('id') id: string,
    @Body() dto: QualityCheckDto,
    @CurrentUser() user: any,
  ) {
    return this.goodsReceiptsService.performQualityCheck(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goods receipt (reverses inventory)' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.goodsReceiptsService.delete(id, user.companyId);
  }
}
