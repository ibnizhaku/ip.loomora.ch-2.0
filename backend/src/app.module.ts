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
import { DeliveryNotesModule } from './modules/delivery-notes/delivery-notes.module';
import { CreditNotesModule } from './modules/credit-notes/credit-notes.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { PurchaseInvoicesModule } from './modules/purchase-invoices/purchase-invoices.module';
import { GoodsReceiptsModule } from './modules/goods-receipts/goods-receipts.module';
import { BomModule } from './modules/bom/bom.module';
import { ProductionOrdersModule } from './modules/production-orders/production-orders.module';
import { CalculationsModule } from './modules/calculations/calculations.module';
import { QualityControlModule } from './modules/quality-control/quality-control.module';
import { ServiceTicketsModule } from './modules/service-tickets/service-tickets.module';
// Extended Accounting
import { JournalEntriesModule } from './modules/journal-entries/journal-entries.module';
import { CostCentersModule } from './modules/cost-centers/cost-centers.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CashBookModule } from './modules/cash-book/cash-book.module';
import { VatReturnsModule } from './modules/vat-returns/vat-returns.module';
import { FixedAssetsModule } from './modules/fixed-assets/fixed-assets.module';

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
    DeliveryNotesModule,
    CreditNotesModule,
    RemindersModule,
    PaymentsModule,
    PurchaseOrdersModule,
    PurchaseInvoicesModule,
    GoodsReceiptsModule,
    // Production & Service
    BomModule,
    ProductionOrdersModule,
    CalculationsModule,
    QualityControlModule,
    ServiceTicketsModule,
    // Extended Accounting
    JournalEntriesModule,
    CostCentersModule,
    BudgetsModule,
    CashBookModule,
    VatReturnsModule,
    FixedAssetsModule,
  ],
})
export class AppModule {}
