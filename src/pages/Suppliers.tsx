import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Banknote,
  Loader2,
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
import { useSuppliers, useSupplierStats, useDeleteSupplier } from "@/hooks/use-suppliers";
import { toast } from "sonner";

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  new: { label: "Neu", color: "bg-info/10 text-info" },
};

export default function Suppliers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading, error } = useSuppliers({ search: searchQuery, pageSize: 100 });
  const stats = useSupplierStats();
  const deleteSupplier = useDeleteSupplier();

  const suppliers = data?.data || [];

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      try {
        await deleteSupplier.mutateAsync(id);
        toast.success(`${name} wurde gelöscht`);
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const getSupplierStatus = (supplier: any): "active" | "inactive" | "new" => {
    if (!supplier.isActive) return "inactive";
    const created = new Date(supplier.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (created > thirtyDaysAgo) return "new";
    return "active";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Lieferanten
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lieferantenbeziehungen
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/suppliers/new")}>
          <Plus className="h-4 w-4" />
          Neuer Lieferant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Lieferanten</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Building2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Banknote className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                CHF {(stats.totalValue / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-muted-foreground">Bestellwert</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Star className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Ø Bewertung</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Lieferanten suchen..."
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
          <p className="text-destructive">Fehler beim Laden der Lieferanten</p>
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
                <TableHead>Lieferant</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Bewertung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bestellwert</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "Keine Lieferanten gefunden" : "Noch keine Lieferanten vorhanden"}
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier, index) => {
                  const status = getSupplierStatus(supplier);
                  return (
                    <TableRow
                      key={supplier.id}
                      className="cursor-pointer animate-fade-in hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/suppliers/${supplier.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {(supplier.companyName || supplier.name)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{supplier.companyName || supplier.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.companyName ? supplier.name : supplier.number}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {supplier.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < (supplier.rating || 0)
                                  ? "text-warning fill-warning"
                                  : "text-muted"
                              )}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[status].color}>
                          {statusConfig[status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">
                            CHF {(supplier.totalValue || 0).toLocaleString("de-CH")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {supplier.totalOrders || 0} Bestellungen
                          </p>
                        </div>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                              Anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/purchase-orders/new")}>
                              Bestellung aufgeben
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(supplier.id, supplier.name);
                              }}
                            >
                              Deaktivieren
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
