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
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import TimeTracking from "./pages/TimeTracking";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import InvoiceCreate from "./pages/InvoiceCreate";
import Quotes from "./pages/Quotes";
import QuoteDetail from "./pages/QuoteDetail";
import QuoteCreate from "./pages/QuoteCreate";
import CreditNoteDetail from "./pages/CreditNoteDetail";
import PurchaseOrderDetail from "./pages/PurchaseOrderDetail";
import PurchaseInvoiceDetail from "./pages/PurchaseInvoiceDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import DeliveryNotes from "./pages/DeliveryNotes";
import DeliveryNoteDetail from "./pages/DeliveryNoteDetail";
import Inventory from "./pages/Inventory";
import InventoryItemDetail from "./pages/InventoryItemDetail";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import HR from "./pages/HR";
import EmployeeDetail from "./pages/EmployeeDetail";
import Payroll from "./pages/Payroll";
import Absences from "./pages/Absences";
import Recruiting from "./pages/Recruiting";
import Training from "./pages/Training";
import Orgchart from "./pages/Orgchart";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Company from "./pages/Company";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import PurchaseOrders from "./pages/PurchaseOrders";
import CreditNotes from "./pages/CreditNotes";
import Reminders from "./pages/Reminders";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import JournalEntries from "./pages/JournalEntries";
import GeneralLedger from "./pages/GeneralLedger";
import OpenItems from "./pages/OpenItems";
import BalanceSheet from "./pages/BalanceSheet";
import VatReturns from "./pages/VatReturns";
import FixedAssets from "./pages/FixedAssets";
import CashBook from "./pages/CashBook";
import BankAccounts from "./pages/BankAccounts";
import SepaPayments from "./pages/SepaPayments";
import CostCenters from "./pages/CostCenters";
import Budgets from "./pages/Budgets";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import EmployeeContracts from "./pages/EmployeeContracts";
import TravelExpenses from "./pages/TravelExpenses";
import Campaigns from "./pages/Campaigns";
import Leads from "./pages/Leads";
import EmailMarketing from "./pages/EmailMarketing";
import Shop from "./pages/Shop";
import Discounts from "./pages/Discounts";
import Reviews from "./pages/Reviews";
import Debtors from "./pages/Debtors";
import Creditors from "./pages/Creditors";
import BillOfMaterials from "./pages/BillOfMaterials";
import Calculation from "./pages/Calculation";
import QRInvoice from "./pages/QRInvoice";
import Production from "./pages/Production";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import Payments from "./pages/Payments";
import BankImport from "./pages/BankImport";
import Swissdec from "./pages/Swissdec";
import WithholdingTax from "./pages/WithholdingTax";
import Service from "./pages/Service";
import QualityControl from "./pages/QualityControl";
import Notifications from "./pages/Notifications";
import AuditLog from "./pages/AuditLog";
import Roles from "./pages/Roles";
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
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  
                  {/* Aufgaben */}
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/tasks/:id" element={<TaskDetail />} />
                  
                  {/* CRM */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/suppliers/:id" element={<SupplierDetail />} />
                  
                  {/* Zeit */}
                  <Route path="/time-tracking" element={<TimeTracking />} />
                  <Route path="/calendar" element={<Calendar />} />
                  
                  {/* Verkauf */}
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/quotes/new" element={<QuoteCreate />} />
                  <Route path="/quotes/:id" element={<QuoteDetail />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/invoices/new" element={<InvoiceCreate />} />
                  <Route path="/invoices/:id" element={<InvoiceDetail />} />
                  <Route path="/delivery-notes" element={<DeliveryNotes />} />
                  <Route path="/delivery-notes/:id" element={<DeliveryNoteDetail />} />
                  <Route path="/credit-notes" element={<CreditNotes />} />
                  <Route path="/credit-notes/:id" element={<CreditNoteDetail />} />
                  <Route path="/reminders" element={<Reminders />} />
                  
                  {/* Einkauf & Lager */}
                  <Route path="/purchase-orders" element={<PurchaseOrders />} />
                  <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
                  <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
                  <Route path="/purchase-invoices/:id" element={<PurchaseInvoiceDetail />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<InventoryItemDetail />} />
                  
                  {/* Finanzen & Buchhaltung */}
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
                  <Route path="/journal-entries" element={<JournalEntries />} />
                  <Route path="/general-ledger" element={<GeneralLedger />} />
                  <Route path="/open-items" element={<OpenItems />} />
                  <Route path="/debtors" element={<Debtors />} />
                  <Route path="/creditors" element={<Creditors />} />
                  <Route path="/balance-sheet" element={<BalanceSheet />} />
                  <Route path="/vat-returns" element={<VatReturns />} />
                  <Route path="/fixed-assets" element={<FixedAssets />} />
                  <Route path="/cash-book" element={<CashBook />} />
                  <Route path="/bank-accounts" element={<BankAccounts />} />
                  <Route path="/sepa-payments" element={<SepaPayments />} />
                  <Route path="/cost-centers" element={<CostCenters />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/contracts/:id" element={<ContractDetail />} />
                  
                  {/* Stammdaten & Verwaltung */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/travel-expenses" element={<TravelExpenses />} />
                  
                  {/* Marketing */}
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/email-marketing" element={<EmailMarketing />} />
                  
                  {/* E-Commerce */}
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/discounts" element={<Discounts />} />
                  <Route path="/reviews" element={<Reviews />} />
                  
                  {/* Berichte */}
                  <Route path="/reports" element={<Reports />} />
                  
                  {/* Dokumente */}
                  <Route path="/documents" element={<Documents />} />
                  
                  {/* HR / Personal */}
                  <Route path="/hr" element={<HR />} />
                  <Route path="/hr/:id" element={<EmployeeDetail />} />
                  <Route path="/employee-contracts" element={<EmployeeContracts />} />
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/absences" element={<Absences />} />
                  <Route path="/recruiting" element={<Recruiting />} />
                  <Route path="/training" element={<Training />} />
                  <Route path="/orgchart" element={<Orgchart />} />
                  
                  {/* Administration */}
                  <Route path="/users" element={<Users />} />
                  <Route path="/company" element={<Company />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/roles" element={<Roles />} />
                  <Route path="/audit-log" element={<AuditLog />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  {/* Neue Module */}
                  <Route path="/bom" element={<BillOfMaterials />} />
                  <Route path="/calculation" element={<Calculation />} />
                  <Route path="/qr-invoice" element={<QRInvoice />} />
                  <Route path="/production" element={<Production />} />
                  <Route path="/purchase-invoices" element={<PurchaseInvoices />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/bank-import" element={<BankImport />} />
                  <Route path="/swissdec" element={<Swissdec />} />
                  <Route path="/withholding-tax" element={<WithholdingTax />} />
                  <Route path="/service" element={<Service />} />
                  <Route path="/quality" element={<QualityControl />} />
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
