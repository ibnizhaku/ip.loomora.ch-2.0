import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCompanyDto, CreateTeamMemberDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Map bankName → bank for frontend compatibility
    return {
      ...company,
      bank: (company as any).bankName || null,
      logo: (company as any).logoUrl || null,
    };
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  // --- Logo ---

  async updateLogo(companyId: string, file: Express.Multer.File) {
    const logoUrl = `/api/uploads/logos/${file.filename}`;

    return this.prisma.company.update({
      where: { id: companyId },
      data: { logoUrl },
    });
  }

  // --- Team Members ---

  async getTeamMembers(companyId: string) {
    return this.prisma.companyTeamMember.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });
  }

  async addTeamMember(companyId: string, dto: CreateTeamMemberDto) {
    return this.prisma.companyTeamMember.create({
      data: {
        companyId,
        name: dto.name,
        role: dto.role,
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });
  }

  async removeTeamMember(companyId: string, memberId: string) {
    const member = await this.prisma.companyTeamMember.findFirst({
      where: { id: memberId, companyId },
    });

    if (!member) {
      throw new NotFoundException('Teammitglied nicht gefunden');
    }

    await this.prisma.companyTeamMember.delete({
      where: { id: memberId },
    });

    return { success: true };
  }
}
