# Frontend Hook Plan — Anbindung an Backend-Endpoints (44 Phasen)

> Erstellt: 2026-02-12
> Status: ✅ ABGESCHLOSSEN

## Übersicht

Alle fehlenden Frontend-Hooks wurden implementiert, um die 44 Backend-Phasen vollständig abzudecken.
**Regel: Cursor darf KEIN Design/Frontend ändern — nur Backend.**

---

## Phase 1: Projects ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useDuplicateProject` | `POST /projects/:id/duplicate` | ✅ |

## Phase 2: Quotes ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useSendQuote` | `POST /quotes/:id/send` | ✅ |
| `useQuoteStats` | `GET /quotes/stats` | ✅ |
| `useDeleteQuote` | `DELETE /quotes/:id` | ✅ |

## Phase 3: Orders ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useOrderStats` | `GET /orders/stats` | ✅ |
| `useDeleteOrder` | `DELETE /orders/:id` | ✅ |
| `useCreateDeliveryNoteFromOrderAction` | `POST /orders/:id/create-delivery-note` | ✅ |

## Phase 4: Delivery Notes ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useDeliveryNoteStats` | `GET /delivery-notes/stats` | ✅ |

## Phase 5: Customers ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useCustomerContacts` | `GET /customers/:id/contacts` | ✅ |
| `useCreateCustomerContact` | `POST /customers/:id/contacts` | ✅ |
| `useUpdateCustomerContact` | `PUT /customers/:id/contacts/:contactId` | ✅ |
| `useDeleteCustomerContact` | `DELETE /customers/:id/contacts/:contactId` | ✅ |

## Phase 6: Finance ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useFinanceMonthlySummary` | `GET /finance/monthly-summary` | ✅ |

## Phase 7: Contracts ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useDuplicateContract` | `POST /contracts/:id/duplicate` | ✅ |

## Phase 8: Documents ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| `useShareDocument` | `POST /documents/:id/share` | ✅ |

## Phase 9: Tasks ✅
| Hook | Endpoint | Status |
|------|----------|--------|
| Task-Typen erweitert | comments, attachments, subtasks | ✅ |

## Phase 10: Settings ✅ (NEUER HOOK)
| Hook | Endpoint | Status |
|------|----------|--------|
| `useSettings` | `GET /settings` | ✅ |
| `useUpdateSettings` | `PUT /settings` | ✅ |
| `useTestSmtp` | `POST /settings/smtp/test` | ✅ |
| `useGenerateApiKey` | `POST /settings/generate-api-key` | ✅ |

---

## Bereits vorhandene Hooks (keine Änderung nötig)

Die folgenden Module hatten bereits vollständige Hooks:
- Invoices (CRUD + stats + payment + send + cancel)
- Products, Suppliers, Employees, Absences
- Time Entries, Calendar, Payments
- Credit Notes, Purchase Orders, Purchase Invoices
- Reminders, Marketing, Service Tickets
- Quality Control, Production Orders, BOM
- Budgets, Cost Centers, Fixed Assets
- VAT Returns, Withholding Tax, Bank Import
- Reports, Audit Log, E-Commerce, Training
- Journal Entries, Cash Book, Users

## Geänderte Dateien

1. `src/hooks/use-projects.ts` — `useDuplicateProject`
2. `src/hooks/use-sales.ts` — `useSendQuote`, `useQuoteStats`, `useDeleteQuote`, `useOrderStats`, `useDeleteOrder`, `useCreateDeliveryNoteFromOrderAction`
3. `src/hooks/use-delivery-notes.ts` — `useDeliveryNoteStats`
4. `src/hooks/use-customers.ts` — `useCustomerContacts` CRUD (4 hooks)
5. `src/hooks/use-finance.ts` — `useFinanceMonthlySummary`
6. `src/hooks/use-contracts.ts` — `useDuplicateContract`
7. `src/hooks/use-documents.ts` — `useShareDocument`
8. `src/hooks/use-tasks.ts` — Task-Typ erweitert (comments, attachments, subtasks)
9. `src/hooks/use-settings.ts` — **NEU** (useSettings, useUpdateSettings, useTestSmtp, useGenerateApiKey)
