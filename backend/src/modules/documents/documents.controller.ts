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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
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
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
export class DmsDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':id')
  @RequirePermissions('documents:read')
  findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.findDocumentById(id, user.companyId);
  }
}

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ==================== FOLDERS ====================

  @Post('folders')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Create folder' })
  async createFolder(
    @CurrentUser() user: any,
    @Body() dto: CreateFolderDto,
  ) {
    return this.documentsService.createFolder(user.companyId, dto, user.userId);
  }

  @Get('folders')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'List folders' })
  async findAllFolders(
    @CurrentUser() user: any,
    @Query('parentId') parentId?: string,
  ) {
    return this.documentsService.findAllFolders(user.companyId, parentId);
  }

  @Get('folders/:id')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get folder by ID' })
  async findFolderById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.findFolderById(id, user.companyId);
  }

  @Get('folders/:id/path')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get folder path' })
  async getFolderPath(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.getFolderPath(id, user.companyId);
  }

  @Put('folders/:id')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Update folder' })
  async updateFolder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
  ) {
    return this.documentsService.updateFolder(id, user.companyId, dto);
  }

  @Delete('folders/:id')
  @RequirePermissions('documents:delete')
  @ApiOperation({ summary: 'Delete folder' })
  async deleteFolder(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteFolder(id, user.companyId);
  }

  @Post('folders/initialize')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Initialize default folders' })
  async initializeDefaultFolders(@CurrentUser() user: any) {
    return this.documentsService.initializeDefaultFolders(user.companyId, user.userId);
  }

  // ==================== DOCUMENTS ====================

  @Post('upload')
  @RequirePermissions('documents:write')
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
  @ApiOperation({ summary: 'Upload document file' })
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
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Create document (metadata)' })
  async createDocument(
    @CurrentUser() user: any,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user.companyId, dto, user.userId);
  }

  @Get()
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'List all documents' })
  async findAllDocuments(
    @CurrentUser() user: any,
    @Query() params: DocumentSearchDto,
  ) {
    return this.documentsService.findAllDocuments(user.companyId, params);
  }

  @Get('statistics')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get storage statistics' })
  async getStorageStats(@CurrentUser() user: any) {
    return this.documentsService.getStorageStats(user.companyId);
  }

  @Get(':id/download')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Download document file' })
  async downloadDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const doc = await this.documentsService.findDocumentById(id, user.companyId);

    let absolutePath: string | null = null;

    if (doc.storagePath) {
      if (doc.storagePath.startsWith('/')) {
        if (existsSync(doc.storagePath)) {
          absolutePath = doc.storagePath;
        }
      } else {
        const resolved = join(UPLOAD_DIR, doc.storagePath);
        if (existsSync(resolved)) absolutePath = resolved;
        const resolvedCwd = join(process.cwd(), doc.storagePath);
        if (!absolutePath && existsSync(resolvedCwd)) absolutePath = resolvedCwd;
      }
    }

    if (!absolutePath) {
      throw new HttpNotFoundException(
        `Datei nicht auf dem Server gefunden. Pfad: ${doc.storagePath || '(leer)'}`,
      );
    }

    res.set({
      'Content-Type': doc.mimeType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
    });

    const stream = createReadStream(absolutePath);
    return new StreamableFile(stream);
  }

  @Get(':id')
  @RequirePermissions('documents:read')
  @ApiOperation({ summary: 'Get document by ID' })
  async findDocumentById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.findDocumentById(id, user.companyId);
  }

  @Put(':id')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Update document metadata' })
  async updateDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(id, user.companyId, dto);
  }

  @Patch(':id/move')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Move document to folder' })
  async moveDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: MoveDocumentDto,
  ) {
    return this.documentsService.moveDocument(id, user.companyId, dto);
  }

  @Patch(':id/archive')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Archive document' })
  async archiveDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.archiveDocument(id, user.companyId);
  }

  @Delete(':id')
  @RequirePermissions('documents:delete')
  @ApiOperation({ summary: 'Delete document' })
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(id, user.companyId);
  }

  @Post(':id/versions')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Create new document version' })
  async createVersion(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { storageUrl: string; storagePath?: string; fileSize: number; changeNote?: string },
  ) {
    return this.documentsService.createVersion(id, user.companyId, user.userId, data);
  }

  @Post(':id/share')
  @RequirePermissions('documents:write')
  @ApiOperation({ summary: 'Share document' })
  async shareDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { emails?: string[]; expiresInDays?: number; permission?: string; expiresAt?: string },
  ) {
    return this.documentsService.shareDocument(id, user.companyId, dto);
  }
}
