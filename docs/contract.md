# Loomora ERP – Frontend API Contract (vollständig)

> Extrahiert aus allen 60 Hook-Dateien in `src/hooks/` + `src/lib/api.ts`
> **Stand**: 2026-02-20 — **NICHT MANUELL BEARBEITEN**, generiert aus Code-Analyse

## Globale Konventionen

| Eigenschaft | Wert |
|---|---|
| Base URL | `/api` (relativ, Proxy via `vite.config.ts` → `https://app.loomora.ch`) |
| Auth | `Authorization: Bearer <JWT>` |
| Content-Type | `application/json` (ausser Upload: `multipart/form-data`) |
| Token Storage | `localStorage`: `auth_token`, `refresh_token`, `auth_user` |
| Error Format | `{ error: string, message?: string, statusCode?: number }` |
| Pagination | `{ data: T[], total: number, page: number, pageSize: number, totalPages?: number }` |

---

## 1. AUTH (`src/lib/api.ts`)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user: AuthUser }` |
| POST | `/auth/register` | `{ email, password, firstName, lastName, companyName }` | `AuthResponse` |
| POST | `/auth/logout` | — | — |
| POST | `/auth/refresh` | `{ refreshToken }` | `AuthResponse` |
| POST | `/auth/2fa/setup` | — | `{ secret, qrCode, manualEntry }` |
| POST | `/auth/2fa/verify` | `{ code }` | `{ success, recoveryCodes[], message }` |
| POST | `/auth/2fa/authenticate` | `{ tempToken, code }` | `AuthenticateResponse` |
| POST | `/auth/2fa/disable` | `{ code }` | — |
| POST | `/auth/2fa/admin-reset/:userId` | — | — |
| GET | `/auth/2fa/status` | — | `{ enabled, recoveryCodesRemaining }` |

**AuthUser**: `{ id, email, firstName, lastName, role, companyId, companyName }`

---

## 2. DASHBOARD (`use-dashboard.ts`)

| Method | Endpoint | Response Fields |
|---|---|---|
| GET | `/dashboard/stats` | `{ totalRevenue, openInvoices, activeProjects, customerCount, employeeCount, revenueChange, utilizationRate }` |
| GET | `/dashboard/activity` | `{ invoices[], projects[], tasks[] }` |

---

## 3. CUSTOMERS (`use-customers.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/customers` | `?page,pageSize,search,sortBy,sortOrder` | `PaginatedResponse<Customer>` |
| GET | `/customers/:id` | — | `Customer` |
| POST | `/customers` | `CustomerCreateInput` | `Customer` |
| PUT | `/customers/:id` | `CustomerUpdateInput` | `Customer` |
| DELETE | `/customers/:id` | — | void |
| GET | `/customers/stats` | — | `{ total, active, prospects, totalRevenue }` |
| GET | `/customers/:id/contacts` | — | `CustomerContact[]` |
| POST | `/customers/:id/contacts` | `Partial<CustomerContact>` | `CustomerContact` |
| PUT | `/customers/:id/contacts/:contactId` | `Partial<CustomerContact>` | `CustomerContact` |
| DELETE | `/customers/:id/contacts/:contactId` | — | void |

---

## 4. SUPPLIERS (`use-suppliers.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/suppliers` | `?page,pageSize,search,sortBy,sortOrder` | `PaginatedResponse<Supplier>` |
| GET | `/suppliers/:id` | — | `Supplier` |
| POST | `/suppliers` | `SupplierCreateInput` | `Supplier` |
| PUT | `/suppliers/:id` | `SupplierUpdateInput` | `Supplier` |
| DELETE | `/suppliers/:id` | — | void |
| GET | `/suppliers/stats` | — | `{ total, active, newSuppliers, totalValue, avgRating }` |

---

## 5. PRODUCTS (`use-products.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/products` | `?page,pageSize,search,sortBy,sortOrder,categoryId,isService` | `PaginatedResponse<Product>` |
| GET | `/products/:id` | — | `Product` |
| GET | `/products/categories` | — | `ProductCategory[]` |
| POST | `/products` | `ProductCreateInput` | `Product` |
| PUT | `/products/:id` | `ProductUpdateInput` | `Product` |
| DELETE | `/products/:id` | — | void |
| POST | `/products/:id/adjust-stock` | `{ quantity, type: IN|OUT|ADJUSTMENT, reason? }` | — |
| POST | `/products/categories` | `{ name, description? }` | `ProductCategory` |
| GET | `/products/stats` | — | `{ total, active, inactive, services, lowStock }` |

---

## 6. PROJECTS (`use-projects.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/projects` | `?page,pageSize,search,status,priority,customerId,managerId,sortBy,sortOrder` | `PaginatedResponse<Project>` |
| GET | `/projects/:id` | — | `Project` |
| GET | `/projects/stats` | — | `{ total, active, completed, paused }` |
| POST | `/projects` | `Partial<Project>` | `Project` |
| PUT | `/projects/:id` | `Partial<Project>` | `Project` |
| DELETE | `/projects/:id` | — | void |
| POST | `/projects/:id/duplicate` | — | `Project` |
| POST | `/projects/:id/members` | `{ employeeId, role? }` | — |
| DELETE | `/projects/:id/members/:memberId` | — | void |
| POST | `/projects/:id/milestones` | `{ title, dueDate? }` | `ProjectMilestone` |
| PUT | `/projects/:id/milestones/:milestoneId` | `{ title?, dueDate?, completed? }` | `ProjectMilestone` |
| DELETE | `/projects/:id/milestones/:milestoneId` | — | void |
| GET | `/projects/:id/activity` | — | `ProjectActivity[]` |

---

## 7. TASKS (`use-tasks.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/tasks` | `?page,pageSize,search,status,priority,projectId,assigneeId` | `PaginatedResponse<Task>` |
| GET | `/tasks/:id` | — | `Task` |
| GET | `/tasks/stats` | — | `{ total, todo, inProgress, done, overdue }` |
| POST | `/tasks` | `Partial<Task>` | `Task` |
| PUT | `/tasks/:id` | `Partial<Task>` | `Task` |
| DELETE | `/tasks/:id` | — | void |

---

## 8. EMPLOYEES (`use-employees.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/employees` | `?page,pageSize,search,department,status` | `PaginatedResponse<Employee>` |
| GET | `/employees/:id` | — | `Employee` |
| GET | `/employees/stats` | — | `{ totalEmployees, activeEmployees, newThisMonth, departmentBreakdown[] }` |
| GET | `/employees/departments` | — | `string[]` |
| POST | `/employees` | `Partial<Employee>` | `Employee` |
| PUT | `/employees/:id` | `Partial<Employee>` | `Employee` |
| DELETE | `/employees/:id` | — | void |

---

## 9. DEPARTMENTS (`use-departments.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/departments` | `PaginatedResponse<Department>` |
| GET | `/departments/:id` | `Department` |
| POST | `/departments` | `Department` |
| PUT | `/departments/:id` | `Department` |
| DELETE | `/departments/:id` | void |

---

## 10. TIME ENTRIES (`use-time-entries.ts`)

| Method | Endpoint | Params/Body | Response |
|---|---|---|---|
| GET | `/time-entries` | `?page,pageSize,startDate,endDate,projectId,taskId,billable,approvalStatus` | `PaginatedResponse<TimeEntry>` |
| GET | `/time-entries/all` | `?page,pageSize,startDate,endDate,projectId,approvalStatus,employeeId` | `PaginatedResponse<TimeEntry>` |
| GET | `/time-entries/stats` | — | `TimeEntryStats` |
| GET | `/time-entries/approval-stats` | — | `{ pending, approved, rejected }` |
| POST | `/time-entries` | `Partial<TimeEntry>` | `TimeEntry` |
| PUT | `/time-entries/:id` | `Partial<TimeEntry>` | `TimeEntry` |
| DELETE | `/time-entries/:id` | — | void |
| POST | `/time-entries/approve` | `{ ids[], status, reason? }` | — |

---

## 11. ABSENCES (`use-absences.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/absences` | `PaginatedResponse<Absence>` |
| GET | `/absences/:id` | `Absence` |
| POST | `/absences` | `Absence` |
| PUT | `/absences/:id` | `Absence` |
| DELETE | `/absences/:id` | void |

---

## 12. CALENDAR (`use-calendar.ts`)

| Method | Endpoint | Params | Response |
|---|---|---|---|
| GET | `/calendar` | `?startDate,endDate,type,projectId,employeeId` | `PaginatedResponse<CalendarEvent>` (data+total) |
| GET | `/calendar/:id` | — | `CalendarEvent` |
| POST | `/calendar` | `Partial<CalendarEvent>` | `CalendarEvent` |
| PUT | `/calendar/:id` | `Partial<CalendarEvent>` | `CalendarEvent` |
| DELETE | `/calendar/:id` | — | void |

---

## 13. QUOTES (`use-sales.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/quotes` | `PaginatedResponse<Quote>` |
| GET | `/quotes/:id` | `Quote` |
| POST | `/quotes` | `Quote` |
| PUT | `/quotes/:id` | `Quote` |
| DELETE | `/quotes/:id` | void |
| POST | `/quotes/:id/convert-to-order` | `Order` |
| POST | `/quotes/:id/send` | `Quote` |
| GET | `/quotes/stats` | `{ total, draft, sent, confirmed, rejected }` |

---

## 14. ORDERS (`use-sales.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/orders` | `PaginatedResponse<Order>` |
| GET | `/orders/:id` | `Order` |
| POST | `/orders` | `Order` |
| **PATCH** | `/orders/:id` | `Order` |
| DELETE | `/orders/:id` | void |
| POST | `/orders/:id/create-invoice` | `Invoice` |
| POST | `/orders/:id/create-delivery-note` | — |
| GET | `/orders/stats` | `{ total, draft, sent, confirmed, cancelled, totalValue }` |

---

## 15. INVOICES (`use-sales.ts` + `use-invoices.ts`)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/invoices` | `?page,pageSize,search,sortBy,sortOrder,status,customerId,overdue` | `PaginatedResponse<Invoice>` |
| GET | `/invoices/:id` | — | `Invoice` |
| GET | `/invoices/open-items` | — | `Invoice[]` |
| POST | `/invoices` | `InvoiceCreateInput` | `Invoice` |
| PUT | `/invoices/:id` | `InvoiceUpdateInput` | `Invoice` |
| DELETE | `/invoices/:id` | — | void |
| POST | `/invoices/:id/payment` | `{ amount, paymentDate?, reference? }` | `Invoice` |
| POST | `/invoices/:id/send` | — | `Invoice` |
| POST | `/invoices/:id/cancel` | — | `Invoice` |
| GET | `/invoices/stats` | — | `{ total, paid, pending, overdue }` |

---

## 16. DELIVERY NOTES (`use-delivery-notes.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/delivery-notes` | `PaginatedResponse<DeliveryNote>` |
| GET | `/delivery-notes/:id` | `DeliveryNote` |
| POST | `/delivery-notes` | `DeliveryNote` |
| POST | `/delivery-notes/from-order/:orderId` | `DeliveryNote` |
| PUT | `/delivery-notes/:id` | `DeliveryNote` |
| DELETE | `/delivery-notes/:id` | void |
| GET | `/delivery-notes/stats` | `{ total, draft, shipped, delivered }` |

---

## 17. CREDIT NOTES (`use-credit-notes.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/credit-notes` | `PaginatedResponse<CreditNote>` |
| GET | `/credit-notes/:id` | `CreditNote` |
| POST | `/credit-notes` | `CreditNote` |
| POST | `/credit-notes/from-invoice/:invoiceId?reason=...` | `CreditNote` |
| PUT | `/credit-notes/:id` | `CreditNote` |
| DELETE | `/credit-notes/:id` | void |

---

## 18. REMINDERS (`use-reminders.ts`)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/reminders` | `?page,pageSize,status,level,customerId,search` | `PaginatedResponse<Reminder>` |
| GET | `/reminders/:id` | — | `Reminder` |
| GET | `/reminders/statistics` | — | `ReminderStatistics` |
| GET | `/reminders/overdue-invoices` | — | — |
| POST | `/reminders` | `{ invoiceId, level?, fee?, dueDate?, notes? }` | `Reminder` |
| POST | `/reminders/batch` | `{ invoiceIds[], level?, fee? }` | `Reminder[]` |
| PUT | `/reminders/:id` | `Partial<Reminder>` | `Reminder` |
| POST | `/reminders/:id/send` | `{ method, recipientEmail? }` | — |
| DELETE | `/reminders/:id` | — | void |

---

## 19. PAYMENTS (`use-payments.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/payments` | `PaginatedResponse<Payment>` |
| GET | `/payments/:id` | `Payment` |
| GET | `/payments/statistics` | `PaymentStatistics` |
| GET | `/payments/match-qr/:qrReference` | — |
| POST | `/payments` | `Payment` |
| PUT | `/payments/:id` | `Payment` |
| POST | `/payments/:id/reconcile` | — |
| DELETE | `/payments/:id` | void |

---

## 20. PURCHASE ORDERS (`use-purchase-orders.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/purchase-orders` | `PaginatedResponse<PurchaseOrder>` |
| GET | `/purchase-orders/:id` | `PurchaseOrder` |
| GET | `/purchase-orders/statistics` | `PurchaseOrderStatistics` |
| POST | `/purchase-orders` | `PurchaseOrder` |
| PUT | `/purchase-orders/:id` | `PurchaseOrder` |
| POST | `/purchase-orders/:id/send` | `PurchaseOrder` |
| DELETE | `/purchase-orders/:id` | void |

---

## 21. PURCHASE INVOICES (`use-purchase-invoices.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/purchase-invoices` | `PaginatedResponse<PurchaseInvoice>` |
| GET | `/purchase-invoices/:id` | `PurchaseInvoice` |
| GET | `/purchase-invoices/statistics` | `PurchaseInvoiceStatistics` |
| POST | `/purchase-invoices` | `PurchaseInvoice` |
| POST | `/purchase-invoices/from-purchase-order/:poId?externalNumber=...` | `PurchaseInvoice` |
| POST | `/purchase-invoices/extract-ocr` | `OcrExtractedData` |
| PUT | `/purchase-invoices/:id` | `PurchaseInvoice` |
| POST | `/purchase-invoices/:id/approve` | `PurchaseInvoice` |
| DELETE | `/purchase-invoices/:id` | void |

---

## 22. GOODS RECEIPTS (`use-goods-receipts.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/goods-receipts` | `PaginatedResponse<GoodsReceipt>` |
| GET | `/goods-receipts/:id` | `GoodsReceipt` |
| GET | `/goods-receipts/statistics` | — |
| GET | `/goods-receipts/pending` | — |
| POST | `/goods-receipts` | `GoodsReceipt` |
| PUT | `/goods-receipts/:id` | `GoodsReceipt` |
| POST | `/goods-receipts/:id/quality-check` | — |
| DELETE | `/goods-receipts/:id` | void |

---

## 23. BOM (`use-bom.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/bom` | `PaginatedResponse<Bom>` |
| GET | `/bom/:id` | `Bom` |
| GET | `/bom/templates` | `Bom[]` |
| POST | `/bom` | `Bom` |
| POST | `/bom/:id/duplicate?name=...` | `Bom` |
| PUT | `/bom/:id` | `Bom` |
| DELETE | `/bom/:id` | void |

---

## 24. PRODUCTION ORDERS (`use-production-orders.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/production-orders` | `PaginatedResponse<ProductionOrder>` |
| GET | `/production-orders/:id` | `ProductionOrder` |
| GET | `/production-orders/statistics` | `ProductionStatistics` |
| GET | `/production-orders/capacity?startDate,endDate` | — |
| POST | `/production-orders` | `ProductionOrder` |
| PUT | `/production-orders/:id` | `ProductionOrder` |
| POST | `/production-orders/:id/book-time` | — |
| POST | `/production-orders/:id/operations/:opId/complete` | — |
| DELETE | `/production-orders/:id` | void |

---

## 25. CALCULATIONS (`use-calculations.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/calculations` | `PaginatedResponse<Calculation>` |
| GET | `/calculations/:id` | `Calculation` |
| POST | `/calculations` | `Calculation` |
| PUT | `/calculations/:id` | `Calculation` |
| POST | `/calculations/:id/transfer-to-quote` | — |
| DELETE | `/calculations/:id` | void |

---

## 26. QUALITY CONTROL (`use-quality-control.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/quality/checklists` | `PaginatedResponse<QualityChecklist>` |
| GET | `/quality/checklists/:id` | `QualityChecklist` |
| GET | `/quality/checklists/templates` | — |
| POST | `/quality/checklists` | `QualityChecklist` |
| PUT | `/quality/checklists/:id` | `QualityChecklist` |
| DELETE | `/quality/checklists/:id` | void |
| GET | `/quality/checks` | `PaginatedResponse<QualityCheck>` |
| GET | `/quality/checks/:id` | `QualityCheck` |
| GET | `/quality/checks/statistics` | `QualityStatistics` |
| POST | `/quality/checks` | `QualityCheck` |
| PUT | `/quality/checks/:id` | `QualityCheck` |
| POST | `/quality/checks/:id/complete` | — |
| DELETE | `/quality/checks/:id` | void |

---

## 27. SERVICE TICKETS (`use-service-tickets.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/service-tickets` | `PaginatedResponse<ServiceTicket>` |
| GET | `/service-tickets/:id` | `ServiceTicket` |
| GET | `/service-tickets/statistics` | `ServiceStatistics` |
| GET | `/service-tickets/upcoming-maintenance?days=` | — |
| GET | `/service-tickets/technician-availability/:techId?startDate,endDate` | — |
| POST | `/service-tickets` | `ServiceTicket` |
| PUT | `/service-tickets/:id` | `ServiceTicket` |
| POST | `/service-tickets/:id/report` | — |
| POST | `/service-tickets/:id/schedule` | — |
| DELETE | `/service-tickets/:id` | void |

---

## 28. FINANCE (`use-finance.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/finance/accounts` | `PaginatedResponse<Account>` |
| GET | `/finance/accounts/:id` | `Account` |
| POST | `/finance/accounts` | `Account` |
| PUT | `/finance/accounts/:id` | `Account` |
| GET | `/finance/bank-accounts` | `BankAccount[]` |
| GET | `/finance/bank-accounts/:id` | `BankAccount` |
| POST | `/finance/bank-accounts` | `BankAccount` |
| PUT | `/finance/bank-accounts/:id` | `BankAccount` |
| GET | `/finance/balance-sheet` | `BalanceSheet` |
| GET | `/finance/income-statement?startDate,endDate` | `IncomeStatement` |
| GET | `/finance/monthly-summary?year=` | `MonthlySummary[]` |

---

## 29. JOURNAL ENTRIES (`use-journal-entries.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/journal-entries` | `PaginatedResponse<JournalEntry>` |
| GET | `/journal-entries/:id` | `JournalEntry` |
| GET | `/journal-entries/trial-balance?startDate,endDate` | — |
| GET | `/journal-entries/account-balance/:accountId` | — |
| POST | `/journal-entries` | `JournalEntry` |
| PUT | `/journal-entries/:id` | `JournalEntry` |
| POST | `/journal-entries/:id/post` | — |
| POST | `/journal-entries/:id/reverse` | — |
| DELETE | `/journal-entries/:id` | void |

---

## 30. COST CENTERS (`use-cost-centers.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/cost-centers` | `PaginatedResponse<CostCenter>` |
| GET | `/cost-centers/:id` | `CostCenter` |
| GET | `/cost-centers/hierarchy` | `CostCenter[]` |
| GET | `/cost-centers/report?startDate,endDate,costCenterIds` | — |
| POST | `/cost-centers` | `CostCenter` |
| PUT | `/cost-centers/:id` | `CostCenter` |
| DELETE | `/cost-centers/:id` | void |

---

## 31. BUDGETS (`use-budgets.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/budgets` | `PaginatedResponse<Budget>` |
| GET | `/budgets/:id` | `Budget` |
| GET | `/budgets/:id/comparison?includeDetails=` | — |
| POST | `/budgets` | `Budget` |
| PUT | `/budgets/:id` | `Budget` |
| POST | `/budgets/:id/approve` | — |
| POST | `/budgets/:id/activate` | — |
| DELETE | `/budgets/:id` | void |

---

## 32. CASH BOOK (`use-cash-book.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/cash-book/registers` | `CashRegister[]` |
| POST | `/cash-book/registers` | `CashRegister` |
| GET | `/cash-book/transactions` | `PaginatedResponse<CashTransaction>` |
| GET | `/cash-book/transactions/:id` | `CashTransaction` |
| POST | `/cash-book/registers/:registerId/transactions` | `CashTransaction` |
| PUT | `/cash-book/transactions/:id` | `CashTransaction` |
| DELETE | `/cash-book/transactions/:id` | void |
| GET | `/cash-book/registers/:registerId/daily-summary?date=` | `DailySummary` |
| POST | `/cash-book/registers/:registerId/closing` | — |

---

## 33. VAT RETURNS (`use-vat-returns.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/vat-returns` | `PaginatedResponse<VatReturn>` |
| GET | `/vat-returns/:id` | `VatReturn` |
| GET | `/vat-returns/summary/:year` | `VatSummary` |
| GET | `/vat-returns/:id/export-xml` | — |
| POST | `/vat-returns` | `VatReturn` |
| POST | `/vat-returns/:id/calculate` | — |
| POST | `/vat-returns/:id/submit` | — |
| PUT | `/vat-returns/:id` | `VatReturn` |
| DELETE | `/vat-returns/:id` | void |

---

## 34. FIXED ASSETS (`use-fixed-assets.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/fixed-assets` | `PaginatedResponse<FixedAsset>` |
| GET | `/fixed-assets/:id` | `FixedAsset` |
| GET | `/fixed-assets/statistics` | `FixedAssetStatistics` |
| GET | `/fixed-assets/:id/depreciation-schedule` | — |
| POST | `/fixed-assets` | `FixedAsset` |
| PUT | `/fixed-assets/:id` | `FixedAsset` |
| POST | `/fixed-assets/run-depreciation` | — |
| POST | `/fixed-assets/:id/dispose` | — |

---

## 35. PAYROLL (`use-payroll.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/payroll` | `PaginatedResponse<PayrollRun>` |
| GET | `/payroll/:id` | `PayrollRun` |
| POST | `/payroll` | `PayrollRun` |
| DELETE | `/payroll/:id` | void |
| POST | `/payroll/:id/complete` | `PayrollRun` |
| GET | `/payroll/stats` | `{ totalGross, totalNet, totalAHV, totalBVG, employeeCount }` |
| GET | `/payslips/:id` | `Payslip` |
| GET | `/payslips` | `PaginatedResponse<Payslip>` |
| POST | `/payslips/:id/send` | — |

---

## 36. EMPLOYEE CONTRACTS (`use-employee-contracts.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/employee-contracts` | `PaginatedResponse<EmployeeContract>` |
| GET | `/employee-contracts/:id` | `EmployeeContract` |
| GET | `/employee-contracts/stats` | `{ total, active, expiring, expired, totalSalary }` |
| POST | `/employee-contracts` | `EmployeeContract` |
| PUT | `/employee-contracts/:id` | `EmployeeContract` |
| DELETE | `/employee-contracts/:id` | void |
| POST | `/employee-contracts/:id/renew` | `EmployeeContract` |
| POST | `/employee-contracts/:id/terminate` | `EmployeeContract` |

---

## 37. TRAVEL EXPENSES (`use-travel-expenses.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/travel-expenses` | `PaginatedResponse<TravelExpense>` |
| GET | `/travel-expenses/:id` | `TravelExpense` |
| GET | `/travel-expenses/stats` | `{ totalAmount, pendingCount, approvedCount, totalCount }` |
| POST | `/travel-expenses` | `TravelExpense` |
| PUT | `/travel-expenses/:id` | `TravelExpense` |
| DELETE | `/travel-expenses/:id` | void |
| POST | `/travel-expenses/:id/approve` | `TravelExpense` |
| POST | `/travel-expenses/:id/reject` | `TravelExpense` |
| POST | `/travel-expenses/:id/mark-paid` | `TravelExpense` |

---

## 38. SWISSDEC (`use-swissdec.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/swissdec` | `PaginatedResponse<SwissdecSubmission>` |
| GET | `/swissdec/:id` | `SwissdecSubmission` |
| GET | `/swissdec/statistics/:year` | `SwissdecStatistics` |
| GET | `/swissdec/:id/xml` | `{ xml, reference }` |
| GET | `/swissdec/certificate/:employeeId/:year` | `SalaryCertificate` |
| POST | `/swissdec` | `SwissdecSubmission` |
| POST | `/swissdec/:id/validate` | — |
| POST | `/swissdec/:id/submit?testMode=` | — |

---

## 39. GAV METALLBAU (`use-gav-metallbau.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/gav-metallbau/settings/:year` | `GavSettings` |
| PUT | `/gav-metallbau/settings` | `GavSettings` |
| GET | `/gav-metallbau/employees` | `GavEmployee[]` |
| GET | `/gav-metallbau/employees/:id` | `GavEmployee` |
| POST | `/gav-metallbau/employees` | `GavEmployee` |
| PUT | `/gav-metallbau/employees/:id` | `GavEmployee` |
| POST | `/gav-metallbau/calculate-salary` | `GavSalaryCalculation` |
| GET | `/gav-metallbau/compliance` | `GavComplianceResult` |
| GET | `/gav-metallbau/minimum-rates?year=` | `GavMinimumRates` |

---

## 40. WITHHOLDING TAX (`use-withholding-tax.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/withholding-tax` | `PaginatedResponse<QstEmployee>` |
| GET | `/withholding-tax/employee/:id` | `QstEmployee` |
| GET | `/withholding-tax/statistics` | `QstStatistics` |
| GET | `/withholding-tax/report/:year/:month` | `QstMonthlyReport` |
| POST | `/withholding-tax/employee` | `QstEmployee` |
| PUT | `/withholding-tax/employee/:id` | `QstEmployee` |
| POST | `/withholding-tax/calculate` | — |
| POST | `/withholding-tax/reconciliation` | — |

---

## 41. REPORTS (`use-reports.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/reports/available` | `AvailableReport[]` |
| POST | `/reports/generate` | — |
| GET | `/reports/profit-loss?year,month` | — |
| GET | `/reports/balance-sheet?year` | — |
| GET | `/reports/payroll-summary?year,month` | — |
| GET | `/reports/gav-compliance` | — |
| GET | `/reports/project-profitability?year` | — |
| GET | `/reports/open-items` | — |
| GET | `/reports/budget-comparison?year` | — |
| GET | `/reports/sales-analysis?year` | — |
| GET | `/reports/withholding-tax?year,month` | — |

---

## 42. MARKETING (`use-marketing.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/marketing/campaigns` | `PaginatedResponse<Campaign>` |
| GET | `/marketing/campaigns/:id` | `Campaign` |
| GET | `/marketing/campaigns/stats` | `{ totalCampaigns, activeCampaigns, totalBudget, totalSpent }` |
| POST | `/marketing/campaigns` | `Campaign` |
| PUT | `/marketing/campaigns/:id` | `Campaign` |
| DELETE | `/marketing/campaigns/:id` | void |
| GET | `/marketing/leads` | `PaginatedResponse<Lead>` |
| GET | `/marketing/leads/:id` | `Lead` |
| GET | `/marketing/leads/stats` | `{ totalLeads, qualifiedLeads, conversionRate }` |
| POST | `/marketing/leads` | `Lead` |
| PUT | `/marketing/leads/:id` | `Lead` |
| DELETE | `/marketing/leads/:id` | void |
| GET | `/marketing/leads/:id/activities` | `LeadActivity[]` |
| POST | `/marketing/leads/activities` | `LeadActivity` |
| POST | `/marketing/leads/convert` | — |
| GET | `/marketing/email-campaigns` | `PaginatedResponse<EmailCampaign>` |
| POST | `/marketing/email-campaigns` | `EmailCampaign` |
| POST | `/marketing/email-campaigns/:id/send` | `EmailCampaign` |

---

## 43. E-COMMERCE (`use-ecommerce.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/ecommerce/orders` | `PaginatedResponse<ShopOrder>` |
| GET | `/ecommerce/orders/:id` | `ShopOrder` |
| GET | `/ecommerce/orders/stats` | `{ totalOrders, pendingOrders, totalRevenue, averageOrderValue }` |
| PUT | `/ecommerce/orders/:id` | `ShopOrder` |
| POST | `/ecommerce/orders/:id/cancel` | `ShopOrder` |
| GET | `/ecommerce/discounts` | `PaginatedResponse<Discount>` |
| GET | `/ecommerce/discounts/:id` | `Discount` |
| POST | `/ecommerce/discounts` | `Discount` |
| PUT | `/ecommerce/discounts/:id` | `Discount` |
| DELETE | `/ecommerce/discounts/:id` | void |
| POST | `/ecommerce/discounts/validate` | `Discount|null` |
| GET | `/ecommerce/reviews` | `PaginatedResponse<Review>` |
| GET | `/ecommerce/reviews/stats` | `{ pendingReviews, averageRating, activeDiscounts? }` |
| PUT | `/ecommerce/reviews/:id` | `Review` |
| DELETE | `/ecommerce/reviews/:id` | void |

---

## 44. CONTRACTS (`use-contracts.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/contracts` | `PaginatedResponse<Contract>` |
| GET | `/contracts/:id` | `Contract` |
| GET | `/contracts/stats` | `{ totalContracts, activeContracts, expiringThisMonth, totalValue, monthlyRecurring }` |
| GET | `/contracts/expiring?days=` | `Contract[]` |
| POST | `/contracts` | `Contract` |
| PUT | `/contracts/:id` | `Contract` |
| DELETE | `/contracts/:id` | void |
| POST | `/contracts/:id/renew` | `Contract` |
| POST | `/contracts/:id/terminate` | `Contract` |
| POST | `/contracts/:id/duplicate` | `Contract` |

---

## 45. RECRUITING (`use-recruiting.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/recruiting/jobs` | `PaginatedResponse<JobPosting>` |
| GET | `/recruiting/jobs/:id` | `JobPosting` |
| POST | `/recruiting/jobs` | `JobPosting` |
| PUT | `/recruiting/jobs/:id` | `JobPosting` |
| DELETE | `/recruiting/jobs/:id` | void |
| POST | `/recruiting/jobs/:id/publish` | `JobPosting` |
| GET | `/recruiting/candidates` | `PaginatedResponse<Candidate>` |
| GET | `/recruiting/candidates/:id` | `Candidate` |
| GET | `/recruiting/candidates/pipeline?jobPostingId=` | `Record<string, Candidate[]>` |
| POST | `/recruiting/candidates` | `Candidate` |
| PUT | `/recruiting/candidates/:id` | `Candidate` |
| DELETE | `/recruiting/candidates/:id` | void |
| POST | `/recruiting/candidates/:id/hire` | `Candidate` |
| POST | `/recruiting/interviews` | `Interview` |
| PUT | `/recruiting/interviews/:id` | `Interview` |
| GET | `/recruiting/stats` | `{ openPositions, totalCandidates, interviewsThisWeek, averageTimeToHire, offerAcceptanceRate }` |

---

## 46. TRAINING (`use-training.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/training` | `PaginatedResponse<Training>` |
| GET | `/training/:id` | `Training` |
| GET | `/training/stats` | `{ totalTrainings, upcomingTrainings, completedThisYear, totalParticipants, averageRating, totalCost }` |
| GET | `/training/upcoming?days=` | `Training[]` |
| GET | `/training/employee/:employeeId` | `Training[]` |
| POST | `/training` | `Training` |
| PUT | `/training/:id` | `Training` |
| DELETE | `/training/:id` | void |
| POST | `/training/:id/participants` | `TrainingParticipation` |
| PUT | `/training/:id/participants/:participantId` | `TrainingParticipation` |
| DELETE | `/training/:id/participants/:participantId` | void |
| POST | `/training/:id/complete` | `Training` |
| POST | `/training/report` | — |

---

## 47. BANK IMPORT (`use-bank-import.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/bank-import/transactions` | `PaginatedResponse<BankTransaction>` |
| GET | `/bank-import/transactions/:id` | `BankTransaction` |
| GET | `/bank-import/transactions/:id/suggestions` | `ReconciliationSuggestion` |
| GET | `/bank-import/statistics` | `{ pendingTransactions, reconciledToday, totalImported, lastImportDate? }` |
| POST | `/bank-import/camt054` | `BankImportResult` |
| POST | `/bank-import/reconcile` | `BankTransaction` |
| POST | `/bank-import/auto-reconcile?bankAccountId=` | `{ reconciled, failed }` |
| PATCH | `/bank-import/transactions/:id/ignore` | `BankTransaction` |

---

## 48. DOCUMENTS DMS (`use-documents.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/documents/folders` | `Folder[]` |
| GET | `/documents/folders/:id` | `Folder` |
| POST | `/documents/folders` | `Folder` |
| PUT | `/documents/folders/:id` | `Folder` |
| DELETE | `/documents/folders/:id` | void |
| GET | `/documents` | `PaginatedResponse<DMSDocument>` |
| GET | `/documents/:id` | `DMSDocument` |
| POST | `/documents/upload` (multipart) | `DMSDocument` |
| PUT | `/documents/:id` | `DMSDocument` |
| POST | `/documents/:id/versions` | `DMSDocument` |
| PATCH | `/documents/:id/archive` | `DMSDocument` |
| PATCH | `/documents/:id/move` | `DMSDocument` |
| DELETE | `/documents/:id` | void |
| GET | `/documents/statistics` | `{ totalDocuments, totalFolders, totalSize, recentUploads, archivedDocuments }` |
| POST | `/documents/:id/share` | `{ shareUrl, token }` |

---

## 49. MESSAGES (`use-messages.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/messages?projectId,taskId,pageSize=200` | `{ data[], total, page, pageSize }` |
| POST | `/messages` | `ChatMessageData` |

---

## 50. NOTIFICATIONS (`use-notifications.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/notifications` | `{ data[], total, page, pageSize }` |
| GET | `/notifications/unread-count` | `{ count }` |
| PATCH | `/notifications/:id/read` | — |
| PATCH | `/notifications/read-all` | — |
| DELETE | `/notifications/:id` | void |

---

## 51. AUDIT LOG (`use-audit-log.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/audit-log` | `PaginatedResponse<AuditLog>` |
| GET | `/audit-log/:id` | `AuditLog` |
| GET | `/audit-log/entity/:entityType/:entityId` | `AuditLog[]` |
| GET | `/audit-log/statistics?days=` | — |
| GET | `/audit-log/export?startDate,endDate,module,format` | — |

---

## 52. COMPANY (`use-company.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/company` | `Company` |
| PUT | `/company` | `Company` |

---

## 53. COMPANY TEAM (`use-company-team.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/company/team` | `TeamMember[]` |
| POST | `/company/team` | `TeamMember` |
| DELETE | `/company/team/:id` | void |

---

## 54. SETTINGS (`use-settings.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/settings` | `CompanySettings` |
| PUT | `/settings` | `CompanySettings` |
| POST | `/settings/generate-api-key` | `{ apiKey }` |

---

## 55. USERS (`use-users.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/users` | `PaginatedResponse<User>` |
| GET | `/users/:id` | `User` |
| POST | `/users` | `User` |
| PUT | `/users/:id` | `User` |
| DELETE | `/users/:id` | void |
| GET | `/users/:id/permissions` | `UserPermissionsResponse` |
| PUT | `/users/:id/password` | — |
| PUT | `/users/:id/permissions` | — |

---

## 56. ROLES (`use-roles.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/roles` | `PaginatedResponse<Role>` |
| GET | `/roles/:id` | `Role` |
| POST | `/roles` | `Role` |
| PUT | `/roles/:id` | `Role` |
| DELETE | `/roles/:id` | void |

---

## 57. MAIL (`use-email-account.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/mail/account` | `MailAccount` |
| POST | `/mail/account` | `MailAccount` |
| POST | `/mail/test` | `{ success, message }` |

---

## 58. INVENTORY (`use-inventory.ts`)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/inventory` | `PaginatedResponse<InventoryItem>` |
| GET | `/inventory/:id` | `InventoryItem` |
| PUT | `/inventory/:id` | `InventoryItem` |
| POST | `/inventory/:id/adjust` | — |
| POST | `/inventory/:id/transfer` | — |
| DELETE | `/inventory/:id` | void |

---

## 59. PDF & EMAIL (standalone, `src/lib/api.ts`)

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/:entityType/:id/pdf` | Binary blob download. entityType: invoices, quotes, credit-notes, delivery-notes, reminders, purchase-invoices |
| POST | `/:entityType/:id/send` | entityType: invoices, quotes, reminders |

---

## 60. HEALTH

| Method | Endpoint | Response |
|---|---|---|
| GET | `/health` | `{ status: 'ok', timestamp }` |
