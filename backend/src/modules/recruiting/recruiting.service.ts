import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateJobPostingDto, 
  UpdateJobPostingDto, 
  CreateCandidateDto, 
  UpdateCandidateDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  JobStatus,
  CandidateStatus,
} from './dto/recruiting.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class RecruitingService {
  constructor(private prisma: PrismaService) {}

  // ============== JOB POSTINGS ==============
  async findAllJobPostings(companyId: string, query: PaginationDto & { status?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { candidates: true } },
          contactPerson: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneJobPosting(id: string, companyId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id, companyId },
      include: {
        candidates: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        contactPerson: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { candidates: true } },
      },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    return posting;
  }

  async createJobPosting(companyId: string, dto: CreateJobPostingDto) {
    return this.prisma.jobPosting.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateJobPosting(id: string, companyId: string, dto: UpdateJobPostingDto) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id, companyId },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    return this.prisma.jobPosting.update({
      where: { id },
      data: dto,
    });
  }

  async removeJobPosting(id: string, companyId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id, companyId },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    return this.prisma.jobPosting.delete({ where: { id } });
  }

  async publishJobPosting(id: string, companyId: string) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id, companyId },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  // ============== CANDIDATES ==============
  async findAllCandidates(companyId: string, query: PaginationDto & { status?: string; jobPostingId?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, jobPostingId } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (jobPostingId) {
      where.jobPostingId = jobPostingId;
    }

    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          jobPosting: { select: { id: true, title: true } },
          _count: { select: { interviews: true } },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneCandidate(id: string, companyId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, companyId },
      include: {
        jobPosting: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            interviewers: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async createCandidate(companyId: string, dto: CreateCandidateDto) {
    // Verify job posting exists
    const jobPosting = await this.prisma.jobPosting.findFirst({
      where: { id: dto.jobPostingId, companyId },
    });

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }

    return this.prisma.candidate.create({
      data: {
        ...dto,
        companyId,
      },
      include: {
        jobPosting: { select: { id: true, title: true } },
      },
    });
  }

  async updateCandidate(id: string, companyId: string, dto: UpdateCandidateDto) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, companyId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.candidate.update({
      where: { id },
      data: dto,
    });
  }

  async removeCandidate(id: string, companyId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, companyId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return this.prisma.candidate.delete({ where: { id } });
  }

  async hireCandidate(id: string, companyId: string) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id, companyId },
      include: { jobPosting: true },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Update candidate status
    await this.prisma.candidate.update({
      where: { id },
      data: {
        status: CandidateStatus.HIRED,
        hiredAt: new Date(),
      },
    });

    // Optionally close the job posting
    // This could be configurable based on business rules
    
    return this.findOneCandidate(id, companyId);
  }

  // ============== INTERVIEWS ==============
  async createInterview(companyId: string, dto: CreateInterviewDto) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: dto.candidateId, companyId },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // Update candidate status to interview if not already further in pipeline
    if (candidate.status === CandidateStatus.NEW || candidate.status === CandidateStatus.SCREENING) {
      await this.prisma.candidate.update({
        where: { id: dto.candidateId },
        data: { status: CandidateStatus.INTERVIEW },
      });
    }

    return this.prisma.interview.create({
      data: {
        ...dto,
        companyId,
        interviewers: dto.interviewerIds ? {
          connect: dto.interviewerIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        interviewers: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateInterview(id: string, companyId: string, dto: UpdateInterviewDto) {
    const interview = await this.prisma.interview.findFirst({
      where: { id, companyId },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return this.prisma.interview.update({
      where: { id },
      data: {
        ...dto,
        interviewers: dto.interviewerIds ? {
          set: dto.interviewerIds.map(id => ({ id })),
        } : undefined,
      },
    });
  }

  async getRecruitingStats(companyId: string) {
    const [openPositions, totalCandidates, newCandidates, interviews] = await Promise.all([
      this.prisma.jobPosting.count({ where: { companyId, status: JobStatus.PUBLISHED } }),
      this.prisma.candidate.count({ where: { companyId } }),
      this.prisma.candidate.count({ where: { companyId, status: CandidateStatus.NEW } }),
      this.prisma.interview.count({
        where: {
          companyId,
          status: 'SCHEDULED',
          scheduledAt: { gte: new Date() },
        },
      }),
    ]);

    return {
      openPositions,
      totalCandidates,
      newCandidates,
      upcomingInterviews: interviews,
    };
  }

  async getCandidatePipeline(companyId: string, jobPostingId?: string) {
    const where: any = { companyId };
    if (jobPostingId) {
      where.jobPostingId = jobPostingId;
    }

    const statuses = ['NEW', 'SCREENING', 'INTERVIEW', 'ASSESSMENT', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];
    
    const pipeline = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.candidate.count({ where: { ...where, status } }),
      }))
    );

    return pipeline;
  }
}
