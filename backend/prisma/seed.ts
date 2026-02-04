import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority, AbsenceType, AbsenceStatus, PaymentTerms, VatRate, DocumentStatus, PaymentStatus, PaymentMethod, AccountType, EntryType, TransactionType, ProductionStatus, QualityStatus, ServiceStatus, ServicePriority, ContractStatus, CampaignStatus, LeadStatus, EmploymentType, PayrollStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.$executeRaw`TRUNCATE TABLE "AuditLog" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "TimeEntry" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Task" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Project" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Absence" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Employee" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "CalendarEvent" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Company" CASCADE`;

  // 1. Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Loomora Metallbau AG',
      legalName: 'Loomora Metallbau AG',
      street: 'Industriestrasse 42',
      zipCode: '8005',
      city: 'Zürich',
      country: 'CH',
      email: 'info@loomora.ch',
      phone: '+41 44 123 45 67',
      website: 'https://loomora.ch',
      vatNumber: 'CHE-123.456.789 MWST',
      iban: 'CH93 0076 2011 6238 5295 7',
      bic: 'UBSWCHZH80A',
      bankName: 'UBS Switzerland AG',
      defaultVatRate: 8.1,
      defaultPaymentTerms: 30,
      fiscalYearStart: 1,
      currency: 'CHF',
    },
  });
  console.log('✓ Company created');

  // 2. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@loomora.ch',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      companyId: company.id,
    },
  });
  console.log('✓ Admin user created (admin@loomora.ch / admin123)');

  // 3. Create Employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        number: 'EMP-001',
        firstName: 'Thomas',
        lastName: 'Müller',
        email: 'thomas.mueller@loomora.ch',
        phone: '+41 79 123 45 01',
        position: 'Projektleiter',
        department: 'Projekte',
        employmentType: EmploymentType.FULL_TIME,
        workloadPercent: 100,
        hourlyRate: 95,
        monthlyGrossSalary: 8500,
        hireDate: new Date('2020-01-15'),
        ahvNumber: '756.1234.5678.90',
        companyId: company.id,
      },
    }),
    prisma.employee.create({
      data: {
        number: 'EMP-002',
        firstName: 'Sarah',
        lastName: 'Weber',
        email: 'sarah.weber@loomora.ch',
        phone: '+41 79 123 45 02',
        position: 'Metallbauer',
        department: 'Produktion',
        employmentType: EmploymentType.FULL_TIME,
        workloadPercent: 100,
        hourlyRate: 75,
        monthlyGrossSalary: 6200,
        hireDate: new Date('2021-03-01'),
        ahvNumber: '756.2345.6789.01',
        companyId: company.id,
      },
    }),
    prisma.employee.create({
      data: {
        number: 'EMP-003',
        firstName: 'Marco',
        lastName: 'Bernasconi',
        email: 'marco.bernasconi@loomora.ch',
        phone: '+41 79 123 45 03',
        position: 'Schweisser',
        department: 'Produktion',
        employmentType: EmploymentType.FULL_TIME,
        workloadPercent: 100,
        hourlyRate: 70,
        monthlyGrossSalary: 5800,
        hireDate: new Date('2019-06-15'),
        ahvNumber: '756.3456.7890.12',
        companyId: company.id,
      },
    }),
    prisma.employee.create({
      data: {
        number: 'EMP-004',
        firstName: 'Lisa',
        lastName: 'Keller',
        email: 'lisa.keller@loomora.ch',
        phone: '+41 79 123 45 04',
        position: 'Buchhalterin',
        department: 'Finanzen',
        employmentType: EmploymentType.PART_TIME,
        workloadPercent: 60,
        hourlyRate: 65,
        monthlyGrossSalary: 3900,
        hireDate: new Date('2022-01-01'),
        ahvNumber: '756.4567.8901.23',
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 4 Employees created');

  // 4. Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        number: 'K-001',
        name: 'Immobilien Zürich AG',
        companyName: 'Immobilien Zürich AG',
        street: 'Bahnhofstrasse 100',
        zipCode: '8001',
        city: 'Zürich',
        country: 'CH',
        email: 'kontakt@immo-zh.ch',
        phone: '+41 44 200 30 40',
        vatNumber: 'CHE-111.222.333 MWST',
        paymentTermDays: 30,
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        number: 'K-002',
        name: 'Bau Meier GmbH',
        companyName: 'Bau Meier GmbH',
        street: 'Werkstrasse 55',
        zipCode: '8400',
        city: 'Winterthur',
        country: 'CH',
        email: 'info@bau-meier.ch',
        phone: '+41 52 300 40 50',
        vatNumber: 'CHE-222.333.444 MWST',
        paymentTermDays: 30,
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        number: 'K-003',
        name: 'Hotel Bellevue',
        companyName: 'Hotel Bellevue AG',
        street: 'Seestrasse 12',
        zipCode: '6004',
        city: 'Luzern',
        country: 'CH',
        email: 'empfang@bellevue.ch',
        phone: '+41 41 400 50 60',
        paymentTermDays: 14,
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        number: 'K-004',
        name: 'Architektur Studio Bern',
        companyName: 'Architektur Studio Bern GmbH',
        street: 'Bundesplatz 8',
        zipCode: '3011',
        city: 'Bern',
        country: 'CH',
        email: 'projekte@arch-bern.ch',
        phone: '+41 31 500 60 70',
        paymentTermDays: 30,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 4 Customers created');

  // 5. Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        number: 'L-001',
        name: 'Stahl Schweiz AG',
        companyName: 'Stahl Schweiz AG',
        street: 'Industrieweg 100',
        zipCode: '4600',
        city: 'Olten',
        country: 'CH',
        email: 'verkauf@stahl-ch.ch',
        phone: '+41 62 100 20 30',
        vatNumber: 'CHE-333.444.555 MWST',
        iban: 'CH82 0900 0000 1234 5678 9',
        paymentTermDays: 30,
        rating: 5,
        companyId: company.id,
      },
    }),
    prisma.supplier.create({
      data: {
        number: 'L-002',
        name: 'Schrauben Express',
        companyName: 'Schrauben Express GmbH',
        street: 'Gewerbepark 22',
        zipCode: '5000',
        city: 'Aarau',
        country: 'CH',
        email: 'bestellung@schrauben-express.ch',
        phone: '+41 62 200 30 40',
        iban: 'CH45 0023 0023 1234 5678 9',
        paymentTermDays: 14,
        rating: 4,
        companyId: company.id,
      },
    }),
    prisma.supplier.create({
      data: {
        number: 'L-003',
        name: 'Farben & Lacke AG',
        companyName: 'Farben & Lacke AG',
        street: 'Chemiestrasse 8',
        zipCode: '4058',
        city: 'Basel',
        country: 'CH',
        email: 'order@farben-lacke.ch',
        phone: '+41 61 300 40 50',
        paymentTermDays: 30,
        rating: 4,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 3 Suppliers created');

  // 6. Create Product Categories
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: { name: 'Stahl & Metall', description: 'Rohmaterial Stahl und Metalle', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Befestigungsmaterial', description: 'Schrauben, Muttern, Bolzen', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Oberflächenbehandlung', description: 'Lacke, Farben, Beschichtungen', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Dienstleistungen', description: 'Arbeitsleistungen und Services', companyId: company.id },
    }),
  ]);
  console.log('✓ 4 Product Categories created');

  // 7. Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'STAHL-001',
        name: 'Stahlprofil IPE 200',
        description: 'I-Profil Träger 200mm',
        unit: 'lfm',
        purchasePrice: 45.00,
        salePrice: 68.00,
        vatRate: VatRate.STANDARD,
        stockQuantity: 250,
        minStock: 50,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'STAHL-002',
        name: 'Stahlblech 2mm verzinkt',
        description: 'Verzinktes Stahlblech 2mm Stärke',
        unit: 'm²',
        purchasePrice: 28.00,
        salePrice: 42.00,
        vatRate: VatRate.STANDARD,
        stockQuantity: 180,
        minStock: 30,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'BEF-001',
        name: 'Sechskantschraube M12x50',
        description: 'DIN 933, verzinkt',
        unit: 'Stk',
        purchasePrice: 0.45,
        salePrice: 0.85,
        vatRate: VatRate.STANDARD,
        stockQuantity: 5000,
        minStock: 1000,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'BEF-002',
        name: 'Ankerschraube M10x80',
        description: 'Betonanker mit Dübel',
        unit: 'Stk',
        purchasePrice: 2.80,
        salePrice: 4.50,
        vatRate: VatRate.STANDARD,
        stockQuantity: 800,
        minStock: 200,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'LACK-001',
        name: 'Industrielack RAL 7016',
        description: 'Anthrazitgrau, 2K-Lack',
        unit: 'Liter',
        purchasePrice: 32.00,
        salePrice: 48.00,
        vatRate: VatRate.STANDARD,
        stockQuantity: 120,
        minStock: 20,
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SERV-001',
        name: 'Metallbauarbeiten',
        description: 'Facharbeiter Metallbau',
        unit: 'Std',
        purchasePrice: 0,
        salePrice: 95.00,
        vatRate: VatRate.STANDARD,
        isService: true,
        categoryId: categories[3].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SERV-002',
        name: 'Schweissarbeiten',
        description: 'Facharbeiter Schweissen',
        unit: 'Std',
        purchasePrice: 0,
        salePrice: 105.00,
        vatRate: VatRate.STANDARD,
        isService: true,
        categoryId: categories[3].id,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 7 Products created');

  // 8. Create Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        number: 'P-2024-001',
        name: 'Geländer Bürogebäude Zürich',
        description: 'Treppengeländer und Brüstungen für 4-stöckiges Bürogebäude',
        status: ProjectStatus.IN_PROGRESS,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-30'),
        budget: 85000,
        customerId: customers[0].id,
        managerId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.project.create({
      data: {
        number: 'P-2024-002',
        name: 'Stahltreppe Hotel Bellevue',
        description: 'Freitragende Stahlwendeltreppe mit Glasgeländer',
        status: ProjectStatus.IN_PROGRESS,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-15'),
        budget: 125000,
        customerId: customers[2].id,
        managerId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.project.create({
      data: {
        number: 'P-2024-003',
        name: 'Balkongeländer Wohnüberbauung',
        description: '48 Balkongeländer für Neubauprojekt',
        status: ProjectStatus.PLANNING,
        startDate: new Date('2024-05-01'),
        budget: 168000,
        customerId: customers[1].id,
        managerId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.project.create({
      data: {
        number: 'P-2023-015',
        name: 'Vordach Geschäftshaus Bern',
        description: 'Stahl-Glas Vordach mit integrierter Beleuchtung',
        status: ProjectStatus.COMPLETED,
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-15'),
        budget: 45000,
        customerId: customers[3].id,
        managerId: employees[0].id,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 4 Projects created');

  // 9. Create Tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Aufmass vor Ort',
        description: 'Detaillierte Vermessung der Treppenanlage',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-01-20'),
        estimatedHours: 4,
        actualHours: 3.5,
        projectId: projects[0].id,
        assigneeId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Werkstattzeichnungen erstellen',
        description: 'CAD-Zeichnungen für Produktion',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-01-30'),
        estimatedHours: 16,
        actualHours: 18,
        projectId: projects[0].id,
        assigneeId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Material bestellen',
        description: 'Stahlprofile und Befestigungsmaterial',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-02-05'),
        estimatedHours: 2,
        actualHours: 1.5,
        projectId: projects[0].id,
        assigneeId: employees[3].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Geländer fertigen',
        description: 'Produktion in der Werkstatt',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-15'),
        estimatedHours: 80,
        actualHours: 45,
        projectId: projects[0].id,
        assigneeId: employees[1].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Schweissarbeiten',
        description: 'WIG-Schweissen der Verbindungen',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-20'),
        estimatedHours: 40,
        actualHours: 22,
        projectId: projects[0].id,
        assigneeId: employees[2].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Oberflächenbehandlung',
        description: 'Pulverbeschichtung RAL 7016',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-03-25'),
        estimatedHours: 16,
        projectId: projects[0].id,
        assigneeId: employees[1].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Montage vor Ort',
        description: 'Installation beim Kunden',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-04-10'),
        estimatedHours: 24,
        projectId: projects[0].id,
        assigneeId: employees[1].id,
        companyId: company.id,
      },
    }),
    // Projekt 2 Tasks
    prisma.task.create({
      data: {
        title: 'Statikberechnung',
        description: 'Statische Berechnung der Wendeltreppe',
        status: TaskStatus.DONE,
        priority: TaskPriority.CRITICAL,
        dueDate: new Date('2024-02-10'),
        estimatedHours: 24,
        actualHours: 28,
        projectId: projects[1].id,
        assigneeId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Glasbestellung koordinieren',
        description: 'Sicherheitsglas für Geländerfüllung',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-01'),
        estimatedHours: 4,
        actualHours: 2,
        projectId: projects[1].id,
        assigneeId: employees[3].id,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 9 Tasks created');

  // 10. Create Time Entries
  const today = new Date();
  const timeEntries = await Promise.all([
    prisma.timeEntry.create({
      data: {
        date: new Date(today.getTime() - 86400000 * 2),
        hours: 8,
        description: 'Geländerfertigung Werkstatt',
        projectId: projects[0].id,
        taskId: tasks[3].id,
        employeeId: employees[1].id,
        companyId: company.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        date: new Date(today.getTime() - 86400000),
        hours: 7.5,
        description: 'Schweissarbeiten Geländer',
        projectId: projects[0].id,
        taskId: tasks[4].id,
        employeeId: employees[2].id,
        companyId: company.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        date: today,
        hours: 4,
        description: 'Projektleitung und Koordination',
        projectId: projects[0].id,
        employeeId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        date: today,
        hours: 6,
        description: 'Stahltreppe Vormontage',
        projectId: projects[1].id,
        employeeId: employees[1].id,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 4 Time Entries created');

  // 11. Create Absences
  const absences = await Promise.all([
    prisma.absence.create({
      data: {
        type: AbsenceType.VACATION,
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-26'),
        days: 10,
        status: AbsenceStatus.APPROVED,
        reason: 'Sommerferien',
        employeeId: employees[0].id,
        companyId: company.id,
      },
    }),
    prisma.absence.create({
      data: {
        type: AbsenceType.SICK,
        startDate: new Date('2024-03-05'),
        endDate: new Date('2024-03-06'),
        days: 2,
        status: AbsenceStatus.APPROVED,
        reason: 'Grippe',
        employeeId: employees[2].id,
        companyId: company.id,
      },
    }),
    prisma.absence.create({
      data: {
        type: AbsenceType.VACATION,
        startDate: new Date('2024-08-12'),
        endDate: new Date('2024-08-16'),
        days: 5,
        status: AbsenceStatus.PENDING,
        reason: 'Kurzurlaub',
        employeeId: employees[1].id,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 3 Absences created');

  // 12. Create Calendar Events
  const calendarEvents = await Promise.all([
    prisma.calendarEvent.create({
      data: {
        title: 'Kundentermin Immobilien Zürich',
        description: 'Besprechung Projektfortschritt',
        startTime: new Date('2024-03-20T10:00:00'),
        endTime: new Date('2024-03-20T11:30:00'),
        location: 'Bahnhofstrasse 100, Zürich',
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Team Meeting',
        description: 'Wöchentliche Projektbesprechung',
        startTime: new Date('2024-03-18T08:00:00'),
        endTime: new Date('2024-03-18T09:00:00'),
        isAllDay: false,
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: 'Lieferung Stahlprofile',
        description: 'Materiallieferung für P-2024-001',
        startTime: new Date('2024-03-19T14:00:00'),
        endTime: new Date('2024-03-19T15:00:00'),
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
  ]);
  console.log('✓ 3 Calendar Events created');

  // 13. Create Quotes
  const quotes = await Promise.all([
    prisma.quote.create({
      data: {
        number: 'OFF-2024-001',
        customerId: customers[3].id,
        status: DocumentStatus.DRAFT,
        issueDate: new Date('2024-03-01'),
        validUntil: new Date('2024-04-01'),
        subtotal: 28500,
        vatAmount: 2308.50,
        total: 30808.50,
        notes: 'Gültig 30 Tage ab Offertdatum',
        companyId: company.id,
        createdById: adminUser.id,
        items: {
          create: [
            { position: 1, productId: products[0].id, description: 'Stahlprofil IPE 200', quantity: 45, unit: 'lfm', unitPrice: 68, total: 3060 },
            { position: 2, productId: products[5].id, description: 'Metallbauarbeiten', quantity: 120, unit: 'Std', unitPrice: 95, total: 11400 },
            { position: 3, productId: products[6].id, description: 'Schweissarbeiten', quantity: 80, unit: 'Std', unitPrice: 105, total: 8400 },
            { position: 4, productId: products[4].id, description: 'Pulverbeschichtung', quantity: 50, unit: 'Liter', unitPrice: 48, total: 2400 },
          ],
        },
      },
    }),
  ]);
  console.log('✓ 1 Quote created');

  // 14. Create Invoices
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        number: 'RE-2024-001',
        customerId: customers[3].id,
        projectId: projects[3].id,
        status: DocumentStatus.PAID,
        issueDate: new Date('2023-12-20'),
        dueDate: new Date('2024-01-20'),
        paidDate: new Date('2024-01-15'),
        subtotal: 45000,
        vatAmount: 3645,
        total: 48645,
        paidAmount: 48645,
        qrReference: '000000000000000000000000001',
        companyId: company.id,
        createdById: adminUser.id,
        items: {
          create: [
            { position: 1, description: 'Vordach Stahl-Glas komplett', quantity: 1, unit: 'Pausch', unitPrice: 45000, total: 45000 },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        number: 'RE-2024-002',
        customerId: customers[0].id,
        projectId: projects[0].id,
        status: DocumentStatus.SENT,
        issueDate: new Date('2024-02-28'),
        dueDate: new Date('2024-03-30'),
        subtotal: 25000,
        vatAmount: 2025,
        total: 27025,
        paidAmount: 0,
        notes: 'Akonto-Rechnung 1 von 3',
        qrReference: '000000000000000000000000002',
        companyId: company.id,
        createdById: adminUser.id,
        items: {
          create: [
            { position: 1, description: 'Akonto Geländer Bürogebäude 30%', quantity: 1, unit: 'Pausch', unitPrice: 25000, total: 25000 },
          ],
        },
      },
    }),
  ]);
  console.log('✓ 2 Invoices created');

  // 15. Create Bank Accounts
  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        name: 'UBS Geschäftskonto',
        bankName: 'UBS Switzerland AG',
        iban: 'CH93 0076 2011 6238 5295 7',
        bic: 'UBSWCHZH80A',
        currency: 'CHF',
        balance: 125680.45,
        isDefault: true,
        companyId: company.id,
      },
    }),
    prisma.bankAccount.create({
      data: {
        name: 'PostFinance',
        bankName: 'PostFinance AG',
        iban: 'CH45 0900 0000 8765 4321 0',
        currency: 'CHF',
        balance: 34520.00,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✓ 2 Bank Accounts created');

  // 16. Create Chart of Accounts (Swiss SME)
  const accounts = await Promise.all([
    // Assets
    prisma.account.create({ data: { number: '1000', name: 'Kasse', type: AccountType.ASSET, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '1020', name: 'Bank UBS', type: AccountType.ASSET, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '1100', name: 'Debitoren', type: AccountType.ASSET, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '1200', name: 'Vorräte Material', type: AccountType.ASSET, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '1500', name: 'Maschinen und Geräte', type: AccountType.ASSET, isActive: true, companyId: company.id } }),
    // Liabilities
    prisma.account.create({ data: { number: '2000', name: 'Kreditoren', type: AccountType.LIABILITY, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '2200', name: 'MWST Schuld', type: AccountType.LIABILITY, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '2270', name: 'Vorsteuer', type: AccountType.ASSET, isActive: true, companyId: company.id } }),
    // Equity
    prisma.account.create({ data: { number: '2800', name: 'Eigenkapital', type: AccountType.EQUITY, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '2900', name: 'Gewinnvortrag', type: AccountType.EQUITY, isActive: true, companyId: company.id } }),
    // Revenue
    prisma.account.create({ data: { number: '3000', name: 'Produktionserlöse', type: AccountType.REVENUE, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '3200', name: 'Dienstleistungserlöse', type: AccountType.REVENUE, isActive: true, companyId: company.id } }),
    // Expenses
    prisma.account.create({ data: { number: '4000', name: 'Materialaufwand', type: AccountType.EXPENSE, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '5000', name: 'Lohnaufwand', type: AccountType.EXPENSE, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '5700', name: 'Sozialversicherungen', type: AccountType.EXPENSE, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '6000', name: 'Raumaufwand', type: AccountType.EXPENSE, isActive: true, companyId: company.id } }),
    prisma.account.create({ data: { number: '6500', name: 'Verwaltungsaufwand', type: AccountType.EXPENSE, isActive: true, companyId: company.id } }),
  ]);
  console.log('✓ 17 Accounts created (Swiss SME Chart)');

  console.log('\n✅ Seed completed successfully!');
  console.log('────────────────────────────────────');
  console.log('Admin Login: admin@loomora.ch');
  console.log('Password: admin123');
  console.log('────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
