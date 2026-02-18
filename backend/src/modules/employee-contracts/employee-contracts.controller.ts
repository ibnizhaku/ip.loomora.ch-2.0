import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { EmployeeContractsService } from './employee-contracts.service';
import { CreateEmployeeContractDto, UpdateEmployeeContractDto } from './dto/employee-contract.dto';

@ApiTags('Employee Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('employee-contracts')
export class EmployeeContractsController {
  constructor(private readonly employeeContractsService: EmployeeContractsService) {}

  @Get()
  @RequirePermissions('employee-contracts:read')
  @ApiOperation({ summary: 'List all employee contracts' })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('employeeId') employeeId?: string,
    @Query('contractType') contractType?: string,
    @Query('search') search?: string,
  ) {
    return this.employeeContractsService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      employeeId,
      contractType,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions('employee-contracts:read')
  @ApiOperation({ summary: 'Get employee contract by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeContractsService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('employee-contracts:write')
  @ApiOperation({ summary: 'Create new employee contract' })
  create(@Body() dto: CreateEmployeeContractDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeContractsService.create(user.companyId, dto);
  }

  @Put(':id')
  @RequirePermissions('employee-contracts:write')
  @ApiOperation({ summary: 'Update employee contract' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeContractDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.employeeContractsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('employee-contracts:delete')
  @ApiOperation({ summary: 'Delete employee contract' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeContractsService.delete(id, user.companyId);
  }
}
