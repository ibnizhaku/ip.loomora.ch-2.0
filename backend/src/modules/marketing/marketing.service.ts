import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateCampaignDto, 
  UpdateCampaignDto, 
  CreateLeadDto, 
  UpdateLeadDto, 
  ConvertLeadDto,
  CreateEmailCampaignDto,
  UpdateEmailCampaignDto,
  CreateLeadActivityDto,
  LeadStatus,
} from './dto/marketing.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async getMarketingOverview(companyId: string) {
    const [campaigns] = await Promise.all([
      this.prisma.emailCampaign.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const newsletters = campaigns.map((c: any) => ({
      id: c.id,
      subject: c.subject,
      status: (c.status || 'DRAFT').toLowerCase() === 'sent' ? 'sent' : (c.status || 'DRAFT').toLowerCase() === 'scheduled' ? 'scheduled' : 'draft',
      sentAt: c.sentAt ? c.sentAt.toISOString().split('T')[0] : null,
      recipients: 0,
      opens: 0,
      clicks: 0,
      unsubscribes: 0,
      bounces: 0,
    }));

    return {
      newsletters,
      templates: [],
      lists: [],
    };
  }

  // ============== CAMPAIGNS ==============
  async findAllCampaigns(companyId: string, query: PaginationDto) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { leads: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneCampaign(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
      include: {
        leads: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: { select: { leads: true } },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async createCampaign(companyId: string, dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateCampaign(id: string, companyId: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return this.prisma.campaign.update({
      where: { id },
      data: dto,
    });
  }

  async removeCampaign(id: string, companyId: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return this.prisma.campaign.delete({ where: { id } });
  }

  async getCampaignStats(companyId: string) {
    const [total, active, totalBudget, totalSpent] = await Promise.all([
      this.prisma.campaign.count({ where: { companyId } }),
      this.prisma.campaign.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.campaign.aggregate({
        where: { companyId },
        _sum: { budget: true },
      }),
      this.prisma.campaign.aggregate({
        where: { companyId },
        _sum: { spent: true },
      }),
    ]);

    return {
      totalCampaigns: total,
      activeCampaigns: active,
      totalBudget: Number(totalBudget._sum.budget || 0),
      totalSpent: Number(totalSpent._sum.spent || 0),
    };
  }

  // ============== LEADS ==============
  async findAllLeads(companyId: string, query: PaginationDto & { status?: string; source?: string; assignedToId?: string; campaignId?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, source, assignedToId, campaignId } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          campaign: { select: { id: true, name: true } },
          _count: { select: { activities: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneLead(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        campaign: { select: { id: true, name: true } },
        activities: { orderBy: { activityDate: 'desc' }, take: 20 },
        customer: { select: { id: true, name: true, number: true } },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async createLead(companyId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateLead(id: string, companyId: string, dto: UpdateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }

  async removeLead(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.lead.delete({ where: { id } });
  }

  async convertLeadToCustomer(companyId: string, dto: ConvertLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.status === LeadStatus.WON) {
      throw new BadRequestException('Lead already converted');
    }

    // Generate customer number
    const lastCustomer = await this.prisma.customer.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
    });
    const lastNum = lastCustomer?.number 
      ? parseInt(lastCustomer.number.replace('K-', '')) 
      : 0;
    const customerNumber = `K-${String(lastNum + 1).padStart(3, '0')}`;

    // Create customer from lead
    const customer = await this.prisma.customer.create({
      data: {
        number: customerNumber,
        name: lead.name,
        companyName: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        companyId,
      },
    });

    // Update lead status and link to customer
    await this.prisma.lead.update({
      where: { id: dto.leadId },
      data: {
        status: LeadStatus.WON,
        customerId: customer.id,
        convertedAt: new Date(),
      },
    });

    // Optionally create a project
    let project = null;
    if (dto.createProject && dto.projectName) {
      const lastProject = await this.prisma.project.findFirst({
        where: { companyId },
        orderBy: { number: 'desc' },
      });
      const lastProjNum = lastProject?.number 
        ? parseInt(lastProject.number.replace('P-', '')) 
        : 0;
      const projectNumber = `P-${String(lastProjNum + 1).padStart(4, '0')}`;

      // Get the first user in the company as createdById fallback
      const firstUser = await this.prisma.user.findFirst({
        where: { companyId },
      });

      project = await this.prisma.project.create({
        data: {
          number: projectNumber,
          name: dto.projectName,
          customerId: customer.id,
          companyId,
          budget: Number(lead.estimatedValue || 0),
          createdById: firstUser?.id || '',
        },
      });
    }

    return { customer, project, lead: await this.findOneLead(dto.leadId, companyId) };
  }

  async getLeadStats(companyId: string) {
    const statuses: Array<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'> = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
    
    const statusCounts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.lead.count({ where: { companyId, status } }),
        value: Number((await this.prisma.lead.aggregate({
          where: { companyId, status },
          _sum: { estimatedValue: true },
        }))._sum.estimatedValue || 0),
      }))
    );

    const total = await this.prisma.lead.count({ where: { companyId } });
    const totalValue = await this.prisma.lead.aggregate({
      where: { companyId },
      _sum: { estimatedValue: true },
    });

    const qualifiedLeads = await this.prisma.lead.count({
      where: { companyId, status: { in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] } },
    });
    const wonLeads = await this.prisma.lead.count({ where: { companyId, status: 'WON' } });
    const conversionRate = total > 0 ? Math.round((wonLeads / total) * 100) : 0;

    return {
      totalLeads: total,
      qualifiedLeads,
      conversionRate,
    };
  }

  // ============== LEAD ACTIVITIES ==============
  async createLeadActivity(companyId: string, dto: CreateLeadActivityDto) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: dto.leadId, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.leadActivity.create({
      data: {
        ...dto,
        activityDate: dto.activityDate || new Date().toISOString(),
      },
    });
  }

  async getLeadActivities(leadId: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.leadActivity.findMany({
      where: { leadId },
      orderBy: { activityDate: 'desc' },
    });
  }

  // ============== EMAIL CAMPAIGNS ==============
  async findAllEmailCampaigns(companyId: string, query: PaginationDto) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.emailCampaign.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.emailCampaign.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneEmailCampaign(id: string, companyId: string) {
    const campaign = await this.prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Email campaign not found');
    }

    return campaign;
  }

  async createEmailCampaign(companyId: string, dto: CreateEmailCampaignDto) {
    return this.prisma.emailCampaign.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async updateEmailCampaign(id: string, companyId: string, dto: UpdateEmailCampaignDto) {
    const campaign = await this.prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Email campaign not found');
    }

    return this.prisma.emailCampaign.update({
      where: { id },
      data: dto,
    });
  }

  async removeEmailCampaign(id: string, companyId: string) {
    const campaign = await this.prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Email campaign not found');
    }

    return this.prisma.emailCampaign.delete({ where: { id } });
  }

  async sendEmailCampaign(id: string, companyId: string) {
    const campaign = await this.prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new NotFoundException('Email campaign not found');
    }

    // In production, this would integrate with an email service
    // For now, we'll simulate sending by updating the status
    return this.prisma.emailCampaign.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }
}
