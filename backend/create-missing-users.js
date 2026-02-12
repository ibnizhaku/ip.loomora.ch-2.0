require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createMissingUsers() {
  const employeesWithoutUser = await prisma.employee.findMany({
    where: { user: null },
    select: { id: true, firstName: true, lastName: true, email: true, companyId: true },
  });

  console.log(`Gefunden: ${employeesWithoutUser.length} Employees ohne User-Account`);

  for (const emp of employeesWithoutUser) {
    const email = emp.email || `${emp.firstName.toLowerCase()}.${emp.lastName.toLowerCase()}@loomora.ch`;
    const password = 'Employee123!';
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: 'EMPLOYEE',
          isActive: true,
          status: 'ACTIVE',
          employeeId: emp.id,
          companyId: emp.companyId,
        },
      });
      console.log(`✓ User erstellt für ${emp.firstName} ${emp.lastName} (${email})`);
    } catch (error) {
      console.log(`✗ Fehler bei ${emp.firstName} ${emp.lastName}: ${error.message}`);
    }
  }

  await prisma.$disconnect();
  console.log('Fertig.');
}

createMissingUsers();
