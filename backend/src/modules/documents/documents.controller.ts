import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Patch, UseInterceptors, UploadedFile,
  BadRequestException, NotFoundException as HttpNotFoundException,
  Res, StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { Response } from 'express';
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
  UploadDocumentDto,
} from './dto/document.dto';

// Ensure upload directory exists at startup
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'documents');
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Alias controller for /dms/documents routes (frontend DMS hooks)
@Controller('dms/documents')
@UseGuards(JwtAuthGuard)
export class DmsDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':id')
  findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.findDocumentById(id, user.companyId);
  }
}

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
    return this.documentsService.createFolder(user.companyId, dto, user.userId);
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
    return this.documentsService.initializeDefaultFolders(user.companyId, user.userId);
  }

  // ==================== DOCUMENTS ====================

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  }))
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('Keine Datei hochgeladen');
    }
    return this.documentsService.createDocumentFromUpload(user.companyId, user.userId, file, dto);
  }

  @Post()
  async createDocument(
    @CurrentUser() user: any,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user.companyId, dto, user.userId);
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

  @Get(':id/download')
  async downloadDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const doc = await this.documentsService.findDocumentById(id, user.companyId);

    if (!doc.storagePath || !existsSync(doc.storagePath)) {
      throw new HttpNotFoundException('Datei nicht auf dem Server gefunden');
    }

    res.set({
      'Content-Type': doc.mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
    });

    const stream = createReadStream(doc.storagePath);
    return new StreamableFile(stream);
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
    return this.documentsService.createVersion(id, user.companyId, user.userId, data);
  }

  @Post(':id/share')
  async shareDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { emails?: string[]; expiresInDays?: number; permission?: string; expiresAt?: string },
  ) {
    return this.documentsService.shareDocument(id, user.companyId, dto);
  }
}
