

# Vollstaendige Analyse: Umgesetzte vs. Fehlende Punkte

Nach gruendlicher Pruefung aller Dateien ist der aktuelle Stand wie folgt:

---

## 1. Angebote (Quotes)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 1.1 | Darf nicht ohne Projekt erstellt werden | ✅ Nicht noetig | ✅ Erledigt | `DocumentForm.tsx` validiert `projectId` fuer `type === "quote"` |
| 1.2 | Projekt wird nicht uebernommen nach Erstellung | ⏳ Offen | ✅ Erledigt | Frontend mapping existiert (`quote.project?.name`), Backend muss `project` Relation inkludieren |
| 1.3 | Projekt auf Detailseite anzeigen | ⏳ Offen | ✅ Erledigt | `quoteData.project` wird angezeigt, wartet auf Backend-Relation |
| 1.4 | Projekt im PDF | ⏳ Offen | ✅ Erledigt | `pdfData.projectNumber = quoteData.project`, wartet auf Backend-Daten |
| 1.5 | User/Ersteller anzeigen auf Detailseite | ⏳ Offen | ✅ Erledigt | `createdByName` im "Details" Card, wartet auf `createdByUser` Relation |
| 1.6 | User im PDF | ⏳ Offen | ✅ Erledigt | `pdfData.createdBy = createdByName`, wartet auf Backend-Daten |
| 1.7 | Verlauf wird nach Bearbeitung geloescht | ⏳ Offen | ✅ Erledigt | `useEntityHistory("quote", id)`, wartet auf AuditLog-Endpoint |
| 1.8 | Drucken zeigt falsch an im Dropdown | ✅ Nicht noetig | ✅ Erledigt | Dropdown zeigt "PDF drucken" mit Blob-URL Print-Methode |
| 1.9 | Quotes-Liste: Projekt-Spalte | ⏳ Offen | ✅ Erledigt | `raw.project?.name`, wartet auf Backend `project` Relation |

---

## 2. Auftraege (Orders)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 2.1 | Darf nicht ohne Projekt erstellt werden | ✅ Nicht noetig | ✅ Erledigt | `DocumentForm.tsx` validiert fuer `type === "order"` |
| 2.2 | Zuweisung von + Neuer Auftrag | ⏳ Offen | ✅ Erledigt | `assignedUserIds` in Sidebar, wartet auf `assignedUsers` Relation |
| 2.3 | Verlauf mit User-Anzeige | ⏳ Offen | ✅ Erledigt | `buildActivityLog()` zeigt `createdByUser`, wartet auf Backend-Relation |
| 2.4 | User im PDF | ⏳ Offen | ✅ Erledigt | `pdfData.createdBy = getUserName(...)`, wartet auf `createdByUser` |
| 2.5 | Projekt im PDF | ⏳ Offen | ✅ Erledigt | `pdfData.projectNumber`, wartet auf Backend `project` Relation |
| 2.6 | Orders-Liste: Projekt-Spalte | ⏳ Offen | ✅ Erledigt | `order.project`, wartet auf Backend `project` Relation |

---

## 3. Lieferscheine (Delivery Notes)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 3.1 | Kunde zeigt falschen Namen | ⏳ Offen | ✅ Erledigt | `raw.customer?.companyName` priorisiert, wartet auf `companyName` Feld |
| 3.2 | Lieferadresse | ⏳ Offen | ✅ Erledigt | `deliveryAddress` Objekt formatiert, wartet auf Backend JSON-Struktur |
| 3.3 | Tracking entfernen | ✅ Nicht noetig | ✅ Erledigt | Tracking-Spalte komplett entfernt |
| 3.4 | Projekt und Ersteller statt Tracking | ⏳ Offen | ✅ Erledigt | Spalten vorhanden, warten auf `project` und `createdByUser` Relations |

---

## 4. Rechnungen (Invoices)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 4.1 | Darf nicht ohne Projekt erstellt werden | ✅ Nicht noetig | ✅ Erledigt | `DocumentForm.tsx` validiert fuer `type === "invoice"` |
| 4.2 | Ersteller auf Detailseite | ⏳ Offen | ✅ Erledigt | Anzeige vorhanden, wartet auf `createdByUser` Relation |
| 4.3 | Ersteller in Liste | ⏳ Offen | ✅ Erledigt | Spalte "Erstellt von", wartet auf Backend-Daten |
| 4.4 | Lieferadresse in Liste | ✅ Nicht noetig | ✅ Erledigt | "Gleich wie RE-Adresse" Logik funktioniert |
| 4.5 | Verlauf auf Detailseite | ⏳ Offen | ✅ Erledigt | `useEntityHistory("invoice", id)`, wartet auf AuditLog-Endpoint |
| 4.6 | Drucken mit QR-PDF | ✅ Nicht noetig | ✅ Erledigt | `generateSwissQRInvoicePDFDataUrl` wenn QR-Daten vorhanden |
| 4.7 | E-Mail -> Status auf versendet | ✅ Nicht noetig | ✅ Erledigt | `sendInvoiceAction.mutateAsync(id)` nach Email-Versand |

---

## 5. Gutschriften (Credit Notes)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 5.1 | PDF-Typ korrigiert | ✅ Nicht noetig | ✅ Erledigt | `type: 'credit-note'` im pdfData |
| 5.2 | Stornieren funktional | ✅ Nicht noetig | ✅ Erledigt | API PUT mit `status: CANCELLED` |
| 5.3 | Duplizieren funktional | ✅ Nicht noetig | ✅ Erledigt | Navigation zu `/credit-notes/new?invoiceId=...` |
| 5.4 | companyName priorisiert | ⏳ Offen | ✅ Erledigt | `cn.customer?.companyName`, wartet auf `companyName` im Backend |
| 5.5 | Verlauf-Card | ⏳ Offen | ✅ Erledigt | `HistoryCard` mit `useEntityHistory`, wartet auf AuditLog-Endpoint |
| 5.6 | Ersteller anzeigen | ⏳ Offen | ✅ Erledigt | `cn.createdByUser` angezeigt, wartet auf Backend-Relation |
| 5.7 | Drucken-Button PDF-basiert | ✅ Nicht noetig | ✅ Erledigt | `getSalesDocumentPDFBlobUrl` implementiert |

---

## 6. Mahnwesen (Reminders)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 6.1 | Schuldner auf Detailpage | ⏳ Offen | ✅ Erledigt | Fallback-Kette vorhanden, wartet auf `invoice.customer` Relation |
| 6.2 | Create-Dialog: ueberfaellige Rechnungen | ⏳ Offen | ✅ Erledigt | Frontend korrekt, Backend `/reminders/overdue-invoices` Filter muss gefixt werden |
| 6.3 | Sammelmahnung E-Mail | ✅ Nicht noetig | ✅ Erledigt | `sendReminderMutation.mutateAsync` |
| 6.4 | PDF-Download 3-Punkte | ✅ Nicht noetig | ✅ Erledigt | `downloadPdf("reminders", ...)` |
| 6.5 | Mahnung versenden 3-Punkte | ✅ Nicht noetig | ✅ Erledigt | `SendEmailModal` via `emailReminderTarget` |
| 6.6 | Anrufen entfernen | ✅ Nicht noetig | ✅ Erledigt | Komplett entfernt |
| 6.7 | Zahlungsfrist verlaengern | ✅ Nicht noetig | ✅ Erledigt | Dialog mit Datepicker, `useUpdateReminder` |
| 6.8 | An Inkasso uebergeben | ✅ Nicht noetig | ✅ Erledigt | `api.put` setzt Level auf 5 |
| 6.9 | Anzeigen zeigt Mahnung nicht richtig | ⏳ Offen | ✅ Erledigt | Navigation korrekt, Detailpage wartet auf Backend-Relations |
| 6.10 | Ueberfaellig ohne Mahnung Tab | ⏳ Offen | ✅ Erledigt | Frontend zeigt `overdueInvoices`, Backend muss Daten liefern |
| 6.11 | Mahnverlauf Tab | ⏳ Offen | ✅ Erledigt | `HistoryTab` implementiert, wartet auf Backend-Daten |
| 6.12 | Projekt bei Mahnung | ⏳ Offen | ✅ Erledigt | Backend muss projectId von Invoice uebernehmen |
| 6.13 | Verlauf auf Detailpage | ⏳ Offen | ✅ Erledigt | `useEntityHistory("reminder", id)`, wartet auf AuditLog |
| 6.14 | Ersteller in Liste | ⏳ Offen | ✅ Erledigt | Spalte "Erstellt von", wartet auf `createdByUser` |
| 6.15 | Verknuepfte Rechnung klickbar | ⏳ Offen | ✅ Erledigt | `Link` vorhanden, wartet auf `invoice` Relation |

---

## Zusammenfassung

| Modul | Frontend | Backend |
|---|---|---|
| Angebote | ✅ 9/9 | ⏳ 6 offen |
| Auftraege | ✅ 6/6 | ⏳ 5 offen |
| Lieferscheine | ✅ 4/4 | ⏳ 3 offen |
| Rechnungen | ✅ 7/7 | ⏳ 2 offen |
| Gutschriften | ✅ 7/7 | ⏳ 3 offen |
| Mahnwesen | ✅ 15/15 | ⏳ 8 offen |
| **Total** | **✅ 48/48** | **⏳ 27 offen** |

---

## Backend-Abhaengigkeiten (Cursor Prompt)

Die folgenden Punkte muessen im Backend gefixt werden, damit die bereits implementierten Frontend-Features Daten erhalten:

**Fuer ALLE findOne/findAll Methoden in quotes, orders, invoices, credit-notes, reminders, delivery-notes Services:**

1. `project` Relation inkludieren: `include: { project: { select: { id: true, name: true, number: true } } }`
2. `createdByUser` Relation inkludieren: `include: { createdByUser: { select: { id: true, firstName: true, lastName: true, name: true } } }`
3. Bei Reminders zusaetzlich: `invoice: { include: { customer: { select: { id: true, name: true, companyName: true, email: true } } } }`
4. `/reminders/overdue-invoices` Endpoint: Filter muss Rechnungen mit Status SENT oder OVERDUE und `dueDate < today` liefern, nur solche mit aktiver Mahnung (status != CANCELLED) ausschliessen
5. AuditLog Endpoint: `GET /audit-log?entityType=X&entityId=Y` muss Events mit User-Relation zurueckgeben
6. `credit-notes` Response: `customer` muss `companyName` Feld enthalten
7. `assignedUsers` Relation bei Orders: Many-to-Many Feld muss in findOne und findAll inkludiert werden
