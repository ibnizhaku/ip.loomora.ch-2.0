import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Banknote,
  Eye,
  Pencil,
  FileText,
  LayoutGrid,
  List,
  Building2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderRaw {
  id: string;
  number: string;
  customer?: { id: string; name: string; companyName?: string };
  project?: { id: string; name: string; number?: string };
  quote?: { id: string; number: string };
  total?: number;
  subtotal?: number;
  status: string;
  orderDate?: string;
  date?: string;
  deliveryDate?: string;
  _count?: { items: number; invoices: number; deliveryNotes: number };
  createdAt?: string;
}

interface Order {
  id: string;
  number: string;
  client: string;
  clientId?: string;
  project?: string;
  projectId?: string;
  quoteNumber?: string;
  amount: number;
  status: string;
  priority: string;
  orderDate: string;
  deliveryDate: string;
  items: number;
  progress: number;
}

function getOrderProgress(status: string): number {
  switch (status?.toUpperCase()) {
    case "DRAFT": return 10;
    case "SENT": return 50;
    case "CONFIRMED": return 100;
    case "CANCELLED": return 0;
    default: return 10;
  }
}

function mapOrder(raw: OrderRaw): Order {
  const s = (raw.status || "DRAFT").toUpperCase();
  let status = "new";
  if (s === "CONFIRMED") status = "completed";
  else if (s === "SENT") status = "in-progress";
  else if (s === "CANCELLED") status = "cancelled";
  else if (s === "DRAFT") status = "new";

  return {
    id: raw.id,
    number: raw.number || "",
    client: raw.customer?.companyName || raw.customer?.name || "–",
    clientId: raw.customer?.id,
    project: raw.project?.name,
    projectId: raw.project?.id,
    quoteNumber: raw.quote?.number,
    amount: Number(raw.total || raw.subtotal || 0),
    status,
    priority: "medium",
    orderDate: raw.orderDate || raw.date
      ? new Date(raw.orderDate || raw.date || "").toLocaleDateString("de-CH")
      : "–",
    deliveryDate: raw.deliveryDate
      ? new Date(raw.deliveryDate).toLocaleDateString("de-CH")
      : "–",
    items: raw._count?.items ?? 0,
    progress: getOrderProgress(s),
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Neu", color: "bg-info/10 text-info", icon: ShoppingCart },
  "in-progress": { label: "In Arbeit", color: "bg-warning/10 text-warning", icon: Clock },
  completed: { label: "Abgeschlossen", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "Storniert", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const defaultStatusCfg = { label: "Unbekannt", color: "bg-muted text-muted-foreground", icon: ShoppingCart };

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "Hoch", color: "bg-destructive/10 text-destructive" },
  medium: { label: "Mittel", color: "bg-warning/10 text-warning" },
  low: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
};

export default function Orders() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const customerIdFilter = searchParams.get("customerId") || undefined;
  const { canWrite, canDelete } = usePermissions();
  const { data: apiData, isLoading } = useQuery({ queryKey: ["/orders"], queryFn: () => api.get<any>("/orders") });
  const allOrders: Order[] = (apiData?.data || []).map(mapOrder);
  const orders = customerIdFilter
    ? allOrders.filter((o) => o.clientId === customerIdFilter)
    : allOrders;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/orders"] });
      toast.success("Auftrag erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const resetFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
  };

  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(o.status);
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(o.priority);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalValue = orders.filter((o) => o.status !== "cancelled").reduce((acc, o) => acc + o.amount, 0);
  const activeOrders = orders.filter((o) => ["new", "confirmed", "in-progress"].includes(o.status)).length;

  const handleCreateDeliveryNote = (order: Order) => {
    toast.success(`Lieferschein für ${order.number} wird erstellt...`);
    navigate(`/delivery-notes/new?orderId=${order.id}&customerId=${order.clientId || ''}`);
  };

  const handleCreateInvoice = (order: Order) => {
    toast.success(`Rechnung für ${order.number} wird erstellt...`);
    navigate(`/invoices/new?orderId=${order.id}&customerId=${order.clientId || ''}`);
  };

  return (
    <div className="space-y-6">
      {customerIdFilter && (
        <div className="flex items-center justify-between rounded-lg border border-info/30 bg-info/5 px-4 py-2 text-sm">
          <span>
            Aufträge für diesen Kunden. Wählen Sie einen Auftrag und klicken Sie auf „Lieferschein erstellen“.
          </span>
          <Link to="/orders" className="text-primary hover:underline font-medium">
            Filter zurücksetzen
          </Link>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Aufträge
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kundenaufträge
          </p>
        </div>
        {canWrite('orders') && (
          <Button className="gap-2" onClick={() => navigate("/orders/new")}>
            <Plus className="h-4 w-4" />
            Neuer Auftrag
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : orders.length}</p>
              <p className="text-sm text-muted-foreground">Aufträge gesamt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : activeOrders}</p>
              <p className="text-sm text-muted-foreground">Aktive Aufträge</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Banknote className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${totalValue.toLocaleString("de-CH")}`}
              </p>
              <p className="text-sm text-muted-foreground">Auftragswert</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Truck className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : orders.filter((o) => o.status === "confirmed").length}
              </p>
              <p className="text-sm text-muted-foreground">Versendet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Aufträge suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={cn("relative", hasActiveFilters && "border-primary text-primary")}>
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-popover" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Zurücksetzen
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="space-y-2">
                    {Object.entries(statusConfig).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${key}`}
                          checked={statusFilters.includes(key)}
                          onCheckedChange={() => toggleStatusFilter(key)}
                        />
                        <label htmlFor={`status-${key}`} className="text-sm cursor-pointer">
                          {value.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priorität</Label>
                  <div className="space-y-2">
                    {Object.entries(priorityConfig).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${key}`}
                          checked={priorityFilters.includes(key)}
                          onCheckedChange={() => togglePriorityFilter(key)}
                        />
                        <label htmlFor={`priority-${key}`} className="text-sm cursor-pointer">
                          {value.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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

      {/* Card View */}
      {viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground rounded-xl border border-dashed">
              Keine Aufträge gefunden
            </div>
          ) : (
            filteredOrders.map((order, index) => {
              const sCfg = statusConfig[order.status] || defaultStatusCfg;
              const StatusIcon = sCfg.icon;
              return (
                <div
                  key={order.id}
                  className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onSelect={() => navigate(`/orders/${order.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate(`/orders/${order.id}/edit`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleCreateDeliveryNote(order)}>
                          <Truck className="h-4 w-4 mr-2" />
                          Lieferschein erstellen
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleCreateInvoice(order)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Rechnung erstellen
                        </DropdownMenuItem>
                        {canDelete('orders') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => {
                                if (confirm("Auftrag wirklich löschen?")) {
                                  deleteMutation.mutate(order.id);
                                }
                              }}
                            >
                              Löschen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{order.number}</p>
                      <p className="text-sm text-muted-foreground">{order.items} Artikel</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {order.clientId ? (
                        <Link to={`/customers/${order.clientId}`} className="hover:text-primary hover:underline">{order.client}</Link>
                      ) : (
                        <span>{order.client}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Bestellt: {order.orderDate}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fortschritt</span>
                        <span>{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="h-1.5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("gap-1", sCfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {sCfg.label}
                      </Badge>
                      <Badge className={(priorityConfig[order.priority] || priorityConfig.medium).color}>
                        {(priorityConfig[order.priority] || priorityConfig.medium).label}
                      </Badge>
                    </div>
                    <span className="font-semibold">CHF {order.amount.toLocaleString("de-CH")}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Auftrag</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fortschritt</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => {
                const sCfg = statusConfig[order.status] || defaultStatusCfg;
                const StatusIcon = sCfg.icon;
                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer animate-fade-in hover:bg-muted/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-medium">{order.number}</span>
                          <p className="text-xs text-muted-foreground">
                            {order.items} Artikel • {order.orderDate}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {order.clientId ? (
                        <Link to={`/customers/${order.clientId}`} className="font-medium hover:text-primary hover:underline">{order.client}</Link>
                      ) : (
                        <span>{order.client}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                      {order.projectId ? (
                        <Link to={`/projects/${order.projectId}`} className="hover:text-primary hover:underline">{order.project || '–'}</Link>
                      ) : (
                        <span>{order.project || '–'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", sCfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {sCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-24 space-y-1">
                        <Progress value={order.progress} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">
                          {order.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={(priorityConfig[order.priority] || priorityConfig.medium).color}>
                        {(priorityConfig[order.priority] || priorityConfig.medium).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {order.amount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onSelect={() => navigate(`/orders/${order.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navigate(`/orders/${order.id}/edit`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => handleCreateDeliveryNote(order)}>
                            <Truck className="h-4 w-4 mr-2" />
                            Lieferschein erstellen
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleCreateInvoice(order)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Rechnung erstellen
                          </DropdownMenuItem>
                          {canDelete('orders') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => {
                                  if (confirm("Auftrag wirklich löschen?")) {
                                    deleteMutation.mutate(order.id);
                                  }
                                }}
                              >
                                Löschen
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
