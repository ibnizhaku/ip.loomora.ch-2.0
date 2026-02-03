import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  FileUp,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Package,
  Clock,
  CreditCard,
  Building2,
  UserCog,
  CheckSquare,
  UsersRound,
  CalendarDays,
  FileBox,
  ShoppingCart,
  Truck,
  Receipt,
  Handshake,
  FileSignature,
  Folder,
  Euro,
  Palmtree,
  GraduationCap,
  UserPlus,
  Network,
  AlertTriangle,
  BookOpen,
  Calculator,
  Landmark,
  Scale,
  Wallet,
  PiggyBank,
  Send,
  Target,
  Plane,
  Box,
  Megaphone,
  Mail,
  Store,
  Percent,
  Star,
  UserCheck,
  UserMinus,
  UserPlus2,
  Search,
  Layers,
  Factory,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import loomoraLogo from "@/assets/loomora-logo.png";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  keywords?: string[]; // Additional search terms
  subItems?: { title: string; url: string; icon?: any }[];
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    keywords: ["übersicht", "home", "start"],
  },
  {
    title: "Projekte",
    url: "/projects",
    icon: FolderKanban,
    keywords: ["project", "vorhaben"],
  },
  {
    title: "Aufgaben",
    url: "/tasks",
    icon: CheckSquare,
    keywords: ["task", "todo", "pendenz"],
  },
  {
    title: "Kalender",
    url: "/calendar",
    icon: CalendarDays,
    keywords: ["termine", "calendar", "datum"],
  },
];

const crmItems: NavItem[] = [
  {
    title: "Kunden",
    url: "/customers",
    icon: Users,
    keywords: ["customer", "client", "debitor"],
  },
  {
    title: "Lieferanten",
    url: "/suppliers",
    icon: Handshake,
    keywords: ["supplier", "kreditor", "zulieferer"],
  },
];

const salesItems: NavItem[] = [
  {
    title: "Angebote",
    url: "/quotes",
    icon: FileText,
    keywords: ["offerte", "quote", "kostenvoranschlag"],
  },
  {
    title: "Aufträge",
    url: "/orders",
    icon: ShoppingCart,
    keywords: ["order", "bestellung"],
  },
  {
    title: "Lieferscheine",
    url: "/delivery-notes",
    icon: Truck,
    keywords: ["delivery", "versand"],
  },
  {
    title: "Rechnungen",
    url: "/invoices",
    icon: Receipt,
    keywords: ["invoice", "faktura", "rechnung"],
  },
  {
    title: "Gutschriften",
    url: "/credit-notes",
    icon: FileBox,
    keywords: ["credit", "storno"],
  },
  {
    title: "Mahnwesen",
    url: "/reminders",
    icon: FileText,
    keywords: ["mahnung", "reminder", "inkasso"],
  },
];

const managementItems: NavItem[] = [
  { title: "Zeiterfassung", url: "/time-tracking", icon: Clock, keywords: ["time", "stunden"] },
  { title: "Einkauf", url: "/purchase-orders", icon: ShoppingCart },
  { title: "Einkaufsrechnungen", url: "/purchase-invoices", icon: Receipt, keywords: ["kreditor", "lieferant"] },
  { title: "Lager", url: "/inventory", icon: Package, keywords: ["inventory", "bestand"] },
  { title: "Produkte", url: "/products", icon: Box, keywords: ["artikel", "material"] },
  { title: "Stücklisten", url: "/bom", icon: Layers, keywords: ["bom", "material"] },
  { title: "Kalkulation", url: "/calculation", icon: Calculator, keywords: ["kalk", "preis"] },
  { title: "Produktion", url: "/production", icon: Factory, keywords: ["werkstatt", "fertigung"] },
  { title: "QS-Prüfung", url: "/quality", icon: ClipboardCheck, keywords: ["qualität", "prüfung"] },
  { title: "Service", url: "/service", icon: Wrench, keywords: ["wartung", "reparatur"] },
  { title: "Verträge", url: "/contracts", icon: FileSignature },
  { title: "Dokumente", url: "/documents", icon: Folder },
  { title: "Berichte", url: "/reports", icon: BarChart3 },
];

const accountingItems: NavItem[] = [
  {
    title: "Controlling",
    url: "/finance",
    icon: CreditCard,
    keywords: ["finanzen", "übersicht", "dashboard"],
    subItems: [
      { title: "Kassenbuch", url: "/cash-book", icon: Wallet },
      { title: "Kostenstellen", url: "/cost-centers", icon: Target },
      { title: "Budgets", url: "/budgets", icon: PiggyBank },
    ],
  },
  {
    title: "Debitoren",
    url: "/debtors",
    icon: UserPlus2,
    keywords: ["forderungen", "kunden", "offene posten"],
  },
  {
    title: "Kreditoren",
    url: "/creditors",
    icon: UserMinus,
    keywords: ["verbindlichkeiten", "lieferanten", "offene posten"],
  },
  {
    title: "Zahlungsverkehr",
    url: "/bank-accounts",
    icon: Landmark,
    keywords: ["bank", "konto", "sepa", "camt", "iso20022"],
  },
  {
    title: "Finanzbuchhaltung",
    url: "/chart-of-accounts",
    icon: BookOpen,
    keywords: ["fibu", "buchhaltung"],
    subItems: [
      { title: "Kontenplan", url: "/chart-of-accounts", icon: BookOpen },
      { title: "Buchungsjournal", url: "/journal-entries", icon: FileText },
      { title: "Hauptbuch", url: "/general-ledger", icon: Receipt },
    ],
  },
  {
    title: "Abschlüsse",
    url: "/balance-sheet",
    icon: Scale,
    keywords: ["bilanz", "guv", "jahresabschluss"],
    subItems: [
      { title: "Bilanz & GuV", url: "/balance-sheet", icon: Scale },
      { title: "MWST-Abrechnung", url: "/vat-returns", icon: Calculator },
      { title: "Anlagenbuchhaltung", url: "/fixed-assets", icon: PiggyBank },
    ],
  },
];

const hrItems: NavItem[] = [
  {
    title: "Mitarbeiter",
    url: "/hr",
    icon: UsersRound,
  },
  {
    title: "Arbeitsverträge",
    url: "/employee-contracts",
    icon: FileSignature,
  },
  {
    title: "Lohnabrechnung CHF",
    url: "/payroll",
    icon: Euro,
  },
  {
    title: "Abwesenheiten",
    url: "/absences",
    icon: Palmtree,
  },
  {
    title: "Reisekosten",
    url: "/travel-expenses",
    icon: Plane,
  },
  {
    title: "Recruiting",
    url: "/recruiting",
    icon: UserPlus,
  },
  {
    title: "Schulungen",
    url: "/training",
    icon: GraduationCap,
  },
  {
    title: "Organigramm",
    url: "/orgchart",
    icon: Network,
  },
];

const marketingItems: NavItem[] = [
  {
    title: "Kampagnen",
    url: "/campaigns",
    icon: Megaphone,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: UserCheck,
  },
  {
    title: "E-Mail Marketing",
    url: "/email-marketing",
    icon: Mail,
  },
];

const ecommerceItems: NavItem[] = [
  {
    title: "Online-Shop",
    url: "/shop",
    icon: Store,
  },
  {
    title: "Rabatte",
    url: "/discounts",
    icon: Percent,
  },
  {
    title: "Bewertungen",
    url: "/reviews",
    icon: Star,
  },
];

const adminItems: NavItem[] = [
  {
    title: "Benutzer",
    url: "/users",
    icon: UserCog,
  },
  {
    title: "Unternehmen",
    url: "/company",
    icon: Building2,
  },
];

interface NavGroupProps {
  label: string;
  items: NavItem[];
  location: ReturnType<typeof useLocation>;
  defaultOpen?: boolean;
  searchQuery?: string;
  useSubmenus?: boolean;
}

function filterItems(items: NavItem[], query: string): NavItem[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery);
    const keywordMatch = item.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));
    const subItemMatch = item.subItems?.some((sub) => sub.title.toLowerCase().includes(lowerQuery));
    return titleMatch || keywordMatch || subItemMatch;
  });
}

function NavGroup({ label, items, location, defaultOpen = true, searchQuery = "", useSubmenus = false }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const filteredItems = filterItems(items, searchQuery);
  
  // Force open when searching and has results
  const shouldBeOpen = searchQuery ? filteredItems.length > 0 : isOpen;

  // Don't render if no items match search
  if (searchQuery && filteredItems.length === 0) {
    return null;
  }

  const toggleSubmenu = (url: string) => {
    setOpenSubmenus(prev => ({ ...prev, [url]: !prev[url] }));
  };

  const isSubmenuOpen = (item: NavItem) => {
    if (searchQuery) return true; // Always open when searching
    if (openSubmenus[item.url] !== undefined) return openSubmenus[item.url];
    // Auto-open if current route is in submenu
    return item.subItems?.some(sub => location.pathname === sub.url) || false;
  };

  return (
    <Collapsible open={shouldBeOpen} onOpenChange={searchQuery ? undefined : setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger className="w-full" disabled={!!searchQuery}>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 flex items-center justify-between cursor-pointer hover:text-foreground transition-colors">
            {label}
            {filteredItems.length !== items.length && searchQuery && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {filteredItems.length}
              </span>
            )}
            {!searchQuery && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  shouldBeOpen && "rotate-180"
                )}
              />
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  {item.subItems && useSubmenus ? (
                    <Collapsible open={isSubmenuOpen(item)} onOpenChange={() => toggleSubmenu(item.url)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "transition-all duration-200 w-full justify-between",
                            (location.pathname === item.url || item.subItems?.some(sub => location.pathname === sub.url)) &&
                              "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-3 w-3 transition-transform duration-200",
                              isSubmenuOpen(item) && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.url}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "transition-all duration-200",
                                  location.pathname === subItem.url &&
                                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                )}
                              >
                                <NavLink to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "transition-all duration-200",
                        location.pathname === item.url &&
                          "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const [sidebarSearch, setSidebarSearch] = useState("");

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <img src={loomoraLogo} alt="Loomora" className="h-12" />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Menü durchsuchen..."
            className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto">
        <NavGroup label="Hauptmenü" items={mainNavItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="CRM" items={crmItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="Verkauf" items={salesItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="Verwaltung" items={managementItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="Buchhaltung" items={accountingItems} location={location} defaultOpen={false} searchQuery={sidebarSearch} useSubmenus={true} />
        <NavGroup label="Marketing" items={marketingItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="E-Commerce" items={ecommerceItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="Personal (HR)" items={hrItems} location={location} searchQuery={sidebarSearch} />
        <NavGroup label="Administration" items={adminItems} location={location} searchQuery={sidebarSearch} />
        
        {sidebarSearch && (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Suche: "{sidebarSearch}"
            </p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "transition-all duration-200",
                location.pathname === "/settings" &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <NavLink to="/settings">
                <Settings className="h-4 w-4" />
                <span>Einstellungen</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="transition-all duration-200">
              <NavLink to="/help">
                <HelpCircle className="h-4 w-4" />
                <span>Hilfe</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-4 p-3 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                MK
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Max Keller</p>
              <p className="text-xs text-muted-foreground truncate">
                Administrator
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
