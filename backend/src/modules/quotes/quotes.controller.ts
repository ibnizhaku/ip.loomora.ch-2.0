import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Query() query: PaginationDto & { status?: string; customerId?: string },
  ) {
    return this.quotesService.findAll(user.companyId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get quote statistics' })
  getStats(@CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.getStats(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new quote' })
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.create(user.companyId, user.userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update quote' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.quotesService.update(id, user.companyId, dto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send quote (set status to SENT)' })
  sendQuote(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.sendQuote(id, user.companyId);
  }

  @Post(':id/convert-to-order')
  @ApiOperation({ summary: 'Convert quote to order' })
  convertToOrder(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.convertToOrder(id, user.companyId, user.userId);
  }

  @Post(':id/convert-to-invoice')
  @ApiOperation({ summary: 'Convert quote to invoice' })
  convertToInvoice(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.convertToInvoice(id, user.companyId, user.userId);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate quote' })
  duplicate(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.duplicate(id, user.companyId, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.quotesService.remove(id, user.companyId);
  }
}
