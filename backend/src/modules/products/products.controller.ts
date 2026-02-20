import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isService', required: false, type: String })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationDto & { categoryId?: string; isService?: string },
  ) {
    return this.productsService.findAll(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get product statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.productsService.getStats(user.companyId);
  }

  @Get('categories')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get all product categories' })
  findAllCategories(@CurrentUser() user: CurrentUserPayload) {
    return this.productsService.findAllCategories(user.companyId);
  }

  @Post('categories')
  @RequirePermissions('products:write')
  @ApiOperation({ summary: 'Create product category' })
  createCategory(
    @Body() data: { name: string; description?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productsService.createCategory(user.companyId, data);
  }

  @Get(':id')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.productsService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('products:write')
  @ApiOperation({ summary: 'Create new product' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: CurrentUserPayload) {
    return this.productsService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('products:write')
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productsService.update(id, user.companyId, dto);
  }

  @Post(':id/adjust-stock')
  @RequirePermissions('products:write')
  @ApiOperation({ summary: 'Adjust product stock' })
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.productsService.adjustStock(id, user.companyId, dto, user.userId);
  }

  @Get('low-stock')
  @RequirePermissions('products:read')
  @ApiOperation({ summary: 'Get products below reorder point (Nachbestellliste)' })
  getLowStock(@CurrentUser() user: CurrentUserPayload) {
    return this.productsService.getLowStockProducts(user.companyId);
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  @ApiOperation({ summary: 'Deactivate product' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.productsService.remove(id, user.companyId);
  }
}
