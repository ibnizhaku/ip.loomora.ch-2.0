# 🏥 HR-Modul Vollständige Analyse (PERSONAL)

> **Erstellt:** 2026-02-15  
> **Status:** Analyse abgeschlossen  
> **WICHTIG:** Cursor darf KEINE Design-, CSS-, Layout- oder Strukturänderungen vornehmen. Nur Logik, Routing, Parameter, State und Datenfluss anpassen.

---

## 📊 Zusammenfassung

| Modul | Listenansicht | Detailseite | Create | Edit | API-Anbindung | Mock-Daten |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| Mitarbeiter (HR.tsx) | ✅ API | ✅ API | ✅ | ✅ | ✅ Vollständig | ✅ Entfernt |
| Arbeitsverträge | ❌ Mock | ⚠️ Mock | ✅ Route | ❌ (via ?edit=true) | ❌ Kein Hook | ❌ Hardcoded |
| Lohnabrechnung | ⚠️ Falsche API | ✅ API | ✅ Route | ❌ | ⚠️ Teilweise | ⚠️ Teilweise |
| Lohnzettel (Payslip) | — | ❌ Mock | — | — | ❌ Kein Hook | ❌ Hardcoded |
| Abwesenheiten | ⚠️ Teilweise | ❌ Mock | ✅ Route | ❌ | ⚠️ Teilweise | ⚠️ Mock-Stats |
| Reisekosten | ⚠️ Teilweise | ❌ Mock | ✅ Route | ❌ | ⚠️ Teilweise | ❌ Hardcoded Detail |
| Recruiting | ⚠️ Teilweise | ❌ Mock | ✅ Route | ❌ | ⚠️ Teilweise | ❌ Hardcoded Detail |
| Schulungen | ⚠️ Teilweise | ❌ Mock | ✅ Route | ❌ Route fehlt | ⚠️ Teilweise | ❌ Hardcoded Detail |
| Abteilungen | ✅ API | ✅ API | ✅ Route | ✅ Dialog | ✅ Vollständig | ✅ Entfernt |
| Organigramm | ❌ localStorage | — | — | ✅ (inline) | ❌ | ❌ Hardcoded |

---

## 1️⃣ KRITISCH: Mock-Daten entfernen (Pflicht)

### ❌ EmployeeContracts.tsx (Zeilen 56-154)
- **Problem:** 6 hardcodierte Vertragsobjekte mit Fake-Namen (Max Keller, Anna Meier, etc.)
- **Stats-Cards** (Zeilen 214-218): Berechnen Werte aus Mock-Array
- **Export-Button** (Zeilen 233-256): Exportiert hardcodierte Mock-Daten als CSV
- **Lösung:** Hook `use-employee-contracts.ts` erstellen, API-Endpunkt `/employee-contracts` anbinden
- **Dateien:** `src/pages/EmployeeContracts.tsx`

### ❌ EmployeeContractDetail.tsx (Zeilen 20-44)
- **Problem:** `initialVertragData` mit hardcodierten Werten ("Marco Brunner", "MA-0045", etc.)
- **handleSave** (Zeile 211): Simuliert API-Call mit `setTimeout` statt echtem API-Aufruf
- **Lösung:** Hook `useEmployeeContract(id)` nutzen, `useUpdateEmployeeContract()` für Speichern
- **Dateien:** `src/pages/EmployeeContractDetail.tsx`

### ❌ AbsenceDetail.tsx (Zeilen 10-48)
- **Problem:** `abwesenheitData`, `kontingent`, `verlauf` komplett hardcodiert
- **Buttons:** Genehmigen/Ablehnen/Stornieren haben KEINE onClick-Handler (nur UI-Buttons)
- **Lösung:** `useAbsence(id)` Hook nutzen, Mutations für Statuswechsel hinzufügen
- **Dateien:** `src/pages/AbsenceDetail.tsx`

### ❌ TravelExpenseDetail.tsx (Zeilen 14-35)
- **Problem:** `initialSpesenData` und `positionen` Array komplett hardcodiert
- **handleApprove/handleReject:** Setzen nur lokalen State, kein API-Call
- **handleExportPDF:** Simuliert PDF-Export mit setTimeout
- **Lösung:** Hook für Travel-Expenses erstellen, API-Integration
- **Dateien:** `src/pages/TravelExpenseDetail.tsx`

### ❌ CandidateDetail.tsx (Zeilen 16-56)
- **Problem:** `kandidatData`, `dokumente`, `interviews` komplett hardcodiert
- **handleHire:** Navigiert nur zu `/hr`, erstellt keinen Mitarbeiter via API
- **handleSendOffer:** Zeigt nur Toast, kein API-Call
- **handleReject:** Zeigt nur Toast, kein API-Call
- **Lösung:** `useCandidate(id)` aus `use-recruiting.ts` nutzen
- **Dateien:** `src/pages/CandidateDetail.tsx`

### ❌ TrainingDetail.tsx (Zeilen 34-93)
- **Problem:** `initialTrainingData` und `availableEmployees` komplett hardcodiert
- **handleEditSave:** Setzt nur lokalen State, kein API-Call
- **handleAddParticipants/handleRemoveParticipant:** Nur lokaler State
- **Lösung:** `useTraining(id)` aus `use-training.ts` nutzen
- **Dateien:** `src/pages/TrainingDetail.tsx`

### ❌ PayslipDetail.tsx (Zeilen 22-82)
- **Problem:** `payslipData` komplett hardcodiert mit Fake-Lohndaten
- **Buttons:** "Versenden", "Drucken", "PDF Export" ohne onClick-Handler
- **Lösung:** API-Anbindung über `/payslips/:id`
- **Dateien:** `src/pages/PayslipDetail.tsx`

### ❌ Orgchart.tsx (Zeilen 54-133)
- **Problem:** `defaultOrgData` mit 9 hardcodierten Personen, gespeichert in localStorage
- **Lösung:** API-Endpunkt `/employees/orgchart` oder `/departments/hierarchy` anbinden
- **Dateien:** `src/pages/Orgchart.tsx`

### ⚠️ Absences.tsx (Zeilen 70-77)
- **Problem:** `employeeVacation` Array mit 6 hardcodierten Ferienkonten
- **Stats-Cards:** "10 Tage" Krankheitstage (Zeile 252) und "1" Heute abwesend (Zeile 271) hardcodiert
- **handleApprove/handleReject:** Setzen nur lokalen useState, kein API-Call
- **Lösung:** Stats über API laden, Mutations für Genehmigung/Ablehnung nutzen
- **Dateien:** `src/pages/Absences.tsx`

### ⚠️ Payroll.tsx (Zeile 72)
- **Problem:** Fetcht von `/employees` statt `/payroll` Endpunkt
- **handleLohnlaufAbschliessen:** Nur Toast, kein API-Call
- **handleSwissdecExport:** Generiert XML aus lokalen Daten
- **Lösung:** Korrekten Endpunkt `/payroll` nutzen
- **Dateien:** `src/pages/Payroll.tsx`

### ⚠️ Recruiting.tsx (Zeilen 97-119)
- **handleSendOffer/handleReject/handleDelete:** Setzen nur lokalen State, kein API-Mutation
- **JobPostings Tab (Zeile 464):** onClick zeigt nur Toast statt Detail-Navigation
- **Lösung:** Mutations aus `use-recruiting.ts` nutzen
- **Dateien:** `src/pages/Recruiting.tsx`

### ⚠️ Training.tsx (Zeilen 108-119)
- **handleCancel/handleDelete:** Setzen nur lokalen State, kein API-Mutation
- **Budget** (Zeile 94): `totalBudget = 15000` hardcodiert
- **Katalog-Tab** (Zeilen 492-516): 6 hardcodierte Kurse
- **Lösung:** Mutations aus `use-training.ts` nutzen
- **Dateien:** `src/pages/Training.tsx`

### ⚠️ TravelExpenses.tsx (Zeilen 187-223)
- **handleApprove/handleReject/handleDuplicate:** Setzen nur lokalen State, kein API-Mutation
- **Lösung:** API-Mutations für Statuswechsel implementieren
- **Dateien:** `src/pages/TravelExpenses.tsx`

---

## 2️⃣ Fehlende Hooks (Cursor muss erstellen)

| Hook-Datei | Benötigte Funktionen | Endpunkte |
|-----------|---------------------|-----------|
| `src/hooks/use-employee-contracts.ts` | `useEmployeeContracts()`, `useEmployeeContract(id)`, `useCreateEmployeeContract()`, `useUpdateEmployeeContract()`, `useDeleteEmployeeContract()` | `GET/POST /employee-contracts`, `GET/PUT/DELETE /employee-contracts/:id` |
| `src/hooks/use-travel-expenses.ts` | `useTravelExpenses()`, `useTravelExpense(id)`, `useCreateTravelExpense()`, `useUpdateTravelExpense()`, `useDeleteTravelExpense()`, `useApproveTravelExpense()`, `useRejectTravelExpense()` | `GET/POST /travel-expenses`, `GET/PUT/DELETE /travel-expenses/:id`, `POST /travel-expenses/:id/approve`, `POST /travel-expenses/:id/reject` |
| `src/hooks/use-payroll.ts` | `usePayrollRuns()`, `usePayrollRun(id)`, `useCreatePayrollRun()`, `useCompletePayrollRun()`, `usePayslip(id)` | `GET/POST /payroll`, `GET /payroll/:id`, `POST /payroll/:id/complete`, `GET /payslips/:id` |

**Hinweis:** `use-absences.ts`, `use-recruiting.ts`, `use-training.ts` existieren bereits mit CRUD-Hooks, werden aber in den Seiten noch nicht korrekt genutzt.

---

## 3️⃣ Button-Analyse (Alle Module)

### ❌ Buttons OHNE Funktionalität

| Modul | Button | Datei | Zeile | Problem |
|-------|--------|-------|-------|---------|
| AbsenceDetail | "Ablehnen" | AbsenceDetail.tsx | 89 | Kein onClick-Handler |
| AbsenceDetail | "Genehmigen" | AbsenceDetail.tsx | 93 | Kein onClick-Handler |
| AbsenceDetail | "Stornieren" | AbsenceDetail.tsx | 101 | Kein onClick-Handler |
| PayslipDetail | "Versenden" | PayslipDetail.tsx | 138-141 | Kein onClick-Handler |
| PayslipDetail | "Drucken" | PayslipDetail.tsx | 142-145 | Kein onClick-Handler |
| PayslipDetail | "PDF Export" | PayslipDetail.tsx | 146-149 | Kein onClick-Handler |
| PayslipDetail | "Jahresübersicht" | PayslipDetail.tsx | 401-403 | Kein onClick-Handler |
| PayslipDetail | "Lohnausweis generieren" | PayslipDetail.tsx | 405-408 | Kein onClick-Handler |

### ⚠️ Buttons mit lokaler Logik statt API

| Modul | Button/Action | Datei | Problem |
|-------|--------------|-------|---------|
| Absences | Genehmigen (Liste) | Absences.tsx | `setRequests()` statt API-Mutation |
| Absences | Ablehnen (Liste) | Absences.tsx | `setRequests()` statt API-Mutation |
| TravelExpenses | Genehmigen | TravelExpenses.tsx | `setExpenses()` statt API-Mutation |
| TravelExpenses | Ablehnen | TravelExpenses.tsx | `setExpenses()` statt API-Mutation |
| TravelExpenses | Duplizieren | TravelExpenses.tsx | `setExpenses()` statt API-Mutation |
| TravelExpenseDetail | Genehmigen | TravelExpenseDetail.tsx | `setSpesenData()` statt API |
| TravelExpenseDetail | Ablehnen | TravelExpenseDetail.tsx | `setSpesenData()` statt API |
| TravelExpenseDetail | Ausbezahlt markieren | TravelExpenseDetail.tsx | `setSpesenData()` statt API |
| Recruiting | Angebot senden | Recruiting.tsx | `setApplicants()` statt API |
| Recruiting | Ablehnen | Recruiting.tsx | `setApplicants()` statt API |
| Recruiting | Löschen | Recruiting.tsx | `setApplicants()` statt API (kein Confirm) |
| CandidateDetail | Einstellen | CandidateDetail.tsx | Kein API-Call, nur navigate |
| CandidateDetail | Angebot senden | CandidateDetail.tsx | Nur Toast |
| CandidateDetail | Absage | CandidateDetail.tsx | Nur Toast |
| Training | Absagen | Training.tsx | `setTrainingsList()` statt API |
| Training | Löschen | Training.tsx | `setTrainingsList()` statt API (kein Confirm) |
| TrainingDetail | Speichern (Edit) | TrainingDetail.tsx | `setTrainingData()` statt API |
| TrainingDetail | Teilnehmer entfernen | TrainingDetail.tsx | `setTrainingData()` statt API |
| EmployeeContractDetail | Speichern | EmployeeContractDetail.tsx | setTimeout-Simulation statt API |
| Payroll | Lohnlauf abschliessen | Payroll.tsx | Nur Toast, kein API-Call |

### ✅ Buttons korrekt implementiert

| Modul | Button | Datei |
|-------|--------|-------|
| HR | Mitarbeiter hinzufügen | HR.tsx → /hr/new ✅ |
| HR | Profil anzeigen (⋮) | HR.tsx → /hr/:id ✅ |
| HR | Bearbeiten (⋮) | HR.tsx → /hr/:id/edit ✅ |
| HR | Löschen (⋮) | HR.tsx → deleteMutation ✅ mit confirm() |
| HR | Urlaub eintragen (⋮) | HR.tsx → /absences/new?employee=:id ✅ |
| EmployeeDetail | E-Mail | EmployeeDetail.tsx → mailto: ✅ |
| EmployeeDetail | Bearbeiten | EmployeeDetail.tsx → /hr/:id/edit ✅ |
| Departments | Neue Abteilung | Departments.tsx → /departments/new ✅ |
| Departments | Bearbeiten (⋮) | Departments.tsx → Dialog ✅ mit API |
| Departments | Löschen (⋮) | Departments.tsx → deleteMutation ✅ mit confirm() |
| Absences | Abwesenheit eintragen | Absences.tsx → /absences/new ✅ |
| Absences | Löschen (⋮) | Absences.tsx → deleteMutation ✅ |
| TravelExpenses | Neue Reise | TravelExpenses.tsx → /travel-expenses/new ✅ |
| TravelExpenses | Löschen (⋮) | TravelExpenses.tsx → deleteMutation ✅ |

---

## 4️⃣ Drei-Punkte-Menü (⋮) Analyse

### ❌ Menüpunkte ohne korrekte Aktion

| Modul | Menüpunkt | Problem |
|-------|-----------|---------|
| EmployeeContracts | "Verlängern" (Zeile 472) | Nur `toast.success()` |
| EmployeeContracts | "Kündigen" (Zeile 480) | Nur `toast.success()` |
| EmployeeContracts | "PDF exportieren" (Zeile 476) | Nur `toast.success()` |
| Recruiting (Bewerber) | "Interview planen" (Zeile 403) | Nur `toast.success()` |
| Recruiting (Bewerber) | "E-Mail senden" (Zeile 407) | Nur `toast.info()` |
| Recruiting (Stellen) | "Bearbeiten" (Zeile 488) | Nur `toast.info()` |
| Recruiting (Stellen) | "Stellenanzeige öffnen" (Zeile 489) | Nur `toast.success()` |
| Recruiting (Stellen) | "Duplizieren" (Zeile 493) | Nur `toast.success()` |
| Recruiting (Stellen) | "Schließen" (Zeile 497) | Nur `toast.info()` |
| Training | "Teilnehmer verwalten" (Zeile 390) | Nur `toast.info()` |
| Training | "Teilnehmer hinzufügen" (Zeile 397) | Nur `toast.success()` |
| Training | "PDF Export" (Zeile 401) | Nur `toast.success()` |
| HR (Mitarbeiter) | "Deaktivieren" (Zeile 282) | Nur `toast.success()` — kein API-Call |

### ✅ Menüpunkte korrekt

| Modul | Menüpunkte |
|-------|-----------|
| HR | Profil anzeigen → navigate ✅, Bearbeiten → navigate ✅, Urlaub eintragen → navigate ✅, Löschen → deleteMutation + confirm ✅ |
| Departments | Bearbeiten → Dialog ✅, Löschen → deleteMutation + confirm ✅ |
| EmployeeContracts | Vertrag anzeigen → navigate ✅, Bearbeiten → navigate mit ?edit=true ✅ |
| Absences | Genehmigen/Ablehnen → (nur lokaler State ⚠️), Details anzeigen → navigate ✅ |
| TravelExpenses | Anzeigen → navigate ✅, Bearbeiten → navigate ✅, Löschen → deleteMutation ✅ |
| Training | Details anzeigen → navigate ✅, Bearbeiten → navigate ✅ (Route fehlt!) |

---

## 5️⃣ Routing & Parameter Prüfung

### ❌ Fehlende Routen in App.tsx

| Route | Benötigt für | Status |
|-------|-------------|--------|
| `/training/:id/edit` | Training ⋮ Menü "Bearbeiten" navigiert dorthin | **FEHLT** — Route nicht registriert |
| `/recruiting/jobs/:id` | Job-Posting Detailseite | **FEHLT** — Klick zeigt nur Toast |

### ⚠️ Route-Konflikte

| Route | Problem |
|-------|---------|
| `/recruiting/:id` → `CandidateDetail` | Route nimmt Bewerber-ID entgegen, aber Bewerber-Klick sendet lokale Array-ID — kein Backend-ID |

### ✅ Korrekte Routen

| Route | Seite | Status |
|-------|-------|--------|
| `/hr` | HR.tsx | ✅ |
| `/hr/new` | EmployeeCreate.tsx | ✅ |
| `/hr/:id` | EmployeeDetail.tsx | ✅ |
| `/hr/:id/edit` | EmployeeEdit.tsx | ✅ |
| `/employee-contracts` | EmployeeContracts.tsx | ✅ |
| `/employee-contracts/new` | EmployeeContractCreate.tsx | ✅ |
| `/employee-contracts/:id` | EmployeeContractDetail.tsx | ✅ |
| `/payroll` | Payroll.tsx | ✅ |
| `/payroll/new` | PayrollCreate.tsx | ✅ |
| `/payroll/:id` | PayrollDetail.tsx | ✅ |
| `/payslips/:id` | PayslipDetail.tsx | ✅ |
| `/absences` | Absences.tsx | ✅ |
| `/absences/new` | AbsenceCreate.tsx | ✅ |
| `/absences/:id` | AbsenceDetail.tsx | ✅ |
| `/travel-expenses` | TravelExpenses.tsx | ✅ |
| `/travel-expenses/new` | TravelExpenseCreate.tsx | ✅ |
| `/travel-expenses/:id` | TravelExpenseDetail.tsx | ✅ |
| `/departments` | Departments.tsx | ✅ |
| `/departments/new` | DepartmentCreate.tsx | ✅ |
| `/departments/:id` | DepartmentDetail.tsx | ✅ |
| `/recruiting` | Recruiting.tsx | ✅ |
| `/recruiting/new` | JobPostingCreate.tsx | ✅ |
| `/recruiting/:id` | CandidateDetail.tsx | ✅ |
| `/training` | Training.tsx | ✅ |
| `/training/new` | TrainingCreate.tsx | ✅ |
| `/training/:id` | TrainingDetail.tsx | ✅ |
| `/orgchart` | Orgchart.tsx | ✅ |

---

## 6️⃣ End-to-End HR-Flows

### ❌ Recruiting → Einstellung → Mitarbeiter anlegen
- CandidateDetail: "Einstellen" Button zeigt Dialog ✅
- Dialog sammelt Eintrittsdatum, Abteilung, Lohn, Vorgesetzter ✅
- **ABER:** `handleHire()` erstellt KEINEN Mitarbeiter via API — nur Toast + navigate
- **Fix:** API-Call `POST /recruiting/candidates/:id/hire` nutzen (Hook `useHireCandidate` existiert bereits!)

### ❌ Mitarbeiter → Vertrag → Lohnabrechnung
- EmployeeDetail → Link zu `/employee-contracts` existiert nicht direkt
- EmployeeContractDetail nutzt hardcodierte Daten
- **Sackgasse:** Kein Button "Vertrag erstellen" auf der Mitarbeiter-Detailseite

### ❌ Abwesenheit → Genehmigung → Lohn
- Absences: Genehmigung ändert nur lokalen State
- AbsenceDetail: Genehmigen/Ablehnen Buttons komplett ohne Handler
- Keine Verbindung zur Lohnabrechnung

### ⚠️ Reisekosten → Genehmigung → Auszahlung
- TravelExpenseDetail: Genehmigen → nur lokaler State
- "Als ausbezahlt markieren" → nur lokaler State
- Keine Verbindung zur Buchhaltung/Lohn

---

## 7️⃣ Edge Cases

| Prüfung | Status | Details |
|---------|--------|---------|
| Leere Listen | ⚠️ | Departments ✅ (Empty-State). Andere Module zeigen leere Tabelle ohne Hinweis |
| Fehlende ID | ⚠️ | EmployeeDetail ✅, PayrollDetail ✅, DepartmentDetail ✅. Andere Detail-Seiten nutzen hardcodierte Daten |
| Ungültige ID / 404 | ⚠️ | Nur bei API-angebundenen Seiten (HR, Payroll, Departments) |
| Doppelklick-Schutz | ❌ | Keine `isPending`-Checks bei Recruiting, Training, Absences Mutations |
| Loading States | ⚠️ | Nur bei API-angebundenen Seiten. Mock-Seiten zeigen sofort Daten |
| Error States | ⚠️ | Nur bei API-angebundenen Seiten |
| Race Conditions | ⚠️ | Absences/TravelExpenses: `useState` aus API-Daten wird nicht synchronisiert wenn API sich ändert |

---

## 8️⃣ Priorisierte Handlungsempfehlung

### 🔴 KRITISCH (sofort umsetzen)

1. **Hooks erstellen:** `use-employee-contracts.ts`, `use-travel-expenses.ts`, `use-payroll.ts`
2. **EmployeeContracts.tsx:** Mock-Array entfernen → API-Hook
3. **EmployeeContractDetail.tsx:** Mock-Objekt entfernen → `useEmployeeContract(id)` + API-Save
4. **AbsenceDetail.tsx:** Mock entfernen → `useAbsence(id)`, Buttons mit Mutations verbinden
5. **PayslipDetail.tsx:** Mock entfernen → API-Anbindung
6. **CandidateDetail.tsx:** Mock entfernen → `useCandidate(id)` aus `use-recruiting.ts`
7. **TrainingDetail.tsx:** Mock entfernen → `useTraining(id)` aus `use-training.ts`
8. **TravelExpenseDetail.tsx:** Mock entfernen → API-Hook

### 🟡 WICHTIG (zeitnah umsetzen)

9. **Absences.tsx:** `employeeVacation` Mock entfernen, Stats von API laden, Mutations für Genehmigung
10. **Payroll.tsx:** API-Endpunkt von `/employees` auf `/payroll` korrigieren
11. **Recruiting.tsx:** Lokale State-Mutations durch API-Mutations ersetzen
12. **Training.tsx:** Lokale State-Mutations durch API-Mutations ersetzen, Budget von API
13. **TravelExpenses.tsx:** Lokale State-Mutations durch API-Mutations ersetzen
14. **Orgchart.tsx:** localStorage → API-Anbindung
15. **Route `/training/:id/edit`** in App.tsx registrieren oder auf Inline-Edit umstellen

### 🟢 OPTIONAL (Verbesserungen)

16. **JobPostingDetail-Seite** erstellen und Route `/recruiting/jobs/:id` registrieren
17. **EmployeeDetail:** Direkt-Link zu Vertrag/Lohn/Abwesenheiten auf der Detailseite
18. **Empty-States** für alle Listen hinzufügen
19. **Doppelklick-Schutz** via `isPending` bei allen Mutations-Buttons
20. **Confirm-Dialoge** für Recruiting/Training Lösch-Aktionen (aktuell kein confirm())
21. **Training Katalog-Tab:** Hardcodierte Kurse durch API ersetzen

---

## 9️⃣ Anweisungen an Cursor

### REGELN FÜR CURSOR:
```
⚠️ KEINE Designänderungen
⚠️ KEINE CSS-Änderungen
⚠️ KEINE Layout-Änderungen
⚠️ KEINE Strukturänderungen
⚠️ KEINE Komponentenänderungen

✅ NUR Logik anpassen
✅ NUR Routing korrigieren
✅ NUR Parameter ergänzen
✅ NUR State-Management korrigieren
✅ NUR Mock-Daten durch API-Anbindung ersetzen
✅ NUR Datenfluss optimieren
```

### Dateien die angepasst werden müssen:

**Neue Hook-Dateien erstellen:**
- `src/hooks/use-employee-contracts.ts`
- `src/hooks/use-travel-expenses.ts`
- `src/hooks/use-payroll.ts`

**Frontend-Dateien korrigieren (NUR Logik, KEIN Design):**
- `src/pages/EmployeeContracts.tsx` — Mock entfernen
- `src/pages/EmployeeContractDetail.tsx` — Mock entfernen, API-Save
- `src/pages/AbsenceDetail.tsx` — Mock entfernen, API-Anbindung
- `src/pages/Absences.tsx` — employeeVacation Mock entfernen, Stats API, Mutations
- `src/pages/PayslipDetail.tsx` — Mock entfernen, API-Anbindung
- `src/pages/TravelExpenseDetail.tsx` — Mock entfernen, API-Anbindung
- `src/pages/TravelExpenses.tsx` — Mutations korrigieren
- `src/pages/CandidateDetail.tsx` — Mock entfernen, API-Anbindung
- `src/pages/Recruiting.tsx` — Mutations korrigieren
- `src/pages/TrainingDetail.tsx` — Mock entfernen, API-Anbindung
- `src/pages/Training.tsx` — Mutations korrigieren
- `src/pages/Payroll.tsx` — API-Endpunkt korrigieren
- `src/pages/Orgchart.tsx` — localStorage → API

**Backend-Endpunkte die benötigt werden:**
- `GET/POST /employee-contracts`
- `GET/PUT/DELETE /employee-contracts/:id`
- `GET /payroll` (korrekter Endpunkt)
- `GET /payslips/:id`
- `GET /absences/stats`
- `GET /absences/:id` (mit Verlauf/Kontingent)
- `GET /travel-expenses/:id`
- `POST /travel-expenses/:id/approve`
- `POST /travel-expenses/:id/reject`
- `GET /employees/orgchart`

**Routing (App.tsx):**
- Route `/training/:id/edit` registrieren ODER Training ⋮-Menü "Bearbeiten" auf Inline-Edit umstellen (navigate(`/training/${id}?edit=true`))
