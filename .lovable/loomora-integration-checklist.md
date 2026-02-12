# 🔗 Loomora ERP — Vollständige Frontend-Backend Integrations-Checkliste

> Erstellt: 2026-02-12
> Zweck: Sicherstellen, dass Frontend (Lovable) und Backend (Cursor/NestJS) zu 100% übereinstimmen
> Regel: Für jedes Modul müssen alle 5 Bausteine geprüft und synchronisiert sein

---

## 📖 Die 5 Bausteine der Kommunikation

| # | Baustein | Was ist das? | Beispiel |
|---|----------|-------------|----------|
| 1 | **API-Endpunkte** | "Türen" im Backend, durch die Daten rein- und rausgehen | `GET /api/invoices` → gibt alle Rechnungen zurück |
| 2 | **API-Client** | Der "Bote" im Frontend, der Anfragen ans Backend schickt | `src/lib/api.ts` — ✅ fertig |
| 3 | **Hooks** | Frontend-Funktionen, die Daten vom Backend holen | `useInvoices()` holt Rechnungen |
| 4 | **Daten-Typen** | Ein "Vertrag" — welche Felder hat ein Objekt? | `{ id, number, total, status }` |
| 5 | **Auth/Token** | Der "Ausweis" bei jeder Anfrage | `Bearer <token>` im Header — ✅ fertig |

## 📋 Prüfpunkte pro Modul

| Prüfpunkt | Frontend (Lovable) | Backend (Cursor) | Status |
|-----------|-------------------|-------------------|--------|
| Endpunkt-Pfade | Hook ruft `/api/xyz` auf | Backend hat Route `/api/xyz` | Muss matchen |
| HTTP-Methoden | GET/POST/PUT/DELETE | Gleiche Methoden | Muss matchen |
| Feld-Namen | Frontend erwartet `total` | Backend sendet `total` | Muss matchen |
| Stats-Format | `{ total, paid, overdue }` | Backend liefert gleich | Muss matchen |
| Pagination | `{ data, total, page, pageSize }` | Backend liefert gleich | Muss matchen |
| Auth | `Bearer <token>` Header | `JwtAuthGuard` prüft Token | ✅ Fertig |
| Fehler-Format | `{ error, message }` | Backend sendet gleich | ✅ Fertig |
| Response-Mapper | Frontend erwartet camelCase | Backend mappt via `response.mapper.ts` | ✅ Fertig |

---

## 🏢 Globale Infrastruktur

### Auth (✅ Fertig)
| Baustein | Details |
|----------|---------|
| API-Client | `src/lib/api.ts` — Token-Refresh, Multi-Tenant |
| Login | `POST /auth/login` → `{ accessToken, refreshToken, user }` |
| Register | `POST /auth/register` → gleiche Response |
| Refresh | `POST /auth/refresh` → `{ userId, refreshToken }` |
| Session | `GET /auth/me` → validiert Token + Company-Status |
| Logout | `POST /auth/logout` |

### Dashboard
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-dashboard.ts` |
| Hooks | `useDashboardStats`, `useRecentActivity` |
| Endpunkte | `GET /dashboard/stats`, `GET /dashboard/activity` |
| Stats-Felder | `{ totalRevenue, openInvoices, activeProjects, customerCount, employeeCount, revenueChange, utilizationRate }` |
| Activity-Felder | `{ invoices[], projects[], tasks[] }` |

### Company / Firma
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-company.ts` |
| Hooks | `useCompany`, `useUpdateCompany` |
| Endpunkte | `GET /company`, `PUT /company` |
| Felder | `{ id, name, legalName, street, zipCode, city, country, phone, email, website, vatNumber, iban, bic, bankName, logoUrl, qrIban, defaultCurrency, fiscalYearStart }` |

### Company Team
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-company-team.ts` |
| Hooks | `useCompanyTeam`, `useAddTeamMember`, `useRemoveTeamMember` |
| Endpunkte | `GET /company/team`, `POST /company/team`, `DELETE /company/team/:id` |

### Settings / Einstellungen
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-settings.ts` |
| Hooks | `useSettings`, `useUpdateSettings`, `useTestSmtp`, `useGenerateApiKey` |
| Endpunkte | `GET /settings`, `PUT /settings`, `POST /settings/smtp/test`, `POST /settings/generate-api-key` |
| Felder | `{ language, timezone, currency, smtpHost, smtpPort, smtpUser, smtpPassword, smtpFrom, invoicePrefix, invoiceNextNumber, quotePrefix, ... , apiKey }` |

### Users / Benutzer
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-users.ts` |
| Hooks | `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser` |
| Endpunkte | `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` |
| Filter | `?search, role, isActive, page, pageSize` |
| Felder | `{ id, name, email, role, status, lastLogin, twoFactor, employeeId, phone }` |

---

## 💼 CRM

### Kunden (Customers)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-customers.ts` |
| Hooks | `useCustomers`, `useCustomer`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer`, `useCustomerStats` |
| Endpunkte | `GET /customers`, `GET /customers/:id`, `POST /customers`, `PUT /customers/:id`, `DELETE /customers/:id`, `GET /customers/stats` |
| Filter | `?search, page, pageSize, sortBy, sortOrder` |
| Stats | `{ total, active, prospects, totalRevenue }` |
| Pagination | `{ data[], total, page, pageSize }` |

#### Kunden-Kontakte (Sub-Resource)
| Baustein | Details |
|----------|---------|
| Hooks | `useCustomerContacts`, `useCreateCustomerContact`, `useUpdateCustomerContact`, `useDeleteCustomerContact` |
| Endpunkte | `GET /customers/:id/contacts`, `POST /customers/:id/contacts`, `PUT /customers/:id/contacts/:contactId`, `DELETE /customers/:id/contacts/:contactId` |
| Felder | `{ id, firstName, lastName, email, phone, mobile, position, department, isPrimary }` |

### Lieferanten (Suppliers)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-suppliers.ts` |
| Hooks | `useSuppliers`, `useSupplier`, `useCreateSupplier`, `useUpdateSupplier`, `useDeleteSupplier`, `useSupplierStats` |
| Endpunkte | `GET /suppliers`, `GET /suppliers/:id`, `POST /suppliers`, `PUT /suppliers/:id`, `DELETE /suppliers/:id`, `GET /suppliers/stats` |
| Stats | `{ total, active, newSuppliers, totalValue, avgRating }` |

---

## 📦 Produkte & Lager

### Produkte (Products)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-products.ts` |
| Hooks | `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`, `useAdjustStock`, `useProductCategories`, `useCreateProductCategory`, `useProductStats` |
| Endpunkte | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `POST /products/:id/adjust-stock`, `GET /products/categories`, `POST /products/categories`, `GET /products/stats` |
| Filter | `?search, page, pageSize, sortBy, sortOrder, categoryId, isService` |
| Stats | `{ total, active, inactive, services, lowStock }` |
| Stock-Adjust | `{ quantity, type: 'IN'|'OUT'|'ADJUSTMENT', reason? }` |

---

## 💰 Verkauf (Sales)

### Angebote (Quotes)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-sales.ts` |
| Hooks | `useQuotes`, `useQuote`, `useCreateQuote`, `useUpdateQuote`, `useDeleteQuote`, `useSendQuote`, `useConvertQuoteToOrder`, `useQuoteStats` |
| Endpunkte | `GET /quotes`, `GET /quotes/:id`, `POST /quotes`, `PUT /quotes/:id`, `DELETE /quotes/:id`, `POST /quotes/:id/send`, `POST /quotes/:id/convert-to-order`, `GET /quotes/stats` |
| Filter | `?status, customerId, search` |
| Stats | `{ total, draft, sent, confirmed, rejected }` |
| Felder | `{ id, number, customerId, customer, status, issueDate, validUntil, subtotal, vatAmount, total, items[] }` |

### Aufträge (Orders)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-sales.ts` |
| Hooks | `useOrders`, `useOrder`, `useCreateOrder`, `useUpdateOrder`, `useDeleteOrder`, `useCreateInvoiceFromOrder`, `useCreateDeliveryNoteFromOrderAction`, `useOrderStats` |
| Endpunkte | `GET /orders`, `GET /orders/:id`, `POST /orders`, `PUT /orders/:id`, `DELETE /orders/:id`, `POST /orders/:id/create-invoice`, `POST /orders/:id/create-delivery-note`, `GET /orders/stats` |
| Stats | `{ total, draft, sent, confirmed, cancelled, totalValue }` |

### Rechnungen (Invoices — in use-sales.ts UND use-invoices.ts)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-invoices.ts` + `src/hooks/use-sales.ts` |
| Hooks | `useInvoices`, `useInvoice`, `useCreateInvoice`, `useUpdateInvoice`, `useDeleteInvoice`, `useInvoiceStats`, `useRecordPayment`, `useSendInvoice`, `useCancelInvoice`, `useOpenItems` |
| Endpunkte | `GET /invoices`, `GET /invoices/:id`, `POST /invoices`, `PUT /invoices/:id`, `DELETE /invoices/:id`, `GET /invoices/stats`, `POST /invoices/:id/payment`, `POST /invoices/:id/send`, `POST /invoices/:id/cancel`, `GET /invoices/open-items` |
| Filter | `?status, customerId, overdue, search, page, pageSize, sortBy, sortOrder` |
| Stats | `{ total, paid, pending, overdue }` |
| Felder | `{ id, number, customerId, customer, issueDate, dueDate, status, subtotal, vatAmount, total, paidAmount, items[] }` |
| ⚠️ ACHTUNG | `use-invoices.ts` und `use-sales.ts` haben BEIDE Invoice-Hooks — Backend muss beide Formate unterstützen |

### Lieferscheine (Delivery Notes)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-delivery-notes.ts` |
| Hooks | `useDeliveryNotes`, `useDeliveryNote`, `useCreateDeliveryNote`, `useCreateDeliveryNoteFromOrder`, `useUpdateDeliveryNote`, `useDeleteDeliveryNote`, `useDeliveryNoteStats` |
| Endpunkte | `GET /delivery-notes`, `GET /delivery-notes/:id`, `POST /delivery-notes`, `POST /delivery-notes/from-order/:orderId`, `PUT /delivery-notes/:id`, `DELETE /delivery-notes/:id`, `GET /delivery-notes/stats` |
| Stats | `{ total, draft, shipped, delivered }` |
| Felder | `{ id, number, customerId, customer, orderId, status, deliveryDate, trackingNumber, carrier, items[] }` |

### Gutschriften (Credit Notes)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-credit-notes.ts` |
| Hooks | `useCreditNotes`, `useCreditNote`, `useCreateCreditNote`, `useCreateCreditNoteFromInvoice`, `useUpdateCreditNote`, `useDeleteCreditNote` |
| Endpunkte | `GET /credit-notes`, `GET /credit-notes/:id`, `POST /credit-notes`, `POST /credit-notes/from-invoice/:invoiceId`, `PUT /credit-notes/:id`, `DELETE /credit-notes/:id` |
| Felder | `{ id, number, customerId, invoiceId, status, issueDate, reason, subtotal, vatAmount, total, items[] }` |

### Mahnungen (Reminders)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-reminders.ts` |
| Hooks | `useReminders`, `useReminder`, `useReminderStatistics`, `useOverdueInvoices`, `useCreateReminder`, `useCreateBatchReminders`, `useUpdateReminder`, `useSendReminder`, `useDeleteReminder` |
| Endpunkte | `GET /reminders`, `GET /reminders/:id`, `GET /reminders/statistics`, `GET /reminders/overdue-invoices`, `POST /reminders`, `POST /reminders/batch`, `PUT /reminders/:id`, `POST /reminders/:id/send`, `DELETE /reminders/:id` |
| Stats | `{ totalReminders, pendingReminders, sentReminders, totalOutstanding, byLevel[] }` |

---

## 🛒 Einkauf (Purchasing)

### Bestellungen (Purchase Orders)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-purchase-orders.ts` |
| Hooks | `usePurchaseOrders`, `usePurchaseOrder`, `usePurchaseOrderStatistics`, `useCreatePurchaseOrder`, `useUpdatePurchaseOrder`, `useSendPurchaseOrder`, `useDeletePurchaseOrder` |
| Endpunkte | `GET /purchase-orders`, `GET /purchase-orders/:id`, `GET /purchase-orders/statistics`, `POST /purchase-orders`, `PUT /purchase-orders/:id`, `POST /purchase-orders/:id/send`, `DELETE /purchase-orders/:id` |
| Stats | `{ totalOrders, draftOrders, sentOrders, confirmedOrders, receivedOrders, totalValue, pendingValue }` |

### Eingangsrechnungen (Purchase Invoices)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-purchase-invoices.ts` |
| Hooks | `usePurchaseInvoices`, `usePurchaseInvoice`, `usePurchaseInvoiceStatistics`, `useCreatePurchaseInvoice`, `useCreatePurchaseInvoiceFromOrder`, `useExtractOcrData`, `useUpdatePurchaseInvoice`, `useApprovePurchaseInvoice`, `useDeletePurchaseInvoice` |
| Endpunkte | `GET /purchase-invoices`, `GET /purchase-invoices/:id`, `GET /purchase-invoices/statistics`, `POST /purchase-invoices`, `POST /purchase-invoices/from-purchase-order/:id`, `POST /purchase-invoices/extract-ocr`, `PUT /purchase-invoices/:id`, `POST /purchase-invoices/:id/approve`, `DELETE /purchase-invoices/:id` |
| Stats | `{ totalInvoices, pendingInvoices, approvedInvoices, paidInvoices, overdueInvoices, totalValue, pendingValue, overdueValue }` |

### Wareneingänge (Goods Receipts)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-goods-receipts.ts` |
| Hooks | `useGoodsReceipts`, `useGoodsReceipt`, `useGoodsReceiptStatistics`, `usePendingGoodsReceipts`, `useCreateGoodsReceipt`, `useUpdateGoodsReceipt`, `usePerformQualityCheck`, `useDeleteGoodsReceipt` |
| Endpunkte | `GET /goods-receipts`, `GET /goods-receipts/:id`, `GET /goods-receipts/statistics`, `GET /goods-receipts/pending`, `POST /goods-receipts`, `PUT /goods-receipts/:id`, `POST /goods-receipts/:id/quality-check`, `DELETE /goods-receipts/:id` |

---

## 📊 Projekte & Aufgaben

### Projekte (Projects)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-projects.ts` |
| Hooks | `useProjects`, `useProject`, `useProjectStats`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useDuplicateProject` |
| Endpunkte | `GET /projects`, `GET /projects/:id`, `GET /projects/stats`, `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id`, `POST /projects/:id/duplicate` |
| Filter | `?search, status, priority, customerId, managerId, page, pageSize, sortBy, sortOrder` |
| Stats | `{ total, active, completed, paused }` |
| Felder | `{ id, number, name, description, customerId, customer, managerId, manager, status, priority, progress, startDate, endDate, budget, spent, members[], tasks[] }` |

### Aufgaben (Tasks) ⚠️
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-tasks.ts` |
| Hooks | `useTasks`, `useTask`, `useTaskStats`, `useCreateTask`, `useUpdateTask`, `useDeleteTask` |
| Endpunkte | `GET /tasks`, `GET /tasks/:id`, `GET /tasks/stats`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id` |
| Filter | `?search, status, priority, projectId, assigneeId, page, pageSize` |
| Stats | `{ total, todo, inProgress, done, overdue }` |
| Felder | `{ id, title, description, status, priority, projectId, project, assigneeId, assignee, dueDate, completedAt, tags[], comments[], attachments[], subtasks[], parentId }` |
| ⚠️ STATUS-MISMATCH | Frontend: `TODO, IN_PROGRESS, DONE, CANCELLED` — Backend DTO: `TODO, IN_PROGRESS, REVIEW, DONE` → **MUSS SYNCHRONISIERT WERDEN** |
| ⚠️ UNTERAUFGABEN | Frontend erwartet `subtasks[]` + `parentId` — Backend braucht entsprechende Routen |
| ⚠️ KOMMENTARE | Frontend erwartet `comments[]` — Backend braucht `POST /tasks/:id/comments`, `DELETE /tasks/:id/comments/:commentId` |
| ⚠️ ANHÄNGE | Frontend erwartet `attachments[]` — Backend braucht `POST /tasks/:id/attachments`, `DELETE /tasks/:id/attachments/:attachmentId` |

### Kalkulationen (Calculations)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-calculations.ts` |
| Hooks | `useCalculations`, `useCalculation`, `useCreateCalculation`, `useUpdateCalculation`, `useTransferCalculationToQuote`, `useDeleteCalculation` |
| Endpunkte | `GET /calculations`, `GET /calculations/:id`, `POST /calculations`, `PUT /calculations/:id`, `POST /calculations/:id/transfer-to-quote`, `DELETE /calculations/:id` |

---

## 📝 Verträge & Dokumente

### Verträge (Contracts)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-contracts.ts` |
| Hooks | `useContracts`, `useContract`, `useCreateContract`, `useUpdateContract`, `useDeleteContract`, `useRenewContract`, `useTerminateContract`, `useExpiringContracts`, `useContractStats`, `useDuplicateContract` |
| Endpunkte | `GET /contracts`, `GET /contracts/:id`, `POST /contracts`, `PUT /contracts/:id`, `DELETE /contracts/:id`, `POST /contracts/:id/renew`, `POST /contracts/:id/terminate`, `GET /contracts/expiring`, `GET /contracts/stats`, `POST /contracts/:id/duplicate` |
| Stats | `{ totalContracts, activeContracts, expiringThisMonth, totalValue, monthlyRecurring }` |

### Dokumente (Documents/DMS)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-documents.ts` |
| Hooks | `useFolders`, `useFolder`, `useFolderTree`, `useCreateFolder`, `useUpdateFolder`, `useDeleteFolder`, `useDMSDocuments`, `useDMSDocument`, `useUploadDocument`, `useUpdateDocument`, `useUploadNewVersion`, `useArchiveDocument`, `useDeleteDocument`, `useMoveDocument`, `useDocumentStats`, `useShareDocument` |
| Endpunkte | `GET /documents/folders`, `GET /documents/folders/:id`, `POST /documents/folders`, `PUT /documents/folders/:id`, `DELETE /documents/folders/:id`, `GET /documents`, `GET /documents/:id`, `POST /documents/upload` (multipart), `PUT /documents/:id`, `POST /documents/:id/versions`, `PATCH /documents/:id/archive`, `DELETE /documents/:id`, `PATCH /documents/:id/move`, `GET /documents/statistics`, `POST /documents/:id/share` |
| Stats | `{ totalDocuments, totalFolders, totalSize, recentUploads, archivedDocuments }` |

---

## 💵 Buchhaltung (Accounting)

### Kontenplan (Chart of Accounts)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-finance.ts` |
| Hooks | `useAccounts`, `useAccount`, `useCreateAccount`, `useUpdateAccount` |
| Endpunkte | `GET /finance/accounts`, `GET /finance/accounts/:id`, `POST /finance/accounts`, `PUT /finance/accounts/:id` |

### Bankkonten (Bank Accounts)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-finance.ts` |
| Hooks | `useBankAccounts`, `useBankAccount`, `useCreateBankAccount`, `useUpdateBankAccount` |
| Endpunkte | `GET /finance/bank-accounts`, `GET /finance/bank-accounts/:id`, `POST /finance/bank-accounts`, `PUT /finance/bank-accounts/:id` |

### Bilanz & Erfolgsrechnung
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-finance.ts` |
| Hooks | `useBalanceSheet`, `useIncomeStatement`, `useFinanceMonthlySummary` |
| Endpunkte | `GET /finance/balance-sheet`, `GET /finance/income-statement`, `GET /finance/monthly-summary` |

### Journalbuchungen (Journal Entries)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-journal-entries.ts` |
| Hooks | `useJournalEntries`, `useJournalEntry`, `useTrialBalance`, `useAccountBalance`, `useCreateJournalEntry`, `useUpdateJournalEntry`, `usePostJournalEntry`, `useReverseJournalEntry`, `useDeleteJournalEntry` |
| Endpunkte | `GET /journal-entries`, `GET /journal-entries/:id`, `GET /journal-entries/trial-balance`, `GET /journal-entries/account-balance/:accountId`, `POST /journal-entries`, `PUT /journal-entries/:id`, `POST /journal-entries/:id/post`, `POST /journal-entries/:id/reverse`, `DELETE /journal-entries/:id` |

### Kassenbuch (Cash Book)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-cash-book.ts` |
| Hooks | `useCashRegisters`, `useCreateCashRegister`, `useCashTransactions`, `useCashTransaction`, `useCreateCashTransaction`, `useUpdateCashTransaction`, `useDeleteCashTransaction`, `useCashDailySummary`, `usePerformCashClosing` |
| Endpunkte | `GET /cash-book/registers`, `POST /cash-book/registers`, `GET /cash-book/transactions`, `GET /cash-book/transactions/:id`, `POST /cash-book/registers/:id/transactions`, `PUT /cash-book/transactions/:id`, `DELETE /cash-book/transactions/:id`, `GET /cash-book/registers/:id/daily-summary`, `POST /cash-book/registers/:id/closing` |

### Zahlungen (Payments)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-payments.ts` |
| Hooks | `usePayments`, `usePayment`, `usePaymentStatistics`, `useFindByQrReference`, `useCreatePayment`, `useUpdatePayment`, `useReconcilePayment`, `useDeletePayment` |
| Endpunkte | `GET /payments`, `GET /payments/:id`, `GET /payments/statistics`, `GET /payments/match-qr/:ref`, `POST /payments`, `PUT /payments/:id`, `POST /payments/:id/reconcile`, `DELETE /payments/:id` |
| Stats | `{ totalIncoming, totalOutgoing, pendingPayments, completedThisMonth }` |

### Bank-Import (camt.054)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-bank-import.ts` |
| Hooks | `useBankTransactions`, `useBankTransaction`, `useImportCamt054`, `useReconciliationSuggestions`, `useReconcileTransaction`, `useAutoReconcile`, `useIgnoreTransaction`, `useBankImportStats` |
| Endpunkte | `GET /bank-import/transactions`, `GET /bank-import/transactions/:id`, `POST /bank-import/camt054`, `GET /bank-import/transactions/:id/suggestions`, `POST /bank-import/reconcile`, `POST /bank-import/auto-reconcile`, `PATCH /bank-import/transactions/:id/ignore`, `GET /bank-import/statistics` |
| Stats | `{ pendingTransactions, reconciledToday, totalImported, lastImportDate }` |

### MWST-Abrechnungen (VAT Returns)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-vat-returns.ts` |
| Hooks | `useVatReturns`, `useVatReturn`, `useVatSummary`, `useExportVatXml`, `useCreateVatReturn`, `useCalculateVatReturn`, `useSubmitVatReturn`, `useUpdateVatReturn`, `useDeleteVatReturn` |
| Endpunkte | `GET /vat-returns`, `GET /vat-returns/:id`, `GET /vat-returns/summary/:year`, `GET /vat-returns/:id/export-xml`, `POST /vat-returns`, `POST /vat-returns/:id/calculate`, `POST /vat-returns/:id/submit`, `PUT /vat-returns/:id`, `DELETE /vat-returns/:id` |

### Budgets
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-budgets.ts` |
| Hooks | `useBudgets`, `useBudget`, `useBudgetComparison`, `useCreateBudget`, `useUpdateBudget`, `useApproveBudget`, `useActivateBudget`, `useDeleteBudget` |
| Endpunkte | `GET /budgets`, `GET /budgets/:id`, `GET /budgets/:id/comparison`, `POST /budgets`, `PUT /budgets/:id`, `POST /budgets/:id/approve`, `POST /budgets/:id/activate`, `DELETE /budgets/:id` |

### Kostenstellen (Cost Centers)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-cost-centers.ts` |
| Hooks | `useCostCenters`, `useCostCenter`, `useCostCenterHierarchy`, `useCostCenterReport`, `useCreateCostCenter`, `useUpdateCostCenter`, `useDeleteCostCenter` |
| Endpunkte | `GET /cost-centers`, `GET /cost-centers/:id`, `GET /cost-centers/hierarchy`, `GET /cost-centers/report`, `POST /cost-centers`, `PUT /cost-centers/:id`, `DELETE /cost-centers/:id` |

### Anlagevermögen (Fixed Assets)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-fixed-assets.ts` |
| Hooks | `useFixedAssets`, `useFixedAsset`, `useFixedAssetStatistics`, `useDepreciationSchedule`, `useCreateFixedAsset`, `useUpdateFixedAsset`, `useRunDepreciation`, `useDisposeFixedAsset` |
| Endpunkte | `GET /fixed-assets`, `GET /fixed-assets/:id`, `GET /fixed-assets/statistics`, `GET /fixed-assets/:id/depreciation-schedule`, `POST /fixed-assets`, `PUT /fixed-assets/:id`, `POST /fixed-assets/run-depreciation`, `POST /fixed-assets/:id/dispose` |
| Stats | `{ totalAssets, totalValue, totalDepreciation, categoryBreakdown[] }` |

### Quellensteuer (Withholding Tax)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-withholding-tax.ts` |
| Hooks | `useQstEmployees`, `useQstEmployee`, `useQstStatistics`, `useQstMonthlyReport`, `useAssignQstData`, `useUpdateQstData`, `useCalculateQst`, `useQstAnnualReconciliation` |
| Endpunkte | `GET /withholding-tax`, `GET /withholding-tax/employee/:id`, `GET /withholding-tax/statistics`, `GET /withholding-tax/report/:year/:month`, `POST /withholding-tax/employee`, `PUT /withholding-tax/employee/:id`, `POST /withholding-tax/calculate`, `POST /withholding-tax/reconciliation` |

---

## 👥 Personal (HR)

### Mitarbeiter (Employees)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-employees.ts` |
| Hooks | `useEmployees`, `useEmployee`, `useEmployeeStats`, `useDepartments`, `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee` |
| Endpunkte | `GET /employees`, `GET /employees/:id`, `GET /employees/stats`, `GET /employees/departments`, `POST /employees`, `PUT /employees/:id`, `DELETE /employees/:id` |
| Filter | `?search, department, status, page, pageSize` |
| Stats | `{ totalEmployees, activeEmployees, newThisMonth, departmentBreakdown[] }` |

### Abteilungen (Departments)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-departments.ts` |
| Hooks | `useDepartments`, `useDepartment`, `useCreateDepartment`, `useUpdateDepartment`, `useDeleteDepartment` |
| Endpunkte | `GET /departments`, `GET /departments/:id`, `POST /departments`, `PUT /departments/:id`, `DELETE /departments/:id` |

### Abwesenheiten (Absences)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-absences.ts` |
| Hooks | `useAbsences`, `useAbsence`, `useCreateAbsence`, `useUpdateAbsence`, `useDeleteAbsence` |
| Endpunkte | `GET /absences`, `GET /absences/:id`, `POST /absences`, `PUT /absences/:id`, `DELETE /absences/:id` |
| Filter | `?employeeId, type, status, startDate, endDate, page, pageSize` |

### Zeiterfassung (Time Entries)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-time-entries.ts` |
| Hooks | `useTimeEntries`, `useAllTimeEntries`, `useTimeEntryStats`, `useApprovalStats`, `useCreateTimeEntry`, `useUpdateTimeEntry`, `useDeleteTimeEntry`, `useApproveTimeEntries` |
| Endpunkte | `GET /time-entries`, `GET /time-entries/all`, `GET /time-entries/stats`, `GET /time-entries/approval-stats`, `POST /time-entries`, `PUT /time-entries/:id`, `DELETE /time-entries/:id`, `POST /time-entries/approve` |
| Stats | `{ todayHours, weekHours, monthHours, billableHours, projectBreakdown[] }` |
| Approval | `{ ids[], status: 'pending'|'approved'|'rejected', reason? }` |

### Kalender (Calendar)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-calendar.ts` |
| Hooks | `useCalendarEvents`, `useCalendarEvent`, `useCreateCalendarEvent`, `useUpdateCalendarEvent`, `useDeleteCalendarEvent` |
| Endpunkte | `GET /calendar`, `GET /calendar/:id`, `POST /calendar`, `PUT /calendar/:id`, `DELETE /calendar/:id` |
| Filter | `?startDate, endDate, type, projectId, employeeId` |

### Swissdec (Lohnmeldung)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-swissdec.ts` |
| Hooks | `useSwissdecSubmissions`, `useSwissdecSubmission`, `useSwissdecStatistics`, `useSwissdecXml`, `useAnnualCertificate`, `useCreateSwissdecSubmission`, `useValidateSwissdecSubmission`, `useSubmitSwissdec` |
| Endpunkte | `GET /swissdec`, `GET /swissdec/:id`, `GET /swissdec/statistics/:year`, `GET /swissdec/:id/xml`, `GET /swissdec/certificate/:employeeId/:year`, `POST /swissdec`, `POST /swissdec/:id/validate`, `POST /swissdec/:id/submit` |

### GAV Metallbau
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-gav-metallbau.ts` |
| Hooks | `useGavSettings`, `useUpdateGavSettings`, `useGavEmployees`, `useGavEmployee`, `useAssignGavClass`, `useUpdateGavClass`, `useCalculateGavSalary`, `useGavCompliance`, `useGavMinimumRates` |
| Endpunkte | `GET /gav-metallbau/settings/:year`, `PUT /gav-metallbau/settings`, `GET /gav-metallbau/employees`, `GET /gav-metallbau/employees/:id`, `POST /gav-metallbau/employees`, `PUT /gav-metallbau/employees/:id`, `POST /gav-metallbau/calculate-salary`, `GET /gav-metallbau/compliance`, `GET /gav-metallbau/minimum-rates` |

### Recruiting
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-recruiting.ts` |
| Hooks | `useJobPostings`, `useJobPosting`, `useCreateJobPosting`, `useUpdateJobPosting`, `useDeleteJobPosting`, `usePublishJobPosting`, `useCandidates`, `useCandidatePipeline`, `useCandidate`, `useCreateCandidate`, `useUpdateCandidate`, `useDeleteCandidate`, `useHireCandidate`, `useCreateInterview`, `useUpdateInterview`, `useRecruitingStats` |
| Endpunkte | `GET /recruiting/jobs`, `GET /recruiting/jobs/:id`, `POST /recruiting/jobs`, `PUT /recruiting/jobs/:id`, `DELETE /recruiting/jobs/:id`, `POST /recruiting/jobs/:id/publish`, `GET /recruiting/candidates`, `GET /recruiting/candidates/pipeline`, `GET /recruiting/candidates/:id`, `POST /recruiting/candidates`, `PUT /recruiting/candidates/:id`, `DELETE /recruiting/candidates/:id`, `POST /recruiting/candidates/:id/hire`, `POST /recruiting/interviews`, `PUT /recruiting/interviews/:id`, `GET /recruiting/stats` |
| Stats | `{ openPositions, totalCandidates, interviewsThisWeek, averageTimeToHire, offerAcceptanceRate }` |

### Weiterbildung (Training)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-training.ts` |
| Hooks | `useTrainings`, `useTraining`, `useCreateTraining`, `useUpdateTraining`, `useDeleteTraining`, `useRegisterForTraining`, `useUpdateParticipant`, `useRemoveParticipant`, `useMarkTrainingComplete`, `useTrainingStats`, `useUpcomingTrainings`, `useEmployeeTrainings`, `useGenerateTrainingReport` |
| Endpunkte | `GET /training`, `GET /training/:id`, `POST /training`, `PUT /training/:id`, `DELETE /training/:id`, `POST /training/:id/participants`, `PUT /training/:id/participants/:participantId`, `DELETE /training/:id/participants/:participantId`, `POST /training/:id/complete`, `GET /training/stats`, `GET /training/upcoming`, `GET /training/employee/:employeeId`, `POST /training/report` |
| Stats | `{ totalTrainings, upcomingTrainings, completedThisYear, totalParticipants, averageRating, totalCost }` |

---

## 🏭 Produktion

### Stücklisten (BOM)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-bom.ts` |
| Hooks | `useBoms`, `useBom`, `useBomTemplates`, `useCreateBom`, `useDuplicateBom`, `useUpdateBom`, `useDeleteBom` |
| Endpunkte | `GET /bom`, `GET /bom/:id`, `GET /bom/templates`, `POST /bom`, `POST /bom/:id/duplicate`, `PUT /bom/:id`, `DELETE /bom/:id` |

### Werkstattaufträge (Production Orders)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-production-orders.ts` |
| Hooks | `useProductionOrders`, `useProductionOrder`, `useProductionStatistics`, `useCapacityOverview`, `useCreateProductionOrder`, `useUpdateProductionOrder`, `useBookProductionTime`, `useCompleteProductionOperation`, `useDeleteProductionOrder` |
| Endpunkte | `GET /production-orders`, `GET /production-orders/:id`, `GET /production-orders/statistics`, `GET /production-orders/capacity`, `POST /production-orders`, `PUT /production-orders/:id`, `POST /production-orders/:id/book-time`, `POST /production-orders/:id/operations/:operationId/complete`, `DELETE /production-orders/:id` |
| Stats | `{ totalOrders, inProgress, completed, utilizationRate }` |

### Qualitätskontrolle (Quality Control)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-quality-control.ts` |
| Hooks | `useQualityChecklists`, `useQualityChecklist`, `useChecklistTemplates`, `useCreateQualityChecklist`, `useUpdateQualityChecklist`, `useDeleteQualityChecklist`, `useQualityChecks`, `useQualityCheck`, `useQualityStatistics`, `useCreateQualityCheck`, `useUpdateQualityCheck`, `useCompleteQualityCheck`, `useDeleteQualityCheck` |
| Endpunkte | `GET /quality/checklists`, `GET /quality/checklists/:id`, `GET /quality/checklists/templates`, `POST /quality/checklists`, `PUT /quality/checklists/:id`, `DELETE /quality/checklists/:id`, `GET /quality/checks`, `GET /quality/checks/:id`, `GET /quality/checks/statistics`, `POST /quality/checks`, `PUT /quality/checks/:id`, `POST /quality/checks/:id/complete`, `DELETE /quality/checks/:id` |
| Stats | `{ totalChecks, passedChecks, failedChecks, passRate, pendingChecks }` |

---

## 🎯 Marketing & E-Commerce

### Marketing (Kampagnen, Leads, E-Mail)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-marketing.ts` |
| Hooks | `useCampaigns`, `useCampaign`, `useCreateCampaign`, `useUpdateCampaign`, `useDeleteCampaign`, `useLeads`, `useLead`, `useCreateLead`, `useUpdateLead`, `useDeleteLead`, `useLeadActivities`, `useCreateLeadActivity`, `useConvertLead`, `useEmailCampaigns`, `useCreateEmailCampaign`, `useSendEmailCampaign`, `useMarketingStats` |
| Endpunkte | `GET /marketing/campaigns`, `GET /marketing/campaigns/:id`, `POST /marketing/campaigns`, `PUT /marketing/campaigns/:id`, `DELETE /marketing/campaigns/:id`, `GET /marketing/campaigns/stats`, `GET /marketing/leads`, `GET /marketing/leads/:id`, `POST /marketing/leads`, `PUT /marketing/leads/:id`, `DELETE /marketing/leads/:id`, `GET /marketing/leads/:id/activities`, `POST /marketing/leads/activities`, `POST /marketing/leads/convert`, `GET /marketing/leads/stats`, `GET /marketing/email-campaigns`, `POST /marketing/email-campaigns`, `POST /marketing/email-campaigns/:id/send` |

### E-Commerce / Online-Shop
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-ecommerce.ts` |
| Hooks | `useShopOrders`, `useShopOrder`, `useUpdateShopOrder`, `useUpdateShopOrderStatus`, `useCancelShopOrder`, `useDiscounts`, `useDiscount`, `useCreateDiscount`, `useUpdateDiscount`, `useDeleteDiscount`, `useValidateDiscountCode`, `useReviews`, `useModerateReview`, `useApproveReview`, `useRespondToReview`, `useDeleteReview`, `useEcommerceStats` |
| Endpunkte | `GET /ecommerce/orders`, `GET /ecommerce/orders/:id`, `PUT /ecommerce/orders/:id`, `POST /ecommerce/orders/:id/cancel`, `GET /ecommerce/orders/stats`, `GET /ecommerce/discounts`, `GET /ecommerce/discounts/:id`, `POST /ecommerce/discounts`, `PUT /ecommerce/discounts/:id`, `DELETE /ecommerce/discounts/:id`, `POST /ecommerce/discounts/validate`, `GET /ecommerce/reviews`, `PUT /ecommerce/reviews/:id`, `DELETE /ecommerce/reviews/:id`, `GET /ecommerce/reviews/stats` |

---

## 🔧 Service & Support

### Service-Tickets
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-service-tickets.ts` |
| Hooks | `useServiceTickets`, `useServiceTicket`, `useServiceStatistics`, `useUpcomingMaintenance`, `useTechnicianAvailability`, `useCreateServiceTicket`, `useUpdateServiceTicket`, `useAddServiceReport`, `useScheduleTechnician`, `useDeleteServiceTicket` |
| Endpunkte | `GET /service-tickets`, `GET /service-tickets/:id`, `GET /service-tickets/statistics`, `GET /service-tickets/upcoming-maintenance`, `GET /service-tickets/technician-availability/:id`, `POST /service-tickets`, `PUT /service-tickets/:id`, `POST /service-tickets/:id/report`, `POST /service-tickets/:id/schedule`, `DELETE /service-tickets/:id` |
| Stats | `{ totalTickets, openTickets, scheduledTickets, completedThisMonth, averageResolutionTime }` |

---

## 📨 Nachrichten (Messages)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-messages.ts` |
| Hooks | `useMessages`, `useSendMessage` |
| Endpunkte | `GET /messages`, `POST /messages` |
| Filter | `?projectId, taskId, pageSize` |

---

## 📈 Reporting & Audit

### Berichte (Reports)
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-reports.ts` |
| Hooks | `useAvailableReports`, `useGenerateReport`, `useProfitLossReport`, `useBalanceSheetReport`, `usePayrollSummaryReport`, `useGavComplianceReport`, `useProjectProfitabilityReport`, `useOpenItemsReport`, `useBudgetComparisonReport`, `useSalesAnalysisReport`, `useWithholdingTaxReport` |
| Endpunkte | `GET /reports/available`, `POST /reports/generate`, `GET /reports/profit-loss`, `GET /reports/balance-sheet`, `GET /reports/payroll-summary`, `GET /reports/gav-compliance`, `GET /reports/project-profitability`, `GET /reports/open-items`, `GET /reports/budget-comparison`, `GET /reports/sales-analysis`, `GET /reports/withholding-tax` |
| Report-Typen | `PROFIT_LOSS, BALANCE_SHEET, CASH_FLOW, VAT_SUMMARY, BUDGET_COMPARISON, COST_CENTER_ANALYSIS, OPEN_ITEMS, PAYROLL_SUMMARY, GAV_COMPLIANCE, WITHHOLDING_TAX, EMPLOYEE_COSTS, ABSENCE_OVERVIEW, PROJECT_PROFITABILITY, PRODUCTION_OVERVIEW, INVENTORY_VALUATION, SALES_ANALYSIS, PURCHASE_ANALYSIS` |

### Audit-Log
| Baustein | Details |
|----------|---------|
| Hook-Datei | `src/hooks/use-audit-log.ts` |
| Hooks | `useAuditLogs`, `useAuditLog`, `useEntityHistory`, `useUserActivity`, `useAuditLogStats`, `useExportAuditLogs` |
| Endpunkte | `GET /audit-log`, `GET /audit-log/:id`, `GET /audit-log/entity/:entityType/:entityId`, `GET /audit-log/statistics`, `GET /audit-log/export` |
| Filter | `?search, action, entityType, entityId, userId, startDate, endDate, page, pageSize` |

---

## 🔄 PDF & E-Mail (API-Client Helpers)

| Funktion | Endpunkt | Details |
|----------|----------|---------|
| `downloadPdf()` | `GET /:entityType/:id/pdf` | Unterstützt: `invoices`, `quotes`, `credit-notes`, `delivery-notes`, `reminders` |
| `sendEmail()` | `POST /:entityType/:id/send` | Unterstützt: `invoices`, `quotes`, `reminders` |

---

## ⚠️ BEKANNTE PROBLEME & MISMATCHES

### 1. Tasks Status-Mismatch
- **Frontend** definiert: `TODO | IN_PROGRESS | DONE | CANCELLED`
- **Backend DTO** definiert: `TODO | IN_PROGRESS | REVIEW | DONE`
- **Aktion**: Backend oder Frontend muss angepasst werden

### 2. Tasks Unteraufgaben/Kommentare/Anhänge
- Frontend-Types unterstützen `subtasks[]`, `comments[]`, `attachments[]`
- Backend braucht dedizierte Controller-Routen für CRUD dieser Sub-Resources
- **Aktion**: Backend-Routen freischalten (Service-Logik existiert bereits)

### 3. Doppelte Invoice-Hooks
- `use-invoices.ts` und `use-sales.ts` haben beide Invoice-Hooks
- Backend muss beide Feld-Formate unterstützen (oder Frontend konsolidieren)

### 4. Response-Mapper Konsistenz
- Backend nutzt `response.mapper.ts` für Feld-Mapping
- Alle neuen Module müssen denselben Mapper nutzen
- Frontend erwartet konsistent camelCase

---

## 📊 Zusammenfassung

| Kategorie | Module | Hooks gesamt | Endpunkte gesamt |
|-----------|--------|-------------|-----------------|
| Infrastruktur | Auth, Dashboard, Company, Settings, Users | ~20 | ~25 |
| CRM | Kunden, Lieferanten, Kontakte | ~15 | ~18 |
| Produkte | Products, Categories, Stock | ~9 | ~10 |
| Verkauf | Quotes, Orders, Invoices, Delivery Notes, Credit Notes, Reminders | ~40 | ~45 |
| Einkauf | Purchase Orders, Purchase Invoices, Goods Receipts | ~20 | ~22 |
| Projekte | Projects, Tasks, Calculations | ~18 | ~20 |
| Verträge/Docs | Contracts, Documents/DMS | ~25 | ~28 |
| Buchhaltung | Accounts, Journal, Cash Book, Payments, Bank Import, VAT, Budgets, Cost Centers, Fixed Assets, QST | ~55 | ~60 |
| Personal | Employees, Departments, Absences, Time Entries, Calendar, Swissdec, GAV, Recruiting, Training | ~50 | ~55 |
| Produktion | BOM, Production Orders, Quality Control | ~20 | ~22 |
| Marketing/Shop | Marketing, E-Commerce | ~25 | ~28 |
| Service | Service Tickets | ~10 | ~11 |
| Nachrichten | Messages | ~2 | ~2 |
| Reporting | Reports, Audit Log | ~15 | ~16 |
| **TOTAL** | **~40 Module** | **~320+ Hooks** | **~360+ Endpunkte** |
