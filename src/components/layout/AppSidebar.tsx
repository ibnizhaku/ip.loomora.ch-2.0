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
  Search,
  Layers,
  Factory,
  ClipboardCheck,
  Wrench,
  Cog,
  Settings,
  Eye,
  EyeOff,
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
  keywords?: string[];
  subItems?: { title: string; url: string; icon?: any }[];
  hidden?: boolean; // Module visibility control
}

// ============================================
// METALLBAU-ERP NAVIGATION STRUCTURE
// ============================================

// TAGESGESCHÄFT - Core daily operations
const dailyOperationsItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    keywords: ["übersicht", "home", "start", "cockpit"],
  },
  {
    title: "Meine Arbeit",
    url: "/my-work",
    icon: ClipboardCheck,
    keywords: ["aufgaben", "tätigkeiten", "fertigungsschritte", "zuweisung"],
  },
  {
    title: "Betriebszeit erfassen",
    url: "/time-tracking",
    icon: Clock,
    keywords: ["zeit", "stunden", "erfassung", "stempeln"],
  },
  {
    title: "Kalender",
    url: "/calendar",
    icon: CalendarDays,
    keywords: ["termine", "planung", "datum"],
  },
];

// AUFTRÄGE & PROJEKTE - Zentrales Modul
const projectsItems: NavItem[] = [
  {
    title: "Aufträge & Projekte",
    url: "/projects",
    icon: FolderKanban,
    keywords: ["projekt", "auftrag", "baustelle", "montage", "order"],
    subItems: [
      { title: "Übersicht", url: "/projects", icon: FolderKanban },
      { title: "Kundenaufträge", url: "/orders", icon: ShoppingCart },
      { title: "Angebote / Offerten", url: "/quotes", icon: FileText },
    ],
  },
  {
    title: "Werkstatt",
    url: "/production",
    icon: Factory,
    keywords: ["werkstatt", "fertigung", "produktion", "maschinen"],
    subItems: [
      { title: "Fertigungsaufträge", url: "/production", icon: Factory },
      { title: "Stücklisten (BOM)", url: "/bom", icon: Layers },
      { title: "Kalkulation", url: "/calculation", icon: Calculator },
    ],
  },
  {
    title: "Lieferung & Abrechnung",
    url: "/delivery-notes",
    icon: Truck,
    keywords: ["lieferung", "rechnung", "faktura", "versand"],
    subItems: [
      { title: "Lieferscheine", url: "/delivery-notes", icon: Truck },
      { title: "Rechnungen", url: "/invoices", icon: Receipt },
      { title: "Mahnwesen", url: "/reminders", icon: FileText },
    ],
  },
];

// LAGER & MATERIAL
const inventoryItems: NavItem[] = [
  {
    title: "Materialien & Lager",
    url: "/inventory",
    icon: Package,
    keywords: ["bestand", "artikel", "waren", "lager"],
  },
  {
    title: "Produkte / Artikel",
    url: "/products",
    icon: Box,
    keywords: ["artikel", "waren", "teile", "stammdaten"],
  },
  {
    title: "QS-Prüfung",
    url: "/quality",
    icon: ClipboardCheck,
    keywords: ["qualität", "kontrolle", "prüfung"],
  },
];

// KUNDEN & LIEFERANTEN
const partnersItems: NavItem[] = [
  {
    title: "Kunden",
    url: "/customers",
    icon: Users,
    keywords: ["kunde", "auftraggeber", "debitor"],
  },
  {
    title: "Lieferanten",
    url: "/suppliers",
    icon: Handshake,
    keywords: ["zulieferer", "kreditor", "bezugsquelle"],
  },
];

// CONTROLLING
const controllingItems: NavItem[] = [
  {
    title: "Finanz-Übersicht",
    url: "/finance",
    icon: CreditCard,
    keywords: ["dashboard", "kennzahlen", "kpi"],
  },
  {
    title: "Kostenstellen",
    url: "/cost-centers",
    icon: Target,
    keywords: ["kostenrechnung", "umlage"],
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: PiggyBank,
    keywords: ["planung", "soll"],
  },
  {
    title: "Kassenbuch",
    url: "/cash-book",
    icon: Wallet,
    keywords: ["bar", "kasse"],
  },
  {
    title: "Berichte",
    url: "/reports",
    icon: BarChart3,
    keywords: ["auswertung", "report", "analyse"],
  },
];

// BUCHHALTUNG
const accountingItems: NavItem[] = [
  {
    title: "Debitoren",
    url: "/debtors",
    icon: Users,
    keywords: ["forderungen", "offene posten"],
  },
  {
    title: "Kreditoren",
    url: "/creditors",
    icon: Handshake,
    keywords: ["verbindlichkeiten", "lieferanten"],
  },
  {
    title: "Einkauf",
    url: "/purchase-orders",
    icon: ShoppingCart,
    keywords: ["bestellung", "beschaffung"],
  },
  {
    title: "Einkaufsrechnungen",
    url: "/purchase-invoices",
    icon: Receipt,
    keywords: ["lieferantenrechnung"],
  },
  {
    title: "Zahlungsverkehr",
    url: "/bank-accounts",
    icon: Landmark,
    keywords: ["bank", "sepa", "iso20022", "qr"],
  },
  {
    title: "Finanzbuchhaltung",
    url: "/chart-of-accounts",
    icon: BookOpen,
    keywords: ["fibu", "konten"],
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
    keywords: ["bilanz", "guv", "erfolgsrechnung"],
    subItems: [
      { title: "Bilanz & Erfolgsrechnung", url: "/balance-sheet", icon: Scale },
      { title: "MWST-Abrechnung", url: "/vat-returns", icon: Calculator },
      { title: "Anlagenbuchhaltung", url: "/fixed-assets", icon: PiggyBank },
    ],
  },
];

// PERSONAL (HR) - Metallbau-fokussiert
const hrItems: NavItem[] = [
  {
    title: "Mitarbeiter",
    url: "/hr",
    icon: UsersRound,
    keywords: ["personal", "angestellte"],
  },
  {
    title: "GAV & Lohnklassen",
    url: "/hr", // GAV settings embedded in HR
    icon: FileSignature,
    keywords: ["gav", "metallbau", "tarif", "lohnklasse"],
  },
  {
    title: "Lohnabrechnung",
    url: "/payroll",
    icon: Euro,
    keywords: ["lohn", "gehalt", "salär"],
  },
  {
    title: "Abwesenheiten",
    url: "/absences",
    icon: Palmtree,
    keywords: ["ferien", "krank", "urlaub"],
  },
  {
    title: "Schulungen",
    url: "/training",
    icon: GraduationCap,
    keywords: ["weiterbildung", "kurs", "qualifikation"],
  },
  {
    title: "Reisekosten",
    url: "/travel-expenses",
    icon: Plane,
    keywords: ["spesen", "fahrkosten"],
  },
  {
    title: "Organigramm",
    url: "/orgchart",
    icon: Network,
    keywords: ["struktur", "hierarchie"],
  },
];

// SONSTIGES - Versteckt standardmäßig
const additionalItems: NavItem[] = [
  {
    title: "Service & Wartung",
    url: "/service",
    icon: Wrench,
    keywords: ["reparatur", "instandhaltung"],
  },
  {
    title: "Verträge",
    url: "/contracts",
    icon: FileSignature,
    keywords: ["vertrag", "vereinbarung"],
  },
  {
    title: "Dokumente",
    url: "/documents",
    icon: Folder,
    keywords: ["datei", "ablage"],
  },
  {
    title: "Gutschriften",
    url: "/credit-notes",
    icon: FileBox,
    keywords: ["storno", "rückerstattung"],
  },
];

// ADMINISTRATION
const adminItems: NavItem[] = [
  {
    title: "Benutzer",
    url: "/users",
    icon: UserCog,
    keywords: ["user", "zugang"],
  },
  {
    title: "Unternehmen",
    url: "/company",
    icon: Building2,
    keywords: ["firma", "einstellungen"],
  },
];

// ============================================
// NAVIGATION COMPONENTS
// ============================================

interface NavGroupProps {
  label: string;
  items: NavItem[];
  location: ReturnType<typeof useLocation>;
  defaultOpen?: boolean;
  searchQuery?: string;
  useSubmenus?: boolean;
}

function filterItems(items: NavItem[], query: string): NavItem[] {
  if (!query.trim()) return items.filter(item => !item.hidden);
  const lowerQuery = query.toLowerCase();
  return items.filter((item) => {
    if (item.hidden) return false;
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
  
  const shouldBeOpen = searchQuery ? filteredItems.length > 0 : isOpen;

  if (searchQuery && filteredItems.length === 0) {
    return null;
  }

  // Don't render empty groups
  if (filteredItems.length === 0) {
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
              {filteredItems.length !== items.filter(i => !i.hidden).length && searchQuery && (
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
                  <SidebarMenuItem key={item.url + item.title}>
                    {item.subItems && useSubmenus ? (
                      <Collapsible open={isSubmenuOpen(item)} onOpenChange={() => toggleSubmenu(item.url)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={cn(
                              "group/item relative w-full justify-between rounded-lg transition-all duration-200",
                              "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                              isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
                                      isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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

  // Combine all items for search result count
  const allItems = [
    ...dailyOperationsItems,
    ...projectsItems,
    ...inventoryItems,
    ...partnersItems,
    ...controllingItems,
    ...accountingItems,
    ...hrItems,
    ...additionalItems,
    ...adminItems,
  ];

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background">
      <SidebarHeader className="p-4 space-y-4">
        <NavLink to="/" className="flex items-center gap-3 px-1 hover:opacity-80 transition-opacity">
          <img src={loomoraLogo} alt="Loomora" className="h-10" />
        </NavLink>
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider px-1 -mt-2">
          ERP für Metallbau
        </p>
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
        {/* METALLBAU-OPTIMIERTE NAVIGATION */}
        <NavGroup 
          label="Tagesgeschäft" 
          items={dailyOperationsItems} 
          location={location} 
          searchQuery={sidebarSearch} 
        />
        <NavGroup 
          label="Aufträge & Projekte" 
          items={projectsItems} 
          location={location} 
          searchQuery={sidebarSearch}
          useSubmenus={true}
        />
        <NavGroup 
          label="Lager & Material" 
          items={inventoryItems} 
          location={location} 
          searchQuery={sidebarSearch} 
        />
        <NavGroup 
          label="Kunden & Lieferanten" 
          items={partnersItems} 
          location={location} 
          searchQuery={sidebarSearch} 
        />
        <NavGroup 
          label="Controlling" 
          items={controllingItems} 
          location={location} 
          searchQuery={sidebarSearch} 
        />
        <NavGroup 
          label="Buchhaltung" 
          items={accountingItems} 
          location={location} 
          defaultOpen={false} 
          searchQuery={sidebarSearch} 
          useSubmenus={true} 
        />
        <NavGroup 
          label="Personal" 
          items={hrItems} 
          location={location} 
          defaultOpen={false}
          searchQuery={sidebarSearch} 
        />
        <NavGroup 
          label="Sonstiges" 
          items={additionalItems} 
          location={location} 
          defaultOpen={false}
          searchQuery={sidebarSearch} 
        />
        <NavGroup 
          label="Administration" 
          items={adminItems} 
          location={location} 
          defaultOpen={false}
          searchQuery={sidebarSearch} 
        />
        
        {sidebarSearch && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground/60">
              {filterItems(allItems, sidebarSearch).length} Ergebnisse für "{sidebarSearch}"
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
