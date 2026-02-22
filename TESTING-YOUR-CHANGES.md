# Testing Your ERP Changes on the Live Version

**Live app:** https://app.loomora.ch  
**Login:** Use your normal credentials (e.g. admin@loomora.ch / admin123 if demo)

---

## 1. New Pages & Routes (CRUD)

### Journal entries
| Test | URL | What to check |
|------|-----|---------------|
| Create new entry | [https://app.loomora.ch/journal-entries/new](https://app.loomora.ch/journal-entries/new) | Form loads, can add lines, save works |
| Access from sidebar | Finance → Journal | "Neuer Buchungssatz" or link to `/journal-entries/new` |

### SEPA payments
| Test | URL | What to check |
|------|-----|---------------|
| Create new payment | [https://app.loomora.ch/sepa-payments/new](https://app.loomora.ch/sepa-payments/new) | Form loads, customer/supplier selection, amount, save |
| Access from sidebar | Finance → SEPA-Zahlungen | "Neue SEPA-Zahlung" links to `/sepa-payments/new` |

### Discount edit
| Test | URL | What to check |
|------|-----|---------------|
| Edit discount | [https://app.loomora.ch/discounts/:id/edit](https://app.loomora.ch/discounts/:id/edit) | From Discounts list → pick one → "Bearbeiten" goes to edit page |

---

## 2. Cross-Entity Links (ERP-style navigation)

### Invoices
- Go to [Invoices](https://app.loomora.ch/invoices)
- Click **customer name** → should go to `/customers/:id`
- Click **project** (if shown) → should go to `/projects/:id`
- Open an invoice → in Details sidebar: **Auftrag** and **Projekt** are clickable links

### Orders
- Go to [Orders](https://app.loomora.ch/orders)
- Click **customer** → goes to `/customers/:id`
- Click **project** → goes to `/projects/:id`
- Row menu: "Lieferschein erstellen" and "Rechnung erstellen" open correct create pages

### Delivery notes
- Go to [Delivery Notes](https://app.loomora.ch/delivery-notes)
- Click **customer** → goes to `/customers/:id`
- Click **project** → goes to `/projects/:id`
- Click **order number** → goes to `/orders/:id`

### Projects
- Go to [Projects](https://app.loomora.ch/projects)
- Click **customer name** → goes to `/customers/:id`
- "Bearbeiten" in row → goes to `/projects/:id/edit`

### Quotes & credit notes
- **Quote detail:** Project in Details links to `/projects/:id`
- **Credit note detail:** Project in Details links to `/projects/:id`
- **Project detail:** Customer subtitle links to `/customers/:id`

### Debtors & creditors
- [Debtors](https://app.loomora.ch/debtors): Click **firm name** → goes to `/customers/:id`
- [Creditors](https://app.loomora.ch/creditors): Click **firm name** → goes to `/suppliers/:id`
- Same in "Überfällig" tab and "Bald fällige" cards (creditors)

### Reminders
- Go to [Reminders](https://app.loomora.ch/reminders)
- In **cards** and **table**: customer name links to `/customers/:id`
- **History** tab: customer column links to customer detail

---

## 3. CustomerDetail → Orders → Delivery Note Flow

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Open a customer, tab **Lieferscheine** | Tab visible |
| 2 | Click **Neuer Lieferschein** | Redirects to `/orders?customerId=...` |
| 3 | See info banner | "Aufträge für diesen Kunden..." |
| 4 | Orders filtered | Only that customer's orders shown |
| 5 | Pick an order → "Lieferschein erstellen" | Opens `/delivery-notes/new?orderId=...` |
| 6 | Create delivery note | Form works, save succeeds |

---

## 4. Orders Customer Filter

| Test | URL | Expected |
|------|-----|----------|
| Direct link | [https://app.loomora.ch/orders?customerId=ANY_CUSTOMER_ID](https://app.loomora.ch/orders?customerId=ANY_CUSTOMER_ID) | Orders filtered by customer, banner visible |
| Reset | Click "Filter zurücksetzen" | Back to all orders, no banner |

---

## 5. Invoice & Discount Fixes

### Invoices
- Draft invoice → row menu → **Bearbeiten** → goes to edit page
- "Rechnung erstellen" from Orders → goes to `/invoices/new?orderId=...` (not `/invoices/create`)

### Discounts
- Discount detail → "Bearbeiten" → goes to `/discounts/:id/edit`
- Discount create → form wired to API, save works

### SepaPayments
- Row actions: Details/Edit navigate to `/payments/:id`

### Delivery notes
- Row dropdown: Delete works
- Order number links to order detail

---

## Quick Checklist

- [ ] `/journal-entries/new` – create journal entry
- [ ] `/sepa-payments/new` – create SEPA payment
- [ ] `/discounts/:id/edit` – edit discount
- [ ] Invoices: customer + project links
- [ ] Orders: customer + project links, customer filter
- [ ] Delivery notes: customer, project, order links
- [ ] Projects: customer link
- [ ] Debtors: firm → customer
- [ ] Creditors: firm → supplier
- [ ] Reminders: customer links (list + history)
- [ ] CustomerDetail: "Neuer Lieferschein" → orders filtered → create from order
- [ ] InvoiceDetail: project link in sidebar
