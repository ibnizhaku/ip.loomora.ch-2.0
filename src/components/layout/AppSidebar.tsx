import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Package,
  Clock,
  CreditCard,
  Building2,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Projekte",
    url: "/projects",
    icon: FolderKanban,
    subItems: [
      { title: "Alle Projekte", url: "/projects" },
      { title: "Kanban Board", url: "/projects/kanban" },
      { title: "Timeline", url: "/projects/timeline" },
    ],
  },
  {
    title: "Kunden",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Zeiterfassung",
    url: "/time-tracking",
    icon: Clock,
  },
  {
    title: "Rechnungen",
    url: "/invoices",
    icon: FileText,
  },
];

const managementItems = [
  {
    title: "Lager",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Finanzen",
    url: "/finance",
    icon: CreditCard,
  },
  {
    title: "Berichte",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Unternehmen",
    url: "/company",
    icon: Building2,
  },
];

const NavItem = ({
  item,
  isActive,
}: {
  item: (typeof mainNavItems)[0];
  isActive: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(isActive);
  const hasSubItems = item.subItems && item.subItems.length > 0;

  if (hasSubItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={cn(
                "group/btn transition-all duration-200",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.url}>
                  <SidebarMenuSubButton asChild>
                    <NavLink
                      to={subItem.url}
                      className={({ isActive }) =>
                        cn(
                          "transition-colors",
                          isActive && "text-primary font-medium"
                        )
                      }
                    >
                      {subItem.title}
                    </NavLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          "transition-all duration-200",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
        )}
      >
        <NavLink to={item.url}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function AppSidebar() {
  const location = useLocation();

  const isItemActive = (item: (typeof mainNavItems)[0]) => {
    if (location.pathname === item.url) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.url);
    }
    return false;
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-lg">Loomora</span>
            <span className="text-xs text-muted-foreground">ERP System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
            Hauptmenü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.url}
                  item={item}
                  isActive={isItemActive(item)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
            Verwaltung
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="transition-all duration-200">
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
