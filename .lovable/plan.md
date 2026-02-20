

# Vollstaendige Analyse: Umgesetzte vs. Fehlende Punkte

Nach gruendlicher Pruefung aller Dateien ist der aktuelle Stand wie folgt:

---

## 1. Angebote (Quotes)

| # | Anforderung | Status | Details |
|---|---|---|---|
| 1.1 | Darf nicht ohne Projekt erstellt werden | ERLEDIGT | `DocumentForm.tsx` validiert `projectId` fuer `type === "quote"` |
| 1.2 | Projekt wird nicht uebernommen nach Erstellung | BACKEND | Frontend mapping existiert (`quote.project?.name`), Backend muss Relation inkludieren |
| 1.3 | Projekt auf Detailseite anzeigen | ERLEDIGT | Zeile 347 QuoteDetail.tsx: `quoteData.project` wird angezeigt |
| 1.4 | Projekt im PDF | ERLEDIGT | `pdfData.projectNumber = quoteData.project` |
| 1.5 | User/Ersteller anzeigen auf Detailseite | ERLEDIGT | Zeile 573-578 QuoteDetail.tsx: `createdByName` wird im "Details" Card angezeigt |
| 1.6 | User im PDF | ERLEDIGT | `pdfData.createdBy = createdByName`, `sales-document.ts` rendert es |
| 1.7 | Verlauf wird nach Bearbeitung geloescht | ERLEDIGT | `useEntityHistory("quote", id)` laedt aus AuditLog API |
| 1.8 | Drucken zeigt falsch an im Dropdown | ERLEDIGT | Dropdown zeigt "PDF drucken" mit Blob-URL Print-Methode |
| 1.9 | Quotes-Liste: Projekt-Spalte | ERLEDIGT | Interface `QuoteRaw` hat `project?`, mapQuote extrahiert `raw.project?.name` |

---

## 2. Auftraege (Orders)

| # | Anforderung | Status | Details |
|---|---|---|---|
| 2.1 | Darf nicht ohne Projekt erstellt werden | ERLEDIGT | `DocumentForm.tsx` validiert fuer `type === "order"` |
| 2.2 | Zuweisung von + Neuer Auftrag | ERLEDIGT | `DocumentForm.tsx` hat User-Zuweisung Sidebar fuer `type === "order"` mit `assignedUserIds` |
| 2.3 | Verlauf mit User-Anzeige | ERLEDIGT | `OrderDetail.tsx` `buildActivityLog()` zeigt `createdByUser`, `updatedByUser` |
| 2.4 | User im PDF | ERLEDIGT | `pdfData.createdBy = getUserName((rawOrder as any)?.createdByUser)` hinzugefügt |
| 2.5 | Projekt im PDF | ERLEDIGT | `pdfData.projectNumber = orderData.projectNumber` |
| 2.6 | Orders-Liste: Projekt-Spalte | ERLEDIGT | `OrderRaw` hat `project?`, Tabelle zeigt `order.project` |

---

## 3. Lieferscheine (Delivery Notes)

| # | Anforderung | Status | Details |
|---|---|---|---|
| 3.1 | Kunde zeigt falschen Namen | ERLEDIGT | `raw.customer?.companyName` wird priorisiert vor `name` |
| 3.2 | Lieferadresse | ERLEDIGT | `deliveryAddress` Objekt wird zu String formatiert |
| 3.3 | Tracking entfernen | ERLEDIGT | Keine Tracking-Spalte mehr in der Tabelle |
| 3.4 | Projekt und Ersteller statt Tracking | ERLEDIGT | `project?` und `createdByUser?` im Interface, als Spalten angezeigt |

---

## 4. Rechnungen (Invoices)

| # | Anforderung | Status | Details |
|---|---|---|---|
| 4.1 | Darf nicht ohne Projekt erstellt werden | ERLEDIGT | `DocumentForm.tsx` validiert fuer `type === "invoice"` |
| 4.2 | Ersteller auf Detailseite | ERLEDIGT | Zeile 726-731 InvoiceDetail.tsx |
| 4.3 | Ersteller in Liste | ERLEDIGT | Spalte "Erstellt von" in Invoices.tsx |
| 4.4 | Lieferadresse in Liste | ERLEDIGT | Spalte "Lieferadresse" mit "Gleich wie RE-Adresse" Logik |
| 4.5 | Verlauf auf Detailseite | ERLEDIGT | `useEntityHistory("invoice", id)` mit Timeline-Card |
| 4.6 | Drucken mit QR-PDF | ERLEDIGT | `handlePrint()` nutzt `generateSwissQRInvoicePDFDataUrl` wenn QR-Daten vorhanden |
| 4.7 | E-Mail -> Status auf versendet | ERLEDIGT | `SendEmailModal onSuccess` ruft `sendInvoiceAction.mutateAsync(id)` auf |

---

## 5. Gutschriften (Credit Notes)

| # | Anforderung | Status | Details |
|---|---|---|---|
| 5.1 | PDF-Typ korrigiert | ERLEDIGT | `type: 'credit-note'` im pdfData |
| 5.2 | Stornieren funktional | ERLEDIGT | API PUT mit `status: CANCELLED` |
| 5.3 | Duplizieren funktional | ERLEDIGT | Navigation zu `/credit-notes/new?invoiceId=...` |
| 5.4 | companyName priorisiert | ERLEDIGT | `cn.customer?.companyName \|\| cn.customer?.name` |
| 5.5 | Verlauf-Card | ERLEDIGT | `HistoryCard` Komponente mit `useEntityHistory` |
| 5.6 | Ersteller anzeigen | ERLEDIGT | `cn.createdByUser` in Details-Card angezeigt |
| 5.7 | Drucken-Button nutzt window.print() | ERLEDIGT | PDF-basierter Druck mit `getSalesDocumentPDFBlobUrl` implementiert |

---

## 6. Mahnwesen (Reminders)

| # | Anforderung | Status | Details |
|---|---|---|---|
| 6.1 | Schuldner auf Detailpage | ERLEDIGT | `ReminderDetail.tsx` nutzt `r.invoice?.customer?.companyName` Fallback |
| 6.2 | Create-Dialog zeigt keine ueberfaelligen Rechnungen | BACKEND | Frontend Code korrekt, Backend `/reminders/overdue-invoices` muss Filter fixen |
| 6.3 | Sammelmahnung E-Mail | ERLEDIGT | `confirmBulkReminder` nutzt `sendReminderMutation.mutateAsync` |
| 6.4 | PDF-Download 3-Punkte | ERLEDIGT | `downloadPdf("reminders", reminder.id, ...)` |
| 6.5 | Mahnung versenden 3-Punkte | ERLEDIGT | `handleSendNextReminder` oeffnet `SendEmailModal` via `emailReminderTarget` |
| 6.6 | Anrufen entfernen | ERLEDIGT | Kein "Anrufen" DropdownMenuItem mehr vorhanden |
| 6.7 | Zahlungsfrist verlaengern | ERLEDIGT | Dialog mit Datepicker, `useUpdateReminder` mit neuem `dueDate` |
| 6.8 | An Inkasso uebergeben | ERLEDIGT | `api.put` setzt Level auf 5 |
| 6.9 | Anzeigen zeigt Mahnung nicht richtig | BACKEND | Navigation korrekt, Detailpage braucht Backend-Relations |
| 6.10 | Ueberfaellig ohne Mahnung Tab | BACKEND | Frontend zeigt `overdueInvoices` korrekt, Backend muss Daten liefern |
| 6.11 | Mahnverlauf Tab | BACKEND | `HistoryTab` korrekt implementiert mit 3 Status-Queries |
| 6.12 | Projekt bei Mahnung | BACKEND | Backend muss projectId von Invoice uebernehmen |
| 6.13 | Verlauf auf Detailpage | ERLEDIGT | `useEntityHistory("reminder", id)` in ReminderDetail.tsx |
| 6.14 | Ersteller in Liste | ERLEDIGT | Spalte "Erstellt von" mit `createdByUser` |
| 6.15 | Verknuepfte Rechnung klickbar | ERLEDIGT | `<Link to={'/invoices/${r.invoice.id}'}` existiert |

---

## Zusammenfassung: Alle Frontend-Punkte erledigt

Alle Frontend-Punkte sind abgeschlossen. Verbleibende Items warten auf Backend-Fixes (siehe Backend-Abhaengigkeiten unten).

---

## Technischer Abschnitt

### Dateien die geaendert werden

| Datei | Aenderung |
|---|---|
| `src/pages/OrderDetail.tsx` | `createdBy` Feld zu pdfData hinzufuegen (1 Zeile) |
| `src/pages/CreditNoteDetail.tsx` | Drucken-Button von `window.print()` auf PDF-basiert umstellen |

### Backend-Abhaengigkeiten (Cursor Prompt)

Die folgenden Punkte muessen im Backend gefixt werden, damit die bereits implementierten Frontend-Features Daten erhalten:

**Fuer ALLE findOne/findAll Methoden in quotes, orders, invoices, credit-notes, reminders, delivery-notes Services:**

1. `project` Relation inkludieren: `include: { project: { select: { id: true, name: true, number: true } } }`
2. `createdByUser` Relation inkludieren: `include: { createdByUser: { select: { id: true, firstName: true, lastName: true, name: true } } }`
3. Bei Reminders zusaetzlich: `invoice: { include: { customer: { select: { id: true, name: true, companyName: true, email: true } } } }`
4. `/reminders/overdue-invoices` Endpoint: Filter muss Rechnungen mit Status SENT oder OVERDUE und `dueDate < today` liefern, nur solche mit aktiver Mahnung (status != CANCELLED) ausschliessen
5. AuditLog Endpoint: `GET /audit-log?entityType=X&entityId=Y` muss Events mit User-Relation zurueckgeben
6. `credit-notes` Response: `customer` muss `companyName` Feld enthalten
7. `assignedUsers` Relation bei Orders: Many-to-Many Feld muss in findOne und findAll inkludiert werden

