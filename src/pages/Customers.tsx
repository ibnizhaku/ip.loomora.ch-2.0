import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Loader2,
  LayoutGrid,
  List,
  Euro,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCustomers, useCustomerStats, useDeleteCustomer } from "@/hooks/use-customers";
import { toast } from "sonner";

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  prospect: { label: "Interessent", color: "bg-info/10 text-info" },
};

export default function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  const { data, isLoading, error } = useCustomers({ search: searchQuery, pageSize: 100 });
  const stats = useCustomerStats();
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.data || [];

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      try {
        await deleteCustomer.mutateAsync(id);
        toast.success(`${name} wurde gelöscht`);
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const getCustomerStatus = (customer: any): "active" | "inactive" => {
    if (!customer.isActive) return "inactive";
    return "active";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Kunden
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kundenbeziehungen
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/customers/new")}>
          <Plus className="h-4 w-4" />
          Neuer Kunde
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "—" : stats.total}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Building2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "—" : stats.active}</p>
              <p className="text-sm text-muted-foreground">Aktive Kunden</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <User className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "—" : stats.prospects}</p>
              <p className="text-sm text-muted-foreground">Interessenten</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Building2 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.isLoading ? "—" : `CHF ${(stats.totalRevenue / 1000).toFixed(0)}k`}
              </p>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kunden suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "table" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "cards" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Fehler beim Laden der Kunden</p>
          <p className="text-sm text-muted-foreground mt-1">
            Stellen Sie sicher, dass der Backend-Server läuft (VITE_API_URL)
          </p>
        </div>
      )}

      {/* Card View */}
      {!isLoading && !error && viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground rounded-xl border border-dashed">
              {searchQuery ? "Keine Kunden gefunden" : "Noch keine Kunden vorhanden"}
            </div>
          ) : (
            customers.map((customer, index) => {
              const status = getCustomerStatus(customer);
              return (
                <div
                  key={customer.id}
                  className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  {/* Top: Avatar + Name + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                          {(customer.companyName || customer.name)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{customer.companyName || customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.number}</p>
                      </div>
                    </div>
                    <Badge className={statusConfig[status].color}>
                      {statusConfig[status].label}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {customer.name && customer.companyName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        {customer.name}
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {(customer.phone || customer.mobile) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {customer.phone || customer.mobile}
                      </div>
                    )}
                    {customer.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {customer.zipCode} {customer.city}
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Euro className="h-3.5 w-3.5 text-success" />
                      <span className="font-medium">CHF {(customer.totalRevenue || 0).toLocaleString("de-CH")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FolderKanban className="h-3.5 w-3.5" />
                      {customer.projectCount || 0} Projekte
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                          Details
                        </DropdownMenuItem>
                        {customer.email && (
                          <DropdownMenuItem onClick={() => window.location.href = `mailto:${customer.email}`}>
                            E-Mail senden
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer.id, customer.name);
                          }}
                        >
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && viewMode === "table" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Kunde</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Umsatz</TableHead>
                <TableHead className="text-right">Projekte</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "Keine Kunden gefunden" : "Noch keine Kunden vorhanden"}
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer, index) => {
                  const status = getCustomerStatus(customer);
                  return (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer animate-fade-in hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {(customer.companyName || customer.name)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.companyName || customer.number}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {customer.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[status].color}>
                          {statusConfig[status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        CHF {(customer.totalRevenue || 0).toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell className="text-right">{customer.projectCount || 0}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/customers/${customer.id}`)}>
                              Bearbeiten
                            </DropdownMenuItem>
                            {customer.email && (
                              <DropdownMenuItem onClick={() => window.location.href = `mailto:${customer.email}`}>
                                E-Mail senden
                              </DropdownMenuItem>
                            )}
                            {customer.phone && (
                              <DropdownMenuItem onClick={() => window.location.href = `tel:${customer.phone}`}>
                                Anrufen
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(customer.id, customer.name);
                              }}
                            >
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}