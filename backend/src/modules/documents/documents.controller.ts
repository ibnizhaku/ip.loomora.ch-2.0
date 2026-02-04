import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateFolderDto,
  UpdateFolderDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  MoveDocumentDto,
  DocumentSearchDto,
} from './dto/document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ==================== FOLDERS ====================

  @Post('folders')
  async createFolder(
    @CurrentUser() user: any,
    @Body() dto: CreateFolderDto,
  ) {
    return this.documentsService.createFolder(user.companyId, dto, user.id);
  }

  @Get('folders')
  async findAllFolders(
    @CurrentUser() user: any,
    @Query('parentId') parentId?: string,
  ) {
    return this.documentsService.findAllFolders(user.companyId, parentId);
  }

  @Get('folders/:id')
  async findFolderById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.findFolderById(id, user.companyId);
  }

  @Get('folders/:id/path')
  async getFolderPath(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.getFolderPath(id, user.companyId);
  }

  @Put('folders/:id')
  async updateFolder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
  ) {
    return this.documentsService.updateFolder(id, user.companyId, dto);
  }

  @Delete('folders/:id')
  async deleteFolder(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteFolder(id, user.companyId);
  }

  @Post('folders/initialize')
  async initializeDefaultFolders(@CurrentUser() user: any) {
    return this.documentsService.initializeDefaultFolders(user.companyId, user.id);
  }

  // ==================== DOCUMENTS ====================

  @Post()
  async createDocument(
    @CurrentUser() user: any,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user.companyId, dto, user.id);
  }

  @Get()
  async findAllDocuments(
    @CurrentUser() user: any,
    @Query() params: DocumentSearchDto,
  ) {
    return this.documentsService.findAllDocuments(user.companyId, params);
  }

  @Get('statistics')
  async getStorageStats(@CurrentUser() user: any) {
    return this.documentsService.getStorageStats(user.companyId);
  }

  @Get(':id')
  async findDocumentById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.findDocumentById(id, user.companyId);
  }

  @Put(':id')
  async updateDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(id, user.companyId, dto);
  }

  @Patch(':id/move')
  async moveDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: MoveDocumentDto,
  ) {
    return this.documentsService.moveDocument(id, user.companyId, dto);
  }

  @Patch(':id/archive')
  async archiveDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.archiveDocument(id, user.companyId);
  }

  @Delete(':id')
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(id, user.companyId);
  }

  @Post(':id/versions')
  async createVersion(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { storageUrl: string; storagePath?: string; fileSize: number; changeNote?: string },
  ) {
    return this.documentsService.createVersion(id, user.companyId, user.id, data);
  }
}
