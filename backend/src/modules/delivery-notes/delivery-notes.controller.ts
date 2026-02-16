import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DeliveryNotesService } from './delivery-notes.service';
import { CreateDeliveryNoteDto, UpdateDeliveryNoteDto } from './dto/delivery-note.dto';

@ApiTags('Delivery Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery-notes')
export class DeliveryNotesController {
  constructor(private readonly deliveryNotesService: DeliveryNotesService) {}

  @Get()
  @ApiOperation({ summary: 'List all delivery notes' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.deliveryNotesService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      customerId,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get delivery note statistics' })
  getStats(@CurrentUser() user: any) {
    return this.deliveryNotesService.getStats(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery note by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveryNotesService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new delivery note' })
  create(@Body() dto: CreateDeliveryNoteDto, @CurrentUser() user: any) {
    return this.deliveryNotesService.create(user.companyId, dto);
  }

  @Post('from-order/:orderId')
  @ApiOperation({ summary: 'Create delivery note from order' })
  createFromOrder(@Param('orderId') orderId: string, @CurrentUser() user: any) {
    return this.deliveryNotesService.createFromOrder(orderId, user.companyId);
  }

  @Post(':id/ship')
  @ApiOperation({ summary: 'Ship delivery note' })
  ship(
    @Param('id') id: string,
    @Body() body: { carrier?: string; trackingNumber?: string },
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.ship(id, user.companyId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update delivery note' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery note' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveryNotesService.delete(id, user.companyId);
  }
}
