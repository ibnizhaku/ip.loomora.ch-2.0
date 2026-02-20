import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CalculationsService } from './calculations.service';
import { CreateCalculationDto, UpdateCalculationDto } from './dto/calculation.dto';

@ApiTags('Calculations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Get()
  @RequirePermissions('quotes:read')
  @ApiOperation({ summary: 'List all calculations' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.calculationsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      projectId,
      customerId,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions('quotes:read')
  @ApiOperation({ summary: 'Get calculation by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calculationsService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('quotes:write')
  @ApiOperation({ summary: 'Create new calculation' })
  create(@Body() dto: CreateCalculationDto, @CurrentUser() user: any) {
    return this.calculationsService.create(user.companyId, dto, user.userId);
  }

  @Put(':id')
  @RequirePermissions('quotes:write')
  @ApiOperation({ summary: 'Update calculation' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCalculationDto,
    @CurrentUser() user: any,
  ) {
    return this.calculationsService.update(id, user.companyId, dto, user.userId);
  }

  @Post(':id/transfer-to-quote')
  @RequirePermissions('quotes:write')
  @ApiOperation({ summary: 'Transfer calculation to quote' })
  transferToQuote(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calculationsService.transferToQuote(id, user.companyId, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('quotes:delete')
  @ApiOperation({ summary: 'Delete calculation' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.calculationsService.delete(id, user.companyId, user.userId);
  }
}
