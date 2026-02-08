import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to create dates relative to today
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const monthStart = (monthsAgo: number = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function main() {
  console.log('🌱 Loomora ERP - Vollständige Seed-Daten');
  console.log('========================================\n');

  // =====================================================
  // 1. COMPANY & USERS
  // =====================================================
  console.log('📦 Erstelle Firma und Benutzer...');

  const company = await prisma.company.upsert({
    where: { slug: 'loomora-demo' },
    update: {},
    create: {
      name: 'Loomora Metallbau AG',
      slug: 'loomora-demo',
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
      status: 'ACTIVE',
      settings: {
        currency: 'CHF',
        locale: 'de-CH',
        vatRates: { standard: 8.1, reduced: 2.6, special: 3.8 },
        numberFormat: {
          invoicePrefix: 'RE-',
          quotePrefix: 'AN-',
          orderPrefix: 'AU-',
          deliveryPrefix: 'LS-',
          creditNotePrefix: 'GS-',
          purchasePrefix: 'BE-',
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@loomora.ch' },
    update: {},
    create: {
      email: 'admin@loomora.ch',
      passwordHash,
      firstName: 'Max',
      lastName: 'Keller',
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@loomora.ch' },
    update: {},
    create: {
      email: 'manager@loomora.ch',
      passwordHash,
      firstName: 'Anna',
      lastName: 'Schmidt',
      role: 'MANAGER',
      companyId: company.id,
    },
  });

  console.log('  ✓ Firma und 2 Benutzer erstellt');

  // =====================================================
  // 2. DEPARTMENTS
  // =====================================================
  console.log('📦 Erstelle Abteilungen...');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-management' },
      update: {},
      create: { id: 'dept-management', name: 'Geschäftsleitung', description: 'Unternehmensführung', companyId: company.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-production' },
      update: {},
      create: { id: 'dept-production', name: 'Produktion', description: 'Fertigung und Werkstatt', companyId: company.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-montage' },
      update: {},
      create: { id: 'dept-montage', name: 'Montage', description: 'Aussenmontage', companyId: company.id },
    }),
    prisma.department.upsert({
      where: { id: 'dept-admin' },
      update: {},
      create: { id: 'dept-admin', name: 'Administration', description: 'Buchhaltung und Verwaltung', companyId: company.id },
    }),
  ]);

  console.log('  ✓ 4 Abteilungen erstellt');

  // =====================================================
  // 3. EMPLOYEES
  // =====================================================
  console.log('📦 Erstelle Mitarbeiter...');

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0001' } },
      update: {},
      create: {
        number: 'MA-0001',
        firstName: 'Thomas',
        lastName: 'Müller',
        email: 'thomas.mueller@loomora.ch',
        phone: '+41 44 123 45 10',
        mobile: '+41 79 123 45 10',
        position: 'Geschäftsführer',
        departmentId: departments[0].id,
        status: 'ACTIVE',
        hireDate: new Date('2015-01-01'),
        ahvNumber: '756.1234.5678.90',
        dateOfBirth: new Date('1975-03-15'),
        nationality: 'CH',
        maritalStatus: 'verheiratet',
        childrenCount: 2,
        employmentType: 'Vollzeit',
        workloadPercent: 100,
        iban: 'CH82 0900 0000 1234 5678 9',
        companyId: company.id,
      },
    }),
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0002' } },
      update: {},
      create: {
        number: 'MA-0002',
        firstName: 'Peter',
        lastName: 'Huber',
        email: 'peter.huber@loomora.ch',
        phone: '+41 44 123 45 11',
        mobile: '+41 79 123 45 11',
        position: 'Werkstattleiter',
        departmentId: departments[1].id,
        status: 'ACTIVE',
        hireDate: new Date('2018-04-01'),
        ahvNumber: '756.2345.6789.01',
        dateOfBirth: new Date('1982-07-22'),
        nationality: 'CH',
        maritalStatus: 'ledig',
        childrenCount: 0,
        employmentType: 'Vollzeit',
        workloadPercent: 100,
        iban: 'CH45 0023 0023 1234 5678 9',
        companyId: company.id,
      },
    }),
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0003' } },
      update: {},
      create: {
        number: 'MA-0003',
        firstName: 'Marco',
        lastName: 'Bernasconi',
        email: 'marco.bernasconi@loomora.ch',
        mobile: '+41 79 123 45 12',
        position: 'Schweisser EFZ',
        departmentId: departments[1].id,
        status: 'ACTIVE',
        hireDate: new Date('2019-08-01'),
        ahvNumber: '756.3456.7890.12',
        dateOfBirth: new Date('1990-11-05'),
        nationality: 'IT',
        maritalStatus: 'verheiratet',
        childrenCount: 1,
        employmentType: 'Vollzeit',
        workloadPercent: 100,
        iban: 'CH12 0483 5012 3456 7890 0',
        companyId: company.id,
      },
    }),
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0004' } },
      update: {},
      create: {
        number: 'MA-0004',
        firstName: 'Sarah',
        lastName: 'Weber',
        email: 'sarah.weber@loomora.ch',
        phone: '+41 44 123 45 13',
        position: 'Metallbauer EFZ',
        departmentId: departments[1].id,
        status: 'ACTIVE',
        hireDate: new Date('2020-02-01'),
        ahvNumber: '756.4567.8901.23',
        dateOfBirth: new Date('1995-02-28'),
        nationality: 'CH',
        maritalStatus: 'ledig',
        childrenCount: 0,
        employmentType: 'Vollzeit',
        workloadPercent: 100,
        iban: 'CH78 0900 0000 8765 4321 0',
        companyId: company.id,
      },
    }),
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0005' } },
      update: {},
      create: {
        number: 'MA-0005',
        firstName: 'Andreas',
        lastName: 'Frei',
        email: 'andreas.frei@loomora.ch',
        mobile: '+41 79 123 45 14',
        position: 'Monteur',
        departmentId: departments[2].id,
        status: 'ACTIVE',
        hireDate: new Date('2021-03-15'),
        ahvNumber: '756.5678.9012.34',
        dateOfBirth: new Date('1988-09-12'),
        nationality: 'CH',
        maritalStatus: 'verheiratet',
        childrenCount: 3,
        employmentType: 'Vollzeit',
        workloadPercent: 100,
        iban: 'CH34 0076 2011 0987 6543 2',
        companyId: company.id,
      },
    }),
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0006' } },
      update: {},
      create: {
        number: 'MA-0006',
        firstName: 'Lisa',
        lastName: 'Keller',
        email: 'lisa.keller@loomora.ch',
        phone: '+41 44 123 45 15',
        position: 'Buchhalterin',
        departmentId: departments[3].id,
        status: 'ACTIVE',
        hireDate: new Date('2022-01-01'),
        ahvNumber: '756.6789.0123.45',
        dateOfBirth: new Date('1992-05-18'),
        nationality: 'CH',
        maritalStatus: 'ledig',
        childrenCount: 0,
        employmentType: 'Teilzeit',
        workloadPercent: 60,
        iban: 'CH56 0483 5098 7654 3210 0',
        companyId: company.id,
      },
    }),
    prisma.employee.upsert({
      where: { companyId_number: { companyId: company.id, number: 'MA-0007' } },
      update: {},
      create: {
        number: 'MA-0007',
        firstName: 'Yusuf',
        lastName: 'Özdemir',
        email: 'yusuf.oezdemir@loomora.ch',
        mobile: '+41 79 123 45 16',
        position: 'Metallbauer Anlernling',
        departmentId: departments[1].id,
        status: 'ACTIVE',
        hireDate: new Date('2023-08-01'),
        ahvNumber: '756.7890.1234.56',
        dateOfBirth: new Date('1998-12-03'),
        nationality: 'TR',
        maritalStatus: 'ledig',
        childrenCount: 0,
        employmentType: 'Vollzeit',
        workloadPercent: 100,
        iban: 'CH90 0900 0000 5555 6666 7',
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 7 Mitarbeiter erstellt');

  // =====================================================
  // 4. EMPLOYEE CONTRACTS
  // =====================================================
  console.log('📦 Erstelle Arbeitsverträge...');

  await Promise.all([
    prisma.employeeContract.create({
      data: {
        employeeId: employees[0].id,
        contractType: 'Unbefristet',
        startDate: new Date('2015-01-01'),
        salaryType: 'Monatslohn',
        baseSalary: 12500,
        hourlyRate: 72,
        wageClass: 'F',
        workHoursPerWeek: 42.5,
        vacationDays: 25,
        noticePeriod: '3 Monate',
      },
    }),
    prisma.employeeContract.create({
      data: {
        employeeId: employees[1].id,
        contractType: 'Unbefristet',
        startDate: new Date('2018-04-01'),
        salaryType: 'Monatslohn',
        baseSalary: 7800,
        hourlyRate: 45,
        wageClass: 'E',
        workHoursPerWeek: 42.5,
        vacationDays: 25,
        noticePeriod: '2 Monate',
      },
    }),
    prisma.employeeContract.create({
      data: {
        employeeId: employees[2].id,
        contractType: 'Unbefristet',
        startDate: new Date('2019-08-01'),
        salaryType: 'Stundenlohn',
        baseSalary: 6200,
        hourlyRate: 35.80,
        wageClass: 'C',
        workHoursPerWeek: 42.5,
        vacationDays: 25,
        noticePeriod: '2 Monate',
      },
    }),
    prisma.employeeContract.create({
      data: {
        employeeId: employees[3].id,
        contractType: 'Unbefristet',
        startDate: new Date('2020-02-01'),
        salaryType: 'Stundenlohn',
        baseSalary: 5800,
        hourlyRate: 33.50,
        wageClass: 'C',
        workHoursPerWeek: 42.5,
        vacationDays: 25,
        noticePeriod: '2 Monate',
      },
    }),
    prisma.employeeContract.create({
      data: {
        employeeId: employees[4].id,
        contractType: 'Unbefristet',
        startDate: new Date('2021-03-15'),
        salaryType: 'Stundenlohn',
        baseSalary: 5500,
        hourlyRate: 31.80,
        wageClass: 'C',
        workHoursPerWeek: 42.5,
        vacationDays: 25,
        noticePeriod: '2 Monate',
      },
    }),
    prisma.employeeContract.create({
      data: {
        employeeId: employees[5].id,
        contractType: 'Unbefristet',
        startDate: new Date('2022-01-01'),
        salaryType: 'Monatslohn',
        baseSalary: 3900,
        hourlyRate: 37.50,
        wageClass: 'D',
        workHoursPerWeek: 25.5,
        vacationDays: 25,
        noticePeriod: '2 Monate',
      },
    }),
    prisma.employeeContract.create({
      data: {
        employeeId: employees[6].id,
        contractType: 'Befristet',
        startDate: new Date('2023-08-01'),
        endDate: new Date('2024-07-31'),
        salaryType: 'Stundenlohn',
        baseSalary: 4200,
        hourlyRate: 24.30,
        wageClass: 'B',
        workHoursPerWeek: 42.5,
        vacationDays: 20,
        probationEnd: new Date('2023-11-01'),
        noticePeriod: '1 Monat',
      },
    }),
  ]);

  console.log('  ✓ 7 Arbeitsverträge erstellt');

  // =====================================================
  // 5. CUSTOMERS
  // =====================================================
  console.log('📦 Erstelle Kunden...');

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { companyId_number: { companyId: company.id, number: 'KD-0001' } },
      update: {},
      create: {
        number: 'KD-0001',
        name: 'Hans Müller',
        companyName: 'Immobilien Zürich AG',
        street: 'Bahnhofstrasse 100',
        zipCode: '8001',
        city: 'Zürich',
        country: 'CH',
        email: 'h.mueller@immo-zh.ch',
        phone: '+41 44 200 30 40',
        vatNumber: 'CHE-111.222.333 MWST',
        paymentTermDays: 30,
        creditLimit: 100000,
        companyId: company.id,
      },
    }),
    prisma.customer.upsert({
      where: { companyId_number: { companyId: company.id, number: 'KD-0002' } },
      update: {},
      create: {
        number: 'KD-0002',
        name: 'Peter Meier',
        companyName: 'Bau Meier GmbH',
        street: 'Werkstrasse 55',
        zipCode: '8400',
        city: 'Winterthur',
        country: 'CH',
        email: 'p.meier@bau-meier.ch',
        phone: '+41 52 300 40 50',
        vatNumber: 'CHE-222.333.444 MWST',
        paymentTermDays: 30,
        creditLimit: 75000,
        companyId: company.id,
      },
    }),
    prisma.customer.upsert({
      where: { companyId_number: { companyId: company.id, number: 'KD-0003' } },
      update: {},
      create: {
        number: 'KD-0003',
        name: 'Maria Steiner',
        companyName: 'Hotel Bellevue AG',
        street: 'Seestrasse 12',
        zipCode: '6004',
        city: 'Luzern',
        country: 'CH',
        email: 'steiner@bellevue.ch',
        phone: '+41 41 400 50 60',
        paymentTermDays: 14,
        creditLimit: 50000,
        companyId: company.id,
      },
    }),
    prisma.customer.upsert({
      where: { companyId_number: { companyId: company.id, number: 'KD-0004' } },
      update: {},
      create: {
        number: 'KD-0004',
        name: 'Sandra Roth',
        companyName: 'Architektur Studio Bern',
        street: 'Bundesplatz 8',
        zipCode: '3011',
        city: 'Bern',
        country: 'CH',
        email: 's.roth@arch-bern.ch',
        phone: '+41 31 500 60 70',
        paymentTermDays: 30,
        creditLimit: 60000,
        companyId: company.id,
      },
    }),
    prisma.customer.upsert({
      where: { companyId_number: { companyId: company.id, number: 'KD-0005' } },
      update: {},
      create: {
        number: 'KD-0005',
        name: 'Beat Brunner',
        companyName: 'Brunner Generalunternehmung AG',
        street: 'Industrieweg 22',
        zipCode: '4600',
        city: 'Olten',
        country: 'CH',
        email: 'brunner@brunner-gu.ch',
        phone: '+41 62 600 70 80',
        vatNumber: 'CHE-444.555.666 MWST',
        paymentTermDays: 45,
        creditLimit: 150000,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 5 Kunden erstellt');

  // =====================================================
  // 6. CONTACTS
  // =====================================================
  console.log('📦 Erstelle Kontakte...');

  await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'Hans',
        lastName: 'Müller',
        position: 'Geschäftsführer',
        email: 'h.mueller@immo-zh.ch',
        phone: '+41 44 200 30 41',
        isPrimary: true,
        customerId: customers[0].id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Claudia',
        lastName: 'Zurfluh',
        position: 'Projektleiterin',
        email: 'c.zurfluh@immo-zh.ch',
        phone: '+41 44 200 30 42',
        mobile: '+41 79 200 30 42',
        customerId: customers[0].id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Peter',
        lastName: 'Meier',
        position: 'Inhaber',
        email: 'p.meier@bau-meier.ch',
        phone: '+41 52 300 40 51',
        isPrimary: true,
        customerId: customers[1].id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Maria',
        lastName: 'Steiner',
        position: 'Direktorin',
        email: 'steiner@bellevue.ch',
        phone: '+41 41 400 50 61',
        isPrimary: true,
        customerId: customers[2].id,
      },
    }),
  ]);

  console.log('  ✓ 4 Kontakte erstellt');

  // =====================================================
  // 7. SUPPLIERS
  // =====================================================
  console.log('📦 Erstelle Lieferanten...');

  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { companyId_number: { companyId: company.id, number: 'LF-0001' } },
      update: {},
      create: {
        number: 'LF-0001',
        name: 'Franz Hofer',
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
    prisma.supplier.upsert({
      where: { companyId_number: { companyId: company.id, number: 'LF-0002' } },
      update: {},
      create: {
        number: 'LF-0002',
        name: 'Kurt Baumann',
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
    prisma.supplier.upsert({
      where: { companyId_number: { companyId: company.id, number: 'LF-0003' } },
      update: {},
      create: {
        number: 'LF-0003',
        name: 'Fabienne Gerber',
        companyName: 'Farben & Lacke AG',
        street: 'Chemiestrasse 8',
        zipCode: '4058',
        city: 'Basel',
        country: 'CH',
        email: 'order@farben-lacke.ch',
        phone: '+41 61 300 40 50',
        iban: 'CH78 0483 5012 3456 7890 0',
        paymentTermDays: 30,
        rating: 4,
        companyId: company.id,
      },
    }),
    prisma.supplier.upsert({
      where: { companyId_number: { companyId: company.id, number: 'LF-0004' } },
      update: {},
      create: {
        number: 'LF-0004',
        name: 'Reto Ammann',
        companyName: 'Glaserei Ammann',
        street: 'Glaserweg 5',
        zipCode: '8953',
        city: 'Dietikon',
        country: 'CH',
        email: 'info@glaserei-ammann.ch',
        phone: '+41 44 740 20 30',
        paymentTermDays: 30,
        rating: 5,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 4 Lieferanten erstellt');

  // =====================================================
  // 8. PRODUCT CATEGORIES & PRODUCTS
  // =====================================================
  console.log('📦 Erstelle Produkte...');

  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { id: 'cat-stahl' },
      update: {},
      create: { id: 'cat-stahl', name: 'Stahl & Metall', description: 'Rohmaterial Stahl und Metalle', companyId: company.id },
    }),
    prisma.productCategory.upsert({
      where: { id: 'cat-befestigung' },
      update: {},
      create: { id: 'cat-befestigung', name: 'Befestigungsmaterial', description: 'Schrauben, Muttern, Bolzen', companyId: company.id },
    }),
    prisma.productCategory.upsert({
      where: { id: 'cat-oberflaeche' },
      update: {},
      create: { id: 'cat-oberflaeche', name: 'Oberflächenbehandlung', description: 'Lacke, Farben, Beschichtungen', companyId: company.id },
    }),
    prisma.productCategory.upsert({
      where: { id: 'cat-glas' },
      update: {},
      create: { id: 'cat-glas', name: 'Glas', description: 'Sicherheitsglas und Glasfüllungen', companyId: company.id },
    }),
    prisma.productCategory.upsert({
      where: { id: 'cat-service' },
      update: {},
      create: { id: 'cat-service', name: 'Dienstleistungen', description: 'Arbeitsleistungen und Services', companyId: company.id },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'STAHL-001' } },
      update: {},
      create: {
        sku: 'STAHL-001',
        name: 'Stahlprofil IPE 200',
        description: 'I-Profil Träger 200mm, S235JR',
        unit: 'lfm',
        purchasePrice: 45.00,
        salePrice: 68.00,
        vatRate: 'STANDARD',
        stockQuantity: 250,
        minStock: 50,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'STAHL-002' } },
      update: {},
      create: {
        sku: 'STAHL-002',
        name: 'Stahlblech 2mm verzinkt',
        description: 'Verzinktes Stahlblech 2mm Stärke, 1000x2000mm',
        unit: 'm²',
        purchasePrice: 28.00,
        salePrice: 42.00,
        vatRate: 'STANDARD',
        stockQuantity: 180,
        minStock: 30,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'STAHL-003' } },
      update: {},
      create: {
        sku: 'STAHL-003',
        name: 'Quadratrohr 60x60x3',
        description: 'Stahlquadratrohr 60x60x3mm, S235JR',
        unit: 'lfm',
        purchasePrice: 12.50,
        salePrice: 19.80,
        vatRate: 'STANDARD',
        stockQuantity: 420,
        minStock: 80,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'STAHL-004' } },
      update: {},
      create: {
        sku: 'STAHL-004',
        name: 'Flachstahl 50x8',
        description: 'Flachstahl 50x8mm, S235JR',
        unit: 'lfm',
        purchasePrice: 4.80,
        salePrice: 7.50,
        vatRate: 'STANDARD',
        stockQuantity: 600,
        minStock: 100,
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'BEF-001' } },
      update: {},
      create: {
        sku: 'BEF-001',
        name: 'Sechskantschraube M12x50',
        description: 'DIN 933, verzinkt',
        unit: 'Stk',
        purchasePrice: 0.45,
        salePrice: 0.85,
        vatRate: 'STANDARD',
        stockQuantity: 5000,
        minStock: 1000,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'BEF-002' } },
      update: {},
      create: {
        sku: 'BEF-002',
        name: 'Ankerschraube M10x80',
        description: 'Betonanker mit Dübel',
        unit: 'Stk',
        purchasePrice: 2.80,
        salePrice: 4.50,
        vatRate: 'STANDARD',
        stockQuantity: 800,
        minStock: 200,
        categoryId: categories[1].id,
        supplierId: suppliers[1].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'LACK-001' } },
      update: {},
      create: {
        sku: 'LACK-001',
        name: 'Industrielack RAL 7016',
        description: 'Anthrazitgrau, 2K-Lack',
        unit: 'Liter',
        purchasePrice: 32.00,
        salePrice: 48.00,
        vatRate: 'STANDARD',
        stockQuantity: 120,
        minStock: 20,
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'GLAS-001' } },
      update: {},
      create: {
        sku: 'GLAS-001',
        name: 'VSG Sicherheitsglas 10mm',
        description: 'Verbundsicherheitsglas 10mm, klar',
        unit: 'm²',
        purchasePrice: 85.00,
        salePrice: 125.00,
        vatRate: 'STANDARD',
        stockQuantity: 45,
        minStock: 10,
        categoryId: categories[3].id,
        supplierId: suppliers[3].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'SERV-001' } },
      update: {},
      create: {
        sku: 'SERV-001',
        name: 'Metallbauarbeiten',
        description: 'Facharbeiter Metallbau',
        unit: 'Std',
        purchasePrice: 0,
        salePrice: 95.00,
        vatRate: 'STANDARD',
        isService: true,
        categoryId: categories[4].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'SERV-002' } },
      update: {},
      create: {
        sku: 'SERV-002',
        name: 'Schweissarbeiten',
        description: 'Facharbeiter Schweissen WIG/MIG/MAG',
        unit: 'Std',
        purchasePrice: 0,
        salePrice: 115.00,
        vatRate: 'STANDARD',
        isService: true,
        categoryId: categories[4].id,
        companyId: company.id,
      },
    }),
    prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: 'SERV-003' } },
      update: {},
      create: {
        sku: 'SERV-003',
        name: 'Montagearbeiten',
        description: 'Montage vor Ort',
        unit: 'Std',
        purchasePrice: 0,
        salePrice: 105.00,
        vatRate: 'STANDARD',
        isService: true,
        categoryId: categories[4].id,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 5 Kategorien und 11 Produkte erstellt');

  // =====================================================
  // 9. PROJECTS
  // =====================================================
  console.log('📦 Erstelle Projekte...');

  const projects = await Promise.all([
    prisma.project.upsert({
      where: { companyId_number: { companyId: company.id, number: 'P-2024-001' } },
      update: {},
      create: {
        number: 'P-2024-001',
        name: 'Geländer Bürogebäude Zürich',
        description: 'Treppengeländer und Brüstungen für 4-stöckiges Bürogebäude. 12 Stockwerke à 15m Geländer.',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: daysAgo(60),
        endDate: daysFromNow(30),
        budget: 85000,
        customer: { connect: { id: customers[0].id } },
        company: { connect: { id: company.id } },
        createdBy: { connect: { id: adminUser.id } },
      },
    }),
    prisma.project.upsert({
      where: { companyId_number: { companyId: company.id, number: 'P-2024-002' } },
      update: {},
      create: {
        number: 'P-2024-002',
        name: 'Stahltreppe Hotel Bellevue',
        description: 'Freitragende Stahlwendeltreppe mit Glasgeländer, 4 Stockwerke',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: daysAgo(45),
        endDate: daysFromNow(60),
        budget: 125000,
        customer: { connect: { id: customers[2].id } },
        company: { connect: { id: company.id } },
        createdBy: { connect: { id: adminUser.id } },
      },
    }),
    prisma.project.upsert({
      where: { companyId_number: { companyId: company.id, number: 'P-2024-003' } },
      update: {},
      create: {
        number: 'P-2024-003',
        name: 'Balkongeländer Wohnüberbauung',
        description: '48 Balkongeländer für Neubauprojekt Bau Meier',
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: daysFromNow(30),
        endDate: daysFromNow(120),
        budget: 168000,
        customer: { connect: { id: customers[1].id } },
        company: { connect: { id: company.id } },
        createdBy: { connect: { id: adminUser.id } },
      },
    }),
    prisma.project.upsert({
      where: { companyId_number: { companyId: company.id, number: 'P-2023-015' } },
      update: {},
      create: {
        number: 'P-2023-015',
        name: 'Vordach Geschäftshaus Bern',
        description: 'Stahl-Glas Vordach mit integrierter Beleuchtung',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        startDate: daysAgo(180),
        endDate: daysAgo(90),
        budget: 45000,
        customer: { connect: { id: customers[3].id } },
        company: { connect: { id: company.id } },
        createdBy: { connect: { id: adminUser.id } },
      },
    }),
    prisma.project.upsert({
      where: { companyId_number: { companyId: company.id, number: 'P-2024-004' } },
      update: {},
      create: {
        number: 'P-2024-004',
        name: 'Brandschutztore Industriehalle',
        description: '6 Brandschutztore T90 für Brunner GU',
        status: 'ACTIVE',
        priority: 'HIGH',
        startDate: daysAgo(20),
        endDate: daysFromNow(45),
        budget: 78000,
        customer: { connect: { id: customers[4].id } },
        company: { connect: { id: company.id } },
        createdBy: { connect: { id: adminUser.id } },
      },
    }),
  ]);

  console.log('  ✓ 5 Projekte erstellt');

  // =====================================================
  // 10. TASKS
  // =====================================================
  console.log('📦 Erstelle Aufgaben...');

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Aufmass vor Ort',
        description: 'Detaillierte Vermessung der Treppenanlage',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: daysAgo(50),
        estimatedHours: 4,
        projectId: projects[0].id,
        assigneeId: adminUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Werkstattzeichnungen erstellen',
        description: 'CAD-Zeichnungen für Produktion',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: daysAgo(40),
        estimatedHours: 16,
        projectId: projects[0].id,
        assigneeId: adminUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Material bestellen',
        description: 'Stahlprofile und Befestigungsmaterial',
        status: 'DONE',
        priority: 'MEDIUM',
        dueDate: daysAgo(35),
        estimatedHours: 2,
        projectId: projects[0].id,
        assigneeId: managerUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Geländer fertigen',
        description: 'Produktion in der Werkstatt - Zuschnitt, Schweissen, Schleifen',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: daysFromNow(10),
        estimatedHours: 80,
        projectId: projects[0].id,
        assigneeId: managerUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Oberflächenbehandlung',
        description: 'Pulverbeschichtung RAL 7016',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: daysFromNow(15),
        estimatedHours: 16,
        projectId: projects[0].id,
        assigneeId: managerUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Montage vor Ort',
        description: 'Installation beim Kunden inkl. Endabnahme',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: daysFromNow(25),
        estimatedHours: 24,
        projectId: projects[0].id,
        assigneeId: managerUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Statikberechnung Wendeltreppe',
        description: 'Statische Berechnung durch Ing.-Büro',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: daysAgo(30),
        estimatedHours: 24,
        projectId: projects[1].id,
        assigneeId: adminUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Glasbestellung koordinieren',
        description: 'VSG Sicherheitsglas für Geländerfüllung',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: daysFromNow(5),
        estimatedHours: 4,
        projectId: projects[1].id,
        assigneeId: managerUser.id,
        createdById: adminUser.id,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 8 Aufgaben erstellt');

  // =====================================================
  // 11. TIME ENTRIES
  // =====================================================
  console.log('📦 Erstelle Zeiterfassung...');

  await Promise.all([
    prisma.timeEntry.create({
      data: {
        date: daysAgo(2),
        duration: 480, // 8 hours in minutes
        description: 'Geländerfertigung Werkstatt',
        projectId: projects[0].id,
        taskId: tasks[3].id,
        userId: managerUser.id,
        companyId: company.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        date: daysAgo(1),
        duration: 450, // 7.5 hours in minutes
        description: 'Schweissarbeiten Geländer',
        projectId: projects[0].id,
        taskId: tasks[3].id,
        userId: managerUser.id,
        companyId: company.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        date: new Date(),
        duration: 240, // 4 hours in minutes
        description: 'Projektleitung und Koordination',
        projectId: projects[0].id,
        userId: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.timeEntry.create({
      data: {
        date: daysAgo(3),
        duration: 480, // 8 hours in minutes
        description: 'Stahltreppe Vormontage',
        projectId: projects[1].id,
        userId: managerUser.id,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 4 Zeiteinträge erstellt');

  // =====================================================
  // 12. QUOTES
  // =====================================================
  console.log('📦 Erstelle Angebote...');

  const quotes = await Promise.all([
    prisma.quote.create({
      data: {
        number: 'AN-2024-001',
        customerId: customers[3].id,
        date: daysAgo(30),
        validUntil: daysFromNow(30),
        status: 'CONFIRMED',
        subtotal: 28500,
        vatAmount: 2308.50,
        total: 30808.50,
        notes: 'Gültig 30 Tage ab Offertdatum',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, productId: products[0].id, description: 'Stahlprofil IPE 200', quantity: 45, unit: 'lfm', unitPrice: 68, vatRate: 'STANDARD', total: 3060 },
            { position: 2, productId: products[8].id, description: 'Metallbauarbeiten', quantity: 120, unit: 'Std', unitPrice: 95, vatRate: 'STANDARD', total: 11400 },
            { position: 3, productId: products[9].id, description: 'Schweissarbeiten', quantity: 80, unit: 'Std', unitPrice: 105, vatRate: 'STANDARD', total: 8400 },
            { position: 4, productId: products[6].id, description: 'Pulverbeschichtung', quantity: 50, unit: 'Liter', unitPrice: 48, vatRate: 'STANDARD', total: 2400 },
            { position: 5, productId: products[10].id, description: 'Montagearbeiten', quantity: 32, unit: 'Std', unitPrice: 105, vatRate: 'STANDARD', total: 3360 },
          ],
        },
      },
    }),
    prisma.quote.create({
      data: {
        number: 'AN-2024-002',
        customerId: customers[1].id,
        date: daysAgo(15),
        validUntil: daysFromNow(45),
        status: 'SENT',
        subtotal: 168000,
        vatAmount: 13608,
        total: 181608,
        notes: 'Inkl. 48 Balkongeländer komplett montiert',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Balkongeländer Typ A (2.5m)', quantity: 24, unit: 'Stk', unitPrice: 2800, vatRate: 'STANDARD', total: 67200 },
            { position: 2, description: 'Balkongeländer Typ B (3.0m)', quantity: 24, unit: 'Stk', unitPrice: 3200, vatRate: 'STANDARD', total: 76800 },
            { position: 3, productId: products[10].id, description: 'Montage inkl. Befestigung', quantity: 240, unit: 'Std', unitPrice: 105, vatRate: 'STANDARD', total: 25200 },
          ],
        },
      },
    }),
    prisma.quote.create({
      data: {
        number: 'AN-2024-003',
        customerId: customers[4].id,
        date: daysAgo(5),
        validUntil: daysFromNow(60),
        status: 'DRAFT',
        subtotal: 45000,
        vatAmount: 3645,
        total: 48645,
        notes: 'Entwurf - noch zu prüfen',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Brandschutztor T90 (3x3m)', quantity: 4, unit: 'Stk', unitPrice: 8500, vatRate: 'STANDARD', total: 34000 },
            { position: 2, description: 'Brandschutztor T90 (2x2.5m)', quantity: 2, unit: 'Stk', unitPrice: 5500, vatRate: 'STANDARD', total: 11000 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 3 Angebote erstellt');

  // =====================================================
  // 13. ORDERS
  // =====================================================
  console.log('📦 Erstelle Aufträge...');

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        number: 'AU-2024-001',
        customerId: customers[0].id,
        projectId: projects[0].id,
        date: daysAgo(55),
        deliveryDate: daysFromNow(25),
        status: 'CONFIRMED',
        subtotal: 85000,
        vatAmount: 6885,
        total: 91885,
        notes: 'Lieferung in 3 Etappen',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Geländer EG komplett', quantity: 1, unit: 'Pausch', unitPrice: 28000, vatRate: 'STANDARD', total: 28000 },
            { position: 2, description: 'Geländer 1.OG komplett', quantity: 1, unit: 'Pausch', unitPrice: 28000, vatRate: 'STANDARD', total: 28000 },
            { position: 3, description: 'Geländer 2.OG komplett', quantity: 1, unit: 'Pausch', unitPrice: 29000, vatRate: 'STANDARD', total: 29000 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        number: 'AU-2024-002',
        customerId: customers[2].id,
        projectId: projects[1].id,
        date: daysAgo(40),
        deliveryDate: daysFromNow(55),
        status: 'CONFIRMED',
        subtotal: 125000,
        vatAmount: 10125,
        total: 135125,
        notes: 'Wendeltreppe mit Glasgeländer',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Stahlwendeltreppe 4 Stockwerke', quantity: 1, unit: 'Pausch', unitPrice: 85000, vatRate: 'STANDARD', total: 85000 },
            { position: 2, productId: products[7].id, description: 'VSG Glasfüllung', quantity: 48, unit: 'm²', unitPrice: 125, vatRate: 'STANDARD', total: 6000 },
            { position: 3, productId: products[10].id, description: 'Montage komplett', quantity: 320, unit: 'Std', unitPrice: 105, vatRate: 'STANDARD', total: 33600 },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        number: 'AU-2023-028',
        customerId: customers[3].id,
        projectId: projects[3].id,
        quoteId: quotes[0].id,
        date: daysAgo(170),
        deliveryDate: daysAgo(95),
        status: 'CONFIRMED',
        subtotal: 45000,
        vatAmount: 3645,
        total: 48645,
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Vordach Stahl-Glas komplett', quantity: 1, unit: 'Pausch', unitPrice: 45000, vatRate: 'STANDARD', total: 45000 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 3 Aufträge erstellt');

  // =====================================================
  // 14. DELIVERY NOTES
  // =====================================================
  console.log('📦 Erstelle Lieferscheine...');

  await Promise.all([
    prisma.deliveryNote.create({
      data: {
        number: 'LS-2024-001',
        customerId: customers[0].id,
        orderId: orders[0].id,
        date: daysAgo(10),
        deliveryDate: daysAgo(10),
        status: 'DELIVERED',
        deliveredAt: daysAgo(10),
        deliveryAddress: 'Bahnhofstrasse 100, 8001 Zürich',
        notes: 'Lieferung EG - 12 Geländerelemente',
        companyId: company.id,
        items: {
          create: [
            { position: 1, productId: products[0].id, description: 'Geländer EG Element 1-6', quantity: 6, unit: 'Stk' },
            { position: 2, productId: products[0].id, description: 'Geländer EG Element 7-12', quantity: 6, unit: 'Stk' },
          ],
        },
      },
    }),
    prisma.deliveryNote.create({
      data: {
        number: 'LS-2023-045',
        customerId: customers[3].id,
        orderId: orders[2].id,
        date: daysAgo(100),
        deliveryDate: daysAgo(100),
        status: 'DELIVERED',
        deliveredAt: daysAgo(100),
        deliveryAddress: 'Bundesplatz 8, 3011 Bern',
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Vordach komplett', quantity: 1, unit: 'Pausch' },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 2 Lieferscheine erstellt');

  // =====================================================
  // 15. INVOICES
  // =====================================================
  console.log('📦 Erstelle Rechnungen...');

  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        number: 'RE-2024-001',
        customerId: customers[0].id,
        orderId: orders[0].id,
        date: daysAgo(8),
        dueDate: daysFromNow(22),
        status: 'SENT',
        subtotal: 28000,
        vatAmount: 2268,
        totalAmount: 30268,
        paidAmount: 0,
        qrReference: '000000000000000000000000001',
        notes: 'Akonto-Rechnung 1/3 - Geländer EG',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Akonto Geländer EG', quantity: 1, unit: 'Pausch', unitPrice: 28000, vatRate: 8.1, vatAmount: 2268, total: 30268 },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        number: 'RE-2023-048',
        customerId: customers[3].id,
        orderId: orders[2].id,
        date: daysAgo(95),
        dueDate: daysAgo(65),
        paidAt: daysAgo(70),
        status: 'PAID',
        subtotal: 45000,
        vatAmount: 3645,
        totalAmount: 48645,
        paidAmount: 48645,
        qrReference: '000000000000000000000000048',
        notes: 'Schlussrechnung Vordach',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Vordach Stahl-Glas komplett', quantity: 1, unit: 'Pausch', unitPrice: 45000, vatRate: 8.1, vatAmount: 3645, total: 48645 },
          ],
        },
      },
    }),
    prisma.invoice.create({
      data: {
        number: 'RE-2023-042',
        customerId: customers[1].id,
        date: daysAgo(120),
        dueDate: daysAgo(90),
        status: 'OVERDUE',
        subtotal: 15000,
        vatAmount: 1215,
        totalAmount: 16215,
        paidAmount: 0,
        qrReference: '000000000000000000000000042',
        notes: 'Kleinauftrag Reparatur',
        createdById: adminUser.id,
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Reparatur Toranlage', quantity: 1, unit: 'Pausch', unitPrice: 15000, vatRate: 8.1, vatAmount: 1215, total: 16215 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 3 Rechnungen erstellt');

  // =====================================================
  // 16. REMINDERS
  // =====================================================
  console.log('📦 Erstelle Mahnungen...');

  await prisma.reminder.create({
    data: {
      number: 'MHN-2024-001',
      invoiceId: invoices[2].id,
      level: 1,
      status: 'SENT',
      sentAt: daysAgo(60),
      dueDate: daysAgo(45),
      fee: 20,
      totalWithFee: 16235,
      notes: '1. Mahnung',
      companyId: company.id,
    },
  });

  await prisma.reminder.create({
    data: {
      number: 'MHN-2024-002',
      invoiceId: invoices[2].id,
      level: 2,
      status: 'SENT',
      sentAt: daysAgo(30),
      dueDate: daysAgo(15),
      fee: 40,
      totalWithFee: 16255,
      notes: '2. Mahnung',
      companyId: company.id,
    },
  });

  console.log('  ✓ 2 Mahnungen erstellt');

  // =====================================================
  // 17. CREDIT NOTES
  // =====================================================
  console.log('📦 Erstelle Gutschriften...');

  await prisma.creditNote.create({
    data: {
      number: 'GS-2024-001',
      customerId: customers[0].id,
      invoiceId: invoices[0].id,
      status: 'ISSUED',
      reason: 'PRICE_ADJUSTMENT',
      reasonText: 'Nachlass wegen Lieferverzögerung',
      issueDate: daysAgo(5),
      subtotal: 1000,
      vatAmount: 81,
      totalAmount: 1081,
      companyId: company.id,
      items: {
        create: [
          { position: 1, description: 'Kulanzgutschrift', quantity: 1, unit: 'Pausch', unitPrice: 1000, vatRate: 8.1, vatAmount: 81, total: 1081 },
        ],
      },
    },
  });

  console.log('  ✓ 1 Gutschrift erstellt');

  // =====================================================
  // 18. PURCHASE ORDERS
  // =====================================================
  console.log('📦 Erstelle Bestellungen...');

  const purchaseOrders = await Promise.all([
    prisma.purchaseOrder.create({
      data: {
        number: 'BE-2024-001',
        supplierId: suppliers[0].id,
        projectId: projects[0].id,
        date: daysAgo(50),
        expectedDate: daysAgo(40),
        status: 'CONFIRMED',
        subtotal: 8500,
        vatAmount: 688.50,
        total: 9188.50,
        notes: 'Stahlprofile für Projekt Zürich',
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Stahlprofil IPE 200', quantity: 80, unit: 'lfm', unitPrice: 45, vatRate: 'STANDARD', total: 3600 },
            { position: 2, description: 'Quadratrohr 60x60x3', quantity: 200, unit: 'lfm', unitPrice: 12.50, vatRate: 'STANDARD', total: 2500 },
            { position: 3, description: 'Flachstahl 50x8', quantity: 320, unit: 'lfm', unitPrice: 4.80, vatRate: 'STANDARD', total: 1536 },
          ],
        },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        number: 'BE-2024-002',
        supplierId: suppliers[1].id,
        date: daysAgo(45),
        expectedDate: daysAgo(38),
        status: 'CONFIRMED',
        subtotal: 1850,
        vatAmount: 149.85,
        total: 1999.85,
        notes: 'Befestigungsmaterial Lager',
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'Sechskantschraube M12x50', quantity: 2000, unit: 'Stk', unitPrice: 0.45, vatRate: 'STANDARD', total: 900 },
            { position: 2, description: 'Ankerschraube M10x80', quantity: 300, unit: 'Stk', unitPrice: 2.80, vatRate: 'STANDARD', total: 840 },
          ],
        },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        number: 'BE-2024-003',
        supplierId: suppliers[3].id,
        projectId: projects[1].id,
        date: daysAgo(20),
        expectedDate: daysFromNow(10),
        status: 'SENT',
        subtotal: 6000,
        vatAmount: 486,
        total: 6486,
        notes: 'Glasfüllung Wendeltreppe',
        companyId: company.id,
        items: {
          create: [
            { position: 1, description: 'VSG Sicherheitsglas 10mm', quantity: 48, unit: 'm²', unitPrice: 85, vatRate: 'STANDARD', total: 4080 },
            { position: 2, description: 'Zuschnitt nach Mass', quantity: 48, unit: 'Stk', unitPrice: 40, vatRate: 'STANDARD', total: 1920 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 3 Bestellungen erstellt');

  // =====================================================
  // 19. GOODS RECEIPTS
  // =====================================================
  console.log('📦 Erstelle Wareneingänge...');

  await Promise.all([
    prisma.goodsReceipt.create({
      data: {
        number: 'WE-2024-001',
        purchaseOrderId: purchaseOrders[0].id,
        status: 'COMPLETE',
        receiptDate: daysAgo(42),
        deliveryNoteNumber: 'LF-55892',
        carrier: 'Planzer Transport',
        notes: 'Vollständig geliefert',
        companyId: company.id,
        items: {
          create: [
            { position: 1, productId: products[0].id, orderedQuantity: 80, receivedQuantity: 80, unit: 'lfm', qualityStatus: 'PASSED' },
            { position: 2, productId: products[2].id, orderedQuantity: 200, receivedQuantity: 200, unit: 'lfm', qualityStatus: 'PASSED' },
            { position: 3, productId: products[3].id, orderedQuantity: 320, receivedQuantity: 320, unit: 'lfm', qualityStatus: 'PASSED' },
          ],
        },
      },
    }),
    prisma.goodsReceipt.create({
      data: {
        number: 'WE-2024-002',
        purchaseOrderId: purchaseOrders[1].id,
        status: 'COMPLETE',
        receiptDate: daysAgo(40),
        deliveryNoteNumber: 'SE-12456',
        notes: 'OK',
        companyId: company.id,
        items: {
          create: [
            { position: 1, productId: products[4].id, orderedQuantity: 2000, receivedQuantity: 2000, unit: 'Stk', qualityStatus: 'PASSED' },
            { position: 2, productId: products[5].id, orderedQuantity: 300, receivedQuantity: 300, unit: 'Stk', qualityStatus: 'PASSED' },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 2 Wareneingänge erstellt');

  // =====================================================
  // 20. PURCHASE INVOICES
  // =====================================================
  console.log('📦 Erstelle Eingangsrechnungen...');

  const purchaseInvoices = await Promise.all([
    prisma.purchaseInvoice.create({
      data: {
        number: 'STAHL-2024-55892',
        supplierId: suppliers[0].id,
        purchaseOrderId: purchaseOrders[0].id,
        date: daysAgo(40),
        dueDate: daysAgo(10),
        status: 'PAID',
        subtotal: 8500,
        vatAmount: 688.50,
        totalAmount: 9188.50,
        paidAmount: 9188.50,
        companyId: company.id,
      },
    }),
    prisma.purchaseInvoice.create({
      data: {
        number: 'SE-2024-12456',
        supplierId: suppliers[1].id,
        purchaseOrderId: purchaseOrders[1].id,
        date: daysAgo(38),
        dueDate: daysAgo(24),
        status: 'PAID',
        subtotal: 1850,
        vatAmount: 149.85,
        totalAmount: 1999.85,
        paidAmount: 1999.85,
        companyId: company.id,
      },
    }),
    prisma.purchaseInvoice.create({
      data: {
        number: 'FL-2024-8834',
        supplierId: suppliers[2].id,
        date: daysAgo(15),
        dueDate: daysFromNow(15),
        status: 'DRAFT',
        subtotal: 2400,
        vatAmount: 194.40,
        totalAmount: 2594.40,
        paidAmount: 0,
        notes: 'Lacke für Q2',
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 3 Eingangsrechnungen erstellt');

  // =====================================================
  // 21. PAYMENTS
  // =====================================================
  console.log('📦 Erstelle Zahlungen...');

  await Promise.all([
    prisma.payment.create({
      data: {
        number: 'ZE-2024-001',
        type: 'INCOMING',
        status: 'COMPLETED',
        invoiceId: invoices[1].id,
        customerId: customers[3].id,
        paymentDate: daysAgo(70),
        amount: 48645,
        method: 'BANK_TRANSFER',
        reference: 'QRR 000000000000000000000000048',
        notes: 'Zahlung via QR-Rechnung',
        companyId: company.id,
      },
    }),
    prisma.payment.create({
      data: {
        number: 'ZA-2024-001',
        type: 'OUTGOING',
        status: 'COMPLETED',
        purchaseInvoiceId: purchaseInvoices[0].id,
        supplierId: suppliers[0].id,
        paymentDate: daysAgo(12),
        amount: 9188.50,
        method: 'BANK_TRANSFER',
        reference: 'STAHL-55892',
        companyId: company.id,
      },
    }),
    prisma.payment.create({
      data: {
        number: 'ZA-2024-002',
        type: 'OUTGOING',
        status: 'COMPLETED',
        purchaseInvoiceId: purchaseInvoices[1].id,
        supplierId: suppliers[1].id,
        paymentDate: daysAgo(26),
        amount: 1999.85,
        method: 'BANK_TRANSFER',
        reference: 'SE-12456',
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 3 Zahlungen erstellt');

  // =====================================================
  // 22. BANK ACCOUNTS
  // =====================================================
  console.log('📦 Erstelle Bankkonten...');

  const bankAccountsList = await Promise.all([
    prisma.bankAccount.upsert({
      where: { id: 'bank-ubs' },
      update: {},
      create: {
        id: 'bank-ubs',
        name: 'UBS Geschäftskonto',
        bankName: 'UBS Switzerland AG',
        iban: 'CH93 0076 2011 6238 5295 7',
        bic: 'UBSWCHZH80A',
        currency: 'CHF',
        balance: 125680.45,
        isDefault: true,
        qrIban: 'CH44 3199 9123 0008 8901 2',
        companyId: company.id,
      },
    }),
    prisma.bankAccount.upsert({
      where: { id: 'bank-postfinance' },
      update: {},
      create: {
        id: 'bank-postfinance',
        name: 'PostFinance',
        bankName: 'PostFinance AG',
        iban: 'CH45 0900 0000 8765 4321 0',
        bic: 'POFICHBEXXX',
        currency: 'CHF',
        balance: 34520.00,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 2 Bankkonten erstellt');

  // =====================================================
  // 23. CHART OF ACCOUNTS (Swiss KMU)
  // =====================================================
  console.log('📦 Erstelle Kontenrahmen...');

  const accounts = await Promise.all([
    // Aktiven
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1000' } }, update: {}, create: { number: '1000', name: 'Kasse', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1020' } }, update: {}, create: { number: '1020', name: 'Bank UBS', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1021' } }, update: {}, create: { number: '1021', name: 'Bank PostFinance', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1100' } }, update: {}, create: { number: '1100', name: 'Debitoren', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1170' } }, update: {}, create: { number: '1170', name: 'Vorsteuer MWST', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1200' } }, update: {}, create: { number: '1200', name: 'Vorräte Material', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1500' } }, update: {}, create: { number: '1500', name: 'Maschinen und Geräte', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1510' } }, update: {}, create: { number: '1510', name: 'Fahrzeuge', type: 'ASSET', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '1520' } }, update: {}, create: { number: '1520', name: 'Werkzeuge', type: 'ASSET', companyId: company.id } }),
    // Passiven
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '2000' } }, update: {}, create: { number: '2000', name: 'Kreditoren', type: 'LIABILITY', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '2200' } }, update: {}, create: { number: '2200', name: 'MWST Schuld', type: 'LIABILITY', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '2300' } }, update: {}, create: { number: '2300', name: 'Passive Rechnungsabgrenzung', type: 'LIABILITY', companyId: company.id } }),
    // Eigenkapital
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '2800' } }, update: {}, create: { number: '2800', name: 'Aktienkapital', type: 'EQUITY', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '2900' } }, update: {}, create: { number: '2900', name: 'Gewinnvortrag', type: 'EQUITY', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '2990' } }, update: {}, create: { number: '2990', name: 'Jahresgewinn/-verlust', type: 'EQUITY', companyId: company.id } }),
    // Ertrag
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '3000' } }, update: {}, create: { number: '3000', name: 'Produktionserlöse', type: 'REVENUE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '3200' } }, update: {}, create: { number: '3200', name: 'Dienstleistungserlöse', type: 'REVENUE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '3800' } }, update: {}, create: { number: '3800', name: 'Sonstige Erlöse', type: 'REVENUE', companyId: company.id } }),
    // Aufwand
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '4000' } }, update: {}, create: { number: '4000', name: 'Materialaufwand', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '4400' } }, update: {}, create: { number: '4400', name: 'Fremdleistungen', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '5000' } }, update: {}, create: { number: '5000', name: 'Lohnaufwand', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '5700' } }, update: {}, create: { number: '5700', name: 'Sozialversicherungen', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '6000' } }, update: {}, create: { number: '6000', name: 'Raumaufwand', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '6200' } }, update: {}, create: { number: '6200', name: 'Fahrzeugaufwand', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '6500' } }, update: {}, create: { number: '6500', name: 'Verwaltungsaufwand', type: 'EXPENSE', companyId: company.id } }),
    prisma.chartOfAccount.upsert({ where: { companyId_number: { companyId: company.id, number: '6800' } }, update: {}, create: { number: '6800', name: 'Abschreibungen', type: 'EXPENSE', companyId: company.id } }),
  ]);

  console.log('  ✓ 26 Konten erstellt');

  // =====================================================
  // 24. JOURNAL ENTRIES
  // =====================================================
  console.log('📦 Erstelle Buchungen...');

  await Promise.all([
    prisma.journalEntry.create({
      data: {
        date: daysAgo(70),
        debitAccountId: accounts[1].id,
        creditAccountId: accounts[3].id,
        amount: 48645,
        description: 'Zahlungseingang RE-2023-048',
        reference: 'RE-2023-048',
        companyId: company.id,
      },
    }),
    prisma.journalEntry.create({
      data: {
        date: daysAgo(12),
        debitAccountId: accounts[9].id,
        creditAccountId: accounts[1].id,
        amount: 9188.50,
        description: 'Zahlung Stahl Schweiz AG',
        reference: 'LF-0001',
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 2 Buchungen erstellt');

  // =====================================================
  // 25. ABSENCES
  // =====================================================
  console.log('📦 Erstelle Abwesenheiten...');

  await Promise.all([
    prisma.absence.create({
      data: {
        employeeId: employees[0].id,
        type: 'VACATION',
        status: 'APPROVED',
        startDate: daysFromNow(60),
        endDate: daysFromNow(74),
        days: 10,
        reason: 'Sommerferien',
      },
    }),
    prisma.absence.create({
      data: {
        employeeId: employees[2].id,
        type: 'SICK',
        status: 'APPROVED',
        startDate: daysAgo(20),
        endDate: daysAgo(18),
        days: 2,
        reason: 'Grippe',
      },
    }),
    prisma.absence.create({
      data: {
        employeeId: employees[4].id,
        type: 'VACATION',
        status: 'PENDING',
        startDate: daysFromNow(30),
        endDate: daysFromNow(34),
        days: 5,
        reason: 'Kurzurlaub',
      },
    }),
    prisma.absence.create({
      data: {
        employeeId: employees[3].id,
        type: 'PATERNITY',
        status: 'APPROVED',
        startDate: daysAgo(45),
        endDate: daysAgo(36),
        days: 10,
        reason: 'Vaterschaftsurlaub',
        notes: 'Geburt am 15.01.2024',
      },
    }),
  ]);

  console.log('  ✓ 4 Abwesenheiten erstellt');

  // =====================================================
  // 26. PAYSLIPS
  // =====================================================
  console.log('📦 Erstelle Lohnabrechnungen...');

  for (const emp of employees.slice(0, 5)) {
    for (let i = 0; i < 3; i++) {
      const period = monthStart(i);
      await prisma.payslip.create({
        data: {
          employeeId: emp.id,
          period,
          grossSalary: emp.number === 'MA-0001' ? 12500 : emp.number === 'MA-0006' ? 3900 : 6000,
          netSalary: emp.number === 'MA-0001' ? 9875 : emp.number === 'MA-0006' ? 3120 : 4740,
          ahvDeduction: emp.number === 'MA-0001' ? 662.50 : emp.number === 'MA-0006' ? 206.70 : 318,
          alvDeduction: emp.number === 'MA-0001' ? 137.50 : emp.number === 'MA-0006' ? 42.90 : 66,
          nbuDeduction: emp.number === 'MA-0001' ? 75 : emp.number === 'MA-0006' ? 23.40 : 36,
          bvgDeduction: emp.number === 'MA-0001' ? 750 : emp.number === 'MA-0006' ? 234 : 360,
          taxDeduction: 0,
          hoursWorked: emp.workloadPercent === 100 ? 184.5 : 110.7,
          isPaid: i > 0,
          paidAt: i > 0 ? new Date(period.getFullYear(), period.getMonth() + 1, 25) : null,
          items: {
            create: [
              { category: 'EARNING', type: 'base', description: 'Monatslohn', amount: emp.number === 'MA-0001' ? 12500 : emp.number === 'MA-0006' ? 3900 : 6000, sortOrder: 1 },
              { category: 'DEDUCTION', type: 'social', description: 'AHV/IV/EO', amount: emp.number === 'MA-0001' ? 662.50 : emp.number === 'MA-0006' ? 206.70 : 318, rate: 5.3, sortOrder: 2 },
              { category: 'DEDUCTION', type: 'social', description: 'ALV', amount: emp.number === 'MA-0001' ? 137.50 : emp.number === 'MA-0006' ? 42.90 : 66, rate: 1.1, sortOrder: 3 },
              { category: 'DEDUCTION', type: 'insurance', description: 'NBU', amount: emp.number === 'MA-0001' ? 75 : emp.number === 'MA-0006' ? 23.40 : 36, rate: 0.6, sortOrder: 4 },
              { category: 'DEDUCTION', type: 'pension', description: 'BVG', amount: emp.number === 'MA-0001' ? 750 : emp.number === 'MA-0006' ? 234 : 360, rate: 6.0, sortOrder: 5 },
            ],
          },
        },
      });
    }
  }

  console.log('  ✓ 15 Lohnabrechnungen erstellt');

  // =====================================================
  // 27. GAV SETTINGS & EMPLOYEE DATA
  // =====================================================
  console.log('📦 Erstelle GAV-Daten...');

  await prisma.gavSettings.upsert({
    where: { companyId_year: { companyId: company.id, year: 2024 } },
    update: {},
    create: {
      year: 2024,
      weeklyHours: 42.5,
      minRateA: 22.75,
      minRateB: 24.30,
      minRateC: 28.10,
      minRateD: 31.50,
      minRateE: 35.80,
      minRateF: 42.00,
      schmutzzulage: 2.50,
      hoehenzulage: 3.00,
      nachtzulageProzent: 25,
      sonntagProzent: 50,
      ueberZeitProzent: 25,
      essenszulage: 18.00,
      unterkunftMax: 120.00,
      companyId: company.id,
    },
  });

  await Promise.all([
    prisma.gavEmployeeData.create({
      data: { employeeId: employees[0].id, lohnklasse: 'F', hourlyRate: 72.00, yearsExperience: 20, hasEfz: true, efzProfession: 'Metallbaumeister', efzDate: new Date('2005-07-01') },
    }),
    prisma.gavEmployeeData.create({
      data: { employeeId: employees[1].id, lohnklasse: 'E', hourlyRate: 45.00, yearsExperience: 12, hasEfz: true, efzProfession: 'Metallbauer EFZ', efzDate: new Date('2012-07-01') },
    }),
    prisma.gavEmployeeData.create({
      data: { employeeId: employees[2].id, lohnklasse: 'C', hourlyRate: 35.80, yearsExperience: 8, hasEfz: true, efzProfession: 'Metallbauer EFZ', efzDate: new Date('2016-07-01') },
    }),
    prisma.gavEmployeeData.create({
      data: { employeeId: employees[3].id, lohnklasse: 'C', hourlyRate: 33.50, yearsExperience: 5, hasEfz: true, efzProfession: 'Metallbauer EFZ', efzDate: new Date('2019-07-01') },
    }),
    prisma.gavEmployeeData.create({
      data: { employeeId: employees[4].id, lohnklasse: 'C', hourlyRate: 31.80, yearsExperience: 4, hasEfz: true, efzProfession: 'Metallbauer EFZ', efzDate: new Date('2020-07-01') },
    }),
    prisma.gavEmployeeData.create({
      data: { employeeId: employees[6].id, lohnklasse: 'B', hourlyRate: 24.30, yearsExperience: 1, hasEfz: false },
    }),
  ]);

  console.log('  ✓ GAV-Einstellungen und 6 Mitarbeiter-GAV-Daten erstellt');

  // =====================================================
  // 28. WITHHOLDING TAX (QST)
  // =====================================================
  console.log('📦 Erstelle Quellensteuer-Daten...');

  await Promise.all([
    prisma.qstEmployeeData.create({
      data: { employeeId: employees[2].id, status: 'ACTIVE', kanton: 'ZH', tarif: 'A', childCount: 1, churchMember: false, nationality: 'IT', permitType: 'B', permitValidUntil: daysFromNow(365) },
    }),
    prisma.qstEmployeeData.create({
      data: { employeeId: employees[6].id, status: 'ACTIVE', kanton: 'ZH', tarif: 'A', childCount: 0, churchMember: false, nationality: 'TR', permitType: 'B', permitValidUntil: daysFromNow(180) },
    }),
  ]);

  console.log('  ✓ 2 Quellensteuer-Daten erstellt');

  // =====================================================
  // 29. COST CENTERS
  // =====================================================
  console.log('📦 Erstelle Kostenstellen...');

  const costCenters = await Promise.all([
    prisma.costCenter.upsert({ where: { companyId_number: { companyId: company.id, number: '100' } }, update: {}, create: { number: '100', name: 'Verwaltung', description: 'Administration und Geschäftsleitung', budgetAmount: 150000, companyId: company.id } }),
    prisma.costCenter.upsert({ where: { companyId_number: { companyId: company.id, number: '200' } }, update: {}, create: { number: '200', name: 'Produktion', description: 'Werkstatt und Fertigung', budgetAmount: 450000, companyId: company.id } }),
    prisma.costCenter.upsert({ where: { companyId_number: { companyId: company.id, number: '300' } }, update: {}, create: { number: '300', name: 'Montage', description: 'Aussenmontage', budgetAmount: 280000, companyId: company.id } }),
    prisma.costCenter.upsert({ where: { companyId_number: { companyId: company.id, number: '400' } }, update: {}, create: { number: '400', name: 'Vertrieb', description: 'Akquise und Kundenbetreuung', budgetAmount: 80000, companyId: company.id } }),
  ]);

  console.log('  ✓ 4 Kostenstellen erstellt');

  // =====================================================
  // 30. BUDGETS
  // =====================================================
  console.log('📦 Erstelle Budgets...');

  await Promise.all([
    prisma.budget.create({ data: { number: 'BUD-2024-001', name: 'Jahresbudget 2024', period: 'YEARLY', year: 2024, totalAmount: 960000, status: 'ACTIVE', companyId: company.id } }),
    prisma.budget.create({ data: { number: 'BUD-2024-002', name: 'Investitionsbudget 2024', period: 'YEARLY', year: 2024, totalAmount: 150000, status: 'ACTIVE', companyId: company.id } }),
  ]);

  console.log('  ✓ 2 Budgets erstellt');

  // =====================================================
  // 31. FIXED ASSETS
  // =====================================================
  console.log('📦 Erstelle Anlagevermögen...');

  const fixedAssets = await Promise.all([
    prisma.fixedAsset.create({
      data: {
        number: 'ANL-00001',
        name: 'CNC-Brennschneidanlage',
        description: 'Messer Cutting Systems MultiTherm',
        category: 'MACHINERY',
        acquisitionDate: new Date('2020-03-15'),
        acquisitionCost: 185000,
        residualValue: 10000,
        currentBookValue: 105000,
        usefulLife: 10,
        depreciationMethod: 'LINEAR',
        depreciationRate: 0.1,
        status: 'ACTIVE',
        location: 'Werkstatt Halle 1',
        costCenterId: costCenters[1].id,
        companyId: company.id,
      },
    }),
    prisma.fixedAsset.create({
      data: {
        number: 'ANL-00002',
        name: 'Schweissroboter',
        description: 'KUKA KR 16 arc HW',
        category: 'MACHINERY',
        acquisitionDate: new Date('2022-06-01'),
        acquisitionCost: 125000,
        residualValue: 5000,
        currentBookValue: 101000,
        usefulLife: 10,
        depreciationMethod: 'LINEAR',
        depreciationRate: 0.1,
        status: 'ACTIVE',
        location: 'Werkstatt Halle 1',
        costCenterId: costCenters[1].id,
        companyId: company.id,
      },
    }),
    prisma.fixedAsset.create({
      data: {
        number: 'ANL-00003',
        name: 'Mercedes Sprinter',
        description: '316 CDI Kastenwagen',
        category: 'VEHICLES',
        serialNumber: 'WDB9066331S123456',
        acquisitionDate: new Date('2021-09-01'),
        acquisitionCost: 52000,
        residualValue: 8000,
        currentBookValue: 36800,
        usefulLife: 6,
        depreciationMethod: 'LINEAR',
        depreciationRate: 0.1667,
        status: 'ACTIVE',
        costCenterId: costCenters[2].id,
        companyId: company.id,
      },
    }),
    prisma.fixedAsset.create({
      data: {
        number: 'ANL-00004',
        name: 'IT-Infrastruktur',
        description: 'Server, Workstations, CAD-Software',
        category: 'IT_EQUIPMENT',
        acquisitionDate: new Date('2023-01-15'),
        acquisitionCost: 28000,
        residualValue: 0,
        currentBookValue: 21000,
        usefulLife: 4,
        depreciationMethod: 'LINEAR',
        depreciationRate: 0.25,
        status: 'ACTIVE',
        costCenterId: costCenters[0].id,
        companyId: company.id,
      },
    }),
  ]);

  // Create depreciation entries
  for (const asset of fixedAssets) {
    const yearsElapsed = Math.floor((Date.now() - asset.acquisitionDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    let bookValue = Number(asset.acquisitionCost);
    const annualDepreciation = (Number(asset.acquisitionCost) - Number(asset.residualValue)) / asset.usefulLife;
    
    for (let year = 0; year < Math.min(yearsElapsed, asset.usefulLife); year++) {
      const deprecYear = asset.acquisitionDate.getFullYear() + year;
      await prisma.assetDepreciation.create({
        data: {
          fixedAssetId: asset.id,
          year: deprecYear,
          amount: annualDepreciation,
          bookValueBefore: bookValue,
          bookValueAfter: bookValue - annualDepreciation,
          isPosted: true,
        },
      });
      bookValue -= annualDepreciation;
    }
  }

  console.log('  ✓ 4 Anlagen mit Abschreibungen erstellt');

  // =====================================================
  // 32. VAT RETURNS
  // =====================================================
  console.log('📦 Erstelle MWST-Abrechnungen...');

  await Promise.all([
    prisma.vatReturn.create({
      data: {
        number: 'MWST-2023-Q4',
        year: 2023,
        period: 'QUARTERLY',
        quarter: 4,
        status: 'SUBMITTED',
        totalOutputTax: 28500,
        totalInputTax: 12400,
        vatPayable: 16100,
        calculatedAt: daysAgo(45),
        submittedAt: daysAgo(30),
        submissionMethod: 'eCH-0217',
        companyId: company.id,
      },
    }),
    prisma.vatReturn.create({
      data: {
        number: 'MWST-2024-Q1',
        year: 2024,
        period: 'QUARTERLY',
        quarter: 1,
        status: 'CALCULATED',
        totalOutputTax: 18200,
        totalInputTax: 8900,
        vatPayable: 9300,
        calculatedAt: daysAgo(5),
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 2 MWST-Abrechnungen erstellt');

  // =====================================================
  // 33. BILL OF MATERIALS
  // =====================================================
  console.log('📦 Erstelle Stücklisten...');

  const boms = await Promise.all([
    prisma.billOfMaterial.create({
      data: {
        name: 'Treppengeländer Standard 3m',
        description: 'Standard-Treppengeländer für Innenbereich',
        isTemplate: true,
        category: 'Geländer',
        companyId: company.id,
        items: {
          create: [
            { type: 'MATERIAL', productId: products[2].id, description: 'Quadratrohr 60x60x3 Handlauf', quantity: 3.2, unit: 'lfm', unitPrice: 12.50, total: 40, sortOrder: 1 },
            { type: 'MATERIAL', productId: products[3].id, description: 'Flachstahl Pfosten', quantity: 8, unit: 'lfm', unitPrice: 4.80, total: 38.40, sortOrder: 2 },
            { type: 'MATERIAL', productId: products[4].id, description: 'Befestigung', quantity: 24, unit: 'Stk', unitPrice: 0.45, total: 10.80, sortOrder: 3 },
            { type: 'LABOR', description: 'Zuschnitt und Schweissen', quantity: 1, unit: 'Pausch', hours: 6, hourlyRate: 95, unitPrice: 570, total: 570, sortOrder: 4 },
            { type: 'LABOR', description: 'Oberflächenbehandlung', quantity: 1, unit: 'Pausch', hours: 2, hourlyRate: 95, unitPrice: 190, total: 190, sortOrder: 5 },
            { type: 'EXTERNAL', description: 'Pulverbeschichtung extern', quantity: 3.5, unit: 'm²', unitPrice: 45, total: 157.50, sortOrder: 6 },
          ],
        },
      },
    }),
    prisma.billOfMaterial.create({
      data: {
        name: 'Balkongeländer Typ A 2.5m',
        description: 'Standard-Balkongeländer mit Glasfüllung',
        isTemplate: true,
        category: 'Geländer',
        companyId: company.id,
        items: {
          create: [
            { type: 'MATERIAL', productId: products[2].id, description: 'Quadratrohr Rahmen', quantity: 8, unit: 'lfm', unitPrice: 12.50, total: 100, sortOrder: 1 },
            { type: 'MATERIAL', productId: products[7].id, description: 'VSG Glasfüllung', quantity: 2, unit: 'm²', unitPrice: 85, total: 170, sortOrder: 2 },
            { type: 'MATERIAL', productId: products[5].id, description: 'Ankerschrauben', quantity: 8, unit: 'Stk', unitPrice: 2.80, total: 22.40, sortOrder: 3 },
            { type: 'LABOR', description: 'Fertigung komplett', quantity: 1, unit: 'Pausch', hours: 8, hourlyRate: 95, unitPrice: 760, total: 760, sortOrder: 4 },
            { type: 'EXTERNAL', description: 'Pulverbeschichtung', quantity: 2.5, unit: 'm²', unitPrice: 45, total: 112.50, sortOrder: 5 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 2 Stücklisten-Vorlagen erstellt');

  // =====================================================
  // 34. PRODUCTION ORDERS
  // =====================================================
  console.log('📦 Erstelle Werkstattaufträge...');

  const productionOrders = await Promise.all([
    prisma.productionOrder.create({
      data: {
        number: 'WA-2024-001',
        name: 'Geländer Bürogebäude EG',
        description: '12 Geländerelemente à 2.5m für Erdgeschoss',
        projectId: projects[0].id,
        orderId: orders[0].id,
        bomId: boms[0].id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        quantity: 12,
        plannedStartDate: daysAgo(25),
        plannedEndDate: daysFromNow(5),
        actualStartDate: daysAgo(20),
        companyId: company.id,
        operations: {
          create: [
            { name: 'Zuschnitt', workstation: 'Säge', plannedHours: 8, actualHours: 7.5, status: 'completed', sortOrder: 1 },
            { name: 'Schweissen', workstation: 'Schweissplatz', plannedHours: 24, actualHours: 18, assignedEmployeeId: employees[2].id, status: 'in_progress', sortOrder: 2 },
            { name: 'Schleifen', workstation: 'Schleifplatz', plannedHours: 8, status: 'pending', sortOrder: 3 },
            { name: 'Qualitätskontrolle', workstation: 'QS', plannedHours: 2, status: 'pending', sortOrder: 4 },
          ],
        },
      },
    }),
    prisma.productionOrder.create({
      data: {
        number: 'WA-2024-002',
        name: 'Wendeltreppe Hotel',
        description: 'Freitragende Stahlwendeltreppe 4 Stockwerke',
        projectId: projects[1].id,
        orderId: orders[1].id,
        status: 'PLANNED',
        priority: 'HIGH',
        quantity: 1,
        plannedStartDate: daysFromNow(10),
        plannedEndDate: daysFromNow(45),
        companyId: company.id,
        operations: {
          create: [
            { name: 'Zuschnitt Hauptkonstruktion', workstation: 'CNC', plannedHours: 16, status: 'pending', sortOrder: 1 },
            { name: 'Biegen Wangen', workstation: 'Biegemaschine', plannedHours: 12, status: 'pending', sortOrder: 2 },
            { name: 'Schweissen Stufen', workstation: 'Roboter', plannedHours: 24, status: 'pending', sortOrder: 3 },
            { name: 'Schweissen Konstruktion', workstation: 'Schweissplatz', plannedHours: 40, status: 'pending', sortOrder: 4 },
            { name: 'Montageprobe', workstation: 'Montagehalle', plannedHours: 8, status: 'pending', sortOrder: 5 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 2 Werkstattaufträge erstellt');

  // =====================================================
  // 35. CALCULATIONS
  // =====================================================
  console.log('📦 Erstelle Kalkulationen...');

  await prisma.calculation.create({
    data: {
      number: 'KA-2024-001',
      name: 'Kalkulation Balkongeländer Projekt',
      description: '48 Balkongeländer für Bau Meier',
      projectId: projects[2].id,
      bomId: boms[1].id,
      customerId: customers[1].id,
      status: 'CALCULATED',
      materialMarkup: 15,
      laborMarkup: 10,
      overheadPercent: 8,
      profitMargin: 12,
      riskMargin: 5,
      discount: 3,
      totalCost: 142500,
      totalPrice: 181608,
      companyId: company.id,
      items: {
        create: [
          { type: 'MATERIAL', description: 'Material gesamt', quantity: 48, unit: 'Stk', unitCost: 292.40, total: 14035, sortOrder: 1 },
          { type: 'LABOR', description: 'Fertigung', quantity: 384, unit: 'Std', hours: 384, hourlyRate: 95, unitCost: 95, total: 36480, sortOrder: 2 },
          { type: 'LABOR', description: 'Montage', quantity: 240, unit: 'Std', hours: 240, hourlyRate: 105, unitCost: 105, total: 25200, sortOrder: 3 },
          { type: 'EXTERNAL', description: 'Pulverbeschichtung', quantity: 120, unit: 'm²', unitCost: 45, total: 5400, sortOrder: 4 },
        ],
      },
    },
  });

  console.log('  ✓ 1 Kalkulation erstellt');

  // =====================================================
  // 36. QUALITY CHECKLISTS & CHECKS
  // =====================================================
  console.log('📦 Erstelle Qualitätsprüfungen...');

  const checklist = await prisma.qualityChecklist.create({
    data: {
      name: 'Schweissnaht-Prüfung',
      description: 'Standard-Prüfprotokoll für Schweissnähte',
      type: 'IN_PROCESS',
      category: 'Schweissnaht',
      companyId: company.id,
      items: {
        create: [
          { name: 'Visuelle Prüfung', description: 'Keine sichtbaren Fehler, Poren, Risse', required: true, sortOrder: 1 },
          { name: 'Massgenauigkeit', description: 'Toleranz ±2mm', required: true, sortOrder: 2 },
          { name: 'Nahtbreite', description: 'Gleichmässige Nahtbreite', required: true, sortOrder: 3 },
          { name: 'Eindringtiefe', description: 'Ausreichende Durchschweissung', required: true, sortOrder: 4 },
          { name: 'Nachbearbeitung', description: 'Schlacke entfernt, geschliffen', required: false, sortOrder: 5 },
        ],
      },
    },
  });

  await prisma.qualityCheck.create({
    data: {
      number: 'QC-2024-001',
      checklistId: checklist.id,
      productionOrderId: productionOrders[0].id,
      type: 'IN_PROCESS',
      status: 'PASSED',
      inspectorId: employees[1].id,
      completedAt: daysAgo(5),
      notes: 'Alle Prüfpunkte bestanden',
      companyId: company.id,
    },
  });

  console.log('  ✓ 1 Checkliste und 1 Prüfung erstellt');

  // =====================================================
  // 37. SERVICE TICKETS
  // =====================================================
  console.log('📦 Erstelle Service-Tickets...');

  await Promise.all([
    prisma.serviceTicket.create({
      data: {
        number: 'ST-2024-001',
        title: 'Geländer Reparatur nach Anprall',
        description: 'Handlauf verbogen nach LKW-Anfahrt, Dringend',
        customerId: customers[0].id,
        priority: 'HIGH',
        status: 'OPEN',
        serviceType: 'REPAIR',
        assignedTechnicianId: employees[4].id,
        scheduledDate: daysFromNow(3),
        companyId: company.id,
      },
    }),
    prisma.serviceTicket.create({
      data: {
        number: 'ST-2024-002',
        title: 'Wartung Toranlage',
        description: 'Jährliche Wartung gemäss Vertrag',
        customerId: customers[1].id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        serviceType: 'MAINTENANCE',
        assignedTechnicianId: employees[4].id,
        scheduledDate: daysFromNow(14),
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 2 Service-Tickets erstellt');

  // =====================================================
  // 38. LEADS
  // =====================================================
  console.log('📦 Erstelle Leads...');

  await Promise.all([
    prisma.lead.create({ data: { name: 'Neue Anfrage Treppengeländer', companyName: 'Wohnbau Basel AG', email: 'anfrage@wohnbau-bs.ch', phone: '+41 61 555 12 34', source: 'Website', status: 'QUALIFIED', estimatedValue: 45000, companyId: company.id } }),
    prisma.lead.create({ data: { name: 'Balkongeländer Neubau', companyName: 'Implenia AG', email: 'projekt@implenia.ch', phone: '+41 44 666 23 45', source: 'Empfehlung', status: 'PROPOSAL', estimatedValue: 120000, companyId: company.id } }),
    prisma.lead.create({ data: { name: 'Carport Stahlkonstruktion', email: 'privat@gmail.com', phone: '+41 79 777 34 56', source: 'Cold Call', status: 'NEW', estimatedValue: 8500, companyId: company.id } }),
  ]);

  console.log('  ✓ 3 Leads erstellt');

  // =====================================================
  // 39. CAMPAIGNS
  // =====================================================
  console.log('📦 Erstelle Kampagnen...');

  await prisma.campaign.create({
    data: {
      name: 'Frühlings-Aktion 2024',
      description: '10% Rabatt auf Balkongeländer',
      type: 'Email',
      status: 'active',
      startDate: daysAgo(30),
      endDate: daysFromNow(30),
      budget: 2500,
      spent: 850,
      targetAudience: 'Bauunternehmen Region Zürich',
      companyId: company.id,
    },
  });

  console.log('  ✓ 1 Kampagne erstellt');

  // =====================================================
  // 40. CALENDAR EVENTS
  // =====================================================
  console.log('📦 Erstelle Kalendereinträge...');

  await Promise.all([
    prisma.calendarEvent.create({ data: { title: 'Kundentermin Immobilien Zürich', description: 'Besprechung Projektfortschritt Geländer', startTime: daysFromNow(3), endTime: new Date(daysFromNow(3).getTime() + 2 * 60 * 60 * 1000), location: 'Bahnhofstrasse 100, Zürich', companyId: company.id } }),
    prisma.calendarEvent.create({ data: { title: 'Team Meeting', description: 'Wöchentliche Projektbesprechung', startTime: daysFromNow(1), endTime: new Date(daysFromNow(1).getTime() + 1 * 60 * 60 * 1000), companyId: company.id } }),
    prisma.calendarEvent.create({ data: { title: 'Lieferung Glas Hotel', description: 'VSG Glas für Wendeltreppe', startTime: daysFromNow(12), endTime: new Date(daysFromNow(12).getTime() + 2 * 60 * 60 * 1000), companyId: company.id } }),
    prisma.calendarEvent.create({ data: { title: 'Montage EG Geländer', description: 'Installation beim Kunden', startTime: daysFromNow(8), endTime: new Date(daysFromNow(8).getTime() + 8 * 60 * 60 * 1000), location: 'Bahnhofstrasse 100, Zürich', companyId: company.id } }),
  ]);

  console.log('  ✓ 4 Kalendereinträge erstellt');

  // =====================================================
  // 41. SWISSDEC SUBMISSIONS
  // =====================================================
  console.log('📦 Erstelle Swissdec-Meldungen...');

  await prisma.swissdecSubmission.create({
    data: {
      reference: 'ELM-2024-001',
      messageType: 'SALARY_DECLARATION',
      year: 2024,
      month: 1,
      recipients: ['AHV', 'FAK', 'UVG', 'KTG'],
      status: 'PROCESSED',
      employeeCount: 7,
      validatedAt: daysAgo(25),
      submittedAt: daysAgo(24),
      transmissionId: 'TX-2024-001-ABC123',
      companyId: company.id,
      declarations: {
        create: employees.slice(0, 5).map(emp => ({
          employeeId: emp.id,
          year: 2024,
          month: 1,
          data: { grossSalary: 6000, ahv: 318, alv: 66, nbu: 36, bvg: 360 },
        })),
      },
    },
  });

  console.log('  ✓ 1 Swissdec-Meldung erstellt');

  // =====================================================
  // 42. TRAININGS
  // =====================================================
  console.log('📦 Erstelle Schulungen...');

  const training = await prisma.training.create({
    data: {
      name: 'Schweisszertifizierung EN 1090',
      description: 'Rezertifizierung für alle Schweisser',
      type: 'CERTIFICATION',
      status: 'SCHEDULED',
      startDate: daysFromNow(30),
      endDate: daysFromNow(31),
      location: 'SVS Schweissfachschule, Dietikon',
      instructorName: 'Dr. Hans Schmid',
      maxParticipants: 8,
      totalBudget: 4500,
      companyId: company.id,
    },
  });

  await Promise.all([
    prisma.trainingParticipant.create({ data: { trainingId: training.id, employeeId: employees[2].id, status: 'REGISTERED' } }),
    prisma.trainingParticipant.create({ data: { trainingId: training.id, employeeId: employees[3].id, status: 'REGISTERED' } }),
  ]);

  console.log('  ✓ 1 Schulung mit 2 Teilnehmern erstellt');

  // =====================================================
  // 43. LEAD ACTIVITIES
  // =====================================================
  console.log('📦 Erstelle Lead-Aktivitäten...');

  const leads = await prisma.lead.findMany({ where: { companyId: company.id }, take: 3 });

  if (leads.length > 0) {
    await Promise.all([
      prisma.leadActivity.create({
        data: {
          leadId: leads[0].id,
          type: 'CALL',
          description: 'Erstkontakt telefonisch',
          activityDate: daysAgo(5),
          durationMinutes: 15,
          outcome: 'Interesse bekundet, Unterlagen zugestellt',
        },
      }),
      prisma.leadActivity.create({
        data: {
          leadId: leads[0].id,
          type: 'EMAIL',
          description: 'Offerte per E-Mail gesendet',
          activityDate: daysAgo(3),
          outcome: 'Offerte CHF 45\'000 zugestellt',
        },
      }),
      prisma.leadActivity.create({
        data: {
          leadId: leads[1].id,
          type: 'MEETING',
          description: 'Vor-Ort Besichtigung Baustelle',
          activityDate: daysAgo(7),
          durationMinutes: 90,
          outcome: 'Aufmass erstellt, technische Klärungen',
        },
      }),
    ]);
  }

  console.log('  ✓ 3 Lead-Aktivitäten erstellt');

  // =====================================================
  // 44. EMAIL CAMPAIGNS
  // =====================================================
  console.log('📦 Erstelle E-Mail Kampagnen...');

  await Promise.all([
    prisma.emailCampaign.create({
      data: {
        name: 'Frühlings-Newsletter 2024',
        subject: 'Neue Geländer-Designs für Ihre Projekte',
        content: '<h1>Frühlings-Aktion</h1><p>Entdecken Sie unsere neuen Geländer-Designs mit 10% Frühlings-Rabatt. Gültig bis Ende April.</p><p>Besuchen Sie unsere Ausstellung!</p>',
        status: 'SENT',
        scheduledAt: daysAgo(14),
        sentAt: daysAgo(14),
        senderName: 'Loomora Metallbau',
        senderEmail: 'newsletter@loomora.ch',
        sentCount: 245,
        openCount: 89,
        clickCount: 23,
        bounceCount: 3,
        unsubscribeCount: 2,
        companyId: company.id,
      },
    }),
    prisma.emailCampaign.create({
      data: {
        name: 'Produktneuheit Mai 2024',
        subject: 'NEU: Modulare Balkongeländer-Systeme',
        content: '<h1>Neu im Sortiment</h1><p>Unser modulares Balkongeländer-System ermöglicht schnelle Montage und flexible Designs.</p>',
        status: 'SCHEDULED',
        scheduledAt: daysFromNow(7),
        senderName: 'Loomora Metallbau',
        senderEmail: 'newsletter@loomora.ch',
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 2 E-Mail Kampagnen erstellt');

  // =====================================================
  // 45. E-COMMERCE: DISCOUNTS
  // =====================================================
  console.log('📦 Erstelle Rabattcodes...');

  const discounts = await Promise.all([
    prisma.discount.create({
      data: {
        code: 'FRUEHLING24',
        name: 'Frühlings-Aktion 2024',
        description: '10% Rabatt auf alle Balkongeländer',
        type: 'PERCENTAGE',
        value: 10,
        minimumOrderValue: 500,
        maximumDiscount: 1000,
        usageLimit: 100,
        usageCount: 12,
        validFrom: daysAgo(30),
        validUntil: daysFromNow(30),
        isActive: true,
        companyId: company.id,
      },
    }),
    prisma.discount.create({
      data: {
        code: 'NEUKUNDE50',
        name: 'Neukunden-Rabatt',
        description: 'CHF 50 Rabatt für Neukunden',
        type: 'FIXED_AMOUNT',
        value: 50,
        minimumOrderValue: 200,
        usageLimit: 50,
        usageLimitPerCustomer: 1,
        usageCount: 8,
        validFrom: daysAgo(60),
        isActive: true,
        companyId: company.id,
      },
    }),
    prisma.discount.create({
      data: {
        code: 'GRATISVERSAND',
        name: 'Gratis Versand',
        description: 'Kostenloser Versand ab CHF 300',
        type: 'FREE_SHIPPING',
        value: 0,
        minimumOrderValue: 300,
        validFrom: daysAgo(90),
        isActive: true,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 3 Rabattcodes erstellt');

  // =====================================================
  // 46. E-COMMERCE: SHOP ORDERS
  // =====================================================
  console.log('📦 Erstelle Shop-Bestellungen...');

  const shopOrders = await Promise.all([
    prisma.shopOrder.create({
      data: {
        orderNumber: 'WEB-00001',
        customerId: customers[0].id,
        customerEmail: 'h.mueller@immo-zh.ch',
        billingAddress: {
          name: 'Hans Müller',
          company: 'Immobilien Zürich AG',
          street: 'Bahnhofstrasse 100',
          zipCode: '8001',
          city: 'Zürich',
          country: 'CH',
        },
        status: 'DELIVERED',
        paymentMethod: 'INVOICE',
        paymentStatus: 'PAID',
        subtotal: 892.50,
        discountAmount: 89.25,
        shippingCost: 0,
        vatAmount: 65.04,
        total: 868.29,
        discountId: discounts[0].id,
        trackingNumber: 'CH123456789',
        shippedAt: daysAgo(12),
        deliveredAt: daysAgo(10),
        companyId: company.id,
        items: {
          create: [
            { productId: products[4].id, quantity: 50, unitPrice: 0.45, discount: 0, total: 22.50 },
            { productId: products[5].id, quantity: 25, unitPrice: 2.80, discount: 0, total: 70.00 },
            { productId: products[2].id, quantity: 50, unitPrice: 12.50, discount: 0, total: 625.00 },
            { productId: products[3].id, quantity: 20, unitPrice: 4.80, discount: 0, total: 96.00 },
          ],
        },
      },
    }),
    prisma.shopOrder.create({
      data: {
        orderNumber: 'WEB-00002',
        customerEmail: 'bestellung@privat.ch',
        billingAddress: {
          name: 'Thomas Weber',
          street: 'Hauptstrasse 15',
          zipCode: '8400',
          city: 'Winterthur',
          country: 'CH',
        },
        status: 'PROCESSING',
        paymentMethod: 'TWINT',
        paymentStatus: 'PAID',
        subtotal: 265.00,
        discountAmount: 0,
        shippingCost: 15.00,
        vatAmount: 22.68,
        total: 302.68,
        companyId: company.id,
        items: {
          create: [
            { productId: products[7].id, quantity: 1, unitPrice: 265.00, discount: 0, total: 265.00 },
          ],
        },
      },
    }),
    prisma.shopOrder.create({
      data: {
        orderNumber: 'WEB-00003',
        customerId: customers[1].id,
        customerEmail: 'p.meier@bau-meier.ch',
        billingAddress: {
          name: 'Peter Meier',
          company: 'Bau Meier GmbH',
          street: 'Werkstrasse 55',
          zipCode: '8400',
          city: 'Winterthur',
          country: 'CH',
        },
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PENDING',
        subtotal: 1580.00,
        discountAmount: 50.00,
        shippingCost: 0,
        vatAmount: 123.93,
        total: 1653.93,
        discountId: discounts[1].id,
        notes: 'Lieferung bitte nur vormittags',
        companyId: company.id,
        items: {
          create: [
            { productId: products[0].id, quantity: 20, unitPrice: 68.50, discount: 0, total: 1370.00 },
            { productId: products[1].id, quantity: 10, unitPrice: 21.00, discount: 0, total: 210.00 },
          ],
        },
      },
    }),
  ]);

  console.log('  ✓ 3 Shop-Bestellungen erstellt');

  // =====================================================
  // 47. E-COMMERCE: REVIEWS
  // =====================================================
  console.log('📦 Erstelle Produktbewertungen...');

  await Promise.all([
    prisma.review.create({
      data: {
        productId: products[2].id,
        shopOrderId: shopOrders[0].id,
        customerName: 'Hans M.',
        customerEmail: 'h.mueller@immo-zh.ch',
        rating: 5,
        title: 'Ausgezeichnete Qualität',
        content: 'Die Quadratrohre haben eine sehr gute Verarbeitungsqualität. Massgenau und saubere Schnitte. Lieferung war schnell und unkompliziert.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
        moderatedAt: daysAgo(8),
        companyId: company.id,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[0].id,
        customerName: 'Sandra R.',
        rating: 4,
        title: 'Gutes Preis-Leistungs-Verhältnis',
        content: 'Stahlträger wie erwartet, Lieferzeit etwas lang (2 Wochen). Qualität aber einwandfrei.',
        isVerifiedPurchase: false,
        status: 'APPROVED',
        moderatedAt: daysAgo(20),
        companyId: company.id,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[7].id,
        shopOrderId: shopOrders[1].id,
        customerName: 'Thomas W.',
        rating: 5,
        title: 'Perfekt für Balkongeländer',
        content: 'VSG Glas in Top-Qualität, sehr sorgfältig verpackt. Keine Kratzer, passt perfekt.',
        isVerifiedPurchase: true,
        status: 'APPROVED',
        moderatedAt: daysAgo(3),
        companyId: company.id,
      },
    }),
    prisma.review.create({
      data: {
        productId: products[1].id,
        customerName: 'Anonym',
        rating: 3,
        title: 'Okay',
        content: 'Material in Ordnung, aber Rost an einigen Stellen bei Lieferung.',
        isVerifiedPurchase: false,
        status: 'PENDING',
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 4 Produktbewertungen erstellt');

  // =====================================================
  // 48. CONTRACTS
  // =====================================================
  console.log('📦 Erstelle Verträge...');

  const contracts = await Promise.all([
    prisma.contract.create({
      data: {
        contractNumber: 'V-0001-2024',
        name: 'Wartungsvertrag Toranlage',
        description: 'Jährliche Wartung der Toranlage inkl. 2 Inspektionen',
        type: 'MAINTENANCE',
        status: 'ACTIVE',
        customerId: customers[1].id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        durationMonths: 12,
        autoRenew: true,
        renewalPeriodMonths: 12,
        noticePeriodDays: 60,
        value: 1200,
        billingCycle: 'ANNUAL',
        paymentTerms: '30 Tage netto',
        responsibleId: adminUser.id,
        companyId: company.id,
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: 'V-0002-2024',
        name: 'Rahmenvertrag Metallkonstruktionen',
        description: 'Rahmenvertrag für alle Metallbauarbeiten am Standort Zürich',
        type: 'FRAMEWORK',
        status: 'ACTIVE',
        customerId: customers[0].id,
        projectId: projects[0].id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2026-01-31'),
        durationMonths: 24,
        autoRenew: false,
        noticePeriodDays: 90,
        value: 180000,
        billingCycle: 'MONTHLY',
        paymentTerms: '30 Tage netto',
        terms: 'Alle Arbeiten gemäss SIA-Normen. Preise fix für Vertragslaufzeit. Stundensätze gemäss Anhang A.',
        responsibleId: managerUser.id,
        companyId: company.id,
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: 'V-0003-2024',
        name: 'Service-Vertrag Hotel Bellevue',
        description: 'Notfall-Service und Kleinreparaturen',
        type: 'SERVICE',
        status: 'ACTIVE',
        customerId: customers[2].id,
        startDate: new Date('2024-03-01'),
        durationMonths: 24,
        autoRenew: true,
        renewalPeriodMonths: 12,
        noticePeriodDays: 30,
        value: 600,
        billingCycle: 'SEMI_ANNUAL',
        paymentTerms: '14 Tage netto',
        notes: 'Reaktionszeit max. 24h bei Notfällen',
        companyId: company.id,
      },
    }),
  ]);

  // Add contract renewal history
  await prisma.contractRenewal.create({
    data: {
      contractId: contracts[0].id,
      previousEndDate: new Date('2023-12-31'),
      newEndDate: new Date('2024-12-31'),
      previousValue: 1100,
      newValue: 1200,
      notes: 'Preisanpassung +9% gem. Teuerung',
    },
  });

  console.log('  ✓ 3 Verträge erstellt');

  // =====================================================
  // 49. RECRUITING: JOB POSTINGS
  // =====================================================
  console.log('📦 Erstelle Stellenausschreibungen...');

  const jobPostings = await Promise.all([
    prisma.jobPosting.create({
      data: {
        title: 'Metallbauer/in EFZ',
        description: 'Wir suchen per sofort oder nach Vereinbarung eine/n motivierte/n Metallbauer/in EFZ für unser Team in Zürich.',
        requirements: '- Abgeschlossene Lehre als Metallbauer/in EFZ\n- Erfahrung im Stahlbau von Vorteil\n- Führerschein Kat. B\n- Teamfähigkeit und Zuverlässigkeit',
        benefits: '- Moderner Arbeitsplatz\n- Weiterbildungsmöglichkeiten\n- 5 Wochen Ferien\n- Gute Sozialleistungen\n- Gratis Parkplatz',
        department: 'Produktion',
        location: 'Zürich',
        remoteAllowed: false,
        employmentType: 'FULL_TIME',
        status: 'PUBLISHED',
        salaryMin: 60000,
        salaryMax: 72000,
        workloadPercent: 100,
        startDate: daysFromNow(30),
        applicationDeadline: daysFromNow(21),
        publishedAt: daysAgo(7),
        contactPersonId: employees[1].id,
        requiredSkills: ['Schweissen', 'Metallbau', 'Technische Zeichnungen', 'Teamarbeit'],
        companyId: company.id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Lernende/r Metallbauer/in EFZ',
        description: 'Starte deine Karriere bei uns! Wir bieten eine fundierte 4-jährige Ausbildung zum/zur Metallbauer/in EFZ.',
        requirements: '- Sekundarschulabschluss\n- Interesse an handwerklicher Arbeit\n- Gutes technisches Verständnis\n- Motivation und Lernbereitschaft',
        benefits: '- Moderne Ausbildungswerkstatt\n- Erfahrene Berufsbildner\n- Überbetriebliche Kurse\n- Möglichkeit zur BMS',
        department: 'Produktion',
        location: 'Zürich',
        employmentType: 'APPRENTICESHIP',
        status: 'PUBLISHED',
        salaryMin: 800,
        salaryMax: 1400,
        workloadPercent: 100,
        startDate: new Date('2024-08-01'),
        applicationDeadline: daysFromNow(60),
        publishedAt: daysAgo(14),
        contactPersonId: employees[0].id,
        requiredSkills: ['Handwerkliches Geschick', 'Teamfähigkeit'],
        companyId: company.id,
      },
    }),
    prisma.jobPosting.create({
      data: {
        title: 'Monteur/in Aussendienst',
        description: 'Verstärken Sie unser Montageteam für Einsätze in der Region Zürich.',
        requirements: '- Erfahrung in der Montage von Metallkonstruktionen\n- Führerschein Kat. B\n- Höhentauglichkeit\n- Selbständige Arbeitsweise',
        benefits: '- Firmenwagen\n- Spesen nach SUVA\n- Flexible Arbeitszeiten',
        department: 'Montage',
        location: 'Region Zürich',
        employmentType: 'FULL_TIME',
        status: 'DRAFT',
        salaryMin: 58000,
        salaryMax: 68000,
        workloadPercent: 100,
        contactPersonId: employees[0].id,
        requiredSkills: ['Montage', 'Schweissen', 'Höhenarbeit'],
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 3 Stellenausschreibungen erstellt');

  // =====================================================
  // 50. RECRUITING: CANDIDATES & INTERVIEWS
  // =====================================================
  console.log('📦 Erstelle Kandidaten und Interviews...');

  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        firstName: 'Michael',
        lastName: 'Schneider',
        email: 'michael.schneider@email.ch',
        phone: '+41 79 234 56 78',
        street: 'Musterweg 12',
        zipCode: '8048',
        city: 'Zürich',
        country: 'CH',
        dateOfBirth: new Date('1992-05-15'),
        nationality: 'CH',
        jobPostingId: jobPostings[0].id,
        status: 'INTERVIEW',
        source: 'JOB_PORTAL',
        expectedSalary: 65000,
        availableFrom: daysFromNow(30),
        rating: 4,
        skills: ['Schweissen MIG/MAG', 'Metallbau', 'CAD Grundkenntnisse'],
        notes: 'Hat sehr guten Eindruck hinterlassen, 5 Jahre Erfahrung',
        companyId: company.id,
      },
    }),
    prisma.candidate.create({
      data: {
        firstName: 'Laura',
        lastName: 'Keller',
        email: 'laura.keller@email.ch',
        phone: '+41 78 345 67 89',
        city: 'Winterthur',
        country: 'CH',
        dateOfBirth: new Date('2008-09-22'),
        nationality: 'CH',
        jobPostingId: jobPostings[1].id,
        status: 'ASSESSMENT',
        source: 'WEBSITE',
        availableFrom: new Date('2024-08-01'),
        rating: 5,
        skills: ['Motiviert', 'Handwerklich begabt', 'Gute Schulnoten'],
        notes: 'Sehr motivierte Bewerberin, Schnuppertag am 15.03.',
        companyId: company.id,
      },
    }),
    prisma.candidate.create({
      data: {
        firstName: 'Stefan',
        lastName: 'Brunner',
        email: 'stefan.brunner@bluewin.ch',
        phone: '+41 76 456 78 90',
        city: 'Baden',
        nationality: 'CH',
        jobPostingId: jobPostings[0].id,
        status: 'REJECTED',
        source: 'LINKEDIN',
        expectedSalary: 80000,
        notes: 'Gehaltsvorstellung zu hoch, keine Schweisserfahrung',
        companyId: company.id,
      },
    }),
  ]);

  // Create interviews
  await Promise.all([
    prisma.interview.create({
      data: {
        candidateId: candidates[0].id,
        type: 'PHONE',
        status: 'COMPLETED',
        scheduledAt: daysAgo(5),
        durationMinutes: 30,
        feedback: 'Guter Ersteindruck, kommunikativ, fachlich versiert. Einladung zum Vorstellungsgespräch.',
        rating: 4,
        recommendHire: true,
        companyId: company.id,
        interviewers: { connect: [{ id: adminUser.id }] },
      },
    }),
    prisma.interview.create({
      data: {
        candidateId: candidates[0].id,
        type: 'ONSITE',
        status: 'SCHEDULED',
        scheduledAt: daysFromNow(3),
        durationMinutes: 90,
        location: 'Industriestrasse 42, Zürich',
        notes: 'Werkstattführung und praktische Probe',
        companyId: company.id,
        interviewers: { connect: [{ id: adminUser.id }, { id: managerUser.id }] },
      },
    }),
    prisma.interview.create({
      data: {
        candidateId: candidates[1].id,
        type: 'ONSITE',
        status: 'COMPLETED',
        scheduledAt: daysAgo(2),
        durationMinutes: 120,
        location: 'Industriestrasse 42, Zürich',
        feedback: 'Sehr positive Schnuppertage. Motiviert, lernwillig, gutes Auftreten. Elterngespräch erfolgt.',
        rating: 5,
        recommendHire: true,
        companyId: company.id,
        interviewers: { connect: [{ id: managerUser.id }] },
      },
    }),
  ]);

  console.log('  ✓ 3 Kandidaten und 3 Interviews erstellt');

  // =====================================================
  // 51. BANK IMPORT TRANSACTIONS
  // =====================================================
  console.log('📦 Erstelle Bank-Transaktionen...');

  const bankAccountsForTransactions = await prisma.bankAccount.findMany({ where: { companyId: company.id }, take: 1 });

  if (bankAccountsForTransactions.length > 0) {
    await Promise.all([
      prisma.bankTransaction.create({
        data: {
          bankAccountId: bankAccountsForTransactions[0].id,
          entryReference: 'CAMT054-001',
          type: 'CREDIT',
          amount: 4850.50,
          currency: 'CHF',
          bookingDate: daysAgo(3),
          valueDate: daysAgo(3),
          qrReference: '000000000000000012345678903',
          remittanceInfo: 'Zahlung RE-2024-001 Immobilien Zürich AG',
          debtorName: 'Immobilien Zürich AG',
          debtorIban: 'CH82 0900 0000 1234 5678 1',
          status: 'RECONCILED',
          matchedInvoiceId: invoices[0].id,
          companyId: company.id,
        },
      }),
      prisma.bankTransaction.create({
        data: {
          bankAccountId: bankAccountsForTransactions[0].id,
          entryReference: 'CAMT054-002',
          type: 'CREDIT',
          amount: 12500.00,
          currency: 'CHF',
          bookingDate: daysAgo(5),
          valueDate: daysAgo(5),
          qrReference: '000000000000000012345678904',
          remittanceInfo: 'Anzahlung Projekt Hotel Bellevue',
          debtorName: 'Hotel Bellevue AG',
          debtorIban: 'CH45 0023 0023 1234 5678 2',
          status: 'MATCHED',
          companyId: company.id,
        },
      }),
      prisma.bankTransaction.create({
        data: {
          bankAccountId: bankAccountsForTransactions[0].id,
          entryReference: 'CAMT054-003',
          type: 'DEBIT',
          amount: 3250.80,
          currency: 'CHF',
          bookingDate: daysAgo(2),
          valueDate: daysAgo(2),
          creditorName: 'Stahl AG Zürich',
          creditorIban: 'CH93 0076 2011 6238 5295 9',
          remittanceInfo: 'Zahlung BE-2024-001',
          status: 'RECONCILED',
          companyId: company.id,
        },
      }),
      prisma.bankTransaction.create({
        data: {
          bankAccountId: bankAccountsForTransactions[0].id,
          entryReference: 'CAMT054-004',
          type: 'CREDIT',
          amount: 868.29,
          currency: 'CHF',
          bookingDate: daysAgo(1),
          valueDate: daysAgo(1),
          remittanceInfo: 'Zahlung Online-Shop WEB-00001',
          debtorName: 'Thomas Weber',
          status: 'PENDING',
          companyId: company.id,
        },
      }),
    ]);
  }

  console.log('  ✓ 4 Bank-Transaktionen erstellt');

  // =====================================================
  // 52. DMS: FOLDERS
  // =====================================================
  console.log('📦 Erstelle DMS Ordner...');

  const folders = await Promise.all([
    prisma.folder.create({
      data: {
        name: 'Projekte',
        type: 'SYSTEM',
        description: 'Projektdokumentation',
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
    prisma.folder.create({
      data: {
        name: 'Kunden',
        type: 'SYSTEM',
        description: 'Kundendokumentation',
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
    prisma.folder.create({
      data: {
        name: 'Rechnungen 2024',
        type: 'INVOICE',
        description: 'Rechnungsarchiv 2024',
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
    prisma.folder.create({
      data: {
        name: 'Personal',
        type: 'EMPLOYEE',
        description: 'Personaldokumente',
        companyId: company.id,
        createdById: adminUser.id,
      },
    }),
  ]);

  // Create project subfolder
  const projectFolder = await prisma.folder.create({
    data: {
      name: 'Bürogebäude Zürich',
      type: 'PROJECT',
      description: 'Dokumente für Projekt Bürogebäude',
      parentId: folders[0].id,
      projectId: projects[0].id,
      companyId: company.id,
      createdById: adminUser.id,
    },
  });

  // Create customer subfolder
  const customerFolder = await prisma.folder.create({
    data: {
      name: 'Immobilien Zürich AG',
      type: 'CUSTOMER',
      parentId: folders[1].id,
      customerId: customers[0].id,
      companyId: company.id,
      createdById: adminUser.id,
    },
  });

  console.log('  ✓ 6 DMS Ordner erstellt');

  // =====================================================
  // 53. DMS: DOCUMENTS
  // =====================================================
  console.log('📦 Erstelle DMS Dokumente...');

  await Promise.all([
    prisma.dMSDocument.create({
      data: {
        name: 'Aufmassblatt_Geländer_EG.pdf',
        mimeType: 'application/pdf',
        fileSize: 245000,
        storagePath: '/projects/buerogebaeude/aufmass_eg.pdf',
        description: 'Aufmassblatt für Geländer Erdgeschoss',
        tags: ['Aufmass', 'Geländer', 'EG'],
        version: 2,
        status: 'ACTIVE',
        folderId: projectFolder.id,
        projectId: projects[0].id,
        companyId: company.id,
        uploadedById: adminUser.id,
      },
    }),
    prisma.dMSDocument.create({
      data: {
        name: 'Vertrag_Rahmenauftrag_2024.pdf',
        mimeType: 'application/pdf',
        fileSize: 156000,
        storagePath: '/customers/immo-zh/vertrag_2024.pdf',
        description: 'Rahmenvertrag 2024-2026',
        tags: ['Vertrag', 'Rahmenauftrag'],
        status: 'ACTIVE',
        folderId: customerFolder.id,
        customerId: customers[0].id,
        companyId: company.id,
        uploadedById: managerUser.id,
      },
    }),
    prisma.dMSDocument.create({
      data: {
        name: 'RE-2024-001.pdf',
        mimeType: 'application/pdf',
        fileSize: 89000,
        storagePath: '/invoices/2024/re-2024-001.pdf',
        description: 'Rechnung AN-2024-001',
        tags: ['Rechnung', '2024'],
        status: 'ACTIVE',
        folderId: folders[2].id,
        invoiceId: invoices[0].id,
        companyId: company.id,
        uploadedById: adminUser.id,
      },
    }),
    prisma.dMSDocument.create({
      data: {
        name: 'Arbeitsvertrag_Müller_Thomas.pdf',
        mimeType: 'application/pdf',
        fileSize: 234000,
        storagePath: '/employees/ma-0001/arbeitsvertrag.pdf',
        tags: ['Arbeitsvertrag', 'Personal'],
        status: 'ACTIVE',
        folderId: folders[3].id,
        employeeId: employees[0].id,
        companyId: company.id,
        uploadedById: adminUser.id,
      },
    }),
  ]);

  console.log('  ✓ 4 DMS Dokumente erstellt');

  // =====================================================
  // 54. AUDIT LOG
  // =====================================================
  console.log('📦 Erstelle Audit-Log Einträge...');

  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'LOGIN',
        module: 'AUTH',
        description: 'Benutzer angemeldet',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        retentionUntil: tenYearsFromNow,
        companyId: company.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'CREATE',
        module: 'INVOICES',
        entityId: invoices[0].id,
        entityType: 'Invoice',
        entityName: 'RE-2024-001',
        description: 'Rechnung erstellt',
        newValues: { number: 'RE-2024-001', total: 4850.50 },
        retentionUntil: tenYearsFromNow,
        companyId: company.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'SEND',
        module: 'INVOICES',
        entityId: invoices[0].id,
        entityType: 'Invoice',
        entityName: 'RE-2024-001',
        description: 'Rechnung per E-Mail versendet',
        metadata: { recipient: 'h.mueller@immo-zh.ch', method: 'email' },
        retentionUntil: tenYearsFromNow,
        companyId: company.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: managerUser.id,
        action: 'UPDATE',
        module: 'PROJECTS',
        entityId: projects[0].id,
        entityType: 'Project',
        entityName: 'Bürogebäude Zürich - Geländer',
        description: 'Projekt-Status geändert',
        oldValues: { status: 'PLANNING' },
        newValues: { status: 'ACTIVE' },
        retentionUntil: tenYearsFromNow,
        companyId: company.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'APPROVE',
        module: 'EMPLOYEES',
        entityId: employees[3].id,
        entityType: 'Absence',
        description: 'Ferienantrag genehmigt',
        metadata: { absenceType: 'VACATION', days: 5 },
        retentionUntil: tenYearsFromNow,
        companyId: company.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'EXPORT',
        module: 'FINANCE',
        description: 'Kontoauszug exportiert (CSV)',
        metadata: { period: '2024-Q1', accounts: ['1000', '1020', '1100'] },
        retentionUntil: tenYearsFromNow,
        companyId: company.id,
      },
    }),
  ]);

  console.log('  ✓ 6 Audit-Log Einträge erstellt');

  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('\n========================================');
  console.log('✅ Seed erfolgreich abgeschlossen!');
  console.log('========================================\n');
  console.log('📊 Erstellte Datensätze:');
  console.log('   - 1 Firma, 2 Benutzer');
  console.log('   - 4 Abteilungen, 7 Mitarbeiter');
  console.log('   - 5 Kunden, 4 Kontakte, 4 Lieferanten');
  console.log('   - 11 Produkte in 5 Kategorien');
  console.log('   - 5 Projekte, 8 Aufgaben');
  console.log('   - 3 Angebote, 3 Aufträge, 2 Lieferscheine');
  console.log('   - 3 Rechnungen, 2 Mahnungen, 1 Gutschrift');
  console.log('   - 3 Bestellungen, 2 Wareneingänge, 3 Eingangsrechnungen');
  console.log('   - 3 Zahlungen, 2 Bankkonten');
  console.log('   - 26 Konten, 2 Buchungen');
  console.log('   - 15 Lohnabrechnungen, 4 Abwesenheiten');
  console.log('   - GAV-Einstellungen, 6 GAV-Daten, 2 QST-Daten');
  console.log('   - 4 Kostenstellen, 2 Budgets, 4 Anlagen');
  console.log('   - 2 MWST-Abrechnungen');
  console.log('   - 2 Stücklisten, 2 Werkstattaufträge, 1 Kalkulation');
  console.log('   - 1 QS-Checkliste, 1 Prüfung, 2 Service-Tickets');
  console.log('   - 3 Leads, 3 Lead-Aktivitäten, 1 Kampagne');
  console.log('   - 2 E-Mail Kampagnen, 4 Kalendereinträge');
  console.log('   - 3 Rabattcodes, 3 Shop-Bestellungen, 4 Bewertungen');
  console.log('   - 3 Verträge, 3 Stellenausschreibungen');
  console.log('   - 3 Kandidaten, 3 Interviews');
  console.log('   - 4 Bank-Transaktionen, 6 DMS-Ordner, 4 DMS-Dokumente');
  console.log('   - 6 Audit-Log Einträge');
  console.log('   - 1 Swissdec-Meldung, 1 Schulung');
  console.log('\n────────────────────────────────────');
  console.log('🔐 Admin Login: admin@loomora.ch');
  console.log('🔐 Passwort: admin123');
  console.log('────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed fehlgeschlagen:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
