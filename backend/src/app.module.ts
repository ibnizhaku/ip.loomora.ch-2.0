import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompanyModule } from './modules/company/company.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ProductsModule } from './modules/products/products.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TimeEntriesModule } from './modules/time-entries/time-entries.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AbsencesModule } from './modules/absences/absences.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { FinanceModule } from './modules/finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompanyModule,
    CustomersModule,
    SuppliersModule,
    ProductsModule,
    ProjectsModule,
    TasksModule,
    TimeEntriesModule,
    CalendarModule,
    EmployeesModule,
    AbsencesModule,
    DashboardModule,
    HealthModule,
    QuotesModule,
    OrdersModule,
    InvoicesModule,
    FinanceModule,
  ],
})
export class AppModule {}
