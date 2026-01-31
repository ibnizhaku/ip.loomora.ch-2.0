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
import Quotes from "./pages/Quotes";
import Orders from "./pages/Orders";
import DeliveryNotes from "./pages/DeliveryNotes";
import Inventory from "./pages/Inventory";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import HR from "./pages/HR";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Company from "./pages/Company";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Suppliers from "./pages/Suppliers";
import Contracts from "./pages/Contracts";
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
                  
                  {/* CRM */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  
                  {/* Zeit */}
                  <Route path="/time-tracking" element={<TimeTracking />} />
                  <Route path="/calendar" element={<Calendar />} />
                  
                  {/* Verkauf */}
                  <Route path="/quotes" element={<Quotes />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/delivery-notes" element={<DeliveryNotes />} />
                  
                  {/* Einkauf & Lager */}
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  
                  {/* Finanzen */}
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/contracts" element={<Contracts />} />
                  
                  {/* Berichte */}
                  <Route path="/reports" element={<Reports />} />
                  
                  {/* Dokumente */}
                  <Route path="/documents" element={<Documents />} />
                  
                  {/* Administration */}
                  <Route path="/hr" element={<HR />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/company" element={<Company />} />
                  <Route path="/settings" element={<Settings />} />
                  
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
