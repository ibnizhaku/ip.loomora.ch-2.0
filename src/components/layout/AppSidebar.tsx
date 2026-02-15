import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  HelpCircle,
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
  BookOpen,
  Calculator,
  Landmark,
  Scale,
  Wallet,
  PiggyBank,
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
    title: "Abteilungen",
    url: "/departments",
    icon: Building2,
    keywords: ["department", "abteilung", "team"],
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
    if (searchQuery) return true;
    if (openSubmenus[item.url] !== undefined) return openSubmenus[item.url];
    return item.subItems?.some(sub => location.pathname === sub.url) || false;
  };

  return (
    <Collapsible open={shouldBeOpen} onOpenChange={searchQuery ? undefined : setIsOpen}>
      <SidebarGroup className="py-1">
        <CollapsibleTrigger className="w-full group/trigger" disabled={!!searchQuery}>
          <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-3 py-2 flex items-center justify-between cursor-pointer hover:text-muted-foreground transition-colors duration-200">
            <span className="flex items-center gap-2">
              {label}
              {filteredItems.length !== items.length && searchQuery && (
                <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  {filteredItems.length}
                </span>
              )}
            </span>
            {!searchQuery && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300 opacity-50 group-hover/trigger:opacity-100",
                  shouldBeOpen && "rotate-180"
                )}
              />
            )}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-in slide-in-from-top-1 duration-200">
          <SidebarGroupContent className="px-1">
            <SidebarMenu className="gap-0.5">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  item.subItems?.some(sub => location.pathname === sub.url);
                
                return (
                  <SidebarMenuItem key={item.url}>
                    {item.subItems && useSubmenus ? (
                      <Collapsible open={isSubmenuOpen(item)} onOpenChange={() => toggleSubmenu(item.url)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "group/item relative w-full justify-between rounded-lg transition-all duration-200",
                              "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                              isActive && "bg-white/15 dark:bg-white/10 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.25),inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_-1px_0_0_rgba(255,255,255,0.05)] text-sidebar-accent-foreground font-medium ring-1 ring-white/10"
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200",
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                              )}>
                                <item.icon className="h-4 w-4" />
                              </span>
                              <span className="text-sm">{item.title}</span>
                            </span>
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-300",
                                isSubmenuOpen(item) && "rotate-180"
                              )}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="animate-in slide-in-from-top-1 duration-200">
                          <SidebarMenuSub className="ml-5 mt-1 border-l-2 border-sidebar-border pl-3 space-y-0.5">
                            {item.subItems.map((subItem) => {
                              const isSubActive = location.pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    className={cn(
                                      "relative rounded-md py-2 transition-all duration-200",
                                      "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                                      isSubActive && "bg-white/15 dark:bg-white/10 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.25),inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_-1px_0_0_rgba(255,255,255,0.05)] text-sidebar-accent-foreground font-medium ring-1 ring-white/10"
                                    )}
                                  >
                                    <NavLink to={subItem.url}>
                                      {isSubActive && (
                                        <span className="absolute left-[-13px] top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full" />
                                      )}
                                      <span className="text-sm">{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "group/item relative rounded-lg transition-all duration-200",
                          "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                          isActive && "bg-white/15 dark:bg-white/10 backdrop-blur-2xl border border-white/30 dark:border-white/15 shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.25),inset_0_1px_0_0_rgba(255,255,255,0.25),inset_0_-1px_0_0_rgba(255,255,255,0.05)] text-sidebar-accent-foreground font-medium ring-1 ring-white/10"
                        )}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3">
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                          )}
                          <span className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200",
                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                          )}>
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
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
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-4 space-y-4">
        <NavLink to="/" className="flex items-center gap-3 px-1 hover:opacity-80 transition-opacity">
          <img src={loomoraLogo} alt="Loomora" className="h-10" />
        </NavLink>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Suchen..."
            className="pl-9 h-10 bg-sidebar-accent/30 border-transparent hover:border-sidebar-border focus:border-primary/50 focus:bg-sidebar-accent/50 text-sm rounded-lg transition-all duration-200 placeholder:text-muted-foreground/50"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
          {sidebarSearch && (
            <button
              onClick={() => setSidebarSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
            >
              <span className="text-[10px] font-bold text-muted-foreground">✕</span>
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
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
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground/60">
              {filterItems([...mainNavItems, ...crmItems, ...salesItems, ...managementItems, ...accountingItems, ...marketingItems, ...ecommerceItems, ...hrItems, ...adminItems], sidebarSearch).length} Ergebnisse für "{sidebarSearch}"
            </p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={cn(
                "group/item relative rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent/60",
                location.pathname === "/help" &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              <NavLink to="/help" className="flex items-center gap-3">
                {location.pathname === "/help" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
                <span className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  location.pathname === "/help" ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover/item:text-foreground"
                )}>
                  <HelpCircle className="h-4 w-4" />
                </span>
                <span className="text-sm">Hilfe & Support</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
