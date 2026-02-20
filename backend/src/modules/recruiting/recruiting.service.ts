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

  private readonly STATUS_LABELS: Record<string, string> = {
    DRAFT: 'Entwurf',
    PUBLISHED: 'Aktiv',
    PAUSED: 'Pausiert',
    CLOSED: 'Geschlossen',
    FILLED: 'Besetzt',
  };

  private readonly CANDIDATE_STATUS_LABELS: Record<string, string> = {
    NEW: 'Neu',
    SCREENING: 'In Prüfung',
    INTERVIEW: 'Interview geplant',
    ASSESSMENT: 'Assessment',
    OFFER: 'Angebot gesendet',
    HIRED: 'Eingestellt',
    REJECTED: 'Abgelehnt',
    WITHDRAWN: 'Zurückgezogen',
  };

  private readonly SOURCE_LABELS: Record<string, string> = {
    WEBSITE: 'Webseite',
    JOB_PORTAL: 'Jobportal',
    LINKEDIN: 'LinkedIn',
    REFERRAL: 'Empfehlung',
    AGENCY: 'Agentur',
    DIRECT: 'Direktbewerbung',
    OTHER: 'Andere',
  };

  // ============== OVERVIEW ==============
  async getOverview(companyId: string, query: PaginationDto & { status?: string }) {
    const [candidates, jobs, stats, upcomingInterviews] = await Promise.all([
      this.findAllCandidates(companyId, { ...query, pageSize: 50 }),
      this.findAllJobPostings(companyId, { ...query, pageSize: 50 }),
      this.getRecruitingStats(companyId),
      this.getUpcomingInterviews(companyId),
    ]);

    const jobPostings = jobs.data.map((job: any) => ({
      ...job,
      status: this.STATUS_LABELS[job.status] || job.status,
      applicants: job._count?.candidates ?? 0,
      postedDate: job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('de-CH') : '–',
      deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('de-CH') : '–',
    }));

    const applicants = candidates.data.map((c: any) => ({
      ...c,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      position: c.jobPosting?.title || '–',
      experience: '–',
      source: this.SOURCE_LABELS[c.source] || c.source || '–',
      rating: c.rating || 0,
      appliedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('de-CH') : '–',
      status: this.CANDIDATE_STATUS_LABELS[c.status] || c.status,
    }));

    return {
      jobPostings,
      applicants,
      interviews: upcomingInterviews,
      stats,
      totalCandidates: candidates.total,
      totalJobs: jobs.total,
    };
  }

  private async getUpcomingInterviews(companyId: string) {
    const interviews = await this.prisma.interview.findMany({
      where: {
        companyId,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
      include: {
        candidate: { select: { firstName: true, lastName: true, jobPosting: { select: { title: true } } } },
      },
    });

    return interviews.map((iv: any) => ({
      id: iv.id,
      applicant: `${iv.candidate?.firstName || ''} ${iv.candidate?.lastName || ''}`.trim(),
      position: iv.candidate?.jobPosting?.title || '–',
      date: new Date(iv.scheduledAt).toLocaleDateString('de-CH'),
      time: new Date(iv.scheduledAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
      type: iv.type,
    }));
  }

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

  private normalizeEmploymentType(value?: string): string {
    if (!value) return 'FULL_TIME';
    const map: Record<string, string> = {
      fulltime: 'FULL_TIME', full_time: 'FULL_TIME',
      parttime: 'PART_TIME', part_time: 'PART_TIME',
      temporary: 'TEMPORARY',
      contract: 'CONTRACT',
      internship: 'INTERNSHIP',
      apprentice: 'APPRENTICESHIP', apprenticeship: 'APPRENTICESHIP',
    };
    return map[value.toLowerCase()] || value.toUpperCase().replace(/\s+/g, '_');
  }

  private normalizeCandidateStatus(value?: string): string {
    if (!value) return 'NEW';
    const map: Record<string, string> = {
      neu: 'NEW', new: 'NEW',
      'in prüfung': 'SCREENING', screening: 'SCREENING',
      'interview geplant': 'INTERVIEW', interview: 'INTERVIEW',
      assessment: 'ASSESSMENT',
      'angebot gesendet': 'OFFER', angebot: 'OFFER', offer: 'OFFER',
      eingestellt: 'HIRED', hired: 'HIRED',
      abgelehnt: 'REJECTED', rejected: 'REJECTED',
      zurückgezogen: 'WITHDRAWN', withdrawn: 'WITHDRAWN',
    };
    return map[value.toLowerCase()] || value.toUpperCase();
  }

  /**
   * Konvertiert einen Datums-String (z.B. "2026-03-15" aus HTML <input type="date">)
   * in ein JavaScript Date-Objekt, das Prisma korrekt als DateTime akzeptiert.
   * Gibt undefined zurück wenn kein Wert vorhanden.
   */
  private toDate(value?: string | Date | null): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private normalizeJobStatus(value?: string): string {
    if (!value) return 'DRAFT';
    const map: Record<string, string> = {
      aktiv: 'PUBLISHED', active: 'PUBLISHED', published: 'PUBLISHED',
      draft: 'DRAFT', entwurf: 'DRAFT',
      paused: 'PAUSED', pausiert: 'PAUSED',
      closed: 'CLOSED', geschlossen: 'CLOSED',
      filled: 'FILLED', besetzt: 'FILLED',
    };
    return map[value.toLowerCase()] || 'DRAFT';
  }

  async createJobPosting(companyId: string, dto: CreateJobPostingDto & Record<string, any>) {
    const data: any = {
      companyId,
      title: dto.title,
      description: dto.description || '',
      requirements: dto.requirements,
      benefits: (dto as any).responsibilities || dto.benefits,
      department: dto.department,
      location: dto.location,
      remoteAllowed: dto.remoteAllowed,
      employmentType: this.normalizeEmploymentType(dto.employmentType),
      status: this.normalizeJobStatus(dto.status),
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax,
      workloadPercent: dto.workloadPercent,
      startDate: this.toDate(dto.startDate),
      applicationDeadline: this.toDate((dto as any).closingDate ?? dto.applicationDeadline),
      contactPersonId: dto.contactPersonId,
      requiredSkills: dto.requiredSkills,
    };

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    return this.prisma.jobPosting.create({ data });
  }

  async updateJobPosting(id: string, companyId: string, dto: UpdateJobPostingDto) {
    const posting = await this.prisma.jobPosting.findFirst({
      where: { id, companyId },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    const updateData: any = { ...dto };
    if (updateData.employmentType) updateData.employmentType = this.normalizeEmploymentType(updateData.employmentType);
    if (updateData.status) updateData.status = this.normalizeJobStatus(updateData.status);
    if ((updateData as any).responsibilities) {
      updateData.benefits = (updateData as any).responsibilities;
      delete (updateData as any).responsibilities;
    }
    if ((updateData as any).closingDate !== undefined) {
      updateData.applicationDeadline = this.toDate((updateData as any).closingDate);
      delete (updateData as any).closingDate;
    }
    if (updateData.applicationDeadline !== undefined && !(updateData.applicationDeadline instanceof Date)) {
      updateData.applicationDeadline = this.toDate(updateData.applicationDeadline);
    }
    if (updateData.startDate !== undefined && !(updateData.startDate instanceof Date)) {
      updateData.startDate = this.toDate(updateData.startDate);
    }

    return this.prisma.jobPosting.update({
      where: { id },
      data: updateData,
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

    const data: any = { ...dto, companyId };
    if (data.status) data.status = this.normalizeCandidateStatus(data.status);

    return this.prisma.candidate.create({
      data,
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

    const updateData: any = { ...dto };
    if (updateData.status) updateData.status = this.normalizeCandidateStatus(updateData.status);

    return this.prisma.candidate.update({
      where: { id },
      data: updateData,
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

    const { interviewerIds, ...interviewFields } = dto as any;
    return this.prisma.interview.create({
      data: {
        ...interviewFields,
        companyId,
        interviewers: interviewerIds?.length ? {
          connect: interviewerIds.map((uid: string) => ({ id: uid })),
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

    const { interviewerIds, ...updateFields } = dto as any;
    return this.prisma.interview.update({
      where: { id },
      data: {
        ...updateFields,
        interviewers: interviewerIds ? {
          set: interviewerIds.map((uid: string) => ({ id: uid })),
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

    // Interviews this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const interviewsThisWeek = await this.prisma.interview.count({
      where: { companyId, scheduledAt: { gte: weekStart, lte: weekEnd } },
    });

    // Average time to hire (days) - from hired candidates in last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const hiredCandidates = await this.prisma.candidate.findMany({
      where: { companyId, status: CandidateStatus.HIRED, updatedAt: { gte: ninetyDaysAgo } },
      select: { createdAt: true, updatedAt: true },
    });
    const averageTimeToHire = hiredCandidates.length > 0
      ? Math.round(hiredCandidates.reduce((sum, c) => sum + (c.updatedAt.getTime() - c.createdAt.getTime()), 0) / hiredCandidates.length / (1000 * 60 * 60 * 24))
      : 0;

    // Offer acceptance rate
    const [offers, accepted] = await Promise.all([
      this.prisma.candidate.count({ where: { companyId, status: { in: [CandidateStatus.HIRED, 'OFFER_DECLINED' as any] } } }),
      this.prisma.candidate.count({ where: { companyId, status: CandidateStatus.HIRED } }),
    ]);
    const offerAcceptanceRate = offers > 0 ? Math.round((accepted / offers) * 100) : 0;

    return {
      openPositions,
      totalCandidates,
      interviewsThisWeek,
      averageTimeToHire,
      offerAcceptanceRate,
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
