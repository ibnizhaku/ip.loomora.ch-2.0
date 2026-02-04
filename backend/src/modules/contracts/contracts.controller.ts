import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { 
  CreateContractDto, 
  UpdateContractDto, 
  RenewContractDto,
  TerminateContractDto,
} from './dto/contract.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all contracts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto & { status?: string; customerId?: string }) {
    return this.contractsService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contract statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.contractsService.getStats(user.companyId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring contracts' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getExpiringContracts(@CurrentUser() user: CurrentUserPayload, @Query('days') days?: number) {
    return this.contractsService.getExpiringContracts(user.companyId, days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.contractsService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new contract' })
  create(@Body() dto: CreateContractDto, @CurrentUser() user: CurrentUserPayload) {
    return this.contractsService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contract' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contractsService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.contractsService.remove(id, user.companyId);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew contract' })
  renew(
    @Param('id') id: string,
    @Body() dto: RenewContractDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contractsService.renew(id, user.companyId, dto);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate contract' })
  terminate(
    @Param('id') id: string,
    @Body() dto: TerminateContractDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.contractsService.terminate(id, user.companyId, dto);
  }
}
