# Loomora ERP – Vollständiger Fix-Plan für Cursor

> **Erstellt:** 2026-02-12  
> **Zweck:** Cursor soll anhand dieses Plans ALLE Fehler beheben, Schritt für Schritt  
> **Regel:** Cursor darf NUR im `/backend` Verzeichnis und `schema.prisma` arbeiten. `/src` ist READ-ONLY.

---

## KRITISCHE BUGS (Sofort beheben)

### BUG 1: Tasks – Subtask-Controller-Endpunkte fehlen
**Problem:** Backend `tasks.service.ts` hat Subtask-Methoden (Z.170-205), aber `tasks.controller.ts` hat KEINE Routen dafür. Frontend TaskDetail.tsx erwartet `task.subtasks[]` vom `GET /tasks/:id` (das funktioniert via `include: { subtasks }` in `findById`). Aber es gibt keine Endpunkte zum Erstellen/Aktualisieren/Löschen von Subtasks nach der Task-Erstellung.

**Zusätzlich:** TaskCreate.tsx erstellt Subtasks nur lokal im State (Z.65, 150-158) und sendet sie NICHT im `handleSubmit` Payload (Z.168-188). Das `CreateTaskDto` hat auch kein `subtasks`-Feld.

**Lösung für Cursor:**
```
1. In backend/src/modules/tasks/tasks.controller.ts folgende Routen hinzufügen:

   @Get(':taskId/subtasks')
   getSubtasks(@CurrentUser() user, @Param('taskId') taskId: string)
   → return this.tasksService.getSubtasks(taskId, user.companyId);

   @Post(':taskId/subtasks')  
   createSubtask(@CurrentUser() user, @Param('taskId') taskId, @Body() dto: { title: string })
   → return this.tasksService.createSubtask(taskId, user.companyId, dto);

   @Put(':taskId/subtasks/:subtaskId')
   updateSubtask(@CurrentUser() user, @Param('taskId') taskId, @Param('subtaskId') subtaskId, @Body() dto)
   → return this.tasksService.updateSubtask(taskId, subtaskId, user.companyId, dto);

   @Delete(':taskId/subtasks/:subtaskId')
   deleteSubtask(@CurrentUser() user, @Param('taskId') taskId, @Param('subtaskId') subtaskId)
   → return this.tasksService.deleteSubtask(taskId, subtaskId, user.companyId);

2. WICHTIG: Die Route @Get(':taskId/subtasks') muss VOR @Get(':id') stehen,
   oder verwende @Get('stats') Pattern – stelle sicher dass 'stats' Route vor ':id' steht (ist bereits so).
   Die subtasks-Routen müssen korrekt geordnet sein.

3. In backend/src/modules/tasks/dto/task.dto.ts:
   - Füge ein optionales Feld `subtasks` zu CreateTaskDto hinzu:
     @IsOptional()
     @IsArray()
     subtasks?: { title: string }[];

4. In backend/src/modules/tasks/tasks.service.ts → create() Methode:
   - Nach dem Task-Create, wenn dto.subtasks existiert und nicht leer ist:
     if (dto.subtasks?.length) {
       await this.prisma.subtask.createMany({
         data: dto.subtasks.map(s => ({ taskId: task.id, title: s.title }))
       });
     }
   - Danach den Task mit subtasks includen und zurückgeben.

5. WICHTIG: Sicherstellen dass Prisma-Schema ein Subtask-Model hat.
   Falls nicht vorhanden, erstelle Migration:
   model Subtask {
     id          String   @id @default(uuid())
     taskId      String
     task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
     title       String
     isCompleted Boolean  @default(false)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
```

### BUG 2: Tasks – Bearbeiten-Button funktioniert nicht
**Problem:** In TaskDetail.tsx Zeile 193-196 gibt es einen "Bearbeiten"-Button, der KEINE Aktion hat (kein onClick). Es gibt auch keine TaskEdit-Seite.

**Lösung für Cursor:**
```
Dieser Bug ist Frontend-seitig. Da /src READ-ONLY ist, kann Cursor ihn nicht direkt fixen.
ABER: Das Backend PUT /tasks/:id funktioniert bereits korrekt (tasks.controller.ts Z.49-57).
Das Frontend hat updateMutation bereits (TaskDetail.tsx Z.82-92).

→ KEIN Backend-Fix nötig. Dieser Bug wird separat im Frontend behoben (durch Lovable).
```

### BUG 3: Tasks – User-Dropdown zeigt Fragezeichen statt Namen
**Problem:** TaskCreate.tsx Z.81-89 holt Users von `/users` API. Der Backend-Endpunkt `GET /users` gibt `name` als zusammengesetztes Feld zurück (users.service.ts Z.62: `name: ${user.firstName} ${user.lastName}`), aber das Frontend mappt `firstName` und `lastName` separat (Z.87: `u.firstName || ""`, `u.lastName || ""`).

**Analyse:** Das Backend gibt `name` als kombiniertes Feld zurück, NICHT `firstName`/`lastName` separat in der Liste. Der `findAll` mapped zu `{ id, name, email, role, ... }`. Das Frontend erwartet aber `firstName` und `lastName`.

**Lösung für Cursor:**
```
In backend/src/modules/users/users.service.ts → findAll() Methode (Z.61-75):
Ergänze firstName und lastName in der mappedData:

const mappedData = data.map(user => ({
  id: user.id,
  firstName: user.firstName,     // ← NEU hinzufügen
  lastName: user.lastName,       // ← NEU hinzufügen
  name: `${user.firstName} ${user.lastName}`,
  email: user.email,
  ... (rest bleibt gleich)
}));
```

### BUG 4: Task-Kommentare Controller-Endpunkte fehlen
**Problem:** Backend `tasks.service.ts` hat Comment-Methoden (Z.211-241), aber `tasks.controller.ts` hat KEINE Routen dafür.

**Lösung für Cursor:**
```
In backend/src/modules/tasks/tasks.controller.ts hinzufügen:

@Get(':taskId/comments')
getComments(@CurrentUser() user, @Param('taskId') taskId)
→ return this.tasksService.getComments(taskId, user.companyId);

@Post(':taskId/comments')
createComment(@CurrentUser() user, @Param('taskId') taskId, @Body() dto: { content: string })
→ return this.tasksService.createComment(taskId, user.companyId, user.userId, dto);

@Delete(':taskId/comments/:commentId')
deleteComment(@CurrentUser() user, @Param('taskId') taskId, @Param('commentId') commentId)
→ return this.tasksService.deleteComment(taskId, commentId, user.companyId);
```

### BUG 5: Task-Attachments Controller-Endpunkte fehlen
**Problem:** Backend `tasks.service.ts` hat Attachment-Methoden (Z.247-287), aber `tasks.controller.ts` hat KEINE Routen dafür.

**Lösung für Cursor:**
```
In backend/src/modules/tasks/tasks.controller.ts hinzufügen:

@Get(':taskId/attachments')
getAttachments(@CurrentUser() user, @Param('taskId') taskId)

@Post(':taskId/attachments')
@UseInterceptors(FileInterceptor('file'))
createAttachment(@CurrentUser() user, @Param('taskId') taskId, @UploadedFile() file)

@Delete(':taskId/attachments/:attachmentId')
deleteAttachment(@CurrentUser() user, @Param('taskId') taskId, @Param('attachmentId') attachmentId)

Multer-Konfiguration für uploads/task-attachments/ Ordner hinzufügen.
```

---

## PERFORMANCE-PROBLEME (Priorität: Hoch)

### PERF 1: Client-seitige Stats laden 1000 Datensätze
**Problem:** 4 Hooks berechnen Statistiken client-seitig mit `pageSize: 1000`:
- `src/hooks/use-customers.ts` → `useCustomerStats()` Z.86-95
- `src/hooks/use-invoices.ts` → `useInvoiceStats()` Z.126-142
- `src/hooks/use-products.ts` → `useProductStats()` Z.119-130
- `src/hooks/use-suppliers.ts` → `useSupplierStats()` Z.86-103

**Lösung für Cursor:**
```
Backend-Stats-Endpunkte existieren teilweise bereits. Fehlende erstellen:

1. GET /api/customers/stats (FEHLT – erstellen)
   Backend: customers.service.ts → getStats(companyId):
   const [total, active] = await Promise.all([
     this.prisma.customer.count({ where: { companyId } }),
     this.prisma.customer.count({ where: { companyId, isActive: true } }),
   ]);
   const prospects = await this.prisma.customer.count({ 
     where: { companyId, invoices: { none: {} } } 
   });
   const revenue = await this.prisma.invoice.aggregate({
     where: { companyId, status: 'PAID' },
     _sum: { totalAmount: true }
   });
   return { total, active, prospects, totalRevenue: Number(revenue._sum.totalAmount || 0) };
   
   Controller: @Get('stats') getStats() – MUSS VOR @Get(':id') stehen!

2. GET /api/invoices/stats (prüfen ob existiert, sonst erstellen)
   Ähnlich wie customers/stats mit total, paid, pending, overdue Beträgen.

3. GET /api/products/stats (prüfen ob existiert, sonst erstellen)
   total, active, inactive, services, lowStock counts.

4. GET /api/suppliers/stats (prüfen ob existiert, sonst erstellen)
   total, active, newSuppliers, totalValue, avgRating.

WICHTIG: Alle @Get('stats') Routen MÜSSEN vor @Get(':id') Routen stehen,
sonst interpretiert NestJS 'stats' als :id Parameter!
```

---

## FEHLENDE BACKEND-LOGIK (Priorität: Mittel)

### MISSING 1: Dashboard – Hardcodierte Werte
**Problem:** `dashboard.service.ts` Z.37 hat `revenueChange: '+12.5%'` hardcodiert und `utilizationRate: 87` hardcodiert.

**Lösung für Cursor:**
```
In dashboard.service.ts:
1. revenueChange berechnen: Vergleiche Umsatz aktueller Monat vs. Vormonat
2. utilizationRate berechnen: (gebuchte Stunden / verfügbare Stunden) * 100
   Oder: Anzahl aktive Tasks / Gesamtkapazität
```

### MISSING 2: Settings-Backend komplett fehlt
**Problem:** `src/pages/Settings.tsx` (3000+ Zeilen) ist ein reines Frontend-Shell. Kein Backend für:
- Lokalisierung (Sprache, Zeitzone, Datumsformat)
- Währung (Hauptwährung, Wechselkurse)
- E-Mail/SMTP (Server, Port, Credentials)
- API-Keys (Generierung, Verwaltung)
- Sicherheit (2FA, Passwort-Regeln, Session-Timeout)

**Lösung für Cursor:**
```
1. Neues Prisma-Model erstellen:
   model CompanySettings {
     id                String   @id @default(uuid())
     companyId         String   @unique
     company           Company  @relation(fields: [companyId], references: [id])
     // Lokalisierung
     language          String   @default("de")
     timezone          String   @default("Europe/Zurich")
     dateFormat        String   @default("dd.MM.yyyy")
     // Währung  
     defaultCurrency   String   @default("CHF")
     // SMTP
     smtpHost          String?
     smtpPort          Int?
     smtpUser          String?
     smtpPassword      String?  // verschlüsselt speichern!
     smtpFromEmail     String?
     smtpFromName      String?
     smtpUseTls        Boolean  @default(true)
     // Sicherheit
     passwordMinLength Int      @default(8)
     sessionTimeout    Int      @default(480) // Minuten
     require2FA        Boolean  @default(false)
     createdAt         DateTime @default(now())
     updatedAt         DateTime @updatedAt
   }

2. Neues Modul: backend/src/modules/settings/
   - settings.module.ts
   - settings.controller.ts  
   - settings.service.ts
   - dto/settings.dto.ts

3. Endpunkte:
   GET    /api/settings       → Alle Settings der Company laden
   PUT    /api/settings       → Settings aktualisieren
   POST   /api/settings/smtp/test → SMTP-Verbindung testen
```

### MISSING 3: Company – Logo-Upload Endpunkt prüfen
**Problem:** `company.service.ts` hat `updateLogo()` Methode, aber prüfe ob der Controller den Multer-Upload korrekt konfiguriert hat.

**Lösung für Cursor:**
```
Prüfe backend/src/modules/company/company.controller.ts:
1. Hat es @Post('logo') mit @UseInterceptors(FileInterceptor('file'))?
2. Ist diskStorage konfiguriert mit destination: './uploads/logos'?
3. Existiert der Ordner auf dem Server?
```

---

## MODUL-FÜR-MODUL PRÜFUNG

### ✅ Dashboard
- `GET /dashboard/stats` → Funktioniert, aber revenueChange/utilizationRate hardcodiert
- `GET /dashboard/activity` → Funktioniert

### ✅ Projekte
- CRUD komplett: list, create, detail, update, delete
- Stats: `GET /projects/stats` existiert
- Team-Members via ProjectMember Relation

### ⚠️ Aufgaben (Tasks)
- ❌ Subtask-Routen fehlen im Controller (Service existiert)
- ❌ Comment-Routen fehlen im Controller (Service existiert)
- ❌ Attachment-Routen fehlen im Controller (Service existiert)
- ❌ Bearbeiten-Button ohne Funktion (Frontend-Bug)
- ❌ User-Dropdown zeigt "??" (Backend gibt kein firstName/lastName in findAll)
- ❌ Subtasks werden bei Create nicht mitgesendet (Frontend + DTO Bug)
- ✅ Status-Wechsel funktioniert
- ✅ Löschen funktioniert
- ✅ Detail-View lädt korrekt (inkl. subtasks via include)

### ✅ Kunden (Customers)
- CRUD komplett
- ⚠️ Stats-Endpoint fehlt im Backend (client-seitig mit 1000 Records)

### ✅ Lieferanten (Suppliers)
- CRUD komplett
- ⚠️ Stats-Endpoint fehlt im Backend (client-seitig mit 1000 Records)

### ✅ Produkte (Products)
- CRUD komplett
- Stock-Adjustment: `POST /products/:id/adjust-stock`
- Kategorien: CRUD vorhanden
- ⚠️ Stats-Endpoint fehlt im Backend (client-seitig mit 1000 Records)

### ✅ Angebote (Quotes)
- CRUD komplett
- Convert to Order: `POST /quotes/:id/convert-to-order`
- PDF: vorhanden
- Send: vorhanden

### ✅ Aufträge (Orders)
- CRUD komplett
- Create Invoice: `POST /orders/:orderId/create-invoice`

### ✅ Rechnungen (Invoices)
- CRUD komplett
- Payment Recording: `POST /invoices/:id/payment`
- Send: `POST /invoices/:id/send`
- Cancel: `POST /invoices/:id/cancel`
- PDF + QR-Rechnung vorhanden
- ⚠️ Stats-Endpoint prüfen ob dediziert vorhanden

### ✅ Lieferscheine (Delivery Notes)
- CRUD komplett
- Create from Order: `POST /delivery-notes/from-order/:orderId`

### ✅ Gutschriften (Credit Notes)
- CRUD vorhanden via Hooks

### ✅ Mahnungen (Reminders)
- CRUD vorhanden via Hooks

### ✅ Zahlungen (Payments)
- CRUD komplett
- Statistics: `GET /payments/statistics`
- QR-Matching: `GET /payments/match-qr/:ref`
- Reconcile: `POST /payments/:id/reconcile`

### ✅ Verträge (Contracts)
- CRUD komplett
- Renew: `POST /contracts/:id/renew`
- Terminate: `POST /contracts/:id/terminate`
- Expiring: `GET /contracts/expiring`
- Stats: `GET /contracts/stats`

### ✅ Kalender
- CRUD komplett

### ✅ Dokumente (DMS)
- Folders: CRUD komplett
- Documents: Upload, CRUD, Versioning, Archive, Move
- Stats: `GET /documents/statistics`

### ✅ Mitarbeiter (Employees)
- CRUD komplett
- Stats: `GET /employees/stats`

### ✅ Benutzer (Users)
- CRUD komplett
- ⚠️ findAll gibt kein firstName/lastName zurück (nur name)

### ⚠️ Einstellungen (Settings)
- ❌ Komplett ohne Backend

### ✅ Zeiterfassung (Time Entries)
- CRUD via Hooks vorhanden

### ✅ Finanzen
- Journal Entries, Cash Book, Chart of Accounts, VAT Returns
- Alle via dedizierte Hooks angebunden

---

## CURSOR AUSFÜHRUNGSREIHENFOLGE

### Phase 1: Kritische Task-Bugs (SOFORT)
```bash
# 1. Prüfe ob Subtask, TaskComment, TaskAttachment Models in schema.prisma existieren
# 2. Falls nicht: Migration erstellen
# 3. tasks.controller.ts erweitern (Subtasks, Comments, Attachments Routen)
# 4. CreateTaskDto erweitern (subtasks Feld)
# 5. tasks.service.ts create() erweitern (Subtasks bei Erstellung)
# 6. users.service.ts findAll() → firstName/lastName hinzufügen
```

### Phase 2: Stats-Endpoints (Backend-Performance)
```bash
# 1. customers.controller.ts: @Get('stats') VOR @Get(':id')
# 2. customers.service.ts: getStats() implementieren
# 3. Gleiches für: invoices, products, suppliers (falls nicht vorhanden)
# 4. Dashboard hardcodierte Werte ersetzen
```

### Phase 3: Settings-Backend
```bash
# 1. CompanySettings Model in schema.prisma
# 2. Migration erstellen
# 3. settings/ Modul erstellen (module, controller, service, dto)
# 4. Endpunkte: GET/PUT /settings, POST /settings/smtp/test
# 5. In app.module.ts registrieren
```

### Phase 4: Verifikation
```bash
# Nach jeder Phase:
# 1. npx prisma generate
# 2. npm run build (TypeScript-Check)
# 3. npx prisma migrate deploy (falls neue Migration)
# 4. pm2 restart loomora-api
# 5. Manuell testen: curl -H "Authorization: Bearer TOKEN" https://app.loomora.ch/api/tasks/TASK_ID
```

---

## REGELN FÜR CURSOR

1. **NUR** `/backend` und `schema.prisma` anfassen
2. **NIEMALS** Dateien in `/src` verändern
3. **IMMER** `@UseGuards(JwtAuthGuard)` auf neuen Controllern
4. **IMMER** `@CurrentUser()` für companyId Isolation
5. **IMMER** `@Get('stats')` VOR `@Get(':id')` in Controllern
6. **IMMER** nach Änderungen: `npm run build` im `/backend` prüfen
7. **IMMER** Prisma-Models prüfen bevor Relations verwendet werden
8. Frontend-Hooks in `src/hooks/` sind die verbindliche API-Referenz
