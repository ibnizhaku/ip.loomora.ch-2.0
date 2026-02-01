import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company' },
    update: {},
    create: {
      id: 'demo-company',
      name: 'Loomora Metallbau AG',
      legalName: 'Loomora Metallbau AG',
      street: 'Industriestrasse 15',
      zipCode: '8005',
      city: 'Zürich',
      country: 'CH',
      phone: '+41 44 123 45 67',
      email: 'info@loomora.ch',
      website: 'https://loomora.ch',
      vatNumber: 'CHE-123.456.789',
      iban: 'CH93 0076 2011 6238 5295 7',
      bic: 'POFICHBEXXX',
      bankName: 'PostFinance AG',
      settings: {
        currency: 'CHF',
        locale: 'de-CH',
        vatRates: {
          standard: 8.1,
          reduced: 2.6,
          special: 3.8,
        },
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

  console.log('✅ Company created:', company.name);

  // Create admin user
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

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample customers
  const customers = [
    {
      number: 'KD-0001',
      name: 'Hans Müller',
      companyName: 'Müller Bau GmbH',
      street: 'Bahnhofstrasse 10',
      zipCode: '8001',
      city: 'Zürich',
      email: 'h.mueller@mueller-bau.ch',
      phone: '+41 44 222 33 44',
      paymentTermDays: 30,
    },
    {
      number: 'KD-0002',
      name: 'Anna Schmidt',
      companyName: 'Schmidt Architekten',
      street: 'Seestrasse 25',
      zipCode: '8002',
      city: 'Zürich',
      email: 'a.schmidt@schmidt-arch.ch',
      phone: '+41 44 333 44 55',
      paymentTermDays: 30,
    },
    {
      number: 'KD-0003',
      name: 'Peter Meier',
      companyName: 'Meier Immobilien AG',
      street: 'Talstrasse 100',
      zipCode: '8008',
      city: 'Zürich',
      email: 'p.meier@meier-immo.ch',
      phone: '+41 44 444 55 66',
      paymentTermDays: 14,
    },
  ];

  for (const customerData of customers) {
    await prisma.customer.upsert({
      where: { 
        companyId_number: { 
          companyId: company.id, 
          number: customerData.number 
        } 
      },
      update: {},
      create: {
        ...customerData,
        companyId: company.id,
      },
    });
  }

  console.log('✅ Sample customers created');

  // Create product categories
  const categories = [
    { name: 'Stahl', description: 'Stahlprodukte und Profile' },
    { name: 'Aluminium', description: 'Aluminiumprodukte' },
    { name: 'Beschläge', description: 'Beschläge und Kleinteile' },
    { name: 'Dienstleistungen', description: 'Arbeitsleistungen' },
  ];

  for (const catData of categories) {
    await prisma.productCategory.upsert({
      where: { id: `cat-${catData.name.toLowerCase()}` },
      update: {},
      create: {
        id: `cat-${catData.name.toLowerCase()}`,
        ...catData,
        companyId: company.id,
      },
    });
  }

  console.log('✅ Product categories created');

  // Create sample products
  const products = [
    {
      sku: 'ART-0001',
      name: 'Stahlträger HEB 200',
      description: 'Breitflanschträger HEB 200, S235JR',
      unit: 'lfm',
      purchasePrice: 45.00,
      salePrice: 68.50,
      vatRate: 'STANDARD' as const,
      stockQuantity: 250,
      minStock: 50,
    },
    {
      sku: 'ART-0002',
      name: 'Stahlrohr 60x60x3',
      description: 'Quadratrohr 60x60x3mm, S235JR',
      unit: 'lfm',
      purchasePrice: 12.50,
      salePrice: 19.80,
      vatRate: 'STANDARD' as const,
      stockQuantity: 500,
      minStock: 100,
    },
    {
      sku: 'ART-0003',
      name: 'Edelstahlblech 2mm',
      description: 'Edelstahlblech 1.4301, 2000x1000x2mm',
      unit: 'Stk',
      purchasePrice: 180.00,
      salePrice: 265.00,
      vatRate: 'STANDARD' as const,
      stockQuantity: 25,
      minStock: 10,
    },
    {
      sku: 'ART-0004',
      name: 'Schlosserschraube M10x30',
      description: 'DIN 603, verzinkt, 100er Pack',
      unit: 'Pkg',
      purchasePrice: 8.50,
      salePrice: 14.90,
      vatRate: 'STANDARD' as const,
      stockQuantity: 150,
      minStock: 30,
    },
    {
      sku: 'SRV-0001',
      name: 'Montagearbeit',
      description: 'Montagearbeit pro Stunde, inkl. Werkzeug',
      unit: 'h',
      purchasePrice: 0,
      salePrice: 95.00,
      vatRate: 'STANDARD' as const,
      stockQuantity: 0,
      isService: true,
    },
    {
      sku: 'SRV-0002',
      name: 'Schweissarbeit',
      description: 'Schweissarbeit pro Stunde, WIG/MIG/MAG',
      unit: 'h',
      purchasePrice: 0,
      salePrice: 115.00,
      vatRate: 'STANDARD' as const,
      stockQuantity: 0,
      isService: true,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { 
        companyId_sku: { 
          companyId: company.id, 
          sku: productData.sku 
        } 
      },
      update: {},
      create: {
        ...productData,
        companyId: company.id,
      },
    });
  }

  console.log('✅ Sample products created');

  // Create chart of accounts (KMU Kontenrahmen)
  const accounts = [
    // Aktiven
    { number: '1000', name: 'Kasse', type: 'ASSET' },
    { number: '1020', name: 'Postfinance', type: 'ASSET' },
    { number: '1100', name: 'Debitoren', type: 'ASSET' },
    { number: '1200', name: 'Warenvorräte', type: 'ASSET' },
    { number: '1500', name: 'Maschinen und Geräte', type: 'ASSET' },
    { number: '1510', name: 'Fahrzeuge', type: 'ASSET' },
    // Passiven
    { number: '2000', name: 'Kreditoren', type: 'LIABILITY' },
    { number: '2100', name: 'Bankverbindlichkeiten', type: 'LIABILITY' },
    { number: '2200', name: 'MWST Schuld', type: 'LIABILITY' },
    { number: '2800', name: 'Eigenkapital', type: 'EQUITY' },
    // Aufwand
    { number: '4000', name: 'Materialaufwand', type: 'EXPENSE' },
    { number: '4200', name: 'Handelswarenaufwand', type: 'EXPENSE' },
    { number: '5000', name: 'Lohnaufwand', type: 'EXPENSE' },
    { number: '6000', name: 'Raumaufwand', type: 'EXPENSE' },
    { number: '6500', name: 'Verwaltungsaufwand', type: 'EXPENSE' },
    // Ertrag
    { number: '3000', name: 'Produktionsertrag', type: 'REVENUE' },
    { number: '3200', name: 'Handelsertrag', type: 'REVENUE' },
    { number: '3400', name: 'Dienstleistungsertrag', type: 'REVENUE' },
  ];

  for (const accountData of accounts) {
    await prisma.chartOfAccount.upsert({
      where: { 
        companyId_number: { 
          companyId: company.id, 
          number: accountData.number 
        } 
      },
      update: {},
      create: {
        ...accountData,
        companyId: company.id,
      },
    });
  }

  console.log('✅ Chart of accounts created');

  // Create bank account
  await prisma.bankAccount.upsert({
    where: { id: 'bank-postfinance' },
    update: {},
    create: {
      id: 'bank-postfinance',
      name: 'PostFinance Geschäftskonto',
      iban: 'CH93 0076 2011 6238 5295 7',
      bic: 'POFICHBEXXX',
      bankName: 'PostFinance AG',
      currency: 'CHF',
      balance: 125000.00,
      isDefault: true,
      qrIban: 'CH93 0076 2011 6238 5295 7',
      companyId: company.id,
    },
  });

  console.log('✅ Bank account created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Email: admin@loomora.ch');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
