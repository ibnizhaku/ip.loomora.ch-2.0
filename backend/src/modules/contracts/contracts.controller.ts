import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto, RenewContractDto, TerminateContractDto } from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  @RequirePermissions('contracts:read')
  @ApiOperation({ summary: 'Get all contracts' })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; customerId?: string }) {
    return this.contractsService.findAll(user.companyId, query);
  }

  @Get('stats')
  @RequirePermissions('contracts:read')
  @ApiOperation({ summary: 'Get contract statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) { return this.contractsService.getStats(user.companyId); }

  @Get('expiring')
  @RequirePermissions('contracts:read')
  @ApiOperation({ summary: 'Get expiring contracts' })
  getExpiringContracts(@CurrentUser() user: CurrentUserPayload, @Query('days') days?: number) { return this.contractsService.getExpiringContracts(user.companyId, days); }

  @Get(':id')
  @RequirePermissions('contracts:read')
  @ApiOperation({ summary: 'Get contract by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.findOne(id, user.companyId); }

  @Post()
  @RequirePermissions('contracts:write')
  @ApiOperation({ summary: 'Create new contract' })
  create(@Body() dto: CreateContractDto, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.create(user.companyId, dto); }

  @Put(':id')
  @RequirePermissions('contracts:write')
  @ApiOperation({ summary: 'Update contract' })
  update(@Param('id') id: string, @Body() dto: UpdateContractDto, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.update(id, user.companyId, dto); }

  @Delete(':id')
  @RequirePermissions('contracts:delete')
  @ApiOperation({ summary: 'Delete contract' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.remove(id, user.companyId); }

  @Post(':id/duplicate')
  @RequirePermissions('contracts:write')
  @ApiOperation({ summary: 'Duplicate contract' })
  duplicate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.duplicate(id, user.companyId); }

  @Post(':id/renew')
  @RequirePermissions('contracts:write')
  @ApiOperation({ summary: 'Renew contract' })
  renew(@Param('id') id: string, @Body() dto: RenewContractDto, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.renew(id, user.companyId, dto); }

  @Post(':id/terminate')
  @RequirePermissions('contracts:write')
  @ApiOperation({ summary: 'Terminate contract' })
  terminate(@Param('id') id: string, @Body() dto: TerminateContractDto, @CurrentUser() user: CurrentUserPayload) { return this.contractsService.terminate(id, user.companyId, dto); }
}
