import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { TravelExpensesService } from './travel-expenses.service';
import { CreateTravelExpenseDto, UpdateTravelExpenseDto } from './dto/travel-expense.dto';

@ApiTags('Travel Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('travel-expenses')
export class TravelExpensesController {
  constructor(private readonly travelExpensesService: TravelExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List all travel expenses' })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.travelExpensesService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      employeeId,
      status,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get travel expense by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.travelExpensesService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new travel expense' })
  create(@Body() dto: CreateTravelExpenseDto, @CurrentUser() user: CurrentUserPayload) {
    return this.travelExpensesService.create(user.companyId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update travel expense' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTravelExpenseDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.travelExpensesService.update(id, user.companyId, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve travel expense' })
  approve(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.travelExpensesService.approve(id, user.companyId, user.userId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject travel expense' })
  reject(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.travelExpensesService.reject(id, user.companyId, body?.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete travel expense' })
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.travelExpensesService.delete(id, user.companyId);
  }
}
