import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreditNotesService } from './credit-notes.service';
import { PdfService } from '../../common/services/pdf.service';
import { CreateCreditNoteDto, UpdateCreditNoteDto, CreateCreditNoteFromInvoiceDto } from './dto/credit-note.dto';

@ApiTags('Credit Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('credit-notes')
export class CreditNotesController {
  constructor(
    private readonly creditNotesService: CreditNotesService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @RequirePermissions('credit-notes:read')
  @ApiOperation({ summary: 'List all credit notes' })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.creditNotesService.findAll(user.companyId, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
      status,
      customerId,
      search,
    });
  }

  @Get(':id/pdf')
  @RequirePermissions('credit-notes:read')
  @ApiOperation({ summary: 'Generate credit note PDF' })
  async generatePdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const creditNote = await this.creditNotesService.findOne(id, user.companyId);
    const pdfBuffer = await this.pdfService.generateCreditNotePdf(creditNote);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Gutschrift-${creditNote.number}.pdf"`,
    });
    res.send(pdfBuffer);
  }

  @Get(':id')
  @RequirePermissions('credit-notes:read')
  @ApiOperation({ summary: 'Get credit note by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.findOne(id, user.companyId);
  }

  @Post()
  @RequirePermissions('credit-notes:write')
  @ApiOperation({ summary: 'Create new credit note' })
  create(@Body() dto: CreateCreditNoteDto, @CurrentUser() user: any) {
    return this.creditNotesService.create(user.companyId, dto, user.userId);
  }

  @Post('from-invoice/:invoiceId')
  @RequirePermissions('credit-notes:write')
  @ApiOperation({ summary: 'Create credit note from invoice (full or partial positions)' })
  createFromInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: CreateCreditNoteFromInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.creditNotesService.createFromInvoice(invoiceId, user.companyId, dto, user.userId);
  }

  @Post(':id/send')
  @RequirePermissions('credit-notes:write')
  @ApiOperation({ summary: 'Send credit note (set status to ISSUED)' })
  send(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.send(id, user.companyId);
  }

  @Put(':id')
  @RequirePermissions('credit-notes:write')
  @ApiOperation({ summary: 'Update credit note' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCreditNoteDto,
    @CurrentUser() user: any,
  ) {
    return this.creditNotesService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @RequirePermissions('credit-notes:delete')
  @ApiOperation({ summary: 'Delete credit note' })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.delete(id, user.companyId);
  }
}
