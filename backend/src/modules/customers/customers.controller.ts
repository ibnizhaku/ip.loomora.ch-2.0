import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateContactDto, UpdateContactDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get('debtors')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get customers with open receivables (Debtors list)' })
  findDebtors(@CurrentUser() user: CurrentUserPayload) {
    return this.customersService.findDebtors(user.companyId);
  }

  @Get('stats')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get customer statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.customersService.getStats(user.companyId);
  }

  @Get()
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(@CurrentUser() user: CurrentUserPayload, @Query() query: PaginationDto) {
    return this.customersService.findAll(user.companyId, query);
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.customersService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Create new customer' })
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: CurrentUserPayload) {
    return this.customersService.create(user.companyId, dto, user.userId);
  }

  @Put(':id')
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Update customer' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.customersService.update(id, user.companyId, dto, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('customers:delete')
  @ApiOperation({ summary: 'Deactivate customer' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.customersService.remove(id, user.companyId, user.userId);
  }

  // ========================
  // CUSTOMER CONTACTS
  // ========================

  @Get(':id/contacts')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get contacts for a customer' })
  getContacts(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.customersService.getContacts(id, user.companyId);
  }

  @Post(':id/contacts')
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Add a contact to a customer' })
  addContact(
    @Param('id') id: string,
    @Body() dto: CreateContactDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.customersService.addContact(id, user.companyId, dto);
  }

  @Put(':id/contacts/:contactId')
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Update a customer contact' })
  updateContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.customersService.updateContact(id, contactId, user.companyId, dto);
  }

  @Delete(':id/contacts/:contactId')
  @RequirePermissions('customers:delete')
  @ApiOperation({ summary: 'Remove a customer contact' })
  removeContact(
    @Param('id') id: string,
    @Param('contactId') contactId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.customersService.removeContact(id, contactId, user.companyId);
  }
}
