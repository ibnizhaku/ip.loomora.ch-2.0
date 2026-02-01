import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Package,
  Tag,
  BarChart3,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Grid3X3,
  List,
  TrendingUp,
  Box,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  type: "physical" | "service" | "digital";
  price: number;
  costPrice: number;
  margin: number;
  stock: number;
  unit: string;
  status: "active" | "inactive" | "discontinued";
  taxRate: number;
}

const products: Product[] = [
  {
    id: "1",
    sku: "ART-001",
    name: "Edelstahl Blech 2mm",
    category: "Rohmaterial",
    type: "physical",
    price: 89.50,
    costPrice: 52,
    margin: 41.9,
    stock: 145,
    unit: "m²",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "2",
    sku: "ART-002",
    name: "Alu-Profil 40x40mm",
    category: "Profile",
    type: "physical",
    price: 24.80,
    costPrice: 14.50,
    margin: 41.5,
    stock: 320,
    unit: "lfm",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "3",
    sku: "ART-003",
    name: "Montagestunde Metallbau",
    category: "Dienstleistung",
    type: "service",
    price: 125,
    costPrice: 65,
    margin: 48,
    stock: -1,
    unit: "Stunde",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "4",
    sku: "ART-004",
    name: "Schweissnaht V-Naht",
    category: "Dienstleistung",
    type: "service",
    price: 8.50,
    costPrice: 3.20,
    margin: 62.4,
    stock: -1,
    unit: "cm",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "5",
    sku: "ART-005",
    name: "Pulverbeschichtung RAL",
    category: "Oberflächenbehandlung",
    type: "service",
    price: 45,
    costPrice: 22,
    margin: 51.1,
    stock: -1,
    unit: "m²",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "6",
    sku: "ART-006",
    name: "Türschliesser DORMA",
    category: "Beschläge",
    type: "physical",
    price: 189,
    costPrice: 98,
    margin: 48.1,
    stock: 28,
    unit: "Stück",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "7",
    sku: "ART-007",
    name: "Sicherheitsglas VSG 8mm",
    category: "Glas",
    type: "physical",
    price: 156,
    costPrice: 89,
    margin: 42.9,
    stock: 45,
    unit: "m²",
    status: "active",
    taxRate: 8.1,
  },
  {
    id: "8",
    sku: "ART-008",
    name: "Schrauben-Set M8 verzinkt",
    category: "Kleinmaterial",
    type: "physical",
    price: 12.50,
    costPrice: 4.80,
    margin: 61.6,
    stock: 580,
    unit: "Set",
    status: "active",
    taxRate: 8.1,
  },
];

const typeStyles = {
  physical: "bg-blue-500/10 text-blue-600",
  service: "bg-purple-500/10 text-purple-600",
  digital: "bg-success/10 text-success",
};

const typeLabels = {
  physical: "Physisch",
  service: "Dienstleistung",
  digital: "Digital",
};

const statusStyles = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  discontinued: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  active: "Aktiv",
  inactive: "Inaktiv",
  discontinued: "Eingestellt",
};

export default function Products() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productList, setProductList] = useState<Product[]>(products);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceListOpen, setPriceListOpen] = useState(false);

  const categories = [...new Set(productList.map((p) => p.category))];
  const activeProducts = productList.filter((p) => p.status === "active");

  const filteredProducts = productList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const product = productList.find(p => p.id === productId);
    setProductList(productList.filter(p => p.id !== productId));
    toast.success(`${product?.name} wurde gelöscht`);
  };

  const handleDuplicate = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const newProduct = {
      ...product,
      id: String(Date.now()),
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Kopie)`,
    };
    setProductList([...productList, newProduct]);
    toast.success(`${product.name} wurde dupliziert`);
  };

  const handleExportPriceList = () => {
    toast.success("Preisliste wird als PDF exportiert...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Produkte & Artikel
          </h1>
          <p className="text-muted-foreground">
            Artikelstamm und Preislisten verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setPriceListOpen(true)}>
            <BarChart3 className="h-4 w-4" />
            Preisliste
          </Button>
          <Button className="gap-2" onClick={() => navigate("/products/new")}>
            <Plus className="h-4 w-4" />
            Produkt anlegen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => setStatusFilter("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Produkte gesamt</p>
              <p className="text-2xl font-bold">{productList.length}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "active" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("active")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Box className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Artikel</p>
              <p className="text-2xl font-bold text-success">{activeProducts.length}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-muted-foreground/50",
            statusFilter === "inactive" ? "border-muted-foreground ring-2 ring-muted-foreground/20" : "border-border"
          )}
          onClick={() => setStatusFilter("inactive")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Tag className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inaktive Artikel</p>
              <p className="text-2xl font-bold">{productList.filter(p => p.status === "inactive").length}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-destructive/50",
            statusFilter === "discontinued" ? "border-destructive ring-2 ring-destructive/20" : "border-border"
          )}
          onClick={() => setStatusFilter("discontinued")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eingestellt</p>
              <p className="text-2xl font-bold">{productList.filter(p => p.status === "discontinued").length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Produkte suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-lg">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge className={statusStyles[product.status]}>
                        {statusLabels[product.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono">{product.sku}</span> • {product.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <Badge className={typeStyles[product.type]}>
                    {typeLabels[product.type]}
                  </Badge>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">VK-Preis</p>
                    <p className="font-mono font-bold">CHF {product.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Marge</p>
                    <p className={cn(
                      "font-mono font-medium",
                      product.margin >= 50 ? "text-success" : product.margin >= 30 ? "text-warning" : "text-destructive"
                    )}>
                      {product.margin.toFixed(1)}%
                    </p>
                  </div>
                  
                  {product.stock >= 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Bestand</p>
                      <p className={cn(
                        "font-mono font-medium",
                        product.stock > 20 ? "text-success" : product.stock > 5 ? "text-warning" : "text-destructive"
                      )}>
                        {product.stock} {product.unit}
                      </p>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDuplicate(e, product)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplizieren
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, product.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <Badge className={statusStyles[product.status]}>
                  {statusLabels[product.status]}
                </Badge>
              </div>
              
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-mono">{product.sku}</span>
              </p>
              
              <div className="flex items-center justify-between">
                <Badge className={typeStyles[product.type]}>
                  {typeLabels[product.type]}
                </Badge>
                <p className="font-mono font-bold text-lg">CHF {product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Price List Dialog */}
      <Dialog open={priceListOpen} onOpenChange={setPriceListOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preisliste
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={handleExportPriceList}>
                <Download className="h-4 w-4" />
                Als PDF exportieren
              </Button>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Art.-Nr.</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead className="text-right">EK-Preis</TableHead>
                    <TableHead className="text-right">VK-Preis</TableHead>
                    <TableHead className="text-right">MwSt.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productList.filter(p => p.status === "active").map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right font-mono">CHF {product.costPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">CHF {product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.taxRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
