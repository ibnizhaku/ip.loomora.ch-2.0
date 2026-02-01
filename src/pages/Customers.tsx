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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const getCustomerStatus = (customer: any): "active" | "inactive" | "prospect" => {
    if (!customer.isActive) return "inactive";
    if (!customer.totalRevenue || customer.totalRevenue === 0) return "prospect";
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
              <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-2xl font-bold">{stats.active}</p>
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
              <p className="text-2xl font-bold">{stats.prospects}</p>
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
                CHF {(stats.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
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

      {/* Table */}
      {!isLoading && !error && (
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
