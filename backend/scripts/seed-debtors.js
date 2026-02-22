/**
 * Seed test debtors - run with: node scripts/seed-debtors.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found.');
    process.exit(1);
  }
  const user = await prisma.user.findFirst({ where: { companyId: company.id } });
  if (!user) {
    console.error('No user found.');
    process.exit(1);
  }
  const existing = await prisma.customer.findFirst({
    where: { companyId: company.id, companyName: 'Test Debitor AG' },
  });
  if (existing) {
    console.log('Test debtor already exists. Visit /debtors to see the list.');
    return;
  }
  const lastC = await prisma.customer.findFirst({
    where: { companyId: company.id },
    orderBy: { number: 'desc' },
  });
  const num = lastC ? parseInt(String(lastC.number).replace(/\D/g, ''), 10) + 1 : 1;
  const customer = await prisma.customer.create({
    data: {
      number: 'KD-' + String(num).padStart(4, '0'),
      name: 'Test Debitor AG',
      companyName: 'Test Debitor AG',
      email: 'test@debitor.ch',
      companyId: company.id,
      paymentTermDays: 30,
    },
  });
  const invNum = 'RE-TEST-' + Date.now().toString(36).toUpperCase();
  const invoice = await prisma.invoice.create({
    data: {
      number: invNum,
      customerId: customer.id,
      companyId: company.id,
      createdById: user.id,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 86400000),
      status: 'SENT',
      subtotal: 5000,
      vatAmount: 405,
      totalAmount: 5405,
      paidAmount: 0,
      vatRate: 8.1,
    },
  });
  await prisma.invoiceItem.create({
    data: {
      invoiceId: invoice.id,
      position: 1,
      description: 'Testleistung für Debitor-Anzeige',
      quantity: 1,
      unit: 'Stück',
      unitPrice: 5000,
      vatRate: 8.1,
      vatAmount: 405,
      total: 5405,
    },
  });
  console.log('✓ Test debtor created:', customer.companyName);
  console.log('  Visit https://app.loomora.ch/debtors to see the list.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
