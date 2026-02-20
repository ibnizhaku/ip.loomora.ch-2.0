


# Vollstaendige Analyse: Umgesetzte vs. Fehlende Punkte

Nach gruendlicher Pruefung aller Dateien ist der aktuelle Stand wie folgt:

---

## 1. Angebote (Quotes)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 1.1 | Darf nicht ohne Projekt erstellt werden | ✅ Nicht noetig | ✅ Erledigt | `DocumentForm.tsx` validiert `projectId` fuer `type === "quote"` |
| 1.2 | Projekt wird nicht uebernommen nach Erstellung | ✅ Erledigt | ✅ Erledigt | `projectId` in create/update nicht mehr auskommentiert, `project` Relation inkludiert |
| 1.3 | Projekt auf Detailseite anzeigen | ✅ Erledigt | ✅ Erledigt | Backend inkludiert `project` Relation in findOne/findAll |
| 1.4 | Projekt im PDF | ✅ Erledigt | ✅ Erledigt | Backend liefert `project`, Frontend setzt `pdfData.projectNumber` |
| 1.5 | User/Ersteller anzeigen auf Detailseite | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation in findOne/findAll inkludiert |
| 1.6 | User im PDF | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation vorhanden, Frontend setzt `pdfData.createdBy` |
| 1.7 | Verlauf wird nach Bearbeitung geloescht | ✅ Erledigt | ✅ Erledigt | `getEntityHistory()` inkludiert `user` Relation |
| 1.8 | Drucken zeigt falsch an im Dropdown | ✅ Nicht noetig | ✅ Erledigt | Dropdown zeigt "PDF drucken" mit Blob-URL Print-Methode |
| 1.9 | Quotes-Liste: Projekt-Spalte | ✅ Erledigt | ✅ Erledigt | `project` Relation in findAll inkludiert |

---

## 2. Auftraege (Orders)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 2.1 | Darf nicht ohne Projekt erstellt werden | ✅ Nicht noetig | ✅ Erledigt | `DocumentForm.tsx` validiert fuer `type === "order"` |
| 2.2 | Zuweisung von + Neuer Auftrag | ✅ Erledigt | ✅ Erledigt | `assignedUsers` Relation in findAll inkludiert |
| 2.3 | Verlauf mit User-Anzeige | ✅ Erledigt | ✅ Erledigt | `createdBy` und `updatedByUser` Relations inkludiert |
| 2.4 | User im PDF | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation vorhanden, Frontend setzt `pdfData.createdBy` |
| 2.5 | Projekt im PDF | ✅ Erledigt | ✅ Erledigt | `project` Relation inkludiert |
| 2.6 | Orders-Liste: Projekt-Spalte | ✅ Erledigt | ✅ Erledigt | `project` Relation in findAll inkludiert |

---

## 3. Lieferscheine (Delivery Notes)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 3.1 | Kunde zeigt falschen Namen | ✅ Erledigt | ✅ Erledigt | `customer.companyName` im select inkludiert |
| 3.2 | Lieferadresse | ✅ Erledigt | ✅ Erledigt | `deliveryAddress` wird aus Order uebernommen |
| 3.3 | Tracking entfernen | ✅ Nicht noetig | ✅ Erledigt | Tracking-Spalte komplett entfernt |
| 3.4 | Projekt und Ersteller statt Tracking | ✅ Erledigt | ✅ Erledigt | `project` (via order) und `createdBy` Relations inkludiert |

---

## 4. Rechnungen (Invoices)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 4.1 | Darf nicht ohne Projekt erstellt werden | ✅ Nicht noetig | ✅ Erledigt | `DocumentForm.tsx` validiert fuer `type === "invoice"` |
| 4.2 | Ersteller auf Detailseite | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation in findOne inkludiert |
| 4.3 | Ersteller in Liste | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation in findAll inkludiert |
| 4.4 | Lieferadresse in Liste | ✅ Nicht noetig | ✅ Erledigt | "Gleich wie RE-Adresse" Logik funktioniert |
| 4.5 | Verlauf auf Detailseite | ✅ Erledigt | ✅ Erledigt | `getEntityHistory()` inkludiert `user` Relation |
| 4.6 | Drucken mit QR-PDF | ✅ Nicht noetig | ✅ Erledigt | `generateSwissQRInvoicePDFDataUrl` wenn QR-Daten vorhanden |
| 4.7 | E-Mail -> Status auf versendet | ✅ Nicht noetig | ✅ Erledigt | `sendInvoiceAction.mutateAsync(id)` nach Email-Versand |

---

## 5. Gutschriften (Credit Notes)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 5.1 | PDF-Typ korrigiert | ✅ Nicht noetig | ✅ Erledigt | `type: 'credit-note'` im pdfData |
| 5.2 | Stornieren funktional | ✅ Nicht noetig | ✅ Erledigt | API PUT mit `status: CANCELLED` |
| 5.3 | Duplizieren funktional | ✅ Nicht noetig | ✅ Erledigt | Navigation zu `/credit-notes/new?invoiceId=...` |
| 5.4 | companyName priorisiert | ✅ Erledigt | ✅ Erledigt | `customer.companyName` im select inkludiert |
| 5.5 | Verlauf-Card | ✅ Erledigt | ✅ Erledigt | `getEntityHistory()` mit `user` Relation |
| 5.6 | Ersteller anzeigen | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation in findOne/findAll inkludiert |
| 5.7 | Drucken-Button PDF-basiert | ✅ Nicht noetig | ✅ Erledigt | `getSalesDocumentPDFBlobUrl` implementiert |

---

## 6. Mahnwesen (Reminders)

| # | Anforderung | Backend Status | Frontend Status | Details |
|---|---|---|---|---|
| 6.1 | Schuldner auf Detailpage | ✅ Erledigt | ✅ Erledigt | `invoice.customer` Relation in findOne inkludiert |
| 6.2 | Create-Dialog: ueberfaellige Rechnungen | ✅ Erledigt | ✅ Erledigt | `/reminders/overdue-invoices` filtert SENT/OVERDUE + dueDate < today + keine aktive Mahnung |
| 6.3 | Sammelmahnung E-Mail | ✅ Nicht noetig | ✅ Erledigt | `sendReminderMutation.mutateAsync` |
| 6.4 | PDF-Download 3-Punkte | ✅ Nicht noetig | ✅ Erledigt | `downloadPdf("reminders", ...)` |
| 6.5 | Mahnung versenden 3-Punkte | ✅ Nicht noetig | ✅ Erledigt | `SendEmailModal` via `emailReminderTarget` |
| 6.6 | Anrufen entfernen | ✅ Nicht noetig | ✅ Erledigt | Komplett entfernt |
| 6.7 | Zahlungsfrist verlaengern | ✅ Nicht noetig | ✅ Erledigt | Dialog mit Datepicker, `useUpdateReminder` |
| 6.8 | An Inkasso uebergeben | ✅ Nicht noetig | ✅ Erledigt | `api.put` setzt Level auf 5 |
| 6.9 | Anzeigen zeigt Mahnung nicht richtig | ✅ Erledigt | ✅ Erledigt | Backend liefert vollstaendige Relations fuer Detailpage |
| 6.10 | Ueberfaellig ohne Mahnung Tab | ✅ Erledigt | ✅ Erledigt | `getOverdueInvoices` Endpoint funktional |
| 6.11 | Mahnverlauf Tab | ✅ Erledigt | ✅ Erledigt | Backend liefert Daten, Frontend `HistoryTab` zeigt sie an |
| 6.12 | Projekt bei Mahnung | ✅ Erledigt | ✅ Erledigt | `projectId` wird von Invoice uebernommen, Schema hat `project` Relation |
| 6.13 | Verlauf auf Detailpage | ✅ Erledigt | ✅ Erledigt | `getEntityHistory()` mit `user` Relation |
| 6.14 | Ersteller in Liste | ✅ Erledigt | ✅ Erledigt | `createdBy` Relation in findAll inkludiert |
| 6.15 | Verknuepfte Rechnung klickbar | ✅ Erledigt | ✅ Erledigt | `invoice` Relation in findAll/findOne inkludiert |

---

## Zusammenfassung

| Modul | Frontend | Backend |
|---|---|---|
| Angebote | ✅ 9/9 | ✅ 9/9 |
| Auftraege | ✅ 6/6 | ✅ 6/6 |
| Lieferscheine | ✅ 4/4 | ✅ 4/4 |
| Rechnungen | ✅ 7/7 | ✅ 7/7 |
| Gutschriften | ✅ 7/7 | ✅ 7/7 |
| Mahnwesen | ✅ 15/15 | ✅ 15/15 |
| **Total** | **✅ 48/48** | **✅ 48/48** |

---

**🎉 ALLE PUNKTE SIND VOLLSTAENDIG UMGESETZT – FRONTEND UND BACKEND!**
