
# Fehlerbehebung: 5 Probleme in Rechnungen & Mahnwesen

## Problem 1: Button "Rechnung senden" statt "Rechnung erstellen"

**Ursache:** In `DocumentForm.tsx` Zeile 295 steht `sendLabel: "Rechnung senden"`.

**Fix:** Label auf `"Rechnung erstellen"` andern.

**Datei:** `src/components/documents/DocumentForm.tsx` (Zeile 295)

---

## Problem 2: QR-Referenznummer fehlt im Einzahlungsschein

**Analyse-Ergebnis:**
- Die PDF-Render-Logik in `swiss-qr-invoice.ts` (Zeilen 436-448, 552-565) ist korrekt implementiert -- Referenz wird gerendert wenn `data.reference` vorhanden und `referenceType !== "NON"`.
- Die `InvoiceDetail.tsx` (Zeile 238) liest `(rawInvoice as any)?.qrReference` -- wenn das Backend dieses Feld nicht liefert, wird der Fallback-Pfad (normales PDF ohne Zahlteil) genommen.
- Das `Invoice` Interface in `use-invoices.ts` hat `qrReference?: string` und `qrIban?: string` (wurde in vorheriger Session hinzugefuegt).
- **Kernproblem**: Das Backend liefert wahrscheinlich `qrReference` nicht in der API-Response. Solange das Backend-Feld fehlt, faellt der Code immer in den Else-Zweig (Zeile 299-308), der ein normales PDF ohne Zahlteil generiert und einen Toast "Kein Zahlteil: QR-Referenz fehlt" anzeigt.

**Frontend-Fix (Absicherung + bessere UX):**
- In InvoiceDetail: Klare visuelle Anzeige im Sidebar-Card "Bankverbindung" ob QR-Referenz vorhanden ist oder fehlt
- Im PDF-Download: Bereits korrekt implementiert -- wenn `qrReference` vom Backend kommt, wird der QR-Zahlteil generiert

**Dieser Punkt erfordert hauptsachlich einen Backend-Fix** (Cursor-Prompt wird geliefert).

---

## Problem 3: Rechnungsliste zeigt Kundenname statt Firmenname

**Ursache:** Das `Invoice` Interface hat nur `customer?: { id: string; name: string }`. Das Backend gibt unter `name` den Personennamen zurueck, nicht den Firmennamen.

**Fix:**
1. `use-invoices.ts`: Interface erweitern um `companyName?: string`
2. `Invoices.tsx` Zeile 364 (Kartenansicht) und Zeile 434 (Tabellenansicht): `invoice.customer?.companyName || invoice.customer?.name` anzeigen

**Dateien:**
- `src/hooks/use-invoices.ts` -- Interface erweitern
- `src/pages/Invoices.tsx` -- Zeilen 364 und 434 anpassen

---

## Problem 4: PDF soll 2 Seiten haben (Rechnung + Einzahlungsschein)

**Aktuelle Situation:** `generateSwissQRInvoicePDF` in `swiss-qr-invoice.ts` rendert den Zahlteil am unteren Rand von Seite 1 (ab Zeile 390). Bei langen Rechnungen mit vielen Positionen ueberlappen die Tabelle und der Zahlteil.

**Fix:** Zahlteil immer auf Seite 2 rendern:
- Nach den Rechnungspositionen und Totals eine neue Seite einfuegen (`doc.addPage()`)
- Zahlteil dann auf Seite 2 unten rendern (gleiche Position relativ zur Seitenunterseite)

**Datei:** `src/lib/pdf/swiss-qr-invoice.ts` -- Ab Zeile ~385: `doc.addPage()` vor dem Payment Part einfuegen, Koordinaten anpassen

---

## Problem 5: Mahnwesen -- 3 Bugs

### 5a: "Neue ueberfaellige Rechnungen" Meldung bleibt nach Mahnerstellung bestehen

**Ursache:** Die Meldung basiert auf `overdueInvoices.length > 0` (Zeile 355). Nach `handleCreateReminder` wird `refetchOverdue()` aufgerufen (Zeile 256), was korrekt ist. ABER: Die Alert-Box ruft eine eigene `onClick`-Funktion auf (Zeile 368-374) die direkt `handleCreateReminder` in einer Schleife aufruft -- dort fehlt am Ende ein `refetchOverdue()` und `queryClient.invalidateQueries`.

**Fix:** Nach der Schleife in der Alert-Box (Zeile 368-374):
- `await refetchOverdue()` aufrufen
- `queryClient.invalidateQueries({ queryKey: ["/reminders"] })` aufrufen
- Danach automatisch zum Tab "Aktive Mahnungen" wechseln

### 5b: "Aktive Mahnungen" Tab bleibt immer leer

**Ursache (Kritischer Bug):** Zeile 139: `const [reminders, setReminders] = useState<Reminder[]>(initialReminders)`. `useState` initialisiert nur EINMAL beim ersten Render. Wenn `apiData` spaeter geladen wird, aendert sich `initialReminders`, aber der State wird NICHT aktualisiert. Die `reminders` bleiben ein leeres Array.

**Fix:** `useState` durch direkte Nutzung von `initialReminders` ersetzen, oder einen `useEffect` hinzufuegen der `setReminders(initialReminders)` aufruft wenn sich `apiData` aendert. Besser: Den lokalen State komplett entfernen und direkt `initialReminders` als Datenquelle nutzen (und lokale Mutationen durch API-Aufrufe ersetzen).

### 5c: "Verlauf" Tab bleibt immer leer

**Ursache:** Zeile 734-742: Der Tab zeigt nur einen Platzhalter-Text "Mahnverlauf wird hier angezeigt". Keine Daten werden geladen.

**Fix:** Die existierenden `useReminders`-Hook nutzen mit Status-Filter `SENT` oder `PAID`/`CANCELLED` um abgeschlossene Mahnungen zu laden und anzuzeigen.

---

## Implementierungsreihenfolge

| Schritt | Datei | Aenderung |
|---------|-------|-----------|
| 1 | `src/components/documents/DocumentForm.tsx` | sendLabel "Rechnung senden" zu "Rechnung erstellen" |
| 2 | `src/hooks/use-invoices.ts` | Invoice.customer Interface um `companyName?` erweitern |
| 3 | `src/pages/Invoices.tsx` | companyName Vorrang bei Anzeige (Zeilen 364, 434) |
| 4 | `src/lib/pdf/swiss-qr-invoice.ts` | Zahlteil auf Seite 2 verschieben (doc.addPage) |
| 5 | `src/pages/InvoiceDetail.tsx` | QR-Status Info in Bankverbindungs-Card anzeigen |
| 6 | `src/pages/Reminders.tsx` | Bug: useState mit useEffect synchronisieren, Verlauf-Tab befuellen, Alert-Refresh nach Mahnerstellung |

## Cursor-Prompt fuer Backend (wird nach Frontend-Aenderungen geliefert)

- `GET /invoices/:id` und `GET /invoices` muessen `qrReference`, `qrIban` und `customer.companyName` zurueckgeben
- `POST /invoices` muss `qrReference` automatisch generieren (27-stellig, rekursiver Mod10)
- `GET /reminders` muss korrekte Datenstruktur liefern (invoice, customer als Objekte)
- `GET /reminders/overdue-invoices` muss nach Mahnerstellung die betroffene Rechnung nicht mehr zurueckgeben
