import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
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
import { DepartmentsModule } from './modules/departments/departments.module';
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
import { CostCentersModule } from './modules/cost-centers/cost-centers.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CashBookModule } from './modules/cash-book/cash-book.module';
import { VatReturnsModule } from './modules/vat-returns/vat-returns.module';
import { FixedAssetsModule } from './modules/fixed-assets/fixed-assets.module';
// HR Extensions
import { SwissdecModule } from './modules/swissdec/swissdec.module';
import { GavMetallbauModule } from './modules/gav-metallbau/gav-metallbau.module';
// import { WithholdingTaxModule } from './modules/withholding-tax/withholding-tax.module'; // Disabled: Decimal type issues
// Reporting
import { ReportsModule } from './modules/reports/reports.module';
// Marketing & Sales
import { MarketingModule } from './modules/marketing/marketing.module';
// E-Commerce
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';
// Contracts
import { ContractsModule } from './modules/contracts/contracts.module';
// Recruiting
import { RecruitingModule } from './modules/recruiting/recruiting.module';
// Training
// import { TrainingModule } from './modules/training/training.module'; // Disabled: department type issues
// Bank Import (camt.054)
import { BankImportModule } from './modules/bank-import/bank-import.module';
// Documents (DMS)
import { DocumentsModule } from './modules/documents/documents.module';
// Chat Messages
import { MessagesModule } from './modules/messages/messages.module';
// Audit Log
import { AuditLogModule } from './modules/audit-log/audit-log.module';
// Subscriptions & Payments
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per minute
    }]),
    PrismaModule,
    CommonModule,
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
    DepartmentsModule,
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
    CostCentersModule,
    BudgetsModule,
    CashBookModule,
    VatReturnsModule,
    FixedAssetsModule,
    // HR Extensions
    SwissdecModule,
    GavMetallbauModule,
    // WithholdingTaxModule,
    // Reporting
    ReportsModule,
    // Marketing & Sales
    MarketingModule,
    // E-Commerce
    EcommerceModule,
    // Contracts
    ContractsModule,
    // Recruiting
    RecruitingModule,
    // Training
    // TrainingModule,
    // Bank Import (camt.054)
    BankImportModule,
    // Documents (DMS)
    DocumentsModule,
    // Chat Messages
    MessagesModule,
    // Audit Log (Global)
    AuditLogModule,
    // Subscriptions & Payments
    SubscriptionsModule,
  ],
})
export class AppModule {}
