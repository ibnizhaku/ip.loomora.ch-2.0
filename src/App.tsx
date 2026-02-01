import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";

// Pages
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectEdit from "./pages/ProjectEdit";
import ProjectCreate from "./pages/ProjectCreate";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import TimeTracking from "./pages/TimeTracking";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceCreate from "./pages/InvoiceCreate";
import InvoiceEdit from "./pages/InvoiceEdit";
import Quotes from "./pages/Quotes";
import QuoteDetail from "./pages/QuoteDetail";
import QuoteCreate from "./pages/QuoteCreate";
import CreditNotes from "./pages/CreditNotes";
import CreditNoteDetail from "./pages/CreditNoteDetail";
import CreditNoteCreate from "./pages/CreditNoteCreate";
import CreditNoteEdit from "./pages/CreditNoteEdit";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import PurchaseOrderCreate from "./pages/PurchaseOrderCreate";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import PurchaseInvoiceDetail from "./pages/PurchaseInvoiceDetail";
import PurchaseInvoiceCreate from "./pages/PurchaseInvoiceCreate";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderCreate from "./pages/OrderCreate";
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
import Payroll from "./pages/Payroll";
import Absences from "./pages/Absences";
import AbsenceDetail from "./pages/AbsenceDetail";
import AbsenceCreate from "./pages/AbsenceCreate";
import Recruiting from "./pages/Recruiting";
import CandidateDetail from "./pages/CandidateDetail";
import Training from "./pages/Training";
import TrainingDetail from "./pages/TrainingDetail";
import Orgchart from "./pages/Orgchart";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import TaskCreate from "./pages/TaskCreate";
import BillOfMaterials from "./pages/BillOfMaterials";
import BOMDetail from "./pages/BOMDetail";
import BOMCreate from "./pages/BOMCreate";
import Calculation from "./pages/Calculation";
import CalculationDetail from "./pages/CalculationDetail";
import CalculationCreate from "./pages/CalculationCreate";
import Production from "./pages/Production";
import ProductionDetail from "./pages/ProductionDetail";
import LeadDetail from "./pages/LeadDetail";
import EmployeeContracts from "./pages/EmployeeContracts";
import EmployeeContractDetail from "./pages/EmployeeContractDetail";
import Service from "./pages/Service";
import ServiceDetail from "./pages/ServiceDetail";
import QualityControl from "./pages/QualityControl";
import QualityCheckDetail from "./pages/QualityCheckDetail";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import JournalEntries from "./pages/JournalEntries";
import JournalEntryDetail from "./pages/JournalEntryDetail";
import Payments from "./pages/Payments";
import PaymentDetail from "./pages/PaymentDetail";
import Reminders from "./pages/Reminders";
import ReminderDetail from "./pages/ReminderDetail";
import TravelExpenses from "./pages/TravelExpenses";
import TravelExpenseDetail from "./pages/TravelExpenseDetail";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Reviews from "./pages/Reviews";
import ReviewDetail from "./pages/ReviewDetail";
import PayslipDetail from "./pages/PayslipDetail";
import BankAccounts from "./pages/BankAccounts";
import BankAccountDetail from "./pages/BankAccountDetail";
import Budgets from "./pages/Budgets";
import BudgetDetail from "./pages/BudgetDetail";
import FixedAssets from "./pages/FixedAssets";
import FixedAssetDetail from "./pages/FixedAssetDetail";
import VatReturns from "./pages/VatReturns";
import VatReturnDetail from "./pages/VatReturnDetail";
import Discounts from "./pages/Discounts";
import DiscountDetail from "./pages/DiscountDetail";
import Roles from "./pages/Roles";
import RoleDetail from "./pages/RoleDetail";
import Settings from "./pages/Settings";
import Company from "./pages/Company";
import CompanyEdit from "./pages/CompanyEdit";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import DocumentDetail from "./pages/DocumentDetail";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import SupplierCreate from "./pages/SupplierCreate";
import CustomerCreate from "./pages/CustomerCreate";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import ChartOfAccountDetail from "./pages/ChartOfAccountDetail";
import GeneralLedger from "./pages/GeneralLedger";
import GeneralLedgerDetail from "./pages/GeneralLedgerDetail";
import OpenItems from "./pages/OpenItems";
import BalanceSheet from "./pages/BalanceSheet";
import CashBook from "./pages/CashBook";
import SepaPayments from "./pages/SepaPayments";
import SepaPaymentDetail from "./pages/SepaPaymentDetail";
import CostCenters from "./pages/CostCenters";
import CostCenterDetail from "./pages/CostCenterDetail";
import Products from "./pages/Products";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <SidebarInset>
              <Header />
              <main className="flex-1 p-6">
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Projekte */}
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/new" element={<ProjectCreate />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/projects/:id/edit" element={<ProjectEdit />} />
                  
                  {/* Aufgaben */}
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/tasks/new" element={<TaskCreate />} />
                  <Route path="/tasks/:id" element={<TaskDetail />} />
                  
                  {/* CRM */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/new" element={<CustomerCreate />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/suppliers/new" element={<SupplierCreate />} />
                  <Route path="/suppliers/:id" element={<SupplierDetail />} />
                  
                  {/* Zeit */}
                  <Route path="/time-tracking" element={<TimeTracking />} />
                  <Route path="/calendar" element={<Calendar />} />
                  
                  {/* Verkauf */}
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/quotes/new" element={<QuoteCreate />} />
                  <Route path="/quotes/:id" element={<QuoteDetail />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/new" element={<OrderCreate />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoices/new" element={<InvoiceCreate />} />
                  <Route path="/invoices/:id" element={<InvoiceDetail />} />
                  <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />
                  <Route path="/delivery-notes" element={<DeliveryNotes />} />
                  <Route path="/delivery-notes/new" element={<DeliveryNoteCreate />} />
                  <Route path="/delivery-notes/:id" element={<DeliveryNoteDetail />} />
                  <Route path="/delivery-notes/:id/edit" element={<DeliveryNoteEdit />} />
                  <Route path="/credit-notes" element={<CreditNotes />} />
                  <Route path="/credit-notes/new" element={<CreditNoteCreate />} />
                  <Route path="/credit-notes/:id" element={<CreditNoteDetail />} />
                  <Route path="/credit-notes/:id/edit" element={<CreditNoteEdit />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/reminders/:id" element={<ReminderDetail />} />
                  
                  {/* Einkauf & Lager */}
                  <Route path="/purchase-orders" element={<PurchaseOrders />} />
                  <Route path="/purchase-orders/new" element={<PurchaseOrderCreate />} />
                  <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
                  <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
                  <Route path="/purchase-invoices/new" element={<PurchaseInvoiceCreate />} />
                  <Route path="/purchase-invoices/:id" element={<PurchaseInvoiceDetail />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<InventoryItemDetail />} />
                  <Route path="/goods-receipts" element={<GoodsReceipts />} />
                  <Route path="/goods-receipts/new" element={<GoodsReceiptCreate />} />
                  <Route path="/goods-receipts/:id" element={<GoodsReceiptDetail />} />
                  
                  {/* Finanzen & Buchhaltung */}
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
                  <Route path="/chart-of-accounts/:id" element={<ChartOfAccountDetail />} />
                  <Route path="/journal-entries" element={<JournalEntries />} />
                  <Route path="/journal-entries/:id" element={<JournalEntryDetail />} />
                  <Route path="/general-ledger" element={<GeneralLedger />} />
                  <Route path="/general-ledger/:id" element={<GeneralLedgerDetail />} />
                  <Route path="/open-items" element={<OpenItems />} />
                  <Route path="/debtors" element={<Debtors />} />
                  <Route path="/creditors" element={<Creditors />} />
                  <Route path="/balance-sheet" element={<BalanceSheet />} />
                  <Route path="/vat-returns" element={<VatReturns />} />
                  <Route path="/vat-returns/:id" element={<VatReturnDetail />} />
                  <Route path="/fixed-assets" element={<FixedAssets />} />
                  <Route path="/fixed-assets/:id" element={<FixedAssetDetail />} />
                  <Route path="/cash-book" element={<CashBook />} />
                  <Route path="/bank-accounts" element={<BankAccounts />} />
                  <Route path="/bank-accounts/:id" element={<BankAccountDetail />} />
                  <Route path="/sepa-payments" element={<SepaPayments />} />
                  <Route path="/sepa-payments/:id" element={<SepaPaymentDetail />} />
                  <Route path="/cost-centers" element={<CostCenters />} />
                  <Route path="/cost-centers/:id" element={<CostCenterDetail />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/budgets/:id" element={<BudgetDetail />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/contracts/:id" element={<ContractDetail />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/payments/:id" element={<PaymentDetail />} />
                  
                  {/* Stammdaten & Verwaltung */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/travel-expenses" element={<TravelExpenses />} />
                  <Route path="/travel-expenses/:id" element={<TravelExpenseDetail />} />
                  
                  {/* Marketing */}
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaigns/:id" element={<CampaignDetail />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/leads/:id" element={<LeadDetail />} />
                  <Route path="/email-marketing" element={<EmailMarketing />} />
                  
                  {/* E-Commerce */}
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/discounts" element={<Discounts />} />
                  <Route path="/discounts/:id" element={<DiscountDetail />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/reviews/:id" element={<ReviewDetail />} />
                  
                  {/* Berichte */}
                  <Route path="/reports" element={<Reports />} />
                  
                  {/* Dokumente */}
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/documents/:id" element={<DocumentDetail />} />
                  
                  {/* HR / Personal */}
                  <Route path="/hr" element={<HR />} />
                  <Route path="/hr/new" element={<EmployeeCreate />} />
                  <Route path="/hr/:id" element={<EmployeeDetail />} />
                  <Route path="/employee-contracts" element={<EmployeeContracts />} />
                  <Route path="/employee-contracts/:id" element={<EmployeeContractDetail />} />
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/payroll/:id" element={<PayslipDetail />} />
                  <Route path="/absences" element={<Absences />} />
                  <Route path="/absences/new" element={<AbsenceCreate />} />
                  <Route path="/absences/:id" element={<AbsenceDetail />} />
                  <Route path="/recruiting" element={<Recruiting />} />
                  <Route path="/recruiting/:id" element={<CandidateDetail />} />
                  <Route path="/training" element={<Training />} />
                  <Route path="/training/:id" element={<TrainingDetail />} />
                  <Route path="/orgchart" element={<Orgchart />} />
                  
                  {/* Administration */}
                  <Route path="/users" element={<Users />} />
                  <Route path="/users/:id" element={<UserDetail />} />
                  <Route path="/company" element={<Company />} />
                  <Route path="/company/edit" element={<CompanyEdit />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/roles" element={<Roles />} />
                  <Route path="/roles/:id" element={<RoleDetail />} />
                  <Route path="/audit-log" element={<AuditLog />} />
                  <Route path="/audit-log/:id" element={<AuditLogDetail />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/notifications/:id" element={<NotificationDetail />} />
                  <Route path="/help" element={<Help />} />
                  
                  {/* Produktion */}
                  <Route path="/bom" element={<BillOfMaterials />} />
                  <Route path="/bom/new" element={<BOMCreate />} />
                  <Route path="/bom/:id" element={<BOMDetail />} />
                  <Route path="/calculation" element={<Calculation />} />
                  <Route path="/calculation/new" element={<CalculationCreate />} />
                  <Route path="/calculation/:id" element={<CalculationDetail />} />
                  <Route path="/production" element={<Production />} />
                  <Route path="/production/:id" element={<ProductionDetail />} />
                  <Route path="/qr-invoice" element={<QRInvoice />} />
                  <Route path="/bank-import" element={<BankImport />} />
                  <Route path="/swissdec" element={<Swissdec />} />
                  <Route path="/withholding-tax" element={<WithholdingTax />} />
                  <Route path="/service" element={<Service />} />
                  <Route path="/service/:id" element={<ServiceDetail />} />
                  <Route path="/quality" element={<QualityControl />} />
                  <Route path="/quality/:id" element={<QualityCheckDetail />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
