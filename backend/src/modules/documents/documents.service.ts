import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  MoveDocumentDto,
  DocumentSearchDto,
  FolderType,
  DocumentStatus,
} from './dto/document.dto';
import { Folder, DMSDocument } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // ==================== FOLDERS ====================

  async createFolder(companyId: string, dto: CreateFolderDto, userId: string) {
    // Validate parent folder if provided
    if (dto.parentId) {
      const parent = await this.prisma.folder.findFirst({
        where: { id: dto.parentId, companyId },
      });
      if (!parent) {
        throw new NotFoundException('Übergeordneter Ordner nicht gefunden');
      }
    }

    return this.prisma.folder.create({
      data: {
        companyId,
        name: dto.name,
        parentId: dto.parentId,
        type: dto.type || FolderType.GENERAL,
        description: dto.description,
        projectId: dto.projectId,
        customerId: dto.customerId,
        createdById: userId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { documents: true, children: true } },
      },
    });
  }

  async findAllFolders(companyId: string, parentId?: string) {
    const where: any = { companyId };
    
    if (parentId === 'root' || !parentId) {
      where.parentId = null;
    } else {
      where.parentId = parentId;
    }

    return this.prisma.folder.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { documents: true, children: true } },
      },
    });
  }

  async findFolderById(id: string, companyId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, companyId },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          select: { id: true, name: true, type: true },
          orderBy: { name: 'asc' },
        },
        documents: {
          where: { status: 'ACTIVE' },
          orderBy: { name: 'asc' },
        },
        _count: { select: { documents: true, children: true } },
      },
    });

    if (!folder) {
      throw new NotFoundException('Ordner nicht gefunden');
    }

    return folder;
  }

  async updateFolder(id: string, companyId: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, companyId },
    });

    if (!folder) {
      throw new NotFoundException('Ordner nicht gefunden');
    }

    if (folder.type === 'SYSTEM') {
      throw new BadRequestException('Systemordner können nicht geändert werden');
    }

    // Prevent circular reference
    if (dto.parentId === id) {
      throw new BadRequestException('Ordner kann nicht sein eigener Übergeordneter sein');
    }

    return this.prisma.folder.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { documents: true, children: true } },
      },
    });
  }

  async deleteFolder(id: string, companyId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, companyId },
      include: { _count: { select: { documents: true, children: true } } },
    });

    if (!folder) {
      throw new NotFoundException('Ordner nicht gefunden');
    }

    if (folder.type === 'SYSTEM') {
      throw new BadRequestException('Systemordner können nicht gelöscht werden');
    }

    if (folder._count.documents > 0 || folder._count.children > 0) {
      throw new BadRequestException('Ordner enthält noch Dokumente oder Unterordner');
    }

    return this.prisma.folder.delete({ where: { id } });
  }

  // Get folder breadcrumb path
  async getFolderPath(id: string, companyId: string): Promise<{ id: string; name: string }[]> {
    const path: { id: string; name: string }[] = [];
    let currentId: string | null = id;

    while (currentId) {
      const folder: Folder | null = await this.prisma.folder.findFirst({
        where: { id: currentId, companyId },
      });

      if (!folder) break;

      path.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId;
    }

    return path;
  }

  // ==================== DOCUMENTS ====================

  async createDocument(companyId: string, dto: CreateDocumentDto, userId: string) {
    // Validate folder if provided
    if (dto.folderId) {
      const folder = await this.prisma.folder.findFirst({
        where: { id: dto.folderId, companyId },
      });
      if (!folder) {
        throw new NotFoundException('Ordner nicht gefunden');
      }
    }

    return this.prisma.dMSDocument.create({
      data: {
        companyId,
        name: dto.name,
        folderId: dto.folderId,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        storageUrl: dto.storageUrl,
        storagePath: dto.storagePath,
        description: dto.description,
        tags: dto.tags || [],
        status: 'ACTIVE',
        version: 1,
        projectId: dto.projectId,
        customerId: dto.customerId,
        invoiceId: dto.invoiceId,
        contractId: dto.contractId,
        employeeId: dto.employeeId,
        uploadedById: userId,
      },
      include: {
        folder: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findAllDocuments(companyId: string, params: DocumentSearchDto) {
    const {
      query,
      folderId,
      tags,
      mimeType,
      projectId,
      customerId,
      startDate,
      endDate,
      page = 1,
      pageSize = 50,
    } = params;

    const skip = (page - 1) * pageSize;
    const where: any = { companyId, status: 'ACTIVE' };

    if (folderId) where.folderId = folderId;
    if (projectId) where.projectId = projectId;
    if (customerId) where.customerId = customerId;
    if (mimeType) where.mimeType = { startsWith: mimeType };
    
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.dMSDocument.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          folder: { select: { id: true, name: true } },
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          project: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.dMSDocument.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findDocumentById(id: string, companyId: string) {
    const document = await this.prisma.dMSDocument.findFirst({
      where: { id, companyId },
      include: {
        folder: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
        contract: { select: { id: true, title: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        versions: {
          orderBy: { version: 'desc' },
          take: 10,
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Dokument nicht gefunden');
    }

    return document;
  }

  async updateDocument(id: string, companyId: string, dto: UpdateDocumentDto) {
    await this.findDocumentById(id, companyId);

    return this.prisma.dMSDocument.update({
      where: { id },
      data: {
        name: dto.name,
        folderId: dto.folderId,
        description: dto.description,
        tags: dto.tags,
        status: dto.status,
      },
      include: {
        folder: { select: { id: true, name: true } },
      },
    });
  }

  async moveDocument(id: string, companyId: string, dto: MoveDocumentDto) {
    await this.findDocumentById(id, companyId);

    // Validate target folder
    const targetFolder = await this.prisma.folder.findFirst({
      where: { id: dto.targetFolderId, companyId },
    });

    if (!targetFolder) {
      throw new NotFoundException('Zielordner nicht gefunden');
    }

    return this.prisma.dMSDocument.update({
      where: { id },
      data: { folderId: dto.targetFolderId },
      include: {
        folder: { select: { id: true, name: true } },
      },
    });
  }

  async deleteDocument(id: string, companyId: string) {
    await this.findDocumentById(id, companyId);

    // Soft delete - mark as deleted
    return this.prisma.dMSDocument.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async archiveDocument(id: string, companyId: string) {
    await this.findDocumentById(id, companyId);

    return this.prisma.dMSDocument.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  // Create new document version
  async createVersion(id: string, companyId: string, userId: string, data: {
    storageUrl: string;
    storagePath?: string;
    fileSize: number;
    changeNote?: string;
  }) {
    const document = await this.findDocumentById(id, companyId);

    // Create version record
    await this.prisma.dMSDocumentVersion.create({
      data: {
        documentId: id,
        version: document.version,
        storageUrl: document.storageUrl || '',
        storagePath: document.storagePath,
        fileSize: document.fileSize || 0,
        createdById: userId,
      },
    });

    // Update document with new version
    return this.prisma.dMSDocument.update({
      where: { id },
      data: {
        version: document.version + 1,
        storageUrl: data.storageUrl,
        storagePath: data.storagePath,
        fileSize: data.fileSize,
      },
      include: {
        folder: { select: { id: true, name: true } },
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    });
  }

  // Get storage statistics
  async getStorageStats(companyId: string) {
    const [totalDocs, totalSize, byType, byFolder] = await Promise.all([
      this.prisma.dMSDocument.count({
        where: { companyId, status: 'ACTIVE' },
      }),
      this.prisma.dMSDocument.aggregate({
        where: { companyId, status: 'ACTIVE' },
        _sum: { fileSize: true },
      }),
      this.prisma.dMSDocument.groupBy({
        by: ['mimeType'],
        where: { companyId, status: 'ACTIVE' },
        _count: true,
        _sum: { fileSize: true },
      }),
      this.prisma.folder.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          _count: { select: { documents: true } },
        },
      }),
    ]);

    return {
      totalDocuments: totalDocs,
      totalSize: totalSize._sum.fileSize || 0,
      totalSizeFormatted: this.formatBytes(totalSize._sum.fileSize || 0),
      byMimeType: byType.map((t: any) => ({
        mimeType: t.mimeType || 'unknown',
        count: t._count,
        size: t._sum.fileSize || 0,
      })),
      byFolder: byFolder.map((f: any) => ({
        id: f.id,
        name: f.name,
        documentCount: f._count.documents,
      })),
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Initialize default folders for a company
  async initializeDefaultFolders(companyId: string, userId: string) {
    const defaultFolders = [
      { name: 'Kunden', type: 'CUSTOMER' },
      { name: 'Projekte', type: 'PROJECT' },
      { name: 'Rechnungen', type: 'INVOICE' },
      { name: 'Verträge', type: 'CONTRACT' },
      { name: 'Personal', type: 'EMPLOYEE' },
      { name: 'Allgemein', type: 'GENERAL' },
    ];

    const created = [];
    for (const folder of defaultFolders) {
      const existing = await this.prisma.folder.findFirst({
        where: { companyId, name: folder.name, parentId: null },
      });

      if (!existing) {
        const newFolder = await this.prisma.folder.create({
          data: {
            companyId,
            name: folder.name,
            type: folder.type as any,
            createdById: userId,
          },
        });
        created.push(newFolder);
      }
    }

    return created;
  }
}
