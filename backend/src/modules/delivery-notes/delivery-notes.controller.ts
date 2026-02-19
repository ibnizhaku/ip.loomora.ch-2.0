import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DeliveryNotesService } from './delivery-notes.service';
import { PdfService } from '../../common/services/pdf.service';
import { CreateDeliveryNoteDto, UpdateDeliveryNoteDto } from './dto/delivery-note.dto';

@ApiTags('Delivery Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('delivery-notes')
export class DeliveryNotesController {
  constructor(
    private readonly deliveryNotesService: DeliveryNotesService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @RequirePermissions('delivery-notes:read')
  @ApiOperation({ summary: 'List all delivery notes' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('orderId') orderId?: string,
    @Query('search') search?: string,
  ) {
    return this.deliveryNotesService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      customerId,
      orderId,
      search,
    });
  }

  @Get('stats')
  @RequirePermissions('delivery-notes:read')
  @ApiOperation({ summary: 'Get delivery note statistics' })
  getStats(@CurrentUser() user: any) {
    return this.deliveryNotesService.getStats(user.companyId);
  }

  @Get(':id/pdf')
  @RequirePermissions('delivery-notes:read')
  @ApiOperation({ summary: 'Generate delivery note PDF' })
  async generatePdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const deliveryNote = await this.deliveryNotesService.findOne(id, user.companyId);
    const pdfBuffer = await this.pdfService.generateDeliveryNotePdf(deliveryNote);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Lieferschein-${deliveryNote.number}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @Get(':id')
  @RequirePermissions('delivery-notes:read')
  @ApiOperation({ summary: 'Get delivery note by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveryNotesService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('delivery-notes:write')
  @ApiOperation({ summary: 'Create new delivery note' })
  create(@Body() dto: CreateDeliveryNoteDto, @CurrentUser() user: any) {
    return this.deliveryNotesService.create(user.companyId, dto, user.userId);
  }

  @Post('from-order/:orderId')
  @RequirePermissions('delivery-notes:write')
  @ApiOperation({ summary: 'Create delivery note from order (with optional item selection)' })
  createFromOrder(
    @Param('orderId') orderId: string,
    @Body() body: { itemIds?: string[] },
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.createFromOrder(orderId, user.companyId, user.userId, body?.itemIds);
  }

  @Post(':id/ship')
  @RequirePermissions('delivery-notes:write')
  @ApiOperation({ summary: 'Ship delivery note' })
  ship(
    @Param('id') id: string,
    @Body() body: { carrier?: string; trackingNumber?: string },
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.ship(id, user.companyId, body);
  }

  @Put(':id')
  @RequirePermissions('delivery-notes:write')
  @ApiOperation({ summary: 'Update delivery note' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryNotesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('delivery-notes:delete')
  @ApiOperation({ summary: 'Delete delivery note' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveryNotesService.delete(id, user.companyId);
  }
}
