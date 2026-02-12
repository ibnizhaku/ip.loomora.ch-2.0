import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'lastName', sortOrder = 'asc' } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    // Users are linked via UserCompanyMembership, not direct companyId
    const where: any = {
      memberships: {
        some: { companyId }
      }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          memberships: {
            where: { companyId },
            select: {
              role: {
                select: { name: true }
              },
              isOwner: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Map to include role from membership
    const mappedData = data.map(user => ({
      ...user,
      role: user.memberships[0]?.role?.name || user.role,
      isOwner: user.memberships[0]?.isOwner || false,
      memberships: undefined, // Remove from response
    }));

    return this.prisma.createPaginatedResponse(mappedData, total, page, pageSize);
  }

  async findById(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { 
        id,
        memberships: {
          some: { companyId }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }
}
