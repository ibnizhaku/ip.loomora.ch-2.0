import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper for pagination – ensures numeric types (query params arrive as strings)
  getPagination(page: number | string = 1, pageSize: number | string = 10) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 10;
    const skip = (p - 1) * ps;
    return { skip, take: ps };
  }

  // Helper for paginated response
  createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number | string,
    pageSize: number | string,
  ) {
    const p = Number(page) || 1;
    const ps = Number(pageSize) || 10;
    return {
      data,
      total,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(total / ps),
    };
  }
}
