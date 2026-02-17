import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { EmployeeContractsService } from './employee-contracts.service';
import { CreateEmployeeContractDto, UpdateEmployeeContractDto } from './dto/employee-contract.dto';

@ApiTags('Employee Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employee-contracts')
export class EmployeeContractsController {
  constructor(private readonly employeeContractsService: EmployeeContractsService) {}

  @Get()
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
  @ApiOperation({ summary: 'Get employee contract by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeContractsService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new employee contract' })
  create(@Body() dto: CreateEmployeeContractDto, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeContractsService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update employee contract' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeContractDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    console.log('UPDATE CONTRACT BODY:', JSON.stringify(dto));
    return this.employeeContractsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete employee contract' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.employeeContractsService.delete(id, user.companyId);
  }
}
