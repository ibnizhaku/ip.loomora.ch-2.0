import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import WebsiteLoomora from "./pages/website-loomora";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { DocumentsProvider } from "./contexts/DocumentsContext";
import { toast } from "sonner";

// Pages
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectEdit from "./pages/ProjectEdit";
import ProjectCreate from "./pages/ProjectCreate";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerEdit from "./pages/CustomerEdit";
import TimeTracking from "./pages/TimeTracking";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceCreate from "./pages/InvoiceCreate";
import InvoiceEdit from "./pages/InvoiceEdit";
import Quotes from "./pages/Quotes";
import QuoteDetail from "./pages/QuoteDetail";
import QuoteCreate from "./pages/QuoteCreate";
import QuoteEdit from "./pages/QuoteEdit";
import CreditNotes from "./pages/CreditNotes";
import CreditNoteDetail from "./pages/CreditNoteDetail";
import CreditNoteCreate from "./pages/CreditNoteCreate";
import CreditNoteEdit from "./pages/CreditNoteEdit";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import PurchaseOrderCreate from "./pages/PurchaseOrderCreate";
import PurchaseOrderEdit from "./pages/PurchaseOrderEdit";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import PurchaseInvoiceDetail from "./pages/PurchaseInvoiceDetail";
import PurchaseInvoiceCreate from "./pages/PurchaseInvoiceCreate";
import PurchaseInvoiceEdit from "./pages/PurchaseInvoiceEdit";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderCreate from "./pages/OrderCreate";
import OrderEdit from "./pages/OrderEdit";
import DeliveryNotes from "./pages/DeliveryNotes";
import DeliveryNoteDetail from "./pages/DeliveryNoteDetail";
import DeliveryNoteCreate from "./pages/DeliveryNoteCreate";
import DeliveryNoteEdit from "./pages/DeliveryNoteEdit";
import Inventory from "./pages/Inventory";
import InventoryItemDetail from "./pages/InventoryItemDetail";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import HR from "./pages/HR";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeCreate from "./pages/EmployeeCreate";
import EmployeeEdit from "./pages/EmployeeEdit";
import Payroll from "./pages/Payroll";
import PayrollCreate from "./pages/PayrollCreate";
import PayrollDetail from "./pages/PayrollDetail";
import Absences from "./pages/Absences";
import AbsenceDetail from "./pages/AbsenceDetail";
import AbsenceCreate from "./pages/AbsenceCreate";
import Departments from "./pages/Departments";
import DepartmentCreate from "./pages/DepartmentCreate";
import DepartmentDetail from "./pages/DepartmentDetail";
import Recruiting from "./pages/Recruiting";
import CandidateDetail from "./pages/CandidateDetail";
import JobPostingCreate from "./pages/JobPostingCreate";
import Training from "./pages/Training";
import TrainingDetail from "./pages/TrainingDetail";
import TrainingCreate from "./pages/TrainingCreate";
import Orgchart from "./pages/Orgchart";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import TaskCreate from "./pages/TaskCreate";
import TaskEdit from "./pages/TaskEdit";
import BillOfMaterials from "./pages/BillOfMaterials";
import BOMDetail from "./pages/BOMDetail";
import BOMCreate from "./pages/BOMCreate";
import Calculation from "./pages/Calculation";
import CalculationDetail from "./pages/CalculationDetail";
import CalculationCreate from "./pages/CalculationCreate";
import Production from "./pages/Production";
import ProductionDetail from "./pages/ProductionDetail";
import ProductionCreate from "./pages/ProductionCreate";
import LeadDetail from "./pages/LeadDetail";
import EmployeeContracts from "./pages/EmployeeContracts";
import EmployeeContractDetail from "./pages/EmployeeContractDetail";
import EmployeeContractCreate from "./pages/EmployeeContractCreate";
import Service from "./pages/Service";
import ServiceDetail from "./pages/ServiceDetail";
import QualityControl from "./pages/QualityControl";
import QualityCheckDetail from "./pages/QualityCheckDetail";
import QualityCheckCreate from "./pages/QualityCheckCreate";
import QualityChecklists from "./pages/QualityChecklists";
import QualityChecklistCreate from "./pages/QualityChecklistCreate";
import QualityChecklistDetail from "./pages/QualityChecklistDetail";
import ServiceCreate from "./pages/ServiceCreate";
import ContractCreate from "./pages/ContractCreate";
import ContractEdit from "./pages/ContractEdit";
import DocumentUpload from "./pages/DocumentUpload";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CampaignCreate from "./pages/CampaignCreate";
import LeadCreate from "./pages/LeadCreate";
import EmailCreate from "./pages/EmailCreate";
import JournalEntries from "./pages/JournalEntries";
import JournalEntryDetail from "./pages/JournalEntryDetail";
import Payments from "./pages/Payments";
import PaymentDetail from "./pages/PaymentDetail";
import Reminders from "./pages/Reminders";
import ReminderDetail from "./pages/ReminderDetail";
import TravelExpenses from "./pages/TravelExpenses";
import TravelExpenseDetail from "./pages/TravelExpenseDetail";
import TravelExpenseCreate from "./pages/TravelExpenseCreate";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import UserCreate from "./pages/UserCreate";
import UserEdit from "./pages/UserEdit";
import Reviews from "./pages/Reviews";
import ReviewDetail from "./pages/ReviewDetail";
import PayslipDetail from "./pages/PayslipDetail";
import BankAccounts from "./pages/BankAccounts";
import BankAccountDetail from "./pages/BankAccountDetail";
import BankAccountCreate from "./pages/BankAccountCreate";
import Budgets from "./pages/Budgets";
import BudgetDetail from "./pages/BudgetDetail";
import BudgetCreate from "./pages/BudgetCreate";
import FixedAssets from "./pages/FixedAssets";
import FixedAssetDetail from "./pages/FixedAssetDetail";
import FixedAssetCreate from "./pages/FixedAssetCreate";
import VatReturns from "./pages/VatReturns";
import VatReturnDetail from "./pages/VatReturnDetail";
import Discounts from "./pages/Discounts";
import DiscountDetail from "./pages/DiscountDetail";
import DiscountCreate from "./pages/DiscountCreate";
import Roles from "./pages/Roles";
import RoleDetail from "./pages/RoleDetail";
import RoleCreate from "./pages/RoleCreate";
import RoleEdit from "./pages/RoleEdit";
import Settings from "./pages/Settings";
import Company from "./pages/Company";
import CompanyEdit from "./pages/CompanyEdit";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import DocumentPreview from "./pages/DocumentPreview";
import FolderDetail from "./pages/FolderDetail";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import SupplierCreate from "./pages/SupplierCreate";
import SupplierEdit from "./pages/SupplierEdit";
import CustomerCreate from "./pages/CustomerCreate";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import ChartOfAccountDetail from "./pages/ChartOfAccountDetail";
import ChartOfAccountCreate from "./pages/ChartOfAccountCreate";
import GeneralLedger from "./pages/GeneralLedger";
import GeneralLedgerDetail from "./pages/GeneralLedgerDetail";
import OpenItems from "./pages/OpenItems";
import BalanceSheet from "./pages/BalanceSheet";
import CashBook from "./pages/CashBook";
import CashBookCreate from "./pages/CashBookCreate";
import CashBookDetail from "./pages/CashBookDetail";
import SepaPayments from "./pages/SepaPayments";
import SepaPaymentDetail from "./pages/SepaPaymentDetail";
import CostCenters from "./pages/CostCenters";
import CostCenterDetail from "./pages/CostCenterDetail";
import CostCenterCreate from "./pages/CostCenterCreate";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import ProductEdit from "./pages/ProductEdit";
import ProductDetail from "./pages/ProductDetail";
import Leads from "./pages/Leads";
import EmailMarketing from "./pages/EmailMarketing";
import Shop from "./pages/Shop";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import QRInvoice from "./pages/QRInvoice";
import BankImport from "./pages/BankImport";
import Swissdec from "./pages/Swissdec";
import WithholdingTax from "./pages/WithholdingTax";
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import AuditLog from "./pages/AuditLog";
import AuditLogDetail from "./pages/AuditLogDetail";
import Help from "./pages/Help";
import GoodsReceipts from "./pages/GoodsReceipts";
import GoodsReceiptCreate from "./pages/GoodsReceiptCreate";
import GoodsReceiptDetail from "./pages/GoodsReceiptDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthPage from "./pages/AuthPage";
import SelectCompany from "./pages/SelectCompany";
import Activity from "./pages/Activity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error: unknown) => {
        const err = error as Error & { statusCode?: number };
        if (err.statusCode === 403) {
          toast.error('Keine Berechtigung für diese Aktion');
        } else if (err.statusCode === 404) {
          toast.error('Nicht gefunden');
        } else if (err.statusCode === 500) {
          toast.error('Serverfehler – bitte versuchen Sie es erneut');
        }
      },
    },
    queries: {
      retry: (failureCount, error: unknown) => {
        const err = error as Error & { statusCode?: number };
        if (err.statusCode === 403 || err.statusCode === 401 || err.statusCode === 404) return false;
        return failureCount < 2;
      },
    },
  },
});

// Error Boundary to catch and display rendering errors
class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">Seite konnte nicht geladen werden</h2>
            <p className="text-sm text-muted-foreground mb-4">{this.state.error?.message}</p>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40 mb-4">{this.state.error?.stack}</pre>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout wrapper for protected routes with sidebar
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="flex-1 p-6">
              <PageErrorBoundary>
                {children}
              </PageErrorBoundary>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DocumentsProvider>
            <Routes>
              {/* Public Routes - No Auth Required */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/select-company" element={<SelectCompany />} />
              
              {/* Protected Routes - Wrapped with Layout */}
              <Route path="/" element={<ProtectedLayout><Index /></ProtectedLayout>} />
              <Route path="/activity" element={<ProtectedLayout><Activity /></ProtectedLayout>} />
              
              {/* Projekte */}
              <Route path="/projects" element={<ProtectedLayout><PermissionGuard module="projects"><Projects /></PermissionGuard></ProtectedLayout>} />
              <Route path="/projects/new" element={<ProtectedLayout><ProjectCreate /></ProtectedLayout>} />
              <Route path="/projects/:id" element={<ProtectedLayout><ProjectDetail /></ProtectedLayout>} />
              <Route path="/projects/:id/edit" element={<ProtectedLayout><ProjectEdit /></ProtectedLayout>} />
              
              {/* Aufgaben */}
              <Route path="/tasks" element={<ProtectedLayout><PermissionGuard module="tasks"><Tasks /></PermissionGuard></ProtectedLayout>} />
              <Route path="/tasks/new" element={<ProtectedLayout><TaskCreate /></ProtectedLayout>} />
              <Route path="/tasks/:id" element={<ProtectedLayout><TaskDetail /></ProtectedLayout>} />
              <Route path="/tasks/:id/edit" element={<ProtectedLayout><TaskEdit /></ProtectedLayout>} />
              
              {/* CRM */}
              <Route path="/customers" element={<ProtectedLayout><PermissionGuard module="customers"><Customers /></PermissionGuard></ProtectedLayout>} />
              <Route path="/customers/new" element={<ProtectedLayout><CustomerCreate /></ProtectedLayout>} />
              <Route path="/customers/:id" element={<ProtectedLayout><CustomerDetail /></ProtectedLayout>} />
              <Route path="/customers/:id/edit" element={<ProtectedLayout><CustomerEdit /></ProtectedLayout>} />
              <Route path="/suppliers" element={<ProtectedLayout><PermissionGuard module="suppliers"><Suppliers /></PermissionGuard></ProtectedLayout>} />
              <Route path="/suppliers/new" element={<ProtectedLayout><SupplierCreate /></ProtectedLayout>} />
              <Route path="/suppliers/:id" element={<ProtectedLayout><SupplierDetail /></ProtectedLayout>} />
              <Route path="/suppliers/:id/edit" element={<ProtectedLayout><SupplierEdit /></ProtectedLayout>} />
              
              {/* Zeit */}
              <Route path="/time-tracking" element={<ProtectedLayout><PermissionGuard module="time-entries"><TimeTracking /></PermissionGuard></ProtectedLayout>} />
              <Route path="/calendar" element={<ProtectedLayout><PermissionGuard module="calendar"><Calendar /></PermissionGuard></ProtectedLayout>} />
              
              {/* Verkauf */}
              <Route path="/quotes" element={<ProtectedLayout><PermissionGuard module="quotes"><Quotes /></PermissionGuard></ProtectedLayout>} />
              <Route path="/quotes/new" element={<ProtectedLayout><QuoteCreate /></ProtectedLayout>} />
              <Route path="/quotes/:id" element={<ProtectedLayout><QuoteDetail /></ProtectedLayout>} />
              <Route path="/quotes/:id/edit" element={<ProtectedLayout><QuoteEdit /></ProtectedLayout>} />
              <Route path="/orders" element={<ProtectedLayout><PermissionGuard module="orders"><Orders /></PermissionGuard></ProtectedLayout>} />
              <Route path="/orders/new" element={<ProtectedLayout><OrderCreate /></ProtectedLayout>} />
              <Route path="/orders/:id" element={<ProtectedLayout><OrderDetail /></ProtectedLayout>} />
              <Route path="/orders/:id/edit" element={<ProtectedLayout><OrderEdit /></ProtectedLayout>} />
              <Route path="/invoices" element={<ProtectedLayout><PermissionGuard module="invoices"><Invoices /></PermissionGuard></ProtectedLayout>} />
              <Route path="/invoices/new" element={<ProtectedLayout><InvoiceCreate /></ProtectedLayout>} />
              <Route path="/invoices/:id" element={<ProtectedLayout><InvoiceDetail /></ProtectedLayout>} />
              <Route path="/invoices/:id/edit" element={<ProtectedLayout><InvoiceEdit /></ProtectedLayout>} />
              <Route path="/delivery-notes" element={<ProtectedLayout><PermissionGuard module="delivery-notes"><DeliveryNotes /></PermissionGuard></ProtectedLayout>} />
              <Route path="/delivery-notes/new" element={<ProtectedLayout><DeliveryNoteCreate /></ProtectedLayout>} />
              <Route path="/delivery-notes/:id" element={<ProtectedLayout><DeliveryNoteDetail /></ProtectedLayout>} />
              <Route path="/delivery-notes/:id/edit" element={<ProtectedLayout><DeliveryNoteEdit /></ProtectedLayout>} />
              <Route path="/credit-notes" element={<ProtectedLayout><PermissionGuard module="credit-notes"><CreditNotes /></PermissionGuard></ProtectedLayout>} />
              <Route path="/credit-notes/new" element={<ProtectedLayout><CreditNoteCreate /></ProtectedLayout>} />
              <Route path="/credit-notes/:id" element={<ProtectedLayout><CreditNoteDetail /></ProtectedLayout>} />
              <Route path="/credit-notes/:id/edit" element={<ProtectedLayout><CreditNoteEdit /></ProtectedLayout>} />
              <Route path="/reminders" element={<ProtectedLayout><PermissionGuard module="reminders"><Reminders /></PermissionGuard></ProtectedLayout>} />
              <Route path="/reminders/:id" element={<ProtectedLayout><ReminderDetail /></ProtectedLayout>} />
              
              {/* Einkauf & Lager */}
              <Route path="/purchase-orders" element={<ProtectedLayout><PermissionGuard module="purchase-orders"><PurchaseOrders /></PermissionGuard></ProtectedLayout>} />
              <Route path="/purchase-orders/new" element={<ProtectedLayout><PurchaseOrderCreate /></ProtectedLayout>} />
              <Route path="/purchase-orders/:id" element={<ProtectedLayout><PurchaseOrderDetail /></ProtectedLayout>} />
              <Route path="/purchase-orders/:id/edit" element={<ProtectedLayout><PurchaseOrderEdit /></ProtectedLayout>} />
              <Route path="/purchase-invoices" element={<ProtectedLayout><PermissionGuard module="purchase-invoices"><PurchaseInvoices /></PermissionGuard></ProtectedLayout>} />
              <Route path="/purchase-invoices/new" element={<ProtectedLayout><PurchaseInvoiceCreate /></ProtectedLayout>} />
              <Route path="/purchase-invoices/:id" element={<ProtectedLayout><PurchaseInvoiceDetail /></ProtectedLayout>} />
              <Route path="/purchase-invoices/:id/edit" element={<ProtectedLayout><PurchaseInvoiceEdit /></ProtectedLayout>} />
              <Route path="/inventory" element={<ProtectedLayout><PermissionGuard module="products"><Inventory /></PermissionGuard></ProtectedLayout>} />
              <Route path="/inventory/:id" element={<ProtectedLayout><InventoryItemDetail /></ProtectedLayout>} />
              <Route path="/goods-receipts" element={<ProtectedLayout><PermissionGuard module="goods-receipts"><GoodsReceipts /></PermissionGuard></ProtectedLayout>} />
              <Route path="/goods-receipts/new" element={<ProtectedLayout><GoodsReceiptCreate /></ProtectedLayout>} />
              <Route path="/goods-receipts/:id" element={<ProtectedLayout><GoodsReceiptDetail /></ProtectedLayout>} />
              
              {/* Finanzen & Buchhaltung */}
              <Route path="/finance" element={<ProtectedLayout><PermissionGuard module="finance"><Finance /></PermissionGuard></ProtectedLayout>} />
              <Route path="/chart-of-accounts" element={<ProtectedLayout><PermissionGuard module="finance"><ChartOfAccounts /></PermissionGuard></ProtectedLayout>} />
              <Route path="/chart-of-accounts/new" element={<ProtectedLayout><ChartOfAccountCreate /></ProtectedLayout>} />
              <Route path="/chart-of-accounts/:id" element={<ProtectedLayout><ChartOfAccountDetail /></ProtectedLayout>} />
              <Route path="/journal-entries" element={<ProtectedLayout><PermissionGuard module="journal-entries"><JournalEntries /></PermissionGuard></ProtectedLayout>} />
              <Route path="/journal-entries/:id" element={<ProtectedLayout><JournalEntryDetail /></ProtectedLayout>} />
              <Route path="/general-ledger" element={<ProtectedLayout><PermissionGuard module="finance"><GeneralLedger /></PermissionGuard></ProtectedLayout>} />
              <Route path="/general-ledger/:id" element={<ProtectedLayout><GeneralLedgerDetail /></ProtectedLayout>} />
              <Route path="/open-items" element={<ProtectedLayout><PermissionGuard module="finance"><OpenItems /></PermissionGuard></ProtectedLayout>} />
              <Route path="/debtors" element={<ProtectedLayout><PermissionGuard module="finance"><Debtors /></PermissionGuard></ProtectedLayout>} />
              <Route path="/creditors" element={<ProtectedLayout><PermissionGuard module="finance"><Creditors /></PermissionGuard></ProtectedLayout>} />
              <Route path="/balance-sheet" element={<ProtectedLayout><PermissionGuard module="finance"><BalanceSheet /></PermissionGuard></ProtectedLayout>} />
              <Route path="/vat-returns" element={<ProtectedLayout><PermissionGuard module="vat-returns"><VatReturns /></PermissionGuard></ProtectedLayout>} />
              <Route path="/vat-returns/:id" element={<ProtectedLayout><VatReturnDetail /></ProtectedLayout>} />
              <Route path="/fixed-assets" element={<ProtectedLayout><PermissionGuard module="fixed-assets"><FixedAssets /></PermissionGuard></ProtectedLayout>} />
              <Route path="/fixed-assets/new" element={<ProtectedLayout><FixedAssetCreate /></ProtectedLayout>} />
              <Route path="/fixed-assets/:id" element={<ProtectedLayout><FixedAssetDetail /></ProtectedLayout>} />
              <Route path="/cash-book" element={<ProtectedLayout><PermissionGuard module="cash-book"><CashBook /></PermissionGuard></ProtectedLayout>} />
              <Route path="/cash-book/new" element={<ProtectedLayout><CashBookCreate /></ProtectedLayout>} />
              <Route path="/cash-book/:id" element={<ProtectedLayout><CashBookDetail /></ProtectedLayout>} />
              <Route path="/bank-accounts" element={<ProtectedLayout><PermissionGuard module="bank-accounts"><BankAccounts /></PermissionGuard></ProtectedLayout>} />
              <Route path="/bank-accounts/new" element={<ProtectedLayout><BankAccountCreate /></ProtectedLayout>} />
              <Route path="/bank-accounts/:id" element={<ProtectedLayout><BankAccountDetail /></ProtectedLayout>} />
              <Route path="/sepa-payments" element={<ProtectedLayout><PermissionGuard module="payments"><SepaPayments /></PermissionGuard></ProtectedLayout>} />
              <Route path="/sepa-payments/:id" element={<ProtectedLayout><SepaPaymentDetail /></ProtectedLayout>} />
              <Route path="/cost-centers" element={<ProtectedLayout><PermissionGuard module="cost-centers"><CostCenters /></PermissionGuard></ProtectedLayout>} />
              <Route path="/cost-centers/new" element={<ProtectedLayout><CostCenterCreate /></ProtectedLayout>} />
              <Route path="/cost-centers/:id" element={<ProtectedLayout><CostCenterDetail /></ProtectedLayout>} />
              <Route path="/budgets" element={<ProtectedLayout><PermissionGuard module="budgets"><Budgets /></PermissionGuard></ProtectedLayout>} />
              <Route path="/budgets/new" element={<ProtectedLayout><BudgetCreate /></ProtectedLayout>} />
              <Route path="/budgets/:id" element={<ProtectedLayout><BudgetDetail /></ProtectedLayout>} />
              <Route path="/contracts" element={<ProtectedLayout><PermissionGuard module="contracts"><Contracts /></PermissionGuard></ProtectedLayout>} />
              <Route path="/contracts/new" element={<ProtectedLayout><ContractCreate /></ProtectedLayout>} />
              <Route path="/contracts/:id" element={<ProtectedLayout><ContractDetail /></ProtectedLayout>} />
              <Route path="/contracts/:id/edit" element={<ProtectedLayout><ContractEdit /></ProtectedLayout>} />
              <Route path="/payments" element={<ProtectedLayout><PermissionGuard module="payments"><Payments /></PermissionGuard></ProtectedLayout>} />
              <Route path="/payments/:id" element={<ProtectedLayout><PaymentDetail /></ProtectedLayout>} />
              
              {/* Stammdaten & Verwaltung */}
              <Route path="/products" element={<ProtectedLayout><PermissionGuard module="products"><Products /></PermissionGuard></ProtectedLayout>} />
              <Route path="/products/new" element={<ProtectedLayout><ProductCreate /></ProtectedLayout>} />
              <Route path="/products/:id" element={<ProtectedLayout><ProductDetail /></ProtectedLayout>} />
              <Route path="/products/:id/edit" element={<ProtectedLayout><ProductEdit /></ProtectedLayout>} />
              <Route path="/travel-expenses" element={<ProtectedLayout><PermissionGuard module="travel-expenses"><TravelExpenses /></PermissionGuard></ProtectedLayout>} />
              <Route path="/travel-expenses/new" element={<ProtectedLayout><TravelExpenseCreate /></ProtectedLayout>} />
              <Route path="/travel-expenses/:id" element={<ProtectedLayout><TravelExpenseDetail /></ProtectedLayout>} />
              
              {/* Marketing */}
              <Route path="/campaigns" element={<ProtectedLayout><PermissionGuard module="marketing"><Campaigns /></PermissionGuard></ProtectedLayout>} />
              <Route path="/campaigns/new" element={<ProtectedLayout><CampaignCreate /></ProtectedLayout>} />
              <Route path="/campaigns/:id" element={<ProtectedLayout><CampaignDetail /></ProtectedLayout>} />
              <Route path="/leads" element={<ProtectedLayout><PermissionGuard module="leads"><Leads /></PermissionGuard></ProtectedLayout>} />
              <Route path="/leads/new" element={<ProtectedLayout><LeadCreate /></ProtectedLayout>} />
              <Route path="/leads/:id" element={<ProtectedLayout><LeadDetail /></ProtectedLayout>} />
              <Route path="/email-marketing" element={<ProtectedLayout><PermissionGuard module="email-marketing"><EmailMarketing /></PermissionGuard></ProtectedLayout>} />
              <Route path="/email-marketing/new" element={<ProtectedLayout><EmailCreate /></ProtectedLayout>} />
              
              {/* E-Commerce */}
              <Route path="/shop" element={<ProtectedLayout><Shop /></ProtectedLayout>} />
              <Route path="/discounts" element={<ProtectedLayout><Discounts /></ProtectedLayout>} />
              <Route path="/discounts/new" element={<ProtectedLayout><DiscountCreate /></ProtectedLayout>} />
              <Route path="/discounts/:id" element={<ProtectedLayout><DiscountDetail /></ProtectedLayout>} />
              <Route path="/reviews" element={<ProtectedLayout><Reviews /></ProtectedLayout>} />
              <Route path="/reviews/:id" element={<ProtectedLayout><ReviewDetail /></ProtectedLayout>} />
              
              {/* Berichte */}
              <Route path="/reports" element={<ProtectedLayout><Reports /></ProtectedLayout>} />
              
              {/* Dokumente */}
              <Route path="/documents" element={<ProtectedLayout><Documents /></ProtectedLayout>} />
              <Route path="/documents/new" element={<ProtectedLayout><DocumentUpload /></ProtectedLayout>} />
              <Route path="/documents/:id" element={<ProtectedLayout><DocumentDetail /></ProtectedLayout>} />
              <Route path="/documents/:id/preview" element={<ProtectedLayout><DocumentPreview /></ProtectedLayout>} />
              <Route path="/folders/:id" element={<ProtectedLayout><FolderDetail /></ProtectedLayout>} />
              
              {/* HR / Personal */}
              <Route path="/hr" element={<ProtectedLayout><HR /></ProtectedLayout>} />
              <Route path="/hr/new" element={<ProtectedLayout><EmployeeCreate /></ProtectedLayout>} />
              <Route path="/hr/:id" element={<ProtectedLayout><EmployeeDetail /></ProtectedLayout>} />
              <Route path="/hr/:id/edit" element={<ProtectedLayout><EmployeeEdit /></ProtectedLayout>} />
              <Route path="/employee-contracts" element={<ProtectedLayout><EmployeeContracts /></ProtectedLayout>} />
              <Route path="/employee-contracts/new" element={<ProtectedLayout><EmployeeContractCreate /></ProtectedLayout>} />
              <Route path="/employee-contracts/:id" element={<ProtectedLayout><EmployeeContractDetail /></ProtectedLayout>} />
              <Route path="/payroll" element={<ProtectedLayout><Payroll /></ProtectedLayout>} />
              <Route path="/payroll/new" element={<ProtectedLayout><PayrollCreate /></ProtectedLayout>} />
              <Route path="/payroll/:id" element={<ProtectedLayout><PayrollDetail /></ProtectedLayout>} />
              <Route path="/payslips/:id" element={<ProtectedLayout><PayslipDetail /></ProtectedLayout>} />
              <Route path="/payroll/payslip/:id" element={<ProtectedLayout><PayslipDetail /></ProtectedLayout>} />
              <Route path="/absences" element={<ProtectedLayout><Absences /></ProtectedLayout>} />
              <Route path="/absences/new" element={<ProtectedLayout><AbsenceCreate /></ProtectedLayout>} />
              <Route path="/absences/:id" element={<ProtectedLayout><AbsenceDetail /></ProtectedLayout>} />
              <Route path="/departments" element={<ProtectedLayout><Departments /></ProtectedLayout>} />
              <Route path="/departments/new" element={<ProtectedLayout><DepartmentCreate /></ProtectedLayout>} />
              <Route path="/departments/:id" element={<ProtectedLayout><DepartmentDetail /></ProtectedLayout>} />
              <Route path="/recruiting" element={<ProtectedLayout><Recruiting /></ProtectedLayout>} />
              <Route path="/recruiting/new" element={<ProtectedLayout><JobPostingCreate /></ProtectedLayout>} />
              <Route path="/recruiting/:id" element={<ProtectedLayout><CandidateDetail /></ProtectedLayout>} />
              <Route path="/training" element={<ProtectedLayout><Training /></ProtectedLayout>} />
              <Route path="/training/new" element={<ProtectedLayout><TrainingCreate /></ProtectedLayout>} />
              <Route path="/training/:id" element={<ProtectedLayout><TrainingDetail /></ProtectedLayout>} />
              <Route path="/orgchart" element={<ProtectedLayout><Orgchart /></ProtectedLayout>} />
              
              {/* Administration */}
              <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
              <Route path="/users/new" element={<ProtectedLayout><UserCreate /></ProtectedLayout>} />
              <Route path="/users/:id" element={<ProtectedLayout><UserDetail /></ProtectedLayout>} />
              <Route path="/users/:id/edit" element={<ProtectedLayout><UserEdit /></ProtectedLayout>} />
              <Route path="/company" element={<ProtectedLayout><Company /></ProtectedLayout>} />
              <Route path="/company/edit" element={<ProtectedLayout><CompanyEdit /></ProtectedLayout>} />
              <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
              <Route path="/roles" element={<ProtectedLayout><Roles /></ProtectedLayout>} />
              <Route path="/roles/new" element={<ProtectedLayout><RoleCreate /></ProtectedLayout>} />
              <Route path="/roles/:id" element={<ProtectedLayout><RoleDetail /></ProtectedLayout>} />
              <Route path="/roles/:id/edit" element={<ProtectedLayout><RoleEdit /></ProtectedLayout>} />
              <Route path="/audit-log" element={<ProtectedLayout><AuditLog /></ProtectedLayout>} />
              <Route path="/audit-log/:id" element={<ProtectedLayout><AuditLogDetail /></ProtectedLayout>} />
              <Route path="/notifications" element={<ProtectedLayout><Notifications /></ProtectedLayout>} />
              <Route path="/notifications/:id" element={<ProtectedLayout><NotificationDetail /></ProtectedLayout>} />
              <Route path="/help" element={<ProtectedLayout><Help /></ProtectedLayout>} />
              
              {/* Produktion */}
              <Route path="/bom" element={<ProtectedLayout><BillOfMaterials /></ProtectedLayout>} />
              <Route path="/bom/new" element={<ProtectedLayout><BOMCreate /></ProtectedLayout>} />
              <Route path="/bom/:id" element={<ProtectedLayout><BOMDetail /></ProtectedLayout>} />
              <Route path="/calculation" element={<ProtectedLayout><Calculation /></ProtectedLayout>} />
              <Route path="/calculation/new" element={<ProtectedLayout><CalculationCreate /></ProtectedLayout>} />
              <Route path="/calculation/:id" element={<ProtectedLayout><CalculationDetail /></ProtectedLayout>} />
              <Route path="/production" element={<ProtectedLayout><Production /></ProtectedLayout>} />
              <Route path="/production/new" element={<ProtectedLayout><ProductionCreate /></ProtectedLayout>} />
              <Route path="/production/:id" element={<ProtectedLayout><ProductionDetail /></ProtectedLayout>} />
              <Route path="/qr-invoice" element={<ProtectedLayout><QRInvoice /></ProtectedLayout>} />
              <Route path="/bank-import" element={<ProtectedLayout><BankImport /></ProtectedLayout>} />
              <Route path="/swissdec" element={<ProtectedLayout><Swissdec /></ProtectedLayout>} />
              <Route path="/withholding-tax" element={<ProtectedLayout><WithholdingTax /></ProtectedLayout>} />
              <Route path="/service" element={<ProtectedLayout><Service /></ProtectedLayout>} />
              <Route path="/service/new" element={<ProtectedLayout><ServiceCreate /></ProtectedLayout>} />
              <Route path="/service/:id" element={<ProtectedLayout><ServiceDetail /></ProtectedLayout>} />
              <Route path="/quality" element={<ProtectedLayout><QualityControl /></ProtectedLayout>} />
              <Route path="/quality/new" element={<ProtectedLayout><QualityCheckCreate /></ProtectedLayout>} />
              <Route path="/quality/checklists" element={<ProtectedLayout><QualityChecklists /></ProtectedLayout>} />
              <Route path="/quality/checklists/new" element={<ProtectedLayout><QualityChecklistCreate /></ProtectedLayout>} />
              <Route path="/quality/checklists/:id" element={<ProtectedLayout><QualityChecklistDetail /></ProtectedLayout>} />
              <Route path="/quality/:id" element={<ProtectedLayout><QualityCheckDetail /></ProtectedLayout>} />
              
              {/* Marketing Website */}
              <Route path="/website" element={<WebsiteLoomora />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DocumentsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
