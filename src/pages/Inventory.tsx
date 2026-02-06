import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Package,
  AlertTriangle,
  TrendingDown,
  Box,
  Warehouse,
  Edit,
  RefreshCw,
  ShoppingCart,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [productList, setProductList] = useState<Product[]>(products);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState(0);

  const filteredProducts = productList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = productList.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = productList.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = productList.filter((p) => p.status === "out-of-stock").length;

  const handleDelete = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const product = productList.find(p => p.id === productId);
    setProductList(productList.filter(p => p.id !== productId));
    toast.success(`${product?.name} wurde gelöscht`);
  };

  const handleOpenStockDialog = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setStockAdjustment(product.stock);
    setStockDialogOpen(true);
  };

  const handleStockAdjustment = () => {
    if (!selectedProduct) return;
    
    setProductList(productList.map(p => {
      if (p.id === selectedProduct.id) {
        const newStock = stockAdjustment;
        let newStatus: Product["status"] = "in-stock";
        if (newStock === 0) newStatus = "out-of-stock";
        else if (newStock < p.minStock) newStatus = "low-stock";
        
        return { ...p, stock: newStock, status: newStatus, lastUpdate: "gerade eben" };
      }
      return p;
    }));
    
    toast.success(`Bestand von ${selectedProduct.name} auf ${stockAdjustment} angepasst`);
    setStockDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleReorder = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    toast.success(`Nachbestellung für ${product.name} wurde ausgelöst`);
    navigate("/purchase-orders/new");
  };

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
        <Button className="gap-2" onClick={() => navigate("/products/new")}>
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
              <p className="text-2xl font-bold">{productList.length}</p>
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
              <p className="text-2xl font-bold">CHF {totalValue.toLocaleString("de-CH")}</p>
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
                className="animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/inventory/${product.id}`)}
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
                  CHF {product.price.toLocaleString("de-CH")}
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
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/inventory/${product.id}`); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleOpenStockDialog(e, product)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Bestand anpassen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleReorder(e, product)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Nachbestellen
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => handleDelete(e, product.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestand anpassen</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <Box className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.sku}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Neuer Bestand</Label>
                <Input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-sm text-muted-foreground">
                  Aktueller Bestand: {selectedProduct.stock} | Mindestbestand: {selectedProduct.minStock}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStockAdjustment}>
              Bestand speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
