import { useState } from "react";
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
  Euro,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface Order {
  id: string;
  number: string;
  client: string;
  quoteNumber?: string;
  amount: number;
  status: "new" | "confirmed" | "in-progress" | "shipped" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  orderDate: string;
  deliveryDate: string;
  items: number;
  progress: number;
}

const orders: Order[] = [
  {
    id: "1",
    number: "AUF-2024-001",
    client: "Fashion Store GmbH",
    quoteNumber: "ANG-2024-001",
    amount: 28500,
    status: "completed",
    priority: "high",
    orderDate: "16.01.2024",
    deliveryDate: "22.01.2024",
    items: 5,
    progress: 100,
  },
  {
    id: "2",
    number: "AUF-2024-002",
    client: "FinTech Solutions",
    amount: 45000,
    status: "in-progress",
    priority: "high",
    orderDate: "21.01.2024",
    deliveryDate: "15.02.2024",
    items: 8,
    progress: 65,
  },
  {
    id: "3",
    number: "AUF-2024-003",
    client: "Sales Pro AG",
    quoteNumber: "ANG-2023-089",
    amount: 12000,
    status: "shipped",
    priority: "medium",
    orderDate: "25.01.2024",
    deliveryDate: "01.02.2024",
    items: 3,
    progress: 90,
  },
  {
    id: "4",
    number: "AUF-2024-004",
    client: "Tech Innovations",
    amount: 35000,
    status: "confirmed",
    priority: "medium",
    orderDate: "28.01.2024",
    deliveryDate: "20.02.2024",
    items: 6,
    progress: 25,
  },
  {
    id: "5",
    number: "AUF-2024-005",
    client: "Logistics Plus",
    amount: 22000,
    status: "new",
    priority: "low",
    orderDate: "30.01.2024",
    deliveryDate: "28.02.2024",
    items: 4,
    progress: 0,
  },
  {
    id: "6",
    number: "AUF-2024-006",
    client: "Data Analytics Inc.",
    amount: 8500,
    status: "cancelled",
    priority: "low",
    orderDate: "10.01.2024",
    deliveryDate: "25.01.2024",
    items: 2,
    progress: 0,
  },
];

const statusConfig = {
  new: { label: "Neu", color: "bg-info/10 text-info", icon: ShoppingCart },
  confirmed: { label: "Bestätigt", color: "bg-primary/10 text-primary", icon: CheckCircle },
  "in-progress": { label: "In Bearbeitung", color: "bg-warning/10 text-warning", icon: Clock },
  shipped: { label: "Versendet", color: "bg-success/10 text-success", icon: Truck },
  completed: { label: "Abgeschlossen", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "Storniert", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const priorityConfig = {
  high: { label: "Hoch", color: "bg-destructive/10 text-destructive" },
  medium: { label: "Mittel", color: "bg-warning/10 text-warning" },
  low: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter(
    (o) =>
      o.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = orders.filter((o) => o.status !== "cancelled").reduce((acc, o) => acc + o.amount, 0);
  const activeOrders = orders.filter((o) => ["new", "confirmed", "in-progress"].includes(o.status)).length;

  return (
    <div className="space-y-6">
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Auftrag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
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
              <p className="text-2xl font-bold">{activeOrders}</p>
              <p className="text-sm text-muted-foreground">Aktive Aufträge</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Euro className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">€{totalValue.toLocaleString()}</p>
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
                {orders.filter((o) => o.status === "shipped").length}
              </p>
              <p className="text-sm text-muted-foreground">Versendet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Auftrag</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fortschritt</TableHead>
              <TableHead>Priorität</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order, index) => {
              const StatusIcon = statusConfig[order.status].icon;
              return (
                <TableRow
                  key={order.id}
                  className="cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                  <TableCell>{order.client}</TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusConfig[order.status].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[order.status].label}
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
                    <Badge className={priorityConfig[order.priority].color}>
                      {priorityConfig[order.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    €{order.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Lieferschein erstellen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ArrowRight className="h-4 w-4" />
                          Rechnung erstellen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
