import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  ShoppingCart,
  Building2,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  MoreHorizontal,
  Euro
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const purchaseOrders = [
  { id: "EK-2024-0048", supplier: "TechParts International", date: "30.01.2024", items: 15, total: 8450, status: "Bestellt", expectedDelivery: "05.02.2024" },
  { id: "EK-2024-0047", supplier: "Office Supplies Pro", date: "28.01.2024", items: 8, total: 1280, status: "In Transit", expectedDelivery: "01.02.2024" },
  { id: "EK-2024-0046", supplier: "Hardware Express", date: "25.01.2024", items: 22, total: 12500, status: "Geliefert", expectedDelivery: "29.01.2024" },
  { id: "EK-2024-0045", supplier: "TechParts International", date: "22.01.2024", items: 10, total: 4580, status: "Geliefert", expectedDelivery: "26.01.2024" },
  { id: "EK-2024-0044", supplier: "Component World", date: "20.01.2024", items: 30, total: 6890, status: "Geliefert", expectedDelivery: "24.01.2024" },
  { id: "EK-2024-0043", supplier: "Server Solutions", date: "18.01.2024", items: 5, total: 15200, status: "Geliefert", expectedDelivery: "22.01.2024" },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: ShoppingCart },
  "Bestellt": { color: "bg-info/10 text-info", icon: Clock },
  "In Transit": { color: "bg-warning/10 text-warning", icon: Truck },
  "Geliefert": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Storniert": { color: "bg-destructive/10 text-destructive", icon: Package },
};

const stats = [
  { title: "Offene Bestellungen", value: "12", change: "+3 diese Woche" },
  { title: "Diesen Monat", value: "CHF 48'900", change: "+15% vs. Vormonat" },
  { title: "Ausstehende Lieferungen", value: "5", change: "2 überfällig" },
  { title: "Top Lieferant", value: "TechParts", change: "CHF 28'500 Volumen" },
];

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = purchaseOrders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Einkauf</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Einkaufsbestellungen</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Bestellung
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm font-medium">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Bestellungen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bestellnummer</TableHead>
                <TableHead>Lieferant</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Positionen</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Lieferung erwartet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig["Entwurf"];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link to={`/purchase-orders/${order.id}`} className="font-medium hover:text-primary">
                        {order.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {order.supplier}
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">{order.items}</TableCell>
                    <TableCell className="text-right font-medium">CHF {order.total.toLocaleString("de-CH")}</TableCell>
                    <TableCell>{order.expectedDelivery}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                          <DropdownMenuItem>Wareneingang buchen</DropdownMenuItem>
                          <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrders;
