import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EcommerceService } from './ecommerce.service';
import { 
  CreateShopOrderDto, 
  UpdateShopOrderDto, 
  CreateDiscountDto, 
  UpdateDiscountDto,
  ValidateDiscountDto,
  CreateReviewDto,
  UpdateReviewDto,
  ShopSettingsDto,
} from './dto/ecommerce.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('E-Commerce')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('ecommerce')
export class EcommerceController {
  constructor(private ecommerceService: EcommerceService) {}

  // ============== SHOP ORDERS ==============
  @Get('orders')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get all shop orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAllOrders(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string }) {
    return this.ecommerceService.findAllOrders(user.companyId, query);
  }

  @Get('orders/stats')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get order statistics' })
  getOrderStats(@CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.getOrderStats(user.companyId);
  }

  @Get('orders/:id')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get order by ID' })
  findOneOrder(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.findOneOrder(id, user.companyId);
  }

  @Post('orders')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Create new shop order' })
  createOrder(@Body() dto: CreateShopOrderDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.createOrder(user.companyId, dto);
  }

  @Put('orders/:id')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Update order' })
  updateOrder(
    @Param('id') id: string,
    @Body() dto: UpdateShopOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ecommerceService.updateOrder(id, user.companyId, dto);
  }

  @Post('orders/:id/cancel')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Cancel order' })
  cancelOrder(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.cancelOrder(id, user.companyId);
  }

  // ============== DISCOUNTS ==============
  @Get('discounts')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get all discounts' })
  findAllDiscounts(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.ecommerceService.findAllDiscounts(user.companyId, query);
  }

  @Get('discounts/:id')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get discount by ID' })
  findOneDiscount(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.findOneDiscount(id, user.companyId);
  }

  @Post('discounts')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Create new discount' })
  createDiscount(@Body() dto: CreateDiscountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.createDiscount(user.companyId, dto);
  }

  @Put('discounts/:id')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Update discount' })
  updateDiscount(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ecommerceService.updateDiscount(id, user.companyId, dto);
  }

  @Delete('discounts/:id')
  @RequirePermissions('ecommerce:delete')
  @ApiOperation({ summary: 'Delete discount' })
  removeDiscount(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.removeDiscount(id, user.companyId);
  }

  @Post('discounts/validate')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Validate discount code' })
  validateDiscount(@Body() dto: ValidateDiscountDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.validateDiscount(user.companyId, dto);
  }

  // ============== REVIEWS ==============
  @Get('reviews')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  findAllReviews(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; productId?: string }) {
    return this.ecommerceService.findAllReviews(user.companyId, query);
  }

  @Get('reviews/stats')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get review statistics' })
  getReviewStats(@CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.getReviewStats(user.companyId);
  }

  @Get('reviews/:id')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get review by ID' })
  findOneReview(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.findOneReview(id, user.companyId);
  }

  @Get('products/:productId/reviews')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get product reviews' })
  getProductReviews(@Param('productId') productId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.getProductReviews(productId, user.companyId);
  }

  @Post('reviews')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Create new review' })
  createReview(@Body() dto: CreateReviewDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.createReview(user.companyId, dto);
  }

  @Put('reviews/:id')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Update review' })
  updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ecommerceService.updateReview(id, user.companyId, dto);
  }

  @Patch('reviews/:id')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Moderate review (approve/reject)' })
  moderateReview(
    @Param('id') id: string,
    @Body() body: { isApproved?: boolean; status?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const status = body.isApproved !== undefined
      ? (body.isApproved ? 'APPROVED' : 'REJECTED')
      : body.status;
    return this.ecommerceService.updateReview(id, user.companyId, { status } as any);
  }

  @Delete('reviews/:id')
  @RequirePermissions('ecommerce:delete')
  @ApiOperation({ summary: 'Delete review' })
  removeReview(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.removeReview(id, user.companyId);
  }

  // ============== SHOP SETTINGS ==============
  @Get('settings')
  @RequirePermissions('ecommerce:read')
  @ApiOperation({ summary: 'Get shop settings' })
  getShopSettings(@CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.getShopSettings(user.companyId);
  }

  @Put('settings')
  @RequirePermissions('ecommerce:write')
  @ApiOperation({ summary: 'Update shop settings' })
  updateShopSettings(@Body() dto: ShopSettingsDto, @CurrentUser() user: CurrentUserPayload) {
    return this.ecommerceService.updateShopSettings(user.companyId, dto);
  }
}
