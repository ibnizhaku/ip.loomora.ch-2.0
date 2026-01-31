import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Box,
  Warehouse,
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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdate: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "MacBook Pro 14\"",
    sku: "MBP-14-2024",
    category: "Elektronik",
    stock: 25,
    minStock: 10,
    price: 2499,
    status: "in-stock",
    lastUpdate: "vor 2 Std.",
  },
  {
    id: "2",
    name: "Dell Monitor 27\"",
    sku: "DM-27-4K",
    category: "Monitore",
    stock: 8,
    minStock: 15,
    price: 549,
    status: "low-stock",
    lastUpdate: "vor 1 Tag",
  },
  {
    id: "3",
    name: "Logitech MX Master 3",
    sku: "LMX-M3",
    category: "Zubehör",
    stock: 45,
    minStock: 20,
    price: 99,
    status: "in-stock",
    lastUpdate: "vor 3 Std.",
  },
  {
    id: "4",
    name: "USB-C Hub 7-in-1",
    sku: "USB-HUB-7",
    category: "Zubehör",
    stock: 0,
    minStock: 25,
    price: 79,
    status: "out-of-stock",
    lastUpdate: "vor 5 Tagen",
  },
  {
    id: "5",
    name: "iPhone 15 Pro",
    sku: "IP15-PRO",
    category: "Elektronik",
    stock: 12,
    minStock: 10,
    price: 1199,
    status: "in-stock",
    lastUpdate: "vor 6 Std.",
  },
  {
    id: "6",
    name: "Samsung SSD 2TB",
    sku: "SAM-SSD-2T",
    category: "Speicher",
    stock: 5,
    minStock: 15,
    price: 189,
    status: "low-stock",
    lastUpdate: "vor 2 Tagen",
  },
];

const statusConfig = {
  "in-stock": { label: "Auf Lager", color: "bg-success/10 text-success" },
  "low-stock": { label: "Niedriger Bestand", color: "bg-warning/10 text-warning" },
  "out-of-stock": { label: "Ausverkauft", color: "bg-destructive/10 text-destructive" },
};

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = products.filter((p) => p.status === "out-of-stock").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Lagerverwaltung
          </h1>
          <p className="text-muted-foreground">
            Überwachen und verwalten Sie Ihren Bestand
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Produkt hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Produkte</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Warehouse className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lagerwert</p>
              <p className="text-2xl font-bold">€{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Niedriger Bestand</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausverkauft</p>
              <p className="text-2xl font-bold">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Produkte suchen..."
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
              <TableHead>Produkt</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Bestand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Preis</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product, index) => (
              <TableRow
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Box className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {product.sku}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{product.stock}</span>
                      <span className="text-muted-foreground">
                        / {product.minStock} min
                      </span>
                    </div>
                    <Progress
                      value={Math.min((product.stock / product.minStock) * 100, 100)}
                      className={cn(
                        "h-1.5",
                        product.status === "out-of-stock" && "[&>div]:bg-destructive",
                        product.status === "low-stock" && "[&>div]:bg-warning"
                      )}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[product.status].color}>
                    {statusConfig[product.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  €{product.price.toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>Bestand anpassen</DropdownMenuItem>
                      <DropdownMenuItem>Nachbestellen</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
