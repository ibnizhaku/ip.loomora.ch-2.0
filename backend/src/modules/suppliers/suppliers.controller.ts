import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.suppliersService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get supplier statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.suppliersService.getStats(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.suppliersService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new supplier' })
  create(@Body() dto: CreateSupplierDto, @CurrentUser() user: CurrentUserPayload) {
    return this.suppliersService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.suppliersService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate supplier' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.suppliersService.remove(id, user.companyId);
  }
}
