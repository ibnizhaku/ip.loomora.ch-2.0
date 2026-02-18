
# E-Mail Versand System – Frontend + Backend Prompt

## Ausgangslage (bestehender Code)

**Was bereits existiert:**
- Settings → E-Mail Sektion: SMTP-Formular mit Host, Port, User, Passwort, Absender-Name, Absender-Adresse – **aber statisch, keine API-Anbindung**
- `sendEmail()` in `src/lib/api.ts`: Ruft direkt `POST /{entityType}/{entityId}/send` auf – ohne Modal, ohne Felder
- Buttons in folgenden Seiten rufen `sendEmail()` direkt auf:
  - `Invoices.tsx` (Tabelle + Karten) – inline `onSelect`
  - `InvoiceDetail.tsx` – `handleSendEmail()`
  - `Quotes.tsx` (Tabelle + Karten) – inline `onSelect`
  - `QuoteDetail.tsx` – `handleSendEmail()` + "Nachfassen per E-Mail"
  - `CreditNoteDetail.tsx` – inline Button
  - `ReminderDetail.tsx` – inline Button
  - `CreditNotes.tsx` – `handleSendEmail()` (toast-only, kein API-Call)
- **Kein Modal vorhanden** – direkter API-Call oder Toast-Dummy
- **Kein `useEmailAccount` Hook**

---

## Was geändert wird

### PHASE 1 – FRONTEND

#### 1. `src/hooks/use-email-account.ts` (NEU)
Hook der `GET /mail/account` aufruft:
```typescript
export interface MailAccount {
  id: string;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  isActive: boolean;
}

export function useEmailAccount() {
  const { data, isLoading } = useQuery({
    queryKey: ['mail-account'],
    queryFn: () => api.get<MailAccount>('/mail/account'),
    retry: false,           // 404 = kein Account → kein Fehler-Toast
    throwOnError: false,    // Graceful: wenn noch kein Account
  });

  return {
    account: data,
    hasEmailAccount: !!(data?.isActive),
    fromEmail: data?.fromEmail ?? '',
    fromName: data?.fromName ?? '',
    isLoading,
  };
}
```

#### 2. `src/components/email/SendEmailModal.tsx` (NEU)
Universelles Modal mit zwei Zuständen:

**Zustand A – Kein Mail-Account konfiguriert:**
```
┌────────────────────────────────────────┐
│ ⚠ Kein E-Mail-Konto konfiguriert      │
│                                        │
│ Sie haben noch kein E-Mail-Konto       │
│ konfiguriert. Bitte gehen Sie zu       │
│ Einstellungen → E-Mail.                │
│                                        │
│ [Zu Einstellungen]    [Abbrechen]      │
└────────────────────────────────────────┘
```

**Zustand B – Mail-Account vorhanden:**
```
┌────────────────────────────────────────┐
│ E-Mail senden                    [X]   │
├────────────────────────────────────────┤
│ Von     [info@firma.ch]  (readOnly)    │
│ An      [kunde@example.com]            │
│ CC      [optional]                     │
│ BCC     [optional]                     │
│ Betreff [Rechnung RE-2026-001 von...]  │
│ ┌──────────────────────────────────┐   │
│ │ Sehr geehrte Damen und Herren... │   │
│ │                                  │   │
│ └──────────────────────────────────┘   │
├────────────────────────────────────────┤
│                [Abbrechen] [Senden]    │
└────────────────────────────────────────┘
```

Props:
```typescript
interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  documentType: 'invoice' | 'quote' | 'delivery-note' | 'reminder' | 'credit-note' | 'order';
  documentId: string;
  documentNumber?: string;    // z.B. "RE-2026-001"
  defaultRecipient?: string;  // kunde@example.com
  companyName?: string;       // Für Betreff + Nachricht
}
```

Betreff-Generierung (automatisch):
```
invoice       → "Rechnung {number} von {companyName}"
quote         → "Angebot {number} von {companyName}"
delivery-note → "Lieferschein {number} von {companyName}"
reminder      → "Zahlungserinnerung {number} von {companyName}"
credit-note   → "Gutschrift {number} von {companyName}"
order         → "Auftragsbestätigung {number} von {companyName}"
```

**Senden-Button:** In Phase 1 nur Dummy-Handler → `toast.success("E-Mail wird gesendet...")` + `onClose()`. Kein API-Call.

#### 3. `src/pages/Settings.tsx` – E-Mail Sektion erweitern
Der bestehende E-Mail-Tab (Zeile 1306–1548) hat bereits SMTP-Felder aber:
- Felder sind statisch (keine State-Anbindung)
- Kein `useSettings()` Hook angebunden
- Kein `useUpdateSettings()` Mutation

Erweiterung: State mit `useSettings()` laden, `useUpdateSettings()` beim Speichern aufrufen, `useTestSmtp()` beim "Verbindung testen" aufrufen. Dabei werden fehlende Felder ergänzt:
- From Name → bereits als "Absender-Name" vorhanden ✓
- From Email → bereits als "Absender-Adresse" vorhanden ✓
- SMTP Host, Port, User, Passwort → bereits vorhanden ✓

Neu: Felder mit echtem State verknüpfen + Save/Test Buttons funktional machen.

#### 4. Buttons anpassen – alle betroffenen Dateien

**Muster-Pattern:**
```typescript
// Statt:
onSelect={async () => { await sendEmail('invoices', invoice.id); }}

// Neu:
const [emailModal, setEmailModal] = useState<{open: boolean; id: string; number: string; recipient?: string} | null>(null);

onSelect={() => setEmailModal({ open: true, id: invoice.id, number: invoice.number, recipient: invoice.customer?.email })}

// Am Ende der Komponente:
{emailModal && (
  <SendEmailModal
    open={emailModal.open}
    onClose={() => setEmailModal(null)}
    documentType="invoice"
    documentId={emailModal.id}
    documentNumber={emailModal.number}
    defaultRecipient={emailModal.recipient}
  />
)}
```

**Betroffene Dateien:**

| Datei | Dokumenttyp | Email-Felder |
|---|---|---|
| `Invoices.tsx` | invoice | `invoice.number`, `invoice.customer?.email` |
| `InvoiceDetail.tsx` | invoice | `invoice.number`, `invoice.customer?.email` |
| `Quotes.tsx` | quote | `quote.number`, `quote.customer?.email` |
| `QuoteDetail.tsx` | quote | `quote.number`, `quote.customer?.email` |
| `CreditNotes.tsx` | credit-note | `note.id`, kein Email-Feld |
| `CreditNoteDetail.tsx` | credit-note | `creditNote.number`, `creditNote.customer?.email` |
| `ReminderDetail.tsx` | reminder | `reminder.number`, `reminder.customer?.email` |

**Permission-Check** auf allen Send-Buttons:
```typescript
{canWrite('invoices') && (
  <DropdownMenuItem onSelect={() => setEmailModal(...)}>
    <Send className="h-4 w-4" /> Per E-Mail senden
  </DropdownMenuItem>
)}
```

#### 5. `src/lib/api.ts` – `sendEmail()` behalten
Die Funktion bleibt unverändert für Phase 2 (echter API-Call). In Phase 1 wird sie nur nicht mehr direkt aufgerufen.

---

## Geänderte Frontend-Dateien (vollständige Liste)

```
NEU:
  src/hooks/use-email-account.ts
  src/components/email/SendEmailModal.tsx

GEÄNDERT:
  src/pages/Settings.tsx          (E-Mail Sektion: State + API-Anbindung)
  src/pages/Invoices.tsx          (Modal statt direkter sendEmail-Call)
  src/pages/InvoiceDetail.tsx     (Modal statt direkter sendEmail-Call)
  src/pages/Quotes.tsx            (Modal statt direkter sendEmail-Call)
  src/pages/QuoteDetail.tsx       (Modal statt direkter sendEmail-Call)
  src/pages/CreditNotes.tsx       (Modal statt Toast-Dummy)
  src/pages/CreditNoteDetail.tsx  (Modal statt direkter sendEmail-Call)
  src/pages/ReminderDetail.tsx    (Modal statt direkter sendEmail-Call)
```

---

## PHASE 2 – Backend Cursor Prompt

Nach Fertigstellung des Frontends wird folgender vollständiger Cursor-Prompt generiert:

**Enthält exakt:**
1. Prisma-Migration: `UserMailAccount` Model mit AES-verschlüsseltem SMTP-Passwort
2. `mail.module.ts`, `mail.service.ts`, `mail.controller.ts`
3. 4 Endpoints: `GET /mail/account`, `POST /mail/account`, `POST /mail/test`, `POST /mail/send`
4. Multi-Tenant Guards: `JwtAuthGuard + CompanyGuard + PermissionGuard`
5. PDF-Attachment Pipeline via `pdf.service.ts`
6. Nodemailer SMTP-Versand
7. AuditLog-Eintrag `MAIL_SENT`
8. Idempotentes Prisma-Migration-Script

---

## Technische Details

- `SendEmailModal` nutzt bestehende Radix Dialog-Komponente (`src/components/ui/dialog.tsx`)
- `useEmailAccount` nutzt `@tanstack/react-query` mit `throwOnError: false` – 404 erzeugt keinen globalen Error-Toast
- Kein neues Design, keine neuen Bibliotheken
- `usePermissions()` bereits in allen Seiten importiert
- Settings E-Mail-Tab ruft `useSettings()` + `useUpdateSettings()` + `useTestSmtp()` aus bestehenden Hooks auf
