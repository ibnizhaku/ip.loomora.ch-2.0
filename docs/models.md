# Loomora ERP – Datenmodelle (Frontend-Sicht)

> Abgeleitet aus Frontend-Hooks und `src/types/api.ts`
> Definiert die Entities wie sie das Frontend erwartet

## Kern-Entities

### AuthUser
```ts
{ id, email, firstName, lastName, role, companyId, companyName }
```

### Company
```ts
{ id, name, slug?, legalName?, street?, zipCode?, city?, country?, phone?, email?,
  website?, vatNumber?, iban?, bic?, bankName?, logoUrl?, qrIban?,
  defaultCurrency?, fiscalYearStart?, timezone?, status?, createdAt, updatedAt? }
```

### Customer
```ts
{ id, number, name, companyName?, street?, zipCode?, city?, country?,
  email?, phone?, mobile?, website?, vatNumber?, paymentTermDays, discount,
  creditLimit?, notes?, isActive, createdAt, updatedAt,
  totalRevenue?, openInvoices?, projectCount? }
```

### CustomerContact
```ts
{ id, customerId, firstName, lastName, email?, phone?, mobile?,
  position?, department?, isPrimary, notes?, createdAt }
```

### Supplier
```ts
{ id, number, name, companyName?, street?, zipCode?, city?, country?,
  email?, phone?, website?, vatNumber?, iban?, paymentTermDays, notes?,
  rating?, isActive, createdAt, updatedAt, totalOrders?, totalValue? }
```

### Product
```ts
{ id, sku, name, description?, unit, purchasePrice, salePrice,
  vatRate: STANDARD|REDUCED|SPECIAL|ZERO, stockQuantity, minStock, maxStock?,
  reservedStock?, isService, isActive, categoryId?, category?, supplierId?,
  supplier?, createdAt, updatedAt, margin?, availableStock? }
```

### Project
```ts
{ id, number, name, description?, customerId?, customer?, client?, managerId?,
  manager?, status: PLANNING|ACTIVE|PAUSED|COMPLETED|CANCELLED,
  priority?, progress?, startDate?, endDate?, budget?, spent?,
  team?, members?: ProjectMember[], milestones?, tasks?: ProjectTask[],
  taskCount?, timeEntryCount?, createdAt? }
```

### Task
```ts
{ id, title, description?, status: TODO|IN_PROGRESS|DONE|CANCELLED,
  priority: LOW|MEDIUM|HIGH, projectId?, project?, assigneeId?, assignee?,
  dueDate?, completedAt?, tags?, comments?, attachments?, subtasks?,
  parentId?, createdAt }
```

### Employee
```ts
{ id, employeeNumber, firstName, lastName, email, phone?, mobile?,
  department?, departmentId?, position?, managerId?, manager?, hireDate,
  terminationDate?, status: ACTIVE|INACTIVE|TERMINATED|VACATION|SICK,
  salary?, workHoursPerWeek?, vacationDays?, address?, socialSecurityNumber?,
  bankAccount?, dateOfBirth?, ahvNumber?, nationality?, maritalStatus?,
  childrenCount?, employmentType?, workloadPercent?, iban?, notes?, createdAt }
```

### Invoice
```ts
{ id, number, customerId, customer?, projectId?, project?, issueDate, dueDate,
  status: DRAFT|SENT|PAID|OVERDUE|CANCELLED, subtotal, vatAmount, total,
  paidAmount?, paidDate?, openAmount?, isOverdue?, qrReference?, qrIban?,
  notes?, items: InvoiceItem[], createdAt, updatedAt }
```

### Quote
```ts
{ id, number, customerId, customer?, projectId?, status: DRAFT|SENT|CONFIRMED|CANCELLED,
  issueDate, validUntil?, subtotal, vatAmount, total, notes?, items: InvoiceItem[] }
```

### Order
```ts
{ id, number, customerId, customer?, projectId?, quoteId?,
  status: DRAFT|SENT|CONFIRMED|CANCELLED, orderDate, deliveryDate?,
  deliveryAddress?, subtotal, vatAmount, total, notes?, items: InvoiceItem[] }
```

### DeliveryNote
```ts
{ id, number, customerId, customer?, orderId?, order?,
  status: DRAFT|SHIPPED|DELIVERED|CANCELLED, deliveryDate, shippedDate?,
  deliveryAddress?, trackingNumber?, carrier?, notes?, items[], createdAt, updatedAt }
```

### CreditNote
```ts
{ id, number, customerId, customer?, invoiceId?, invoice?,
  status: DRAFT|ISSUED|APPLIED|CANCELLED, issueDate, reason?,
  subtotal, vatAmount, total, items[], createdAt }
```

### Reminder
```ts
{ id, number, invoiceId, invoice?, customerId, customer?,
  status: DRAFT|SENT|PAID|CANCELLED, level, fee, interestAmount?,
  totalAmount, dueDate, sentDate?, notes?, createdAt }
```

### Payment
```ts
{ id, number, type: INCOMING|OUTGOING, status: PENDING|COMPLETED|CANCELLED|FAILED,
  method: BANK_TRANSFER|CASH|CREDIT_CARD|QR_BILL|OTHER, amount, currency,
  paymentDate, reference?, qrReference?, customerId?, customer?, supplierId?,
  supplier?, invoiceId?, purchaseInvoiceId?, bankAccountId?, notes?, createdAt }
```

## Weitere Entities (gekürzt)

- **PurchaseOrder**: supplierId, items[], status DRAFT|SENT|CONFIRMED|PARTIAL|RECEIVED|CANCELLED
- **PurchaseInvoice**: supplierId, externalNumber, items[], OCR support
- **GoodsReceipt**: purchaseOrderId, supplierId, items[] mit qualityStatus
- **Bom**: items[] mit type MATERIAL|LABOR|SUBCONTRACT|OTHER
- **ProductionOrder**: bomId, operations[], quantity, status chain
- **Calculation**: items[] mit margin, transfer-to-quote
- **QualityChecklist/Check**: checklists + inspections
- **ServiceTicket**: reports[], technician scheduling
- **Account**: chart of accounts (ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE)
- **BankAccount**: IBAN, BIC, balance
- **JournalEntry**: lines[] mit debit/credit
- **CostCenter**: hierarchical, report endpoint
- **Budget**: lines[], approve/activate lifecycle
- **CashRegister/CashTransaction**: daily-summary, closing
- **VatReturn**: lines[], calculate/submit lifecycle
- **FixedAsset**: depreciation schedule, dispose
- **PayrollRun/Payslip**: earnings[], deductions[], employerContributions[]
- **EmployeeContract**: GAV class, renew/terminate
- **TravelExpense**: items[], approve/reject/mark-paid
- **SwissdecSubmission**: XML generation, validate/submit
- **GavEmployee**: compliance check, salary calculation
- **Campaign/Lead/EmailCampaign**: Marketing CRM
- **ShopOrder/Discount/Review**: E-Commerce
- **Contract**: renew/terminate, expiring alerts
- **JobPosting/Candidate/Interview**: Recruiting pipeline
- **Training/TrainingParticipation**: course management
- **BankTransaction**: camt.054 import, reconciliation
- **Folder/DMSDocument**: DMS with versioning, sharing
- **ChatMessageData**: project/task scoped
- **Notification**: categories, read/unread
- **AuditLog**: entity history, export
- **Role/RolePermission**: RBAC
- **User**: CRUD + permission overrides
