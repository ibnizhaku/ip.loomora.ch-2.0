--
-- PostgreSQL database dump
--

\restrict 9evcaagHf0dEQA7tWaUwbktoVVbAGXZmMFTHw5A9YioTA0pf6XRHEBLmMxT8K7k

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AbsenceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AbsenceStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: AbsenceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AbsenceType" AS ENUM (
    'VACATION',
    'SICK',
    'UNPAID',
    'MATERNITY',
    'PATERNITY',
    'OTHER'
);


--
-- Name: AssetCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetCategory" AS ENUM (
    'BUILDINGS',
    'MACHINERY',
    'VEHICLES',
    'FURNITURE',
    'IT_EQUIPMENT',
    'SOFTWARE',
    'TOOLS',
    'OTHER'
);


--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'ACTIVE',
    'FULLY_DEPRECIATED',
    'DISPOSED',
    'SOLD'
);


--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuditAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'EXPORT',
    'PRINT',
    'LOGIN',
    'LOGOUT',
    'APPROVE',
    'REJECT',
    'SEND',
    'LOCK',
    'UNLOCK'
);


--
-- Name: AuditModule; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuditModule" AS ENUM (
    'AUTH',
    'CUSTOMERS',
    'SUPPLIERS',
    'PRODUCTS',
    'QUOTES',
    'ORDERS',
    'INVOICES',
    'PAYMENTS',
    'EMPLOYEES',
    'PROJECTS',
    'FINANCE',
    'DOCUMENTS',
    'CONTRACTS',
    'SETTINGS',
    'USERS',
    'SYSTEM'
);


--
-- Name: BankTransactionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BankTransactionStatus" AS ENUM (
    'PENDING',
    'MATCHED',
    'RECONCILED',
    'IGNORED'
);


--
-- Name: BankTransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BankTransactionType" AS ENUM (
    'CREDIT',
    'DEBIT'
);


--
-- Name: BudgetPeriod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BudgetPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


--
-- Name: BudgetStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BudgetStatus" AS ENUM (
    'DRAFT',
    'APPROVED',
    'ACTIVE',
    'CLOSED'
);


--
-- Name: CalculationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CalculationStatus" AS ENUM (
    'DRAFT',
    'CALCULATED',
    'APPROVED',
    'TRANSFERRED'
);


--
-- Name: CashTransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CashTransactionType" AS ENUM (
    'RECEIPT',
    'PAYMENT',
    'OPENING',
    'CLOSING'
);


--
-- Name: CreditNoteReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CreditNoteReason" AS ENUM (
    'RETURN',
    'PRICE_ADJUSTMENT',
    'QUANTITY_DIFFERENCE',
    'QUALITY_ISSUE',
    'GOODWILL',
    'OTHER'
);


--
-- Name: CreditNoteStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CreditNoteStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'APPLIED',
    'CANCELLED'
);


--
-- Name: DMSDocumentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DMSDocumentStatus" AS ENUM (
    'ACTIVE',
    'ARCHIVED',
    'DELETED'
);


--
-- Name: DeliveryNoteStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DeliveryNoteStatus" AS ENUM (
    'DRAFT',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


--
-- Name: DepreciationMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DepreciationMethod" AS ENUM (
    'LINEAR',
    'DECLINING'
);


--
-- Name: DocumentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DocumentStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'CONFIRMED',
    'CANCELLED'
);


--
-- Name: EmployeeStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'VACATION',
    'SICK',
    'INACTIVE'
);


--
-- Name: EventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventType" AS ENUM (
    'MEETING',
    'CALL',
    'DEADLINE',
    'REMINDER',
    'VACATION'
);


--
-- Name: FolderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FolderType" AS ENUM (
    'SYSTEM',
    'PROJECT',
    'CUSTOMER',
    'INVOICE',
    'CONTRACT',
    'EMPLOYEE',
    'GENERAL'
);


--
-- Name: GavLohnklasse; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GavLohnklasse" AS ENUM (
    'A',
    'B',
    'C',
    'D',
    'E',
    'F'
);


--
-- Name: GoodsReceiptStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GoodsReceiptStatus" AS ENUM (
    'PENDING',
    'PARTIAL',
    'COMPLETE',
    'CANCELLED'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PARTIAL',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);


--
-- Name: JournalEntryStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."JournalEntryStatus" AS ENUM (
    'DRAFT',
    'POSTED',
    'REVERSED'
);


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'TWINT',
    'PAYPAL',
    'CASH',
    'INVOICE'
);


--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: PaymentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentType" AS ENUM (
    'INCOMING',
    'OUTGOING'
);


--
-- Name: ProductionOrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductionOrderStatus" AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: ProductionPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductionPriority" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);


--
-- Name: ProjectPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectPriority" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);


--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'PLANNING',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: QstStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QstStatus" AS ENUM (
    'ACTIVE',
    'EXEMPT',
    'CROSS_BORDER'
);


--
-- Name: QualityCheckStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QualityCheckStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'PASSED',
    'FAILED',
    'CONDITIONAL'
);


--
-- Name: QualityCheckType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QualityCheckType" AS ENUM (
    'INCOMING',
    'IN_PROCESS',
    'FINAL'
);


--
-- Name: QualityStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QualityStatus" AS ENUM (
    'NOT_CHECKED',
    'PASSED',
    'FAILED',
    'PARTIAL'
);


--
-- Name: ReminderLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderLevel" AS ENUM (
    'FIRST',
    'SECOND',
    'THIRD',
    'FOURTH',
    'FIFTH'
);


--
-- Name: ReminderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReminderStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'CANCELLED'
);


--
-- Name: ServiceTicketPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceTicketPriority" AS ENUM (
    'URGENT',
    'HIGH',
    'MEDIUM',
    'LOW'
);


--
-- Name: ServiceTicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceTicketStatus" AS ENUM (
    'OPEN',
    'ASSIGNED',
    'IN_PROGRESS',
    'WAITING',
    'RESOLVED',
    'CLOSED'
);


--
-- Name: ServiceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ServiceType" AS ENUM (
    'REPAIR',
    'MAINTENANCE',
    'INSTALLATION',
    'INSPECTION',
    'WARRANTY'
);


--
-- Name: SwissdecMessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SwissdecMessageType" AS ENUM (
    'SALARY_DECLARATION',
    'ANNUAL_DECLARATION',
    'CORRECTION',
    'TERMINATION'
);


--
-- Name: SwissdecStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SwissdecStatus" AS ENUM (
    'DRAFT',
    'VALIDATED',
    'SUBMITTED',
    'ACKNOWLEDGED',
    'REJECTED',
    'PROCESSED'
);


--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);


--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'REVIEW',
    'DONE'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'MANAGER',
    'EMPLOYEE',
    'READONLY'
);


--
-- Name: VatMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VatMethod" AS ENUM (
    'AGREED',
    'RECEIVED'
);


--
-- Name: VatRate; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VatRate" AS ENUM (
    'STANDARD',
    'REDUCED',
    'SPECIAL',
    'EXEMPT'
);


--
-- Name: VatReturnPeriod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VatReturnPeriod" AS ENUM (
    'MONTHLY',
    'QUARTERLY',
    'YEARLY'
);


--
-- Name: VatReturnStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VatReturnStatus" AS ENUM (
    'DRAFT',
    'CALCULATED',
    'SUBMITTED',
    'ACCEPTED',
    'REJECTED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _Interviewer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."_Interviewer" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: absences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.absences (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    type public."AbsenceType" NOT NULL,
    status public."AbsenceStatus" DEFAULT 'PENDING'::public."AbsenceStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    days numeric(4,1) NOT NULL,
    reason text,
    notes text,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: asset_depreciations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asset_depreciations (
    id text NOT NULL,
    "fixedAssetId" text NOT NULL,
    year integer NOT NULL,
    amount numeric(14,2) NOT NULL,
    "bookValueBefore" numeric(14,2) NOT NULL,
    "bookValueAfter" numeric(14,2) NOT NULL,
    "journalEntryId" text,
    "isPosted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    action public."AuditAction" NOT NULL,
    module public."AuditModule" NOT NULL,
    "entityId" text,
    "entityType" text,
    "entityName" text,
    description text,
    "oldValues" jsonb,
    "newValues" jsonb,
    metadata jsonb,
    "ipAddress" text,
    "userAgent" text,
    "retentionUntil" timestamp(3) without time zone NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    id text NOT NULL,
    name text NOT NULL,
    iban text NOT NULL,
    bic text,
    "bankName" text,
    currency text DEFAULT 'CHF'::text NOT NULL,
    balance numeric(14,2) DEFAULT 0 NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "qrIban" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transactions (
    id text NOT NULL,
    "bankAccountId" text NOT NULL,
    "entryReference" text,
    type public."BankTransactionType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'CHF'::text NOT NULL,
    "bookingDate" timestamp(3) without time zone NOT NULL,
    "valueDate" timestamp(3) without time zone NOT NULL,
    "qrReference" text,
    "creditorReference" text,
    "endToEndId" text,
    "remittanceInfo" text,
    "debtorName" text,
    "debtorIban" text,
    "creditorName" text,
    "creditorIban" text,
    status public."BankTransactionStatus" DEFAULT 'PENDING'::public."BankTransactionStatus" NOT NULL,
    "matchedInvoiceId" text,
    "matchedPaymentId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: bill_of_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bill_of_materials (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "projectId" text,
    "isTemplate" boolean DEFAULT false NOT NULL,
    category text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: bom_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bom_items (
    id text NOT NULL,
    "bomId" text NOT NULL,
    type text NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    hours numeric(10,2),
    "hourlyRate" numeric(10,2),
    total numeric(12,2) NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: budget_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_lines (
    id text NOT NULL,
    "budgetId" text NOT NULL,
    "accountId" text NOT NULL,
    "costCenterId" text,
    amount numeric(14,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budgets (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    description text,
    period public."BudgetPeriod" NOT NULL,
    year integer NOT NULL,
    quarter integer,
    month integer,
    status public."BudgetStatus" DEFAULT 'DRAFT'::public."BudgetStatus" NOT NULL,
    "totalAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    "approvedAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: calculation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculation_items (
    id text NOT NULL,
    "calculationId" text NOT NULL,
    type text NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitCost" numeric(12,2) NOT NULL,
    hours numeric(10,2),
    "hourlyRate" numeric(10,2),
    total numeric(12,2) NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: calculations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calculations (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    description text,
    "projectId" text,
    "bomId" text,
    "customerId" text,
    "quoteId" text,
    status public."CalculationStatus" DEFAULT 'DRAFT'::public."CalculationStatus" NOT NULL,
    "materialMarkup" numeric(5,2) DEFAULT 15 NOT NULL,
    "laborMarkup" numeric(5,2) DEFAULT 10 NOT NULL,
    "overheadPercent" numeric(5,2) DEFAULT 8 NOT NULL,
    "profitMargin" numeric(5,2) DEFAULT 12 NOT NULL,
    "riskMargin" numeric(5,2) DEFAULT 5 NOT NULL,
    discount numeric(5,2) DEFAULT 0 NOT NULL,
    "totalCost" numeric(12,2),
    "totalPrice" numeric(12,2),
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    type public."EventType" DEFAULT 'MEETING'::public."EventType" NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone,
    "isAllDay" boolean DEFAULT false NOT NULL,
    location text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    budget numeric(12,2) DEFAULT 0 NOT NULL,
    spent numeric(12,2) DEFAULT 0 NOT NULL,
    "targetAudience" text,
    "expectedReach" integer,
    "actualReach" integer,
    conversions integer DEFAULT 0,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidates (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    street text,
    "zipCode" text,
    city text,
    country text,
    "dateOfBirth" timestamp(3) without time zone,
    nationality text,
    "linkedinUrl" text,
    "portfolioUrl" text,
    "resumeUrl" text,
    "coverLetterUrl" text,
    "jobPostingId" text NOT NULL,
    status text DEFAULT 'NEW'::text NOT NULL,
    source text,
    "expectedSalary" numeric(12,2),
    "availableFrom" timestamp(3) without time zone,
    rating integer,
    notes text,
    skills text[] DEFAULT ARRAY[]::text[],
    "hiredAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cash_closings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_closings (
    id text NOT NULL,
    "cashRegisterId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "systemBalance" numeric(14,2) NOT NULL,
    "countedAmount" numeric(14,2) NOT NULL,
    difference numeric(14,2) NOT NULL,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: cash_registers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_registers (
    id text NOT NULL,
    name text NOT NULL,
    location text,
    "currentBalance" numeric(14,2) DEFAULT 0 NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cash_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cash_transactions (
    id text NOT NULL,
    number text NOT NULL,
    "cashRegisterId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    type public."CashTransactionType" NOT NULL,
    amount numeric(14,2) NOT NULL,
    description text NOT NULL,
    reference text,
    category text,
    "accountId" text,
    "costCenterId" text,
    "vatRate" text,
    "vatAmount" numeric(14,2) DEFAULT 0 NOT NULL,
    "balanceAfter" numeric(14,2) NOT NULL,
    "isPosted" boolean DEFAULT false NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chart_of_accounts (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: check_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.check_results (
    id text NOT NULL,
    "qualityCheckId" text NOT NULL,
    "checklistItemId" text NOT NULL,
    passed boolean NOT NULL,
    notes text,
    "measuredValue" text,
    "photoUrls" text[] DEFAULT ARRAY[]::text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.checklist_items (
    id text NOT NULL,
    "checklistId" text NOT NULL,
    name text NOT NULL,
    description text,
    required boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id text NOT NULL,
    name text NOT NULL,
    "legalName" text,
    street text,
    "zipCode" text,
    city text,
    country text DEFAULT 'CH'::text NOT NULL,
    phone text,
    email text,
    website text,
    "vatNumber" text,
    iban text,
    bic text,
    "bankName" text,
    "logoUrl" text,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    "shopSettings" jsonb,
    "invoiceCounter" integer DEFAULT 0 NOT NULL,
    "quoteCounter" integer DEFAULT 0 NOT NULL,
    "orderCounter" integer DEFAULT 0 NOT NULL,
    "deliveryCounter" integer DEFAULT 0 NOT NULL,
    "creditNoteCounter" integer DEFAULT 0 NOT NULL,
    "purchaseCounter" integer DEFAULT 0 NOT NULL,
    "projectCounter" integer DEFAULT 0 NOT NULL,
    "employeeCounter" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "position" text,
    phone text,
    mobile text,
    email text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    notes text,
    "customerId" text,
    "supplierId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: contract_renewals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_renewals (
    id text NOT NULL,
    "contractId" text NOT NULL,
    "previousEndDate" timestamp(3) without time zone,
    "newEndDate" timestamp(3) without time zone NOT NULL,
    "previousValue" numeric(14,2) NOT NULL,
    "newValue" numeric(14,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id text NOT NULL,
    "contractNumber" text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "customerId" text NOT NULL,
    "projectId" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "durationMonths" integer,
    "autoRenew" boolean DEFAULT false NOT NULL,
    "renewalPeriodMonths" integer,
    "noticePeriodDays" integer,
    "renewalCount" integer DEFAULT 0 NOT NULL,
    value numeric(14,2) NOT NULL,
    "billingCycle" text,
    "paymentTerms" text,
    terms text,
    notes text,
    "responsibleId" text,
    "terminatedAt" timestamp(3) without time zone,
    "terminationReason" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_centers (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    description text,
    "parentId" text,
    "managerId" text,
    "budgetAmount" numeric(14,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: credit_note_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_note_items (
    id text NOT NULL,
    "creditNoteId" text NOT NULL,
    "position" integer NOT NULL,
    "productId" text,
    description text,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "vatRate" numeric(5,2) DEFAULT 8.1 NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL
);


--
-- Name: credit_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_notes (
    id text NOT NULL,
    number text NOT NULL,
    "customerId" text NOT NULL,
    "invoiceId" text,
    status public."CreditNoteStatus" DEFAULT 'DRAFT'::public."CreditNoteStatus" NOT NULL,
    reason public."CreditNoteReason",
    "reasonText" text,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "vatRate" numeric(5,2) DEFAULT 8.1 NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    "companyName" text,
    salutation text,
    street text,
    "zipCode" text,
    city text,
    country text DEFAULT 'CH'::text NOT NULL,
    phone text,
    mobile text,
    email text,
    website text,
    "vatNumber" text,
    "paymentTermDays" integer DEFAULT 30 NOT NULL,
    "creditLimit" numeric(12,2),
    discount numeric(5,2) DEFAULT 0 NOT NULL,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: delivery_note_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_note_items (
    id text NOT NULL,
    "deliveryNoteId" text NOT NULL,
    "position" integer NOT NULL,
    "productId" text,
    description text,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL
);


--
-- Name: delivery_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_notes (
    id text NOT NULL,
    number text NOT NULL,
    "customerId" text NOT NULL,
    "orderId" text,
    status public."DeliveryNoteStatus" DEFAULT 'DRAFT'::public."DeliveryNoteStatus" NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryDate" timestamp(3) without time zone,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "deliveryAddress" text,
    "shippingAddress" jsonb,
    "trackingNumber" text,
    carrier text,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "managerId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discounts (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    value numeric(10,2) NOT NULL,
    "minimumOrderValue" numeric(12,2),
    "maximumDiscount" numeric(12,2),
    "usageLimit" integer,
    "usageLimitPerCustomer" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "validFrom" timestamp(3) without time zone NOT NULL,
    "validUntil" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "applicableProductIds" text[] DEFAULT ARRAY[]::text[],
    "applicableCategoryIds" text[] DEFAULT ARRAY[]::text[],
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: dms_document_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dms_document_versions (
    id text NOT NULL,
    "documentId" text NOT NULL,
    version integer NOT NULL,
    "storageUrl" text NOT NULL,
    "storagePath" text,
    "fileSize" integer NOT NULL,
    "changeNote" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: dms_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dms_documents (
    id text NOT NULL,
    name text NOT NULL,
    "mimeType" text,
    "fileSize" integer,
    "storageUrl" text,
    "storagePath" text,
    description text,
    tags text[] DEFAULT ARRAY[]::text[],
    version integer DEFAULT 1 NOT NULL,
    status public."DMSDocumentStatus" DEFAULT 'ACTIVE'::public."DMSDocumentStatus" NOT NULL,
    "folderId" text,
    "projectId" text,
    "customerId" text,
    "invoiceId" text,
    "contractId" text,
    "employeeId" text,
    "companyId" text NOT NULL,
    "uploadedById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    "templateId" text,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "recipientListIds" text[] DEFAULT ARRAY[]::text[],
    "senderName" text,
    "senderEmail" text,
    "replyToEmail" text,
    "sentCount" integer DEFAULT 0 NOT NULL,
    "openCount" integer DEFAULT 0 NOT NULL,
    "clickCount" integer DEFAULT 0 NOT NULL,
    "bounceCount" integer DEFAULT 0 NOT NULL,
    "unsubscribeCount" integer DEFAULT 0 NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: employee_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_contracts (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    "contractType" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "salaryType" text NOT NULL,
    "baseSalary" numeric(12,2) NOT NULL,
    "hourlyRate" numeric(10,2),
    "wageClass" text,
    "workHoursPerWeek" numeric(4,1) DEFAULT 42.5 NOT NULL,
    "vacationDays" integer DEFAULT 25 NOT NULL,
    "probationEnd" timestamp(3) without time zone,
    "noticePeriod" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id text NOT NULL,
    number text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text,
    mobile text,
    "position" text,
    "departmentId" text,
    status public."EmployeeStatus" DEFAULT 'ACTIVE'::public."EmployeeStatus" NOT NULL,
    "hireDate" timestamp(3) without time zone,
    "terminationDate" timestamp(3) without time zone,
    "ahvNumber" text,
    "dateOfBirth" timestamp(3) without time zone,
    nationality text,
    "maritalStatus" text,
    "childrenCount" integer DEFAULT 0 NOT NULL,
    "employmentType" text,
    "workloadPercent" integer DEFAULT 100 NOT NULL,
    iban text,
    "avatarUrl" text,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_attendees (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL
);


--
-- Name: event_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_reminders (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "minutesBefore" integer NOT NULL,
    method text NOT NULL
);


--
-- Name: fixed_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fixed_assets (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    description text,
    category public."AssetCategory" NOT NULL,
    "serialNumber" text,
    location text,
    "acquisitionDate" timestamp(3) without time zone NOT NULL,
    "acquisitionCost" numeric(14,2) NOT NULL,
    "residualValue" numeric(14,2) DEFAULT 0 NOT NULL,
    "currentBookValue" numeric(14,2) NOT NULL,
    "usefulLife" integer NOT NULL,
    "depreciationMethod" public."DepreciationMethod" NOT NULL,
    "depreciationRate" numeric(5,4) NOT NULL,
    status public."AssetStatus" DEFAULT 'ACTIVE'::public."AssetStatus" NOT NULL,
    "disposalDate" timestamp(3) without time zone,
    "salePrice" numeric(14,2),
    "gainLoss" numeric(14,2),
    "disposalReason" text,
    "disposalNotes" text,
    "purchaseInvoiceId" text,
    "costCenterId" text,
    "assetAccountId" text,
    "depreciationAccountId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folders (
    id text NOT NULL,
    name text NOT NULL,
    type public."FolderType" DEFAULT 'GENERAL'::public."FolderType" NOT NULL,
    description text,
    "parentId" text,
    "projectId" text,
    "customerId" text,
    "companyId" text NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: gav_employee_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gav_employee_data (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    lohnklasse public."GavLohnklasse" NOT NULL,
    "hourlyRate" numeric(8,2) NOT NULL,
    "yearsExperience" integer,
    "hasEfz" boolean DEFAULT false NOT NULL,
    "efzProfession" text,
    "efzDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: gav_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gav_settings (
    id text NOT NULL,
    year integer NOT NULL,
    "weeklyHours" numeric(4,1) DEFAULT 42.5 NOT NULL,
    "minRateA" numeric(6,2) NOT NULL,
    "minRateB" numeric(6,2) NOT NULL,
    "minRateC" numeric(6,2) NOT NULL,
    "minRateD" numeric(6,2) NOT NULL,
    "minRateE" numeric(6,2) NOT NULL,
    "minRateF" numeric(6,2) NOT NULL,
    schmutzzulage numeric(6,2) NOT NULL,
    hoehenzulage numeric(6,2) NOT NULL,
    "nachtzulageProzent" integer NOT NULL,
    "sonntagProzent" integer NOT NULL,
    "ueberZeitProzent" integer NOT NULL,
    essenszulage numeric(6,2) NOT NULL,
    "unterkunftMax" numeric(6,2) NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: goods_receipt_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipt_items (
    id text NOT NULL,
    "goodsReceiptId" text NOT NULL,
    "position" integer NOT NULL,
    "productId" text NOT NULL,
    "orderedQuantity" numeric(12,3) NOT NULL,
    "receivedQuantity" numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "qualityStatus" public."QualityStatus" DEFAULT 'NOT_CHECKED'::public."QualityStatus" NOT NULL,
    "qualityNotes" text,
    "batchNumber" text,
    "serialNumber" text,
    "storageLocation" text
);


--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipts (
    id text NOT NULL,
    number text NOT NULL,
    "purchaseOrderId" text NOT NULL,
    status public."GoodsReceiptStatus" DEFAULT 'PENDING'::public."GoodsReceiptStatus" NOT NULL,
    "receiptDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryNoteNumber" text,
    carrier text,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interviews (
    id text NOT NULL,
    "candidateId" text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'SCHEDULED'::text NOT NULL,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "durationMinutes" integer,
    location text,
    "meetingUrl" text,
    feedback text,
    rating integer,
    "recommendHire" boolean,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id text NOT NULL,
    "productId" text NOT NULL,
    type text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    reference text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "position" integer NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    discount numeric(5,2),
    "vatRate" numeric(5,2) DEFAULT 8.1 NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    number text NOT NULL,
    "customerId" text NOT NULL,
    "orderId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "billingAddress" jsonb,
    subtotal numeric(12,2) NOT NULL,
    "discountPercent" numeric(5,2),
    "discountAmount" numeric(12,2),
    "vatRate" numeric(5,2) DEFAULT 8.1 NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "qrReference" text,
    "qrIban" text,
    notes text,
    "internalNotes" text,
    "paymentTerms" text,
    "createdById" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: job_postings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_postings (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    requirements text,
    benefits text,
    department text,
    location text,
    "remoteAllowed" boolean DEFAULT false NOT NULL,
    "employmentType" text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "salaryMin" numeric(12,2),
    "salaryMax" numeric(12,2),
    "workloadPercent" integer,
    "startDate" timestamp(3) without time zone,
    "applicationDeadline" timestamp(3) without time zone,
    "publishedAt" timestamp(3) without time zone,
    "contactPersonId" text,
    "requiredSkills" text[] DEFAULT ARRAY[]::text[],
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "debitAccountId" text NOT NULL,
    "creditAccountId" text NOT NULL,
    amount numeric(14,2) NOT NULL,
    description text,
    reference text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: journal_entries_extended; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_entries_extended (
    id text NOT NULL,
    number text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    reference text,
    "documentType" text,
    "documentId" text,
    status public."JournalEntryStatus" DEFAULT 'DRAFT'::public."JournalEntryStatus" NOT NULL,
    "totalAmount" numeric(14,2) NOT NULL,
    "postedAt" timestamp(3) without time zone,
    "reversesEntryId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.journal_lines (
    id text NOT NULL,
    "journalEntryId" text NOT NULL,
    "accountId" text NOT NULL,
    debit numeric(14,2) DEFAULT 0 NOT NULL,
    credit numeric(14,2) DEFAULT 0 NOT NULL,
    "costCenterId" text,
    description text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lead_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_activities (
    id text NOT NULL,
    "leadId" text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    "activityDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "durationMinutes" integer,
    outcome text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id text NOT NULL,
    name text NOT NULL,
    "companyName" text,
    email text,
    phone text,
    "position" text,
    source text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    priority text,
    "estimatedValue" numeric(12,2),
    score integer DEFAULT 0,
    "assignedToId" text,
    "campaignId" text,
    "customerId" text,
    "convertedAt" timestamp(3) without time zone,
    "nextFollowUp" timestamp(3) without time zone,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    link text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "position" integer NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    discount numeric(5,2),
    "vatRate" public."VatRate" DEFAULT 'STANDARD'::public."VatRate" NOT NULL,
    total numeric(12,2) NOT NULL,
    "deliveredQty" numeric(12,3) DEFAULT 0 NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    number text NOT NULL,
    "customerId" text NOT NULL,
    "quoteId" text,
    "projectId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryDate" timestamp(3) without time zone,
    status public."DocumentStatus" DEFAULT 'DRAFT'::public."DocumentStatus" NOT NULL,
    "billingAddress" jsonb,
    "shippingAddress" jsonb,
    subtotal numeric(12,2) NOT NULL,
    "discountPercent" numeric(5,2),
    "discountAmount" numeric(12,2),
    "vatAmount" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    notes text,
    "internalNotes" text,
    "createdById" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    number text NOT NULL,
    type public."PaymentType" DEFAULT 'INCOMING'::public."PaymentType" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "invoiceId" text,
    "purchaseInvoiceId" text,
    "customerId" text,
    "supplierId" text,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    amount numeric(12,2) NOT NULL,
    method text NOT NULL,
    reference text,
    "qrReference" text,
    notes text,
    "bankAccountId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payslip_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payslip_items (
    id text NOT NULL,
    "payslipId" text NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "isDeduction" boolean DEFAULT false NOT NULL
);


--
-- Name: payslips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payslips (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    period timestamp(3) without time zone NOT NULL,
    "grossSalary" numeric(12,2) NOT NULL,
    "netSalary" numeric(12,2) NOT NULL,
    "ahvDeduction" numeric(10,2) DEFAULT 0 NOT NULL,
    "alvDeduction" numeric(10,2) DEFAULT 0 NOT NULL,
    "nbuDeduction" numeric(10,2) DEFAULT 0 NOT NULL,
    "bvgDeduction" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxDeduction" numeric(10,2) DEFAULT 0 NOT NULL,
    "hoursWorked" numeric(6,2),
    overtime numeric(6,2),
    "vacationDays" numeric(4,1),
    "sickDays" numeric(4,1),
    notes text,
    "isPaid" boolean DEFAULT false NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "parentId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: production_operations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_operations (
    id text NOT NULL,
    "productionOrderId" text NOT NULL,
    name text NOT NULL,
    description text,
    workstation text,
    "plannedHours" numeric(10,2) NOT NULL,
    "actualHours" numeric(10,2) DEFAULT 0 NOT NULL,
    "assignedEmployeeId" text,
    status text DEFAULT 'pending'::text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


--
-- Name: production_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_orders (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    description text,
    "projectId" text,
    "orderId" text,
    "bomId" text,
    status public."ProductionOrderStatus" DEFAULT 'PLANNED'::public."ProductionOrderStatus" NOT NULL,
    priority public."ProductionPriority" DEFAULT 'MEDIUM'::public."ProductionPriority" NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "plannedStartDate" timestamp(3) without time zone NOT NULL,
    "plannedEndDate" timestamp(3) without time zone,
    "actualStartDate" timestamp(3) without time zone,
    "actualEndDate" timestamp(3) without time zone,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    unit text DEFAULT 'Stk'::text NOT NULL,
    "purchasePrice" numeric(12,2) DEFAULT 0 NOT NULL,
    "salePrice" numeric(12,2) NOT NULL,
    "vatRate" public."VatRate" DEFAULT 'STANDARD'::public."VatRate" NOT NULL,
    "stockQuantity" numeric(12,3) DEFAULT 0 NOT NULL,
    "minStock" numeric(12,3) DEFAULT 0 NOT NULL,
    "maxStock" numeric(12,3),
    "reservedStock" numeric(12,3) DEFAULT 0 NOT NULL,
    weight numeric(10,3),
    length numeric(10,2),
    width numeric(10,2),
    height numeric(10,2),
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isService" boolean DEFAULT false NOT NULL,
    "categoryId" text,
    "supplierId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: project_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_members (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "employeeId" text NOT NULL,
    role text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    description text,
    "customerId" text,
    status public."ProjectStatus" DEFAULT 'PLANNING'::public."ProjectStatus" NOT NULL,
    priority public."ProjectPriority" DEFAULT 'MEDIUM'::public."ProjectPriority" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    budget numeric(12,2),
    spent numeric(12,2) DEFAULT 0 NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    "createdById" text NOT NULL,
    "managerId" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: purchase_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_invoices (
    id text NOT NULL,
    number text NOT NULL,
    "supplierId" text NOT NULL,
    "purchaseOrderId" text,
    date timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "documentUrl" text,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id text NOT NULL,
    "purchaseOrderId" text NOT NULL,
    "position" integer NOT NULL,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "vatRate" public."VatRate" DEFAULT 'STANDARD'::public."VatRate" NOT NULL,
    total numeric(12,2) NOT NULL
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id text NOT NULL,
    number text NOT NULL,
    "supplierId" text NOT NULL,
    "projectId" text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expectedDate" timestamp(3) without time zone,
    status public."DocumentStatus" DEFAULT 'DRAFT'::public."DocumentStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: qst_employee_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qst_employee_data (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    status public."QstStatus" DEFAULT 'ACTIVE'::public."QstStatus" NOT NULL,
    kanton text NOT NULL,
    tarif text NOT NULL,
    "childCount" numeric(3,1) DEFAULT 0 NOT NULL,
    "churchMember" boolean DEFAULT true NOT NULL,
    nationality text,
    "permitType" text,
    "permitValidUntil" timestamp(3) without time zone,
    "crossBorderCountry" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: quality_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quality_checklists (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'FINAL'::text NOT NULL,
    category text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: quality_checks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quality_checks (
    id text NOT NULL,
    number text NOT NULL,
    "checklistId" text NOT NULL,
    "productionOrderId" text,
    "goodsReceiptId" text,
    type text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "inspectorId" text,
    notes text,
    "completedAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_items (
    id text NOT NULL,
    "quoteId" text NOT NULL,
    "position" integer NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    discount numeric(5,2),
    "vatRate" public."VatRate" DEFAULT 'STANDARD'::public."VatRate" NOT NULL,
    total numeric(12,2) NOT NULL
);


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotes (
    id text NOT NULL,
    number text NOT NULL,
    "customerId" text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validUntil" timestamp(3) without time zone NOT NULL,
    status public."DocumentStatus" DEFAULT 'DRAFT'::public."DocumentStatus" NOT NULL,
    "billingAddress" jsonb,
    "shippingAddress" jsonb,
    subtotal numeric(12,2) NOT NULL,
    "discountPercent" numeric(5,2),
    "discountAmount" numeric(12,2),
    "vatAmount" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    notes text,
    "internalNotes" text,
    terms text,
    "createdById" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminders (
    id text NOT NULL,
    number text NOT NULL,
    "invoiceId" text NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    status public."ReminderStatus" DEFAULT 'DRAFT'::public."ReminderStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "sendMethod" text,
    "dueDate" timestamp(3) without time zone NOT NULL,
    fee numeric(10,2) DEFAULT 0 NOT NULL,
    "totalWithFee" numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "shopOrderId" text,
    "customerName" text NOT NULL,
    "customerEmail" text,
    rating integer NOT NULL,
    title text,
    content text NOT NULL,
    "isVerifiedPurchase" boolean DEFAULT false NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "moderatorNote" text,
    "moderatedAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: service_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_reports (
    id text NOT NULL,
    "serviceTicketId" text NOT NULL,
    "serviceDate" timestamp(3) without time zone NOT NULL,
    "hoursWorked" numeric(6,2) NOT NULL,
    "travelTime" numeric(6,2) DEFAULT 0 NOT NULL,
    "workPerformed" text NOT NULL,
    "partsUsed" text,
    "materialCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "laborCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "customerSignature" text,
    "photoUrls" text[] DEFAULT ARRAY[]::text[],
    "followUpNeeded" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: service_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_tickets (
    id text NOT NULL,
    number text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "customerId" text NOT NULL,
    "contactId" text,
    "projectId" text,
    "serviceType" public."ServiceType" NOT NULL,
    priority public."ServiceTicketPriority" DEFAULT 'MEDIUM'::public."ServiceTicketPriority" NOT NULL,
    status public."ServiceTicketStatus" DEFAULT 'OPEN'::public."ServiceTicketStatus" NOT NULL,
    "assignedTechnicianId" text,
    "scheduledDate" timestamp(3) without time zone,
    "estimatedHours" numeric(6,2),
    location text,
    "equipmentInfo" text,
    resolution text,
    tags text[] DEFAULT ARRAY[]::text[],
    "resolvedAt" timestamp(3) without time zone,
    "closedAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id text NOT NULL,
    "companyId" text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: shop_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_order_items (
    id text NOT NULL,
    "shopOrderId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL
);


--
-- Name: shop_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "customerId" text,
    "customerEmail" text NOT NULL,
    "billingAddress" jsonb NOT NULL,
    "shippingAddress" jsonb,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "paymentMethod" text,
    "paymentStatus" text DEFAULT 'PENDING'::text NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT 0 NOT NULL,
    "vatAmount" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    "discountId" text,
    "trackingNumber" text,
    "trackingUrl" text,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: subtasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subtasks (
    id text NOT NULL,
    "taskId" text NOT NULL,
    title text NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    number text NOT NULL,
    name text NOT NULL,
    "companyName" text,
    street text,
    "zipCode" text,
    city text,
    country text DEFAULT 'CH'::text NOT NULL,
    phone text,
    email text,
    website text,
    "vatNumber" text,
    iban text,
    "paymentTermDays" integer DEFAULT 30 NOT NULL,
    rating integer DEFAULT 0,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: swissdec_declarations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.swissdec_declarations (
    id text NOT NULL,
    "submissionId" text NOT NULL,
    "employeeId" text NOT NULL,
    year integer NOT NULL,
    month integer,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: swissdec_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.swissdec_submissions (
    id text NOT NULL,
    reference text NOT NULL,
    "messageType" public."SwissdecMessageType" NOT NULL,
    year integer NOT NULL,
    month integer,
    recipients text[] DEFAULT ARRAY[]::text[],
    status public."SwissdecStatus" DEFAULT 'DRAFT'::public."SwissdecStatus" NOT NULL,
    "employeeCount" integer DEFAULT 0 NOT NULL,
    "validationErrors" text[] DEFAULT ARRAY[]::text[],
    "validationWarnings" text[] DEFAULT ARRAY[]::text[],
    "validatedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone,
    "transmissionId" text,
    "xmlContent" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: task_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_tags (
    id text NOT NULL,
    "taskId" text NOT NULL,
    name text NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "projectId" text,
    status public."TaskStatus" DEFAULT 'TODO'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "estimatedHours" numeric(6,2),
    "assigneeId" text,
    "createdById" text NOT NULL,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.time_entries (
    id text NOT NULL,
    "userId" text NOT NULL,
    "projectId" text,
    "taskId" text,
    description text,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    duration integer NOT NULL,
    "isBillable" boolean DEFAULT true NOT NULL,
    "hourlyRate" numeric(10,2),
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: training_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_participants (
    id text NOT NULL,
    "trainingId" text NOT NULL,
    "employeeId" text NOT NULL,
    status text DEFAULT 'REGISTERED'::text NOT NULL,
    attended boolean DEFAULT false NOT NULL,
    rating integer,
    feedback text,
    "certificateIssued" boolean DEFAULT false NOT NULL,
    "certificateExpiryDate" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainings (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    status text DEFAULT 'DRAFT'::text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "durationHours" numeric(6,2),
    location text,
    "isOnline" boolean DEFAULT false NOT NULL,
    "meetingUrl" text,
    "maxParticipants" integer,
    "costPerPerson" numeric(10,2),
    "totalBudget" numeric(12,2),
    provider text,
    "instructorId" text,
    "instructorName" text,
    "targetDepartments" text[] DEFAULT ARRAY[]::text[],
    prerequisites text[] DEFAULT ARRAY[]::text[],
    "certificationType" text,
    "isMandatory" boolean DEFAULT false NOT NULL,
    notes text,
    "completedAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: travel_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.travel_expenses (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    kilometers numeric(8,2),
    "kmRate" numeric(4,2) DEFAULT 0.70 NOT NULL,
    "mealAllowance" numeric(10,2),
    accommodation numeric(10,2),
    "otherExpenses" numeric(10,2),
    "totalAmount" numeric(12,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "rejectionReason" text,
    "receiptUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."UserRole" DEFAULT 'EMPLOYEE'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "twoFactorEnabled" boolean DEFAULT false NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "refreshToken" text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: vat_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vat_returns (
    id text NOT NULL,
    number text NOT NULL,
    year integer NOT NULL,
    period public."VatReturnPeriod" NOT NULL,
    quarter integer,
    month integer,
    method public."VatMethod" DEFAULT 'AGREED'::public."VatMethod" NOT NULL,
    status public."VatReturnStatus" DEFAULT 'DRAFT'::public."VatReturnStatus" NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    "totalOutputTax" numeric(14,2),
    "totalInputTax" numeric(14,2),
    "vatPayable" numeric(14,2),
    "calculatedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone,
    "submissionMethod" text,
    "submissionReference" text,
    notes text,
    "companyId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _Interviewer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_Interviewer" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
\.


--
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.absences (id, "employeeId", type, status, "startDate", "endDate", days, reason, notes, "approvedById", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: asset_depreciations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asset_depreciations (id, "fixedAssetId", year, amount, "bookValueBefore", "bookValueAfter", "journalEntryId", "isPosted", "createdAt") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", action, module, "entityId", "entityType", "entityName", description, "oldValues", "newValues", metadata, "ipAddress", "userAgent", "retentionUntil", "companyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_accounts (id, name, iban, bic, "bankName", currency, balance, "isDefault", "qrIban", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bank_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transactions (id, "bankAccountId", "entryReference", type, amount, currency, "bookingDate", "valueDate", "qrReference", "creditorReference", "endToEndId", "remittanceInfo", "debtorName", "debtorIban", "creditorName", "creditorIban", status, "matchedInvoiceId", "matchedPaymentId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bill_of_materials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bill_of_materials (id, name, description, "projectId", "isTemplate", category, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: bom_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bom_items (id, "bomId", type, "productId", description, quantity, unit, "unitPrice", hours, "hourlyRate", total, "sortOrder") FROM stdin;
\.


--
-- Data for Name: budget_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_lines (id, "budgetId", "accountId", "costCenterId", amount, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budgets (id, number, name, description, period, year, quarter, month, status, "totalAmount", "approvedAt", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: calculation_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calculation_items (id, "calculationId", type, "productId", description, quantity, unit, "unitCost", hours, "hourlyRate", total, "sortOrder") FROM stdin;
\.


--
-- Data for Name: calculations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calculations (id, number, name, description, "projectId", "bomId", "customerId", "quoteId", status, "materialMarkup", "laborMarkup", "overheadPercent", "profitMargin", "riskMargin", discount, "totalCost", "totalPrice", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_events (id, title, description, type, "startTime", "endTime", "isAllDay", location, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.campaigns (id, name, description, type, status, "startDate", "endDate", budget, spent, "targetAudience", "expectedReach", "actualReach", conversions, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.candidates (id, "firstName", "lastName", email, phone, street, "zipCode", city, country, "dateOfBirth", nationality, "linkedinUrl", "portfolioUrl", "resumeUrl", "coverLetterUrl", "jobPostingId", status, source, "expectedSalary", "availableFrom", rating, notes, skills, "hiredAt", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cash_closings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_closings (id, "cashRegisterId", date, "systemBalance", "countedAmount", difference, notes, "companyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: cash_registers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_registers (id, name, location, "currentBalance", "isDefault", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cash_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cash_transactions (id, number, "cashRegisterId", date, type, amount, description, reference, category, "accountId", "costCenterId", "vatRate", "vatAmount", "balanceAfter", "isPosted", "companyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chart_of_accounts (id, number, name, type, "parentId", "isActive", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: check_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.check_results (id, "qualityCheckId", "checklistItemId", passed, notes, "measuredValue", "photoUrls", "createdAt") FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.checklist_items (id, "checklistId", name, description, required, "sortOrder") FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, "legalName", street, "zipCode", city, country, phone, email, website, "vatNumber", iban, bic, "bankName", "logoUrl", settings, "shopSettings", "invoiceCounter", "quoteCounter", "orderCounter", "deliveryCounter", "creditNoteCounter", "purchaseCounter", "projectCounter", "employeeCounter", "createdAt", "updatedAt") FROM stdin;
cml8ck7bf0000139rxnaefuma	Loomora GmbH	Loomora GmbH	Musterstrasse 123	8001	Zürich	CH	+41 44 123 45 67	info@loomora.ch	https://loomora.ch	CHE-123.456.789	\N	\N	\N	\N	{}	\N	0	0	0	0	0	0	2	0	2026-02-04 18:14:26.571	2026-02-05 13:35:08.233
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contacts (id, "firstName", "lastName", "position", phone, mobile, email, "isPrimary", notes, "customerId", "supplierId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contract_renewals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contract_renewals (id, "contractId", "previousEndDate", "newEndDate", "previousValue", "newValue", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, "contractNumber", name, description, type, status, "customerId", "projectId", "startDate", "endDate", "durationMonths", "autoRenew", "renewalPeriodMonths", "noticePeriodDays", "renewalCount", value, "billingCycle", "paymentTerms", terms, notes, "responsibleId", "terminatedAt", "terminationReason", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cost_centers (id, number, name, description, "parentId", "managerId", "budgetAmount", "isActive", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: credit_note_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_note_items (id, "creditNoteId", "position", "productId", description, quantity, unit, "unitPrice", "vatRate", "vatAmount", total) FROM stdin;
\.


--
-- Data for Name: credit_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.credit_notes (id, number, "customerId", "invoiceId", status, reason, "reasonText", "issueDate", subtotal, "vatRate", "vatAmount", "totalAmount", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, number, name, "companyName", salutation, street, "zipCode", city, country, phone, mobile, email, website, "vatNumber", "paymentTermDays", "creditLimit", discount, notes, "isActive", "companyId", "createdAt", "updatedAt") FROM stdin;
cml8f9upn000178el872zq2ml	K-001	Testfirma GmbH	Testfirma GmbH	\N	Teststrasse 123	8000	Zürich	CH	+41 44 123 45 67	\N	test@testfirma.ch	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-04 19:30:22.524	2026-02-04 19:30:22.524
cml8hbbph0001mncp07ejqz0q	K-002	Neti	Neti GBBA 	\N	\N	\N	\N	Schweiz	079 1111	111	info@ggba.ch	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-04 20:27:30.436	2026-02-04 20:27:30.436
cml9i53220001g0qoizjypp4j	K-004	Thomas Bauer	Sales Pro AG	\N	Reeperbahn 50	20359	Hamburg	DE	+49 172 3456789	\N	t.bauer@salespro.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:25.083	2026-02-05 13:38:25.083
cml9i532f0005g0qojbkswm86	K-003	Sandra Klein	FinTech Solutions	\N	Alexanderplatz 1	10178	Berlin	DE	+49 171 2345678	\N	s.klein@fintech.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:25.083	2026-02-05 13:38:25.083
cml9i532g0007g0qo26yzpno4	K-005	Julia Hoffmann	Data Analytics Inc.	\N	Kaiserstrasse 12	60311	Frankfurt	DE	+49 173 4567890	\N	j.hoffmann@dataanalytics.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:25.083	2026-02-05 13:38:25.083
cml9i5g8000011o6ce2lwvpku	K-006	Michael Weber	Fashion Store GmbH	\N	Musterstrasse 123	80331	München	DE	+49 170 1234567	\N	m.weber@fashionstore.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:42.145	2026-02-05 13:38:42.145
cml9i5g8700031o6c71dn49mc	K-007	Sandra Klein	FinTech Solutions	\N	Alexanderplatz 1	10178	Berlin	DE	+49 171 2345678	\N	s.klein@fintech.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:42.145	2026-02-05 13:38:42.145
cml9i5g8700051o6cpxu5n7em	K-008	Thomas Bauer	Sales Pro AG	\N	Reeperbahn 50	20359	Hamburg	DE	+49 172 3456789	\N	t.bauer@salespro.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:42.145	2026-02-05 13:38:42.145
cml9i5g8700071o6c63wsx1pt	K-009	Julia Hoffmann	Data Analytics Inc.	\N	Kaiserstrasse 12	60311	Frankfurt	DE	+49 173 4567890	\N	j.hoffmann@dataanalytics.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:42.145	2026-02-05 13:38:42.145
cml9i5wu600015ztc7zn8gv0o	K-010	Michael Weber	Fashion Store GmbH	\N	Musterstrasse 123	80331	München	DE	+49 170 1234567	\N	m.weber@fashionstore.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.678	2026-02-05 13:39:03.678
cml9i5wub00055ztcbue39rul	K-012	Thomas Bauer	Sales Pro AG	\N	Reeperbahn 50	20359	Hamburg	DE	+49 172 3456789	\N	t.bauer@salespro.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.678	2026-02-05 13:39:03.678
cml9i5wub00035ztcleybuip3	K-011	Sandra Klein	FinTech Solutions	\N	Alexanderplatz 1	10178	Berlin	DE	+49 171 2345678	\N	s.klein@fintech.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.678	2026-02-05 13:39:03.678
cml9i5wuc00075ztcnsac3k1r	K-013	Julia Hoffmann	Data Analytics Inc.	\N	Kaiserstrasse 12	60311	Frankfurt	DE	+49 173 4567890	\N	j.hoffmann@dataanalytics.de	\N	\N	30	\N	0.00	\N	t	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.678	2026-02-05 13:39:03.678
\.


--
-- Data for Name: delivery_note_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_note_items (id, "deliveryNoteId", "position", "productId", description, quantity, unit) FROM stdin;
\.


--
-- Data for Name: delivery_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_notes (id, number, "customerId", "orderId", status, date, "deliveryDate", "shippedAt", "deliveredAt", "deliveryAddress", "shippingAddress", "trackingNumber", carrier, notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, description, "managerId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discounts (id, code, name, description, type, value, "minimumOrderValue", "maximumDiscount", "usageLimit", "usageLimitPerCustomer", "usageCount", "validFrom", "validUntil", "isActive", "applicableProductIds", "applicableCategoryIds", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dms_document_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dms_document_versions (id, "documentId", version, "storageUrl", "storagePath", "fileSize", "changeNote", "createdById", "createdAt") FROM stdin;
\.


--
-- Data for Name: dms_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dms_documents (id, name, "mimeType", "fileSize", "storageUrl", "storagePath", description, tags, version, status, "folderId", "projectId", "customerId", "invoiceId", "contractId", "employeeId", "companyId", "uploadedById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_campaigns (id, name, subject, content, "templateId", status, "scheduledAt", "sentAt", "recipientListIds", "senderName", "senderEmail", "replyToEmail", "sentCount", "openCount", "clickCount", "bounceCount", "unsubscribeCount", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employee_contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_contracts (id, "employeeId", "contractType", "startDate", "endDate", "salaryType", "baseSalary", "hourlyRate", "wageClass", "workHoursPerWeek", "vacationDays", "probationEnd", "noticePeriod", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, number, "firstName", "lastName", email, phone, mobile, "position", "departmentId", status, "hireDate", "terminationDate", "ahvNumber", "dateOfBirth", nationality, "maritalStatus", "childrenCount", "employmentType", "workloadPercent", iban, "avatarUrl", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
cml9i5wun000j5ztc88n9k21x	MA-003	Lisa	Weber	l.weber@loomora.ch	+41 79 345 67 89	\N	UI Designer	\N	ACTIVE	2023-01-10 00:00:00	\N	\N	\N	\N	\N	0	\N	80	\N	\N	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.695	2026-02-05 13:39:03.695
cml9i5wun000i5ztcl0zunotv	MA-002	Thomas	Müller	t.mueller@loomora.ch	+41 79 234 56 78	\N	Backend Developer	\N	ACTIVE	2022-03-01 00:00:00	\N	\N	\N	\N	\N	0	\N	100	\N	\N	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.695	2026-02-05 13:39:03.695
cml9i5wun000h5ztchvv3lxre	MA-001	Anna	Schmidt	a.schmidt@loomora.ch	+41 79 123 45 67	\N	Lead Developer	\N	ACTIVE	2022-01-15 00:00:00	\N	\N	\N	\N	\N	0	\N	100	\N	\N	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.695	2026-02-05 13:39:03.695
\.


--
-- Data for Name: event_attendees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_attendees (id, "eventId", "userId", status) FROM stdin;
\.


--
-- Data for Name: event_reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_reminders (id, "eventId", "minutesBefore", method) FROM stdin;
\.


--
-- Data for Name: fixed_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fixed_assets (id, number, name, description, category, "serialNumber", location, "acquisitionDate", "acquisitionCost", "residualValue", "currentBookValue", "usefulLife", "depreciationMethod", "depreciationRate", status, "disposalDate", "salePrice", "gainLoss", "disposalReason", "disposalNotes", "purchaseInvoiceId", "costCenterId", "assetAccountId", "depreciationAccountId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.folders (id, name, type, description, "parentId", "projectId", "customerId", "companyId", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gav_employee_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gav_employee_data (id, "employeeId", lohnklasse, "hourlyRate", "yearsExperience", "hasEfz", "efzProfession", "efzDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: gav_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gav_settings (id, year, "weeklyHours", "minRateA", "minRateB", "minRateC", "minRateD", "minRateE", "minRateF", schmutzzulage, hoehenzulage, "nachtzulageProzent", "sonntagProzent", "ueberZeitProzent", essenszulage, "unterkunftMax", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: goods_receipt_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_receipt_items (id, "goodsReceiptId", "position", "productId", "orderedQuantity", "receivedQuantity", unit, "qualityStatus", "qualityNotes", "batchNumber", "serialNumber", "storageLocation") FROM stdin;
\.


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.goods_receipts (id, number, "purchaseOrderId", status, "receiptDate", "deliveryNoteNumber", carrier, notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.interviews (id, "candidateId", type, status, "scheduledAt", "durationMinutes", location, "meetingUrl", feedback, rating, "recommendHire", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_movements (id, "productId", type, quantity, reference, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_items (id, "invoiceId", "position", "productId", description, quantity, unit, "unitPrice", discount, "vatRate", "vatAmount", total) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, number, "customerId", "orderId", date, "dueDate", "paidAt", status, "billingAddress", subtotal, "discountPercent", "discountAmount", "vatRate", "vatAmount", "totalAmount", "paidAmount", "qrReference", "qrIban", notes, "internalNotes", "paymentTerms", "createdById", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: job_postings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_postings (id, title, description, requirements, benefits, department, location, "remoteAllowed", "employmentType", status, "salaryMin", "salaryMax", "workloadPercent", "startDate", "applicationDeadline", "publishedAt", "contactPersonId", "requiredSkills", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entries (id, date, "debitAccountId", "creditAccountId", amount, description, reference, "companyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: journal_entries_extended; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_entries_extended (id, number, date, description, reference, "documentType", "documentId", status, "totalAmount", "postedAt", "reversesEntryId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.journal_lines (id, "journalEntryId", "accountId", debit, credit, "costCenterId", description, "sortOrder", "createdAt") FROM stdin;
\.


--
-- Data for Name: lead_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lead_activities (id, "leadId", type, description, "activityDate", "durationMinutes", outcome, "createdAt") FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, name, "companyName", email, phone, "position", source, status, priority, "estimatedValue", score, "assignedToId", "campaignId", "customerId", "convertedAt", "nextFollowUp", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", title, message, type, "isRead", link, "createdAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "position", "productId", description, quantity, unit, "unitPrice", discount, "vatRate", total, "deliveredQty") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, number, "customerId", "quoteId", "projectId", date, "deliveryDate", status, "billingAddress", "shippingAddress", subtotal, "discountPercent", "discountAmount", "vatAmount", total, notes, "internalNotes", "createdById", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, number, type, status, "invoiceId", "purchaseInvoiceId", "customerId", "supplierId", "paymentDate", amount, method, reference, "qrReference", notes, "bankAccountId", "companyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: payslip_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payslip_items (id, "payslipId", type, description, amount, "isDeduction") FROM stdin;
\.


--
-- Data for Name: payslips; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payslips (id, "employeeId", period, "grossSalary", "netSalary", "ahvDeduction", "alvDeduction", "nbuDeduction", "bvgDeduction", "taxDeduction", "hoursWorked", overtime, "vacationDays", "sickDays", notes, "isPaid", "paidAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_categories (id, name, description, "parentId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: production_operations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.production_operations (id, "productionOrderId", name, description, workstation, "plannedHours", "actualHours", "assignedEmployeeId", status, "sortOrder") FROM stdin;
\.


--
-- Data for Name: production_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.production_orders (id, number, name, description, "projectId", "orderId", "bomId", status, priority, quantity, "plannedStartDate", "plannedEndDate", "actualStartDate", "actualEndDate", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, sku, name, description, unit, "purchasePrice", "salePrice", "vatRate", "stockQuantity", "minStock", "maxStock", "reservedStock", weight, length, width, height, "imageUrl", "isActive", "isService", "categoryId", "supplierId", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: project_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_members (id, "projectId", "employeeId", role, "createdAt") FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, number, name, description, "customerId", status, priority, "startDate", "endDate", budget, spent, progress, "createdById", "managerId", "companyId", "createdAt", "updatedAt") FROM stdin;
cml8fafli000378el4thx917v	PRJ-2026-0001	Website Redesign	Neue Website für Testfirma	cml8f9upn000178el872zq2ml	ACTIVE	MEDIUM	2026-02-01 00:00:00	2026-03-31 00:00:00	15000.00	0.00	0	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-04 19:30:49.591	2026-02-04 19:30:49.591
cml9i0v6600018bw43vicjcp1	PRJ-2026-0002	test	test	cml8hbbph0001mncp07ejqz0q	PLANNING	MEDIUM	2026-02-06 00:00:00	2026-02-16 00:00:00	20000.00	0.00	0	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:35:08.237	2026-02-05 13:35:08.237
cml9i5g8c000c1o6cl2rm5m08	PRJ-2026-0004	CRM Integration	Integration mit Salesforce CRM	cml9i5g8700051o6cpxu5n7em	PLANNING	MEDIUM	2024-03-01 00:00:00	2024-04-30 00:00:00	25000.00	0.00	0	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:42.156	2026-02-05 13:38:42.156
cml9i5g8c000b1o6c157t0s9y	PRJ-2026-0003	Mobile Banking App	iOS und Android Banking App	cml9i5g8700031o6c71dn49mc	ACTIVE	HIGH	2024-02-01 00:00:00	2024-05-31 00:00:00	80000.00	48000.00	60	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:38:42.156	2026-02-05 13:38:42.156
cml9i5wuj000b5ztc4dzip6tu	PRJ-2026-0006	Mobile Banking App	iOS und Android Banking App	cml9i5wub00035ztcleybuip3	ACTIVE	HIGH	2024-02-01 00:00:00	2024-05-31 00:00:00	80000.00	48000.00	60	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.691	2026-02-05 13:39:03.691
cml9i5wuj000c5ztcnza9kio4	PRJ-2026-0007	CRM Integration	Integration mit Salesforce CRM	cml9i5wub00055ztcbue39rul	PLANNING	MEDIUM	2024-03-01 00:00:00	2024-04-30 00:00:00	25000.00	0.00	0	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.691	2026-02-05 13:39:03.691
cml9i5wuj000d5ztcq1m3mntk	PRJ-2026-0005	E-Commerce Platform	Entwicklung einer modernen E-Commerce Plattform	cml9i5wu600015ztc7zn8gv0o	ACTIVE	HIGH	2024-01-15 00:00:00	2024-03-15 00:00:00	45000.00	33750.00	75	cml8ck7ez0002139r570bmrs2	\N	cml8ck7bf0000139rxnaefuma	2026-02-05 13:39:03.691	2026-02-05 13:39:03.691
\.


--
-- Data for Name: purchase_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_invoices (id, number, "supplierId", "purchaseOrderId", date, "dueDate", status, subtotal, "vatAmount", "totalAmount", "paidAmount", "documentUrl", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_order_items (id, "purchaseOrderId", "position", description, quantity, unit, "unitPrice", "vatRate", total) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.purchase_orders (id, number, "supplierId", "projectId", date, "expectedDate", status, subtotal, "vatAmount", total, notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: qst_employee_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.qst_employee_data (id, "employeeId", status, kanton, tarif, "childCount", "churchMember", nationality, "permitType", "permitValidUntil", "crossBorderCountry", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: quality_checklists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quality_checklists (id, name, description, type, category, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: quality_checks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quality_checks (id, number, "checklistId", "productionOrderId", "goodsReceiptId", type, status, "inspectorId", notes, "completedAt", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: quote_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_items (id, "quoteId", "position", "productId", description, quantity, unit, "unitPrice", discount, "vatRate", total) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotes (id, number, "customerId", date, "validUntil", status, "billingAddress", "shippingAddress", subtotal, "discountPercent", "discountAmount", "vatAmount", total, notes, "internalNotes", terms, "createdById", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reminders (id, number, "invoiceId", level, status, "sentAt", "sendMethod", "dueDate", fee, "totalWithFee", notes, "companyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "productId", "shopOrderId", "customerName", "customerEmail", rating, title, content, "isVerifiedPurchase", status, "moderatorNote", "moderatedAt", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: service_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_reports (id, "serviceTicketId", "serviceDate", "hoursWorked", "travelTime", "workPerformed", "partsUsed", "materialCost", "laborCost", "totalCost", "customerSignature", "photoUrls", "followUpNeeded", "createdAt") FROM stdin;
\.


--
-- Data for Name: service_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_tickets (id, number, title, description, "customerId", "contactId", "projectId", "serviceType", priority, status, "assignedTechnicianId", "scheduledDate", "estimatedHours", location, "equipmentInfo", resolution, tags, "resolvedAt", "closedAt", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, "companyId", key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shop_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shop_order_items (id, "shopOrderId", "productId", quantity, "unitPrice", discount, total) FROM stdin;
\.


--
-- Data for Name: shop_orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shop_orders (id, "orderNumber", "customerId", "customerEmail", "billingAddress", "shippingAddress", status, "paymentMethod", "paymentStatus", subtotal, "discountAmount", "shippingCost", "vatAmount", total, "discountId", "trackingNumber", "trackingUrl", "shippedAt", "deliveredAt", "cancelledAt", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subtasks (id, "taskId", title, "isCompleted", "createdAt") FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suppliers (id, number, name, "companyName", street, "zipCode", city, country, phone, email, website, "vatNumber", iban, "paymentTermDays", rating, notes, "isActive", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: swissdec_declarations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.swissdec_declarations (id, "submissionId", "employeeId", year, month, data, "createdAt") FROM stdin;
\.


--
-- Data for Name: swissdec_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.swissdec_submissions (id, reference, "messageType", year, month, recipients, status, "employeeCount", "validationErrors", "validationWarnings", "validatedAt", "submittedAt", "transmissionId", "xmlContent", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: task_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_tags (id, "taskId", name) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, description, "projectId", status, priority, "dueDate", "estimatedHours", "assigneeId", "createdById", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.time_entries (id, "userId", "projectId", "taskId", description, date, duration, "isBillable", "hourlyRate", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: training_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_participants (id, "trainingId", "employeeId", status, attended, rating, feedback, "certificateIssued", "certificateExpiryDate", notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: trainings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trainings (id, name, description, type, status, "startDate", "endDate", "durationHours", location, "isOnline", "meetingUrl", "maxParticipants", "costPerPerson", "totalBudget", provider, "instructorId", "instructorName", "targetDepartments", prerequisites, "certificationType", "isMandatory", notes, "completedAt", "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: travel_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.travel_expenses (id, "employeeId", date, description, kilometers, "kmRate", "mealAllowance", accommodation, "otherExpenses", "totalAmount", status, "approvedById", "approvedAt", "rejectionReason", "receiptUrl", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, "passwordHash", "firstName", "lastName", phone, "avatarUrl", role, "isActive", "twoFactorEnabled", "lastLoginAt", "refreshToken", "companyId", "createdAt", "updatedAt") FROM stdin;
cml8ck7ez0002139r570bmrs2	admin@loomora.ch	$2a$10$YhEVb/cU1T42Uu0OIXmN8e1mNMq5d4HdRkjfj2izvbOcGGg5unHN6	Admin	User	\N	\N	ADMIN	t	f	2026-02-05 13:43:47.417	$2a$10$0RODX2XsoCpumdPKlTWWGu.3JAi9wO4cP2qGNW2dipOhBxp5IA9ay	cml8ck7bf0000139rxnaefuma	2026-02-04 18:14:26.699	2026-02-06 16:33:54.955
cml8ck7hm0004139rf62rizqw	user@loomora.ch	$2a$10$9IOUlqj0mQ8HkcuLfb5VyOS2Y/Yp4kP2sZWIKp/6UE4c4JPxZQ9Jq	Max	Muster	\N	\N	EMPLOYEE	t	f	2026-02-04 19:36:55.174	$2a$10$/fstZCm.updchzMdLvx8jOMeUklYgrMM/biQKpZD16Ib9PbWAHiua	cml8ck7bf0000139rxnaefuma	2026-02-04 18:14:26.794	2026-02-04 19:36:55.389
\.


--
-- Data for Name: vat_returns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vat_returns (id, number, year, period, quarter, month, method, status, data, "totalOutputTax", "totalInputTax", "vatPayable", "calculatedAt", "submittedAt", "submissionMethod", "submissionReference", notes, "companyId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: absences absences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_pkey PRIMARY KEY (id);


--
-- Name: asset_depreciations asset_depreciations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_depreciations
    ADD CONSTRAINT asset_depreciations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);


--
-- Name: bill_of_materials bill_of_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_of_materials
    ADD CONSTRAINT bill_of_materials_pkey PRIMARY KEY (id);


--
-- Name: bom_items bom_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_items
    ADD CONSTRAINT bom_items_pkey PRIMARY KEY (id);


--
-- Name: budget_lines budget_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_pkey PRIMARY KEY (id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (id);


--
-- Name: calculation_items calculation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_items
    ADD CONSTRAINT calculation_items_pkey PRIMARY KEY (id);


--
-- Name: calculations calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT calculations_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: cash_closings cash_closings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_closings
    ADD CONSTRAINT cash_closings_pkey PRIMARY KEY (id);


--
-- Name: cash_registers cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);


--
-- Name: cash_transactions cash_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT cash_transactions_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: check_results check_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_results
    ADD CONSTRAINT check_results_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: contract_renewals contract_renewals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_renewals
    ADD CONSTRAINT contract_renewals_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: credit_note_items credit_note_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_note_items
    ADD CONSTRAINT credit_note_items_pkey PRIMARY KEY (id);


--
-- Name: credit_notes credit_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: delivery_note_items delivery_note_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_note_items
    ADD CONSTRAINT delivery_note_items_pkey PRIMARY KEY (id);


--
-- Name: delivery_notes delivery_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notes
    ADD CONSTRAINT delivery_notes_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- Name: dms_document_versions dms_document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_document_versions
    ADD CONSTRAINT dms_document_versions_pkey PRIMARY KEY (id);


--
-- Name: dms_documents dms_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT dms_documents_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: employee_contracts employee_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_contracts
    ADD CONSTRAINT employee_contracts_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: event_attendees event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (id);


--
-- Name: event_reminders event_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reminders
    ADD CONSTRAINT event_reminders_pkey PRIMARY KEY (id);


--
-- Name: fixed_assets fixed_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: gav_employee_data gav_employee_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gav_employee_data
    ADD CONSTRAINT gav_employee_data_pkey PRIMARY KEY (id);


--
-- Name: gav_settings gav_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gav_settings
    ADD CONSTRAINT gav_settings_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_items goods_receipt_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT goods_receipt_items_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_postings job_postings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT job_postings_pkey PRIMARY KEY (id);


--
-- Name: journal_entries_extended journal_entries_extended_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries_extended
    ADD CONSTRAINT journal_entries_extended_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: lead_activities lead_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_activities
    ADD CONSTRAINT lead_activities_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payslip_items payslip_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslip_items
    ADD CONSTRAINT payslip_items_pkey PRIMARY KEY (id);


--
-- Name: payslips payslips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: production_operations production_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_operations
    ADD CONSTRAINT production_operations_pkey PRIMARY KEY (id);


--
-- Name: production_orders production_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders
    ADD CONSTRAINT production_orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: project_members project_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: purchase_invoices purchase_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT purchase_invoices_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: qst_employee_data qst_employee_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qst_employee_data
    ADD CONSTRAINT qst_employee_data_pkey PRIMARY KEY (id);


--
-- Name: quality_checklists quality_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quality_checklists
    ADD CONSTRAINT quality_checklists_pkey PRIMARY KEY (id);


--
-- Name: quality_checks quality_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quality_checks
    ADD CONSTRAINT quality_checks_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: service_reports service_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports
    ADD CONSTRAINT service_reports_pkey PRIMARY KEY (id);


--
-- Name: service_tickets service_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tickets
    ADD CONSTRAINT service_tickets_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: shop_order_items shop_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items
    ADD CONSTRAINT shop_order_items_pkey PRIMARY KEY (id);


--
-- Name: shop_orders shop_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_pkey PRIMARY KEY (id);


--
-- Name: subtasks subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: swissdec_declarations swissdec_declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swissdec_declarations
    ADD CONSTRAINT swissdec_declarations_pkey PRIMARY KEY (id);


--
-- Name: swissdec_submissions swissdec_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swissdec_submissions
    ADD CONSTRAINT swissdec_submissions_pkey PRIMARY KEY (id);


--
-- Name: task_tags task_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT task_tags_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: training_participants training_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_participants
    ADD CONSTRAINT training_participants_pkey PRIMARY KEY (id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: travel_expenses travel_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_expenses
    ADD CONSTRAINT travel_expenses_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vat_returns vat_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vat_returns
    ADD CONSTRAINT vat_returns_pkey PRIMARY KEY (id);


--
-- Name: _Interviewer_AB_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "_Interviewer_AB_unique" ON public."_Interviewer" USING btree ("A", "B");


--
-- Name: _Interviewer_B_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "_Interviewer_B_index" ON public."_Interviewer" USING btree ("B");


--
-- Name: absences_employeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "absences_employeeId_idx" ON public.absences USING btree ("employeeId");


--
-- Name: absences_startDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "absences_startDate_idx" ON public.absences USING btree ("startDate");


--
-- Name: asset_depreciations_fixedAssetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "asset_depreciations_fixedAssetId_idx" ON public.asset_depreciations USING btree ("fixedAssetId");


--
-- Name: asset_depreciations_fixedAssetId_year_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "asset_depreciations_fixedAssetId_year_key" ON public.asset_depreciations USING btree ("fixedAssetId", year);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_companyId_idx" ON public.audit_logs USING btree ("companyId");


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_entityId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_entityId_idx" ON public.audit_logs USING btree ("entityId");


--
-- Name: audit_logs_module_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_module_idx ON public.audit_logs USING btree (module);


--
-- Name: audit_logs_retentionUntil_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_retentionUntil_idx" ON public.audit_logs USING btree ("retentionUntil");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: bank_accounts_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bank_accounts_companyId_idx" ON public.bank_accounts USING btree ("companyId");


--
-- Name: bank_transactions_bankAccountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bank_transactions_bankAccountId_idx" ON public.bank_transactions USING btree ("bankAccountId");


--
-- Name: bank_transactions_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bank_transactions_companyId_idx" ON public.bank_transactions USING btree ("companyId");


--
-- Name: bank_transactions_qrReference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bank_transactions_qrReference_idx" ON public.bank_transactions USING btree ("qrReference");


--
-- Name: bank_transactions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX bank_transactions_status_idx ON public.bank_transactions USING btree (status);


--
-- Name: bill_of_materials_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bill_of_materials_companyId_idx" ON public.bill_of_materials USING btree ("companyId");


--
-- Name: bill_of_materials_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bill_of_materials_projectId_idx" ON public.bill_of_materials USING btree ("projectId");


--
-- Name: bom_items_bomId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bom_items_bomId_idx" ON public.bom_items USING btree ("bomId");


--
-- Name: bom_items_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bom_items_productId_idx" ON public.bom_items USING btree ("productId");


--
-- Name: budget_lines_accountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_lines_accountId_idx" ON public.budget_lines USING btree ("accountId");


--
-- Name: budget_lines_budgetId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budget_lines_budgetId_idx" ON public.budget_lines USING btree ("budgetId");


--
-- Name: budgets_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "budgets_companyId_idx" ON public.budgets USING btree ("companyId");


--
-- Name: budgets_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "budgets_companyId_number_key" ON public.budgets USING btree ("companyId", number);


--
-- Name: budgets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_status_idx ON public.budgets USING btree (status);


--
-- Name: budgets_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budgets_year_idx ON public.budgets USING btree (year);


--
-- Name: calculation_items_calculationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculation_items_calculationId_idx" ON public.calculation_items USING btree ("calculationId");


--
-- Name: calculations_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculations_companyId_idx" ON public.calculations USING btree ("companyId");


--
-- Name: calculations_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "calculations_companyId_number_key" ON public.calculations USING btree ("companyId", number);


--
-- Name: calculations_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculations_customerId_idx" ON public.calculations USING btree ("customerId");


--
-- Name: calculations_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calculations_projectId_idx" ON public.calculations USING btree ("projectId");


--
-- Name: calendar_events_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calendar_events_companyId_idx" ON public.calendar_events USING btree ("companyId");


--
-- Name: calendar_events_startTime_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "calendar_events_startTime_idx" ON public.calendar_events USING btree ("startTime");


--
-- Name: campaigns_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "campaigns_companyId_idx" ON public.campaigns USING btree ("companyId");


--
-- Name: campaigns_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX campaigns_status_idx ON public.campaigns USING btree (status);


--
-- Name: candidates_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "candidates_companyId_idx" ON public.candidates USING btree ("companyId");


--
-- Name: candidates_jobPostingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "candidates_jobPostingId_idx" ON public.candidates USING btree ("jobPostingId");


--
-- Name: candidates_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX candidates_status_idx ON public.candidates USING btree (status);


--
-- Name: cash_closings_cashRegisterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_closings_cashRegisterId_idx" ON public.cash_closings USING btree ("cashRegisterId");


--
-- Name: cash_closings_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_closings_date_idx ON public.cash_closings USING btree (date);


--
-- Name: cash_registers_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_registers_companyId_idx" ON public.cash_registers USING btree ("companyId");


--
-- Name: cash_transactions_cashRegisterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_transactions_cashRegisterId_idx" ON public.cash_transactions USING btree ("cashRegisterId");


--
-- Name: cash_transactions_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cash_transactions_companyId_idx" ON public.cash_transactions USING btree ("companyId");


--
-- Name: cash_transactions_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cash_transactions_companyId_number_key" ON public.cash_transactions USING btree ("companyId", number);


--
-- Name: cash_transactions_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cash_transactions_date_idx ON public.cash_transactions USING btree (date);


--
-- Name: chart_of_accounts_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chart_of_accounts_companyId_idx" ON public.chart_of_accounts USING btree ("companyId");


--
-- Name: chart_of_accounts_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "chart_of_accounts_companyId_number_key" ON public.chart_of_accounts USING btree ("companyId", number);


--
-- Name: check_results_qualityCheckId_checklistItemId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "check_results_qualityCheckId_checklistItemId_key" ON public.check_results USING btree ("qualityCheckId", "checklistItemId");


--
-- Name: check_results_qualityCheckId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "check_results_qualityCheckId_idx" ON public.check_results USING btree ("qualityCheckId");


--
-- Name: checklist_items_checklistId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "checklist_items_checklistId_idx" ON public.checklist_items USING btree ("checklistId");


--
-- Name: contacts_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contacts_customerId_idx" ON public.contacts USING btree ("customerId");


--
-- Name: contacts_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contacts_supplierId_idx" ON public.contacts USING btree ("supplierId");


--
-- Name: contract_renewals_contractId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contract_renewals_contractId_idx" ON public.contract_renewals USING btree ("contractId");


--
-- Name: contracts_companyId_contractNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "contracts_companyId_contractNumber_key" ON public.contracts USING btree ("companyId", "contractNumber");


--
-- Name: contracts_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contracts_companyId_idx" ON public.contracts USING btree ("companyId");


--
-- Name: contracts_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contracts_customerId_idx" ON public.contracts USING btree ("customerId");


--
-- Name: contracts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contracts_status_idx ON public.contracts USING btree (status);


--
-- Name: cost_centers_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "cost_centers_companyId_idx" ON public.cost_centers USING btree ("companyId");


--
-- Name: cost_centers_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "cost_centers_companyId_number_key" ON public.cost_centers USING btree ("companyId", number);


--
-- Name: credit_note_items_creditNoteId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "credit_note_items_creditNoteId_idx" ON public.credit_note_items USING btree ("creditNoteId");


--
-- Name: credit_note_items_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "credit_note_items_productId_idx" ON public.credit_note_items USING btree ("productId");


--
-- Name: credit_notes_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "credit_notes_companyId_idx" ON public.credit_notes USING btree ("companyId");


--
-- Name: credit_notes_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "credit_notes_companyId_number_key" ON public.credit_notes USING btree ("companyId", number);


--
-- Name: credit_notes_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "credit_notes_customerId_idx" ON public.credit_notes USING btree ("customerId");


--
-- Name: credit_notes_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX credit_notes_status_idx ON public.credit_notes USING btree (status);


--
-- Name: customers_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "customers_companyId_idx" ON public.customers USING btree ("companyId");


--
-- Name: customers_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "customers_companyId_number_key" ON public.customers USING btree ("companyId", number);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- Name: delivery_note_items_deliveryNoteId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "delivery_note_items_deliveryNoteId_idx" ON public.delivery_note_items USING btree ("deliveryNoteId");


--
-- Name: delivery_note_items_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "delivery_note_items_productId_idx" ON public.delivery_note_items USING btree ("productId");


--
-- Name: delivery_notes_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "delivery_notes_companyId_idx" ON public.delivery_notes USING btree ("companyId");


--
-- Name: delivery_notes_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "delivery_notes_companyId_number_key" ON public.delivery_notes USING btree ("companyId", number);


--
-- Name: delivery_notes_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "delivery_notes_customerId_idx" ON public.delivery_notes USING btree ("customerId");


--
-- Name: delivery_notes_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_notes_status_idx ON public.delivery_notes USING btree (status);


--
-- Name: departments_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "departments_companyId_idx" ON public.departments USING btree ("companyId");


--
-- Name: discounts_companyId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "discounts_companyId_code_key" ON public.discounts USING btree ("companyId", code);


--
-- Name: discounts_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "discounts_companyId_idx" ON public.discounts USING btree ("companyId");


--
-- Name: discounts_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "discounts_isActive_idx" ON public.discounts USING btree ("isActive");


--
-- Name: dms_document_versions_documentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dms_document_versions_documentId_idx" ON public.dms_document_versions USING btree ("documentId");


--
-- Name: dms_documents_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dms_documents_companyId_idx" ON public.dms_documents USING btree ("companyId");


--
-- Name: dms_documents_folderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "dms_documents_folderId_idx" ON public.dms_documents USING btree ("folderId");


--
-- Name: dms_documents_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dms_documents_status_idx ON public.dms_documents USING btree (status);


--
-- Name: email_campaigns_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_campaigns_companyId_idx" ON public.email_campaigns USING btree ("companyId");


--
-- Name: email_campaigns_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_campaigns_status_idx ON public.email_campaigns USING btree (status);


--
-- Name: employee_contracts_employeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "employee_contracts_employeeId_idx" ON public.employee_contracts USING btree ("employeeId");


--
-- Name: employees_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "employees_companyId_idx" ON public.employees USING btree ("companyId");


--
-- Name: employees_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "employees_companyId_number_key" ON public.employees USING btree ("companyId", number);


--
-- Name: employees_departmentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "employees_departmentId_idx" ON public.employees USING btree ("departmentId");


--
-- Name: event_attendees_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "event_attendees_eventId_idx" ON public.event_attendees USING btree ("eventId");


--
-- Name: event_attendees_eventId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON public.event_attendees USING btree ("eventId", "userId");


--
-- Name: event_reminders_eventId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "event_reminders_eventId_idx" ON public.event_reminders USING btree ("eventId");


--
-- Name: fixed_assets_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fixed_assets_category_idx ON public.fixed_assets USING btree (category);


--
-- Name: fixed_assets_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "fixed_assets_companyId_idx" ON public.fixed_assets USING btree ("companyId");


--
-- Name: fixed_assets_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "fixed_assets_companyId_number_key" ON public.fixed_assets USING btree ("companyId", number);


--
-- Name: fixed_assets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fixed_assets_status_idx ON public.fixed_assets USING btree (status);


--
-- Name: folders_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "folders_companyId_idx" ON public.folders USING btree ("companyId");


--
-- Name: folders_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "folders_customerId_idx" ON public.folders USING btree ("customerId");


--
-- Name: folders_parentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "folders_parentId_idx" ON public.folders USING btree ("parentId");


--
-- Name: folders_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "folders_projectId_idx" ON public.folders USING btree ("projectId");


--
-- Name: gav_employee_data_employeeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "gav_employee_data_employeeId_key" ON public.gav_employee_data USING btree ("employeeId");


--
-- Name: gav_employee_data_lohnklasse_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gav_employee_data_lohnklasse_idx ON public.gav_employee_data USING btree (lohnklasse);


--
-- Name: gav_settings_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "gav_settings_companyId_idx" ON public.gav_settings USING btree ("companyId");


--
-- Name: gav_settings_companyId_year_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "gav_settings_companyId_year_key" ON public.gav_settings USING btree ("companyId", year);


--
-- Name: goods_receipt_items_goodsReceiptId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "goods_receipt_items_goodsReceiptId_idx" ON public.goods_receipt_items USING btree ("goodsReceiptId");


--
-- Name: goods_receipt_items_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "goods_receipt_items_productId_idx" ON public.goods_receipt_items USING btree ("productId");


--
-- Name: goods_receipts_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "goods_receipts_companyId_idx" ON public.goods_receipts USING btree ("companyId");


--
-- Name: goods_receipts_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "goods_receipts_companyId_number_key" ON public.goods_receipts USING btree ("companyId", number);


--
-- Name: goods_receipts_purchaseOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "goods_receipts_purchaseOrderId_idx" ON public.goods_receipts USING btree ("purchaseOrderId");


--
-- Name: goods_receipts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX goods_receipts_status_idx ON public.goods_receipts USING btree (status);


--
-- Name: interviews_candidateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "interviews_candidateId_idx" ON public.interviews USING btree ("candidateId");


--
-- Name: interviews_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "interviews_companyId_idx" ON public.interviews USING btree ("companyId");


--
-- Name: interviews_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX interviews_status_idx ON public.interviews USING btree (status);


--
-- Name: inventory_movements_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "inventory_movements_productId_idx" ON public.inventory_movements USING btree ("productId");


--
-- Name: invoice_items_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoice_items_invoiceId_idx" ON public.invoice_items USING btree ("invoiceId");


--
-- Name: invoices_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_companyId_idx" ON public.invoices USING btree ("companyId");


--
-- Name: invoices_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_companyId_number_key" ON public.invoices USING btree ("companyId", number);


--
-- Name: invoices_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "invoices_customerId_idx" ON public.invoices USING btree ("customerId");


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: job_postings_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "job_postings_companyId_idx" ON public.job_postings USING btree ("companyId");


--
-- Name: job_postings_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX job_postings_status_idx ON public.job_postings USING btree (status);


--
-- Name: journal_entries_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_entries_companyId_idx" ON public.journal_entries USING btree ("companyId");


--
-- Name: journal_entries_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_date_idx ON public.journal_entries USING btree (date);


--
-- Name: journal_entries_extended_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_entries_extended_companyId_idx" ON public.journal_entries_extended USING btree ("companyId");


--
-- Name: journal_entries_extended_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "journal_entries_extended_companyId_number_key" ON public.journal_entries_extended USING btree ("companyId", number);


--
-- Name: journal_entries_extended_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_extended_date_idx ON public.journal_entries_extended USING btree (date);


--
-- Name: journal_entries_extended_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX journal_entries_extended_status_idx ON public.journal_entries_extended USING btree (status);


--
-- Name: journal_lines_accountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_lines_accountId_idx" ON public.journal_lines USING btree ("accountId");


--
-- Name: journal_lines_costCenterId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_lines_costCenterId_idx" ON public.journal_lines USING btree ("costCenterId");


--
-- Name: journal_lines_journalEntryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "journal_lines_journalEntryId_idx" ON public.journal_lines USING btree ("journalEntryId");


--
-- Name: lead_activities_activityDate_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lead_activities_activityDate_idx" ON public.lead_activities USING btree ("activityDate");


--
-- Name: lead_activities_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "lead_activities_leadId_idx" ON public.lead_activities USING btree ("leadId");


--
-- Name: leads_assignedToId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "leads_assignedToId_idx" ON public.leads USING btree ("assignedToId");


--
-- Name: leads_campaignId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "leads_campaignId_idx" ON public.leads USING btree ("campaignId");


--
-- Name: leads_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "leads_companyId_idx" ON public.leads USING btree ("companyId");


--
-- Name: leads_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leads_status_idx ON public.leads USING btree (status);


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: orders_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_companyId_idx" ON public.orders USING btree ("companyId");


--
-- Name: orders_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_companyId_number_key" ON public.orders USING btree ("companyId", number);


--
-- Name: orders_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "orders_customerId_idx" ON public.orders USING btree ("customerId");


--
-- Name: payments_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_companyId_idx" ON public.payments USING btree ("companyId");


--
-- Name: payments_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_companyId_number_key" ON public.payments USING btree ("companyId", number);


--
-- Name: payments_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_invoiceId_idx" ON public.payments USING btree ("invoiceId");


--
-- Name: payments_purchaseInvoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_purchaseInvoiceId_idx" ON public.payments USING btree ("purchaseInvoiceId");


--
-- Name: payments_qrReference_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payments_qrReference_idx" ON public.payments USING btree ("qrReference");


--
-- Name: payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payments_status_idx ON public.payments USING btree (status);


--
-- Name: payslip_items_payslipId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payslip_items_payslipId_idx" ON public.payslip_items USING btree ("payslipId");


--
-- Name: payslips_employeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "payslips_employeeId_idx" ON public.payslips USING btree ("employeeId");


--
-- Name: payslips_period_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payslips_period_idx ON public.payslips USING btree (period);


--
-- Name: product_categories_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "product_categories_companyId_idx" ON public.product_categories USING btree ("companyId");


--
-- Name: production_operations_assignedEmployeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "production_operations_assignedEmployeeId_idx" ON public.production_operations USING btree ("assignedEmployeeId");


--
-- Name: production_operations_productionOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "production_operations_productionOrderId_idx" ON public.production_operations USING btree ("productionOrderId");


--
-- Name: production_orders_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "production_orders_companyId_idx" ON public.production_orders USING btree ("companyId");


--
-- Name: production_orders_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "production_orders_companyId_number_key" ON public.production_orders USING btree ("companyId", number);


--
-- Name: production_orders_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "production_orders_projectId_idx" ON public.production_orders USING btree ("projectId");


--
-- Name: production_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX production_orders_status_idx ON public.production_orders USING btree (status);


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_companyId_idx" ON public.products USING btree ("companyId");


--
-- Name: products_companyId_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "products_companyId_sku_key" ON public.products USING btree ("companyId", sku);


--
-- Name: project_members_projectId_employeeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "project_members_projectId_employeeId_key" ON public.project_members USING btree ("projectId", "employeeId");


--
-- Name: project_members_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "project_members_projectId_idx" ON public.project_members USING btree ("projectId");


--
-- Name: projects_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "projects_companyId_idx" ON public.projects USING btree ("companyId");


--
-- Name: projects_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "projects_companyId_number_key" ON public.projects USING btree ("companyId", number);


--
-- Name: projects_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "projects_customerId_idx" ON public.projects USING btree ("customerId");


--
-- Name: projects_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX projects_status_idx ON public.projects USING btree (status);


--
-- Name: purchase_invoices_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_invoices_companyId_idx" ON public.purchase_invoices USING btree ("companyId");


--
-- Name: purchase_invoices_supplierId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_invoices_supplierId_idx" ON public.purchase_invoices USING btree ("supplierId");


--
-- Name: purchase_order_items_purchaseOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON public.purchase_order_items USING btree ("purchaseOrderId");


--
-- Name: purchase_orders_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "purchase_orders_companyId_idx" ON public.purchase_orders USING btree ("companyId");


--
-- Name: purchase_orders_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "purchase_orders_companyId_number_key" ON public.purchase_orders USING btree ("companyId", number);


--
-- Name: qst_employee_data_employeeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "qst_employee_data_employeeId_key" ON public.qst_employee_data USING btree ("employeeId");


--
-- Name: qst_employee_data_kanton_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX qst_employee_data_kanton_idx ON public.qst_employee_data USING btree (kanton);


--
-- Name: qst_employee_data_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX qst_employee_data_status_idx ON public.qst_employee_data USING btree (status);


--
-- Name: quality_checklists_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quality_checklists_companyId_idx" ON public.quality_checklists USING btree ("companyId");


--
-- Name: quality_checks_checklistId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quality_checks_checklistId_idx" ON public.quality_checks USING btree ("checklistId");


--
-- Name: quality_checks_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quality_checks_companyId_idx" ON public.quality_checks USING btree ("companyId");


--
-- Name: quality_checks_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "quality_checks_companyId_number_key" ON public.quality_checks USING btree ("companyId", number);


--
-- Name: quality_checks_productionOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quality_checks_productionOrderId_idx" ON public.quality_checks USING btree ("productionOrderId");


--
-- Name: quality_checks_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX quality_checks_status_idx ON public.quality_checks USING btree (status);


--
-- Name: quote_items_quoteId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quote_items_quoteId_idx" ON public.quote_items USING btree ("quoteId");


--
-- Name: quotes_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quotes_companyId_idx" ON public.quotes USING btree ("companyId");


--
-- Name: quotes_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "quotes_companyId_number_key" ON public.quotes USING btree ("companyId", number);


--
-- Name: quotes_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "quotes_customerId_idx" ON public.quotes USING btree ("customerId");


--
-- Name: reminders_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reminders_companyId_idx" ON public.reminders USING btree ("companyId");


--
-- Name: reminders_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "reminders_companyId_number_key" ON public.reminders USING btree ("companyId", number);


--
-- Name: reminders_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reminders_invoiceId_idx" ON public.reminders USING btree ("invoiceId");


--
-- Name: reminders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reminders_status_idx ON public.reminders USING btree (status);


--
-- Name: reviews_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_companyId_idx" ON public.reviews USING btree ("companyId");


--
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- Name: reviews_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_status_idx ON public.reviews USING btree (status);


--
-- Name: service_reports_serviceTicketId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "service_reports_serviceTicketId_idx" ON public.service_reports USING btree ("serviceTicketId");


--
-- Name: service_tickets_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "service_tickets_companyId_idx" ON public.service_tickets USING btree ("companyId");


--
-- Name: service_tickets_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "service_tickets_companyId_number_key" ON public.service_tickets USING btree ("companyId", number);


--
-- Name: service_tickets_customerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "service_tickets_customerId_idx" ON public.service_tickets USING btree ("customerId");


--
-- Name: service_tickets_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_tickets_priority_idx ON public.service_tickets USING btree (priority);


--
-- Name: service_tickets_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX service_tickets_status_idx ON public.service_tickets USING btree (status);


--
-- Name: settings_companyId_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "settings_companyId_key_key" ON public.settings USING btree ("companyId", key);


--
-- Name: shop_order_items_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shop_order_items_productId_idx" ON public.shop_order_items USING btree ("productId");


--
-- Name: shop_order_items_shopOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shop_order_items_shopOrderId_idx" ON public.shop_order_items USING btree ("shopOrderId");


--
-- Name: shop_orders_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shop_orders_companyId_idx" ON public.shop_orders USING btree ("companyId");


--
-- Name: shop_orders_companyId_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "shop_orders_companyId_orderNumber_key" ON public.shop_orders USING btree ("companyId", "orderNumber");


--
-- Name: shop_orders_paymentStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shop_orders_paymentStatus_idx" ON public.shop_orders USING btree ("paymentStatus");


--
-- Name: shop_orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shop_orders_status_idx ON public.shop_orders USING btree (status);


--
-- Name: subtasks_taskId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "subtasks_taskId_idx" ON public.subtasks USING btree ("taskId");


--
-- Name: suppliers_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suppliers_companyId_idx" ON public.suppliers USING btree ("companyId");


--
-- Name: suppliers_companyId_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "suppliers_companyId_number_key" ON public.suppliers USING btree ("companyId", number);


--
-- Name: swissdec_declarations_employeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "swissdec_declarations_employeeId_idx" ON public.swissdec_declarations USING btree ("employeeId");


--
-- Name: swissdec_declarations_submissionId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "swissdec_declarations_submissionId_idx" ON public.swissdec_declarations USING btree ("submissionId");


--
-- Name: swissdec_submissions_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "swissdec_submissions_companyId_idx" ON public.swissdec_submissions USING btree ("companyId");


--
-- Name: swissdec_submissions_companyId_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "swissdec_submissions_companyId_reference_key" ON public.swissdec_submissions USING btree ("companyId", reference);


--
-- Name: swissdec_submissions_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX swissdec_submissions_status_idx ON public.swissdec_submissions USING btree (status);


--
-- Name: swissdec_submissions_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX swissdec_submissions_year_idx ON public.swissdec_submissions USING btree (year);


--
-- Name: task_tags_taskId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "task_tags_taskId_idx" ON public.task_tags USING btree ("taskId");


--
-- Name: tasks_assigneeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tasks_assigneeId_idx" ON public.tasks USING btree ("assigneeId");


--
-- Name: tasks_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tasks_companyId_idx" ON public.tasks USING btree ("companyId");


--
-- Name: tasks_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tasks_projectId_idx" ON public.tasks USING btree ("projectId");


--
-- Name: tasks_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);


--
-- Name: time_entries_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "time_entries_companyId_idx" ON public.time_entries USING btree ("companyId");


--
-- Name: time_entries_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX time_entries_date_idx ON public.time_entries USING btree (date);


--
-- Name: time_entries_projectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "time_entries_projectId_idx" ON public.time_entries USING btree ("projectId");


--
-- Name: time_entries_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "time_entries_userId_idx" ON public.time_entries USING btree ("userId");


--
-- Name: training_participants_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX training_participants_status_idx ON public.training_participants USING btree (status);


--
-- Name: training_participants_trainingId_employeeId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "training_participants_trainingId_employeeId_key" ON public.training_participants USING btree ("trainingId", "employeeId");


--
-- Name: training_participants_trainingId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "training_participants_trainingId_idx" ON public.training_participants USING btree ("trainingId");


--
-- Name: trainings_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "trainings_companyId_idx" ON public.trainings USING btree ("companyId");


--
-- Name: trainings_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX trainings_status_idx ON public.trainings USING btree (status);


--
-- Name: travel_expenses_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX travel_expenses_date_idx ON public.travel_expenses USING btree (date);


--
-- Name: travel_expenses_employeeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "travel_expenses_employeeId_idx" ON public.travel_expenses USING btree ("employeeId");


--
-- Name: users_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "users_companyId_idx" ON public.users USING btree ("companyId");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: vat_returns_companyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "vat_returns_companyId_idx" ON public.vat_returns USING btree ("companyId");


--
-- Name: vat_returns_companyId_year_period_quarter_month_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "vat_returns_companyId_year_period_quarter_month_key" ON public.vat_returns USING btree ("companyId", year, period, quarter, month);


--
-- Name: vat_returns_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vat_returns_status_idx ON public.vat_returns USING btree (status);


--
-- Name: vat_returns_year_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vat_returns_year_idx ON public.vat_returns USING btree (year);


--
-- Name: _Interviewer _Interviewer_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_Interviewer"
    ADD CONSTRAINT "_Interviewer_A_fkey" FOREIGN KEY ("A") REFERENCES public.interviews(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _Interviewer _Interviewer_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."_Interviewer"
    ADD CONSTRAINT "_Interviewer_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: absences absences_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT "absences_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asset_depreciations asset_depreciations_fixedAssetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asset_depreciations
    ADD CONSTRAINT "asset_depreciations_fixedAssetId_fkey" FOREIGN KEY ("fixedAssetId") REFERENCES public.fixed_assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bank_accounts bank_accounts_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT "bank_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bank_transactions bank_transactions_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT "bank_transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bank_transactions bank_transactions_matchedInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT "bank_transactions_matchedInvoiceId_fkey" FOREIGN KEY ("matchedInvoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bank_transactions bank_transactions_matchedPaymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT "bank_transactions_matchedPaymentId_fkey" FOREIGN KEY ("matchedPaymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bill_of_materials bill_of_materials_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bill_of_materials
    ADD CONSTRAINT "bill_of_materials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: bom_items bom_items_bomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_items
    ADD CONSTRAINT "bom_items_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES public.bill_of_materials(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bom_items bom_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bom_items
    ADD CONSTRAINT "bom_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: budget_lines budget_lines_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT "budget_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: budget_lines budget_lines_budgetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT "budget_lines_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES public.budgets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: budget_lines budget_lines_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT "budget_lines_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public.cost_centers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calculation_items calculation_items_calculationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculation_items
    ADD CONSTRAINT "calculation_items_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES public.calculations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: calculations calculations_bomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT "calculations_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES public.bill_of_materials(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calculations calculations_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT "calculations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calculations calculations_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT "calculations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: calendar_events calendar_events_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT "calendar_events_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: campaigns campaigns_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT "campaigns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: candidates candidates_jobPostingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT "candidates_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES public.job_postings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cash_closings cash_closings_cashRegisterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_closings
    ADD CONSTRAINT "cash_closings_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES public.cash_registers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cash_transactions cash_transactions_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "cash_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cash_transactions cash_transactions_cashRegisterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "cash_transactions_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES public.cash_registers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cash_transactions cash_transactions_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cash_transactions
    ADD CONSTRAINT "cash_transactions_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public.cost_centers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chart_of_accounts chart_of_accounts_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT "chart_of_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chart_of_accounts chart_of_accounts_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT "chart_of_accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: check_results check_results_checklistItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_results
    ADD CONSTRAINT "check_results_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES public.checklist_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: check_results check_results_qualityCheckId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_results
    ADD CONSTRAINT "check_results_qualityCheckId_fkey" FOREIGN KEY ("qualityCheckId") REFERENCES public.quality_checks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_checklistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT "checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES public.quality_checklists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contacts contacts_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "contacts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contacts contacts_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "contacts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contract_renewals contract_renewals_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_renewals
    ADD CONSTRAINT "contract_renewals_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contracts contracts_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contracts contracts_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contracts contracts_responsibleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT "contracts_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cost_centers cost_centers_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT "cost_centers_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cost_centers cost_centers_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT "cost_centers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.cost_centers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_note_items credit_note_items_creditNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_note_items
    ADD CONSTRAINT "credit_note_items_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES public.credit_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_note_items credit_note_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_note_items
    ADD CONSTRAINT "credit_note_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: credit_notes credit_notes_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_notes credit_notes_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: credit_notes credit_notes_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT "credit_notes_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery_note_items delivery_note_items_deliveryNoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_note_items
    ADD CONSTRAINT "delivery_note_items_deliveryNoteId_fkey" FOREIGN KEY ("deliveryNoteId") REFERENCES public.delivery_notes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery_note_items delivery_note_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_note_items
    ADD CONSTRAINT "delivery_note_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: delivery_notes delivery_notes_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notes
    ADD CONSTRAINT "delivery_notes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery_notes delivery_notes_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notes
    ADD CONSTRAINT "delivery_notes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: delivery_notes delivery_notes_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_notes
    ADD CONSTRAINT "delivery_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: departments departments_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT "departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dms_document_versions dms_document_versions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_document_versions
    ADD CONSTRAINT "dms_document_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dms_document_versions dms_document_versions_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_document_versions
    ADD CONSTRAINT "dms_document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public.dms_documents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dms_documents dms_documents_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.contracts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dms_documents dms_documents_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dms_documents dms_documents_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dms_documents dms_documents_folderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES public.folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dms_documents dms_documents_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dms_documents dms_documents_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dms_documents dms_documents_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dms_documents
    ADD CONSTRAINT "dms_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employee_contracts employee_contracts_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_contracts
    ADD CONSTRAINT "employee_contracts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: event_attendees event_attendees_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.calendar_events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_attendees event_attendees_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: event_reminders event_reminders_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reminders
    ADD CONSTRAINT "event_reminders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.calendar_events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fixed_assets fixed_assets_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT "fixed_assets_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public.cost_centers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: folders folders_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: folders folders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: folders folders_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.folders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: folders folders_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT "folders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gav_employee_data gav_employee_data_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gav_employee_data
    ADD CONSTRAINT "gav_employee_data_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goods_receipt_items goods_receipt_items_goodsReceiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT "goods_receipt_items_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES public.goods_receipts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goods_receipt_items goods_receipt_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt_items
    ADD CONSTRAINT "goods_receipt_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_receipts goods_receipts_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT "goods_receipts_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: interviews interviews_candidateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES public.candidates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: invoices invoices_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: job_postings job_postings_contactPersonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_postings
    ADD CONSTRAINT "job_postings_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: journal_entries journal_entries_creditAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_entries journal_entries_debitAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT "journal_entries_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_entries_extended journal_entries_extended_reversesEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_entries_extended
    ADD CONSTRAINT "journal_entries_extended_reversesEntryId_fkey" FOREIGN KEY ("reversesEntryId") REFERENCES public.journal_entries_extended(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_lines journal_lines_accountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT "journal_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES public.chart_of_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_lines journal_lines_costCenterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT "journal_lines_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES public.cost_centers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_lines journal_lines_journalEntryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT "journal_lines_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES public.journal_entries_extended(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lead_activities lead_activities_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_activities
    ADD CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public.leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leads leads_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leads leads_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: leads leads_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "leads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_quoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES public.quotes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_purchaseInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_purchaseInvoiceId_fkey" FOREIGN KEY ("purchaseInvoiceId") REFERENCES public.purchase_invoices(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payslip_items payslip_items_payslipId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslip_items
    ADD CONSTRAINT "payslip_items_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES public.payslips(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payslips payslips_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT "payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: production_operations production_operations_assignedEmployeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_operations
    ADD CONSTRAINT "production_operations_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: production_operations production_operations_productionOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_operations
    ADD CONSTRAINT "production_operations_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES public.production_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: production_orders production_orders_bomId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders
    ADD CONSTRAINT "production_orders_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES public.bill_of_materials(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: production_orders production_orders_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders
    ADD CONSTRAINT "production_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: production_orders production_orders_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_orders
    ADD CONSTRAINT "production_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_members project_members_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project_members project_members_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: projects projects_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: projects projects_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_invoices purchase_invoices_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT "purchase_invoices_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_invoices purchase_invoices_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT "purchase_invoices_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_invoices purchase_invoices_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT "purchase_invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: qst_employee_data qst_employee_data_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qst_employee_data
    ADD CONSTRAINT "qst_employee_data_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quality_checks quality_checks_checklistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quality_checks
    ADD CONSTRAINT "quality_checks_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES public.quality_checklists(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quality_checks quality_checks_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quality_checks
    ADD CONSTRAINT "quality_checks_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quality_checks quality_checks_productionOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quality_checks
    ADD CONSTRAINT "quality_checks_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES public.production_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quote_items quote_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT "quote_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quote_items quote_items_quoteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT "quote_items_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES public.quotes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotes quotes_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "quotes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotes quotes_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "quotes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotes quotes_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT "quotes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reminders reminders_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT "reminders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_shopOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_shopOrderId_fkey" FOREIGN KEY ("shopOrderId") REFERENCES public.shop_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_reports service_reports_serviceTicketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_reports
    ADD CONSTRAINT "service_reports_serviceTicketId_fkey" FOREIGN KEY ("serviceTicketId") REFERENCES public.service_tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_tickets service_tickets_assignedTechnicianId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tickets
    ADD CONSTRAINT "service_tickets_assignedTechnicianId_fkey" FOREIGN KEY ("assignedTechnicianId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_tickets service_tickets_contactId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tickets
    ADD CONSTRAINT "service_tickets_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES public.contacts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_tickets service_tickets_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tickets
    ADD CONSTRAINT "service_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_tickets service_tickets_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_tickets
    ADD CONSTRAINT "service_tickets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shop_order_items shop_order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items
    ADD CONSTRAINT "shop_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shop_order_items shop_order_items_shopOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items
    ADD CONSTRAINT "shop_order_items_shopOrderId_fkey" FOREIGN KEY ("shopOrderId") REFERENCES public.shop_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shop_orders shop_orders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT "shop_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shop_orders shop_orders_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT "shop_orders_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public.discounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: subtasks subtasks_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT "subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: suppliers suppliers_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "suppliers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: swissdec_declarations swissdec_declarations_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swissdec_declarations
    ADD CONSTRAINT "swissdec_declarations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: swissdec_declarations swissdec_declarations_submissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.swissdec_declarations
    ADD CONSTRAINT "swissdec_declarations_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES public.swissdec_submissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_tags task_tags_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT "task_tags_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks tasks_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: time_entries time_entries_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: time_entries time_entries_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: time_entries time_entries_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT "time_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: training_participants training_participants_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_participants
    ADD CONSTRAINT "training_participants_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: training_participants training_participants_trainingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_participants
    ADD CONSTRAINT "training_participants_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES public.trainings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trainings trainings_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT "trainings_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: travel_expenses travel_expenses_employeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_expenses
    ADD CONSTRAINT "travel_expenses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 9evcaagHf0dEQA7tWaUwbktoVVbAGXZmMFTHw5A9YioTA0pf6XRHEBLmMxT8K7k

