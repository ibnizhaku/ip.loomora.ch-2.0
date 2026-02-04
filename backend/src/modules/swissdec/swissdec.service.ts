import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateSwissdecSubmissionDto, 
  SwissdecMessageType,
  SwissdecStatus,
  SwissdecRecipient,
  SalaryDeclarationDto,
  AnnualCertificateDto 
} from './dto/swissdec.dto';

@Injectable()
export class SwissdecService {
  constructor(private prisma: PrismaService) {}

  // Swiss social insurance rates 2024
  private readonly RATES = {
    AHV_IV_EO: 0.053,        // 5.3% employee share (10.6% total)
    ALV: 0.011,              // 1.1% employee share (2.2% total)
    ALV_MAX_SALARY: 148200,  // Maximum insured salary
    ALV_Z_RATE: 0.005,       // 0.5% additional for salary > 148'200
    NBUV: 0.0097,            // ~0.97% average (varies by insurer)
    BVG_COORD_DEDUCTION: 25725,  // 2024 coordination deduction
    BVG_MIN_SALARY: 22050,   // Minimum insured salary
    BVG_MAX_SALARY: 88200,   // Maximum insured salary
  };

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    year?: number;
    messageType?: string;
  }) {
    const { page = 1, pageSize = 20, status, year, messageType } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (year) where.year = year;
    if (messageType) where.messageType = messageType;

    const [data, total] = await Promise.all([
      this.prisma.swissdecSubmission.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.swissdecSubmission.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string, companyId: string) {
    const submission = await this.prisma.swissdecSubmission.findFirst({
      where: { id, companyId },
      include: {
        declarations: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, ahvNumber: true } },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Swissdec-Meldung nicht gefunden');
    }

    return submission;
  }

  async create(companyId: string, dto: CreateSwissdecSubmissionDto) {
    // Generate reference number
    const year = dto.year;
    const count = await this.prisma.swissdecSubmission.count({ where: { companyId, year } });
    const reference = `ELM-${year}-${String(count + 1).padStart(4, '0')}`;

    // Get employees
    const employeeWhere: any = { companyId, status: 'ACTIVE' };
    if (dto.employeeIds?.length) {
      employeeWhere.id = { in: dto.employeeIds };
    }

    const employees = await this.prisma.employee.findMany({
      where: employeeWhere,
      include: {
        payslips: {
          where: dto.month 
            ? { year, month: dto.month }
            : { year },
        },
      },
    });

    // Create submission
    const submission = await this.prisma.swissdecSubmission.create({
      data: {
        companyId,
        reference,
        messageType: dto.messageType,
        year: dto.year,
        month: dto.month,
        recipients: dto.recipients,
        status: SwissdecStatus.DRAFT,
        employeeCount: employees.length,
        declarations: {
          create: employees.map(emp => {
            const payslips = emp.payslips;
            const totals = this.calculateTotals(payslips);
            
            return {
              employeeId: emp.id,
              year: dto.year,
              month: dto.month,
              data: totals,
            };
          }),
        },
      },
    });

    return submission;
  }

  async validate(id: string, companyId: string) {
    const submission = await this.findOne(id, companyId);

    if (submission.status !== SwissdecStatus.DRAFT) {
      throw new BadRequestException('Nur Entwürfe können validiert werden');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate each declaration
    for (const decl of submission.declarations) {
      const emp = decl.employee;
      const data = decl.data as any;

      // Check AHV number
      if (!emp.ahvNumber || !this.validateAhvNumber(emp.ahvNumber)) {
        errors.push(`${emp.firstName} ${emp.lastName}: Ungültige AHV-Nummer`);
      }

      // Check salary data
      if (!data.grossSalary || data.grossSalary <= 0) {
        errors.push(`${emp.firstName} ${emp.lastName}: Bruttolohn fehlt`);
      }

      // Validate deductions
      if (data.ahvIvEo && Math.abs(data.ahvIvEo - data.grossSalary * this.RATES.AHV_IV_EO) > 1) {
        warnings.push(`${emp.firstName} ${emp.lastName}: AHV/IV/EO-Abzug weicht vom Standardsatz ab`);
      }
    }

    const isValid = errors.length === 0;

    await this.prisma.swissdecSubmission.update({
      where: { id },
      data: {
        status: isValid ? SwissdecStatus.VALIDATED : SwissdecStatus.DRAFT,
        validationErrors: errors,
        validationWarnings: warnings,
        validatedAt: isValid ? new Date() : null,
      },
    });

    return {
      isValid,
      errors,
      warnings,
      declarationCount: submission.declarations.length,
    };
  }

  async submit(id: string, companyId: string, testMode: boolean = true) {
    const submission = await this.findOne(id, companyId);

    if (submission.status !== SwissdecStatus.VALIDATED) {
      throw new BadRequestException('Nur validierte Meldungen können übermittelt werden');
    }

    // Generate ELM XML
    const xml = await this.generateElmXml(submission, companyId);

    // In production, this would submit to the actual Swissdec distributor
    // For now, we simulate the submission
    const submissionResult = {
      success: true,
      transmissionId: `TX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      testMode,
    };

    await this.prisma.swissdecSubmission.update({
      where: { id },
      data: {
        status: SwissdecStatus.SUBMITTED,
        submittedAt: new Date(),
        transmissionId: submissionResult.transmissionId,
        xmlContent: xml,
      },
    });

    return submissionResult;
  }

  // Generate ELM XML according to Swissdec standard
  async generateElmXml(submission: any, companyId: string): Promise<string> {
    const company = await this.prisma.company.findFirst({ where: { id: companyId } });
    
    const declarations = submission.declarations.map((decl: any) => {
      const data = decl.data as any;
      const emp = decl.employee;
      
      return `
      <Person>
        <SV-AS-Nummer>${emp.ahvNumber || ''}</SV-AS-Nummer>
        <Nachname>${emp.lastName}</Nachname>
        <Vorname>${emp.firstName}</Vorname>
        <Lohn>
          <BruttolohnAHV>${data.grossSalary?.toFixed(2) || '0.00'}</BruttolohnAHV>
          <AHV-IVBeitrag>${data.ahvIvEo?.toFixed(2) || '0.00'}</AHV-IVBeitrag>
          <ALV-Beitrag>${data.alv?.toFixed(2) || '0.00'}</ALV-Beitrag>
          <BVG-Beitrag>${data.bvg?.toFixed(2) || '0.00'}</BVG-Beitrag>
          <Nettolohn>${data.netSalary?.toFixed(2) || '0.00'}</Nettolohn>
        </Lohn>
      </Person>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Swissdec xmlns="http://www.swissdec.ch/schema/ld/20230101">
  <Header>
    <UID>${company?.vatNumber || ''}</UID>
    <Firmenname>${company?.name || ''}</Firmenname>
    <Meldungstyp>${submission.messageType}</Meldungstyp>
    <Jahr>${submission.year}</Jahr>
    ${submission.month ? `<Monat>${submission.month}</Monat>` : ''}
    <Erstellungsdatum>${new Date().toISOString()}</Erstellungsdatum>
    <Referenz>${submission.reference}</Referenz>
  </Header>
  <Personen>${declarations}
  </Personen>
</Swissdec>`;
  }

  // Generate annual salary certificate (Lohnausweis)
  async generateAnnualCertificate(companyId: string, employeeId: string, year: number): Promise<AnnualCertificateDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId },
    });
    if (!employee) throw new NotFoundException('Mitarbeiter nicht gefunden');

    const payslips = await this.prisma.payslip.findMany({
      where: { employeeId, year },
      orderBy: { month: 'asc' },
    });

    // Sum up all amounts for the year
    const totals = payslips.reduce((acc, ps) => ({
      grossSalary: acc.grossSalary + Number(ps.grossSalary || 0),
      ahvIvEo: acc.ahvIvEo + Number(ps.ahvIvEo || 0),
      alv: acc.alv + Number(ps.alv || 0),
      bvg: acc.bvg + Number(ps.bvg || 0),
      netSalary: acc.netSalary + Number(ps.netSalary || 0),
      quellensteuer: acc.quellensteuer + Number(ps.quellensteuer || 0),
    }), {
      grossSalary: 0,
      ahvIvEo: 0,
      alv: 0,
      bvg: 0,
      netSalary: 0,
      quellensteuer: 0,
    });

    return {
      employeeId,
      year,
      grossSalary: totals.grossSalary,
      incidentalBenefits: 0,
      boardAndLodging: 0,
      companyCarPrivateUse: 0,
      otherBenefits: 0,
      totalGross: totals.grossSalary,
      deductionAhvIvEo: totals.ahvIvEo,
      deductionAlv: totals.alv,
      deductionBvg: totals.bvg,
      deductionOther: 0,
      netSalary: totals.netSalary,
      withholdingTax: totals.quellensteuer,
      expenseReimbursements: 0,
    };
  }

  // Calculate salary totals from payslips
  private calculateTotals(payslips: any[]) {
    return payslips.reduce((acc, ps) => ({
      grossSalary: acc.grossSalary + Number(ps.grossSalary || 0),
      ahvIvEo: acc.ahvIvEo + Number(ps.ahvIvEo || 0),
      alv: acc.alv + Number(ps.alv || 0),
      bvg: acc.bvg + Number(ps.bvg || 0),
      ktg: acc.ktg + Number(ps.ktg || 0),
      nbuv: acc.nbuv + Number(ps.nbuv || 0),
      quellensteuer: acc.quellensteuer + Number(ps.quellensteuer || 0),
      netSalary: acc.netSalary + Number(ps.netSalary || 0),
    }), {
      grossSalary: 0,
      ahvIvEo: 0,
      alv: 0,
      bvg: 0,
      ktg: 0,
      nbuv: 0,
      quellensteuer: 0,
      netSalary: 0,
    });
  }

  // Validate Swiss AHV number (756.XXXX.XXXX.XX)
  private validateAhvNumber(ahv: string): boolean {
    const cleaned = ahv.replace(/[.\s]/g, '');
    if (cleaned.length !== 13) return false;
    if (!cleaned.startsWith('756')) return false;
    
    // Verify checksum (EAN-13 algorithm)
    const digits = cleaned.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[12];
  }

  // Get submission statistics
  async getStatistics(companyId: string, year: number) {
    const submissions = await this.prisma.swissdecSubmission.findMany({
      where: { companyId, year },
    });

    const byStatus = submissions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = submissions.reduce((acc, s) => {
      acc[s.messageType] = (acc[s.messageType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      year,
      totalSubmissions: submissions.length,
      byStatus,
      byType,
      lastSubmission: submissions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0],
    };
  }
}
