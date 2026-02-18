import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from './dto/employee.dto';
import { mapEmployeeResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: EmployeeQueryDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'lastName', sortOrder = 'asc', status, departmentId } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          department: { select: { id: true, name: true } },
          contracts: { orderBy: { startDate: 'desc' }, take: 1 },
          absences: {
            where: { type: 'VACATION', status: 'APPROVED', startDate: { gte: yearStart, lt: yearEnd } },
            select: { days: true },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    // Transform to match frontend format using mapper
    const transformedData = data.map((e) => {
      const mapped = mapEmployeeResponse(e);
      const vacationTaken = (e.absences || []).reduce((sum, a) => sum + Number(a.days), 0);
      return {
        ...mapped,
        name: `${e.firstName} ${e.lastName}`,
        position: e.position || 'Keine Angabe',
        department: e.department?.name || 'Keine Abteilung',
        email: e.email || '',
        phone: e.phone || e.mobile || '',
        status: e.status.toLowerCase(),
        hireDate: e.hireDate?.toISOString(),
        startDate: e.hireDate?.toLocaleDateString('de-CH') || '',
        avatar: e.avatarUrl,
        vacationTaken,
      };
    });

    return this.prisma.createPaginatedResponse(transformedData, total, page, pageSize);
  }

  async findById(id: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        department: true,
        contracts: { orderBy: { startDate: 'desc' } },
        absences: { orderBy: { startDate: 'desc' }, take: 10 },
        manager: { select: { id: true, firstName: true, lastName: true, position: true } },
        projectMemberships: {
          include: {
            project: { select: { id: true, name: true, status: true } },
          },
        },
        documents: {
          select: { id: true, name: true, createdAt: true, storageUrl: true },
          orderBy: { createdAt: 'desc' as const },
          take: 20,
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Calculate vacationTaken: approved vacation days in current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    const vacationAgg = await this.prisma.absence.aggregate({
      where: {
        employeeId: id,
        type: 'VACATION',
        status: 'APPROVED',
        startDate: { gte: yearStart, lt: yearEnd },
      },
      _sum: { days: true },
    });

    const vacationTaken = Number(vacationAgg._sum.days || 0);

    const mapped = mapEmployeeResponse(employee);
    const emp = employee as any;

    return {
      ...mapped,
      // Address fields
      street: emp.street || null,
      zip: emp.zip || null,
      city: emp.city || null,
      // Vacation
      vacationTaken,
      // Manager
      manager: emp.manager || null,
      // Projects via memberships
      projects: (emp.projectMemberships || []).map((pm: any) => ({
        id: pm.project.id,
        name: pm.project.name,
        role: pm.role || 'Mitglied',
        status: pm.project.status || 'Aktiv',
      })),
      // Documents
      documents: (emp.documents || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name || 'Dokument',
        date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('de-CH') : '',
        url: doc.storageUrl || null,
      })),
      // JSON profile fields
      skills: Array.isArray(emp.skills) ? emp.skills : (emp.skills ? JSON.parse(emp.skills) : []),
      certifications: Array.isArray(emp.certifications) ? emp.certifications : (emp.certifications ? JSON.parse(emp.certifications) : []),
      education: Array.isArray(emp.education) ? emp.education : (emp.education ? JSON.parse(emp.education) : []),
      // Verknüpfter Benutzer
      userId: emp.user?.id || null,
      userName: emp.user ? `${emp.user.firstName} ${emp.user.lastName}`.trim() : null,
      userEmail: emp.user?.email || null,
    };
  }

  async create(companyId: string, dto: CreateEmployeeDto) {
    // Validate departmentId if provided (skip if empty string or null)
    if (dto.departmentId && dto.departmentId.trim() !== '') {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId },
      });
      if (!department) {
        // Department doesn't exist - clear it
        dto.departmentId = undefined;
      }
    } else {
      // Empty or null - clear it
      dto.departmentId = undefined;
    }

    // Generate employee number
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: { employeeCounter: { increment: 1 } },
    });

    const number = `MA-${String(company.employeeCounter).padStart(4, '0')}`;

    const employee = await this.prisma.employee.create({
      data: {
        number,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        mobile: dto.mobile,
        position: dto.position,
        departmentId: dto.departmentId,
        status: dto.status || 'ACTIVE',
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        ahvNumber: dto.ahvNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        nationality: dto.nationality,
        maritalStatus: dto.maritalStatus,
        childrenCount: dto.childrenCount || 0,
        employmentType: dto.employmentType,
        workloadPercent: dto.workloadPercent || 100,
        iban: dto.iban,
        street: dto.street,
        zip: dto.zip,
        city: dto.city,
        managerId: dto.managerId || null,
        skills: dto.skills || [],
        certifications: dto.certifications || [],
        education: dto.education || [],
        companyId,
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    return employee;
  }

  async update(id: string, companyId: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate departmentId if being changed (skip if empty)
    if (dto.departmentId && dto.departmentId.trim() !== '' && dto.departmentId !== employee.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId },
      });
      if (!department) {
        // Department doesn't exist - clear it
        dto.departmentId = undefined;
      }
    } else if (dto.departmentId === '' || dto.departmentId === null) {
      // Explicitly clearing department
      dto.departmentId = undefined;
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        mobile: dto.mobile,
        position: dto.position,
        departmentId: dto.departmentId,
        status: dto.status,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : undefined,
        ahvNumber: dto.ahvNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        nationality: dto.nationality,
        maritalStatus: dto.maritalStatus,
        childrenCount: dto.childrenCount,
        employmentType: dto.employmentType,
        workloadPercent: dto.workloadPercent,
        iban: dto.iban,
        notes: dto.notes,
        street: dto.street,
        zip: dto.zip,
        city: dto.city,
        managerId: dto.managerId !== undefined ? (dto.managerId || null) : undefined,
        skills: dto.skills !== undefined ? dto.skills : undefined,
        certifications: dto.certifications !== undefined ? dto.certifications : undefined,
        education: dto.education !== undefined ? dto.education : undefined,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.employee.delete({ where: { id } });
    return { success: true };
  }

  // Statistics
  async getStats(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEmployees, activeEmployees, newThisMonth, departments] = await Promise.all([
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.employee.count({ where: { companyId, hireDate: { gte: startOfMonth } } }),
      this.prisma.employee.groupBy({
        by: ['departmentId'],
        where: { companyId },
        _count: true,
      }),
    ]);

    // Build department breakdown with names
    const deptIds = departments.map(d => d.departmentId).filter(Boolean) as string[];
    const deptNames = deptIds.length > 0
      ? await this.prisma.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true } })
      : [];
    const deptMap = new Map(deptNames.map(d => [d.id, d.name]));

    const departmentBreakdown = departments.map(d => ({
      department: d.departmentId ? (deptMap.get(d.departmentId) || 'Unbekannt') : 'Keine Abteilung',
      count: d._count,
    }));

    return { totalEmployees, activeEmployees, newThisMonth, departmentBreakdown };
  }

  // Departments
  async getDepartments(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  // Orgchart
  async getOrgchart(companyId: string) {
    const departments = await this.prisma.department.findMany({
      where: { companyId },
      include: {
        employees: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            email: true,
            phone: true,
          },
          orderBy: { lastName: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Look up managers by managerId
    const managerIds = departments.map(d => d.managerId).filter(Boolean) as string[];
    const managers = managerIds.length > 0
      ? await this.prisma.employee.findMany({
          where: { id: { in: managerIds } },
          select: { id: true, firstName: true, lastName: true, position: true },
        })
      : [];

    const managerMap = new Map(managers.map(m => [m.id, m]));

    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      manager: dept.managerId ? managerMap.get(dept.managerId) || null : null,
      employees: dept.employees,
      employeeCount: dept.employees.length,
    }));
  }
}
