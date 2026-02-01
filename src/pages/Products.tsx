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
  Loader2,
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
import { useProducts, useProductStats, useProductCategories, useDeleteProduct } from "@/hooks/use-products";
import type { Product } from "@/types/api";

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priceListOpen, setPriceListOpen] = useState(false);

  const { data, isLoading, error } = useProducts({ 
    search: searchQuery, 
    pageSize: 100,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: categories } = useProductCategories();
  const stats = useProductStats();
  const deleteProduct = useDeleteProduct();

  const products = data?.data || [];

  const handleDelete = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const product = products.find(p => p.id === productId);
    if (confirm(`Möchten Sie "${product?.name}" wirklich löschen?`)) {
      try {
        await deleteProduct.mutateAsync(productId);
        toast.success(`${product?.name} wurde gelöscht`);
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const getProductType = (product: Product): "physical" | "service" | "digital" => {
    return product.isService ? "service" : "physical";
  };

  const getProductStatus = (product: Product): "active" | "inactive" | "discontinued" => {
    return product.isActive ? "active" : "inactive";
  };

  const getMargin = (product: Product): number => {
    if (product.purchasePrice === 0) return 100;
    return ((Number(product.salePrice) - Number(product.purchasePrice)) / Number(product.salePrice)) * 100;
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
              <p className="text-2xl font-bold">{stats.total}</p>
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
              <p className="text-2xl font-bold text-success">{stats.active}</p>
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
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Niedriger Bestand</p>
              <p className="text-2xl font-bold text-warning">{stats.lowStock}</p>
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
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Fehler beim Laden der Produkte</p>
          <p className="text-sm text-muted-foreground mt-1">
            Stellen Sie sicher, dass der Backend-Server läuft (VITE_API_URL)
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? "Keine Produkte gefunden" : "Noch keine Produkte vorhanden"}
          </p>
          <Button className="mt-4" onClick={() => navigate("/products/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Erstes Produkt anlegen
          </Button>
        </div>
      )}

      {/* Products List */}
      {!isLoading && !error && products.length > 0 && viewMode === "list" && (
        <div className="space-y-3">
          {products.map((product, index) => {
            const margin = getMargin(product);
            const productType = getProductType(product);
            const productStatus = getProductStatus(product);
            
            return (
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
                        <Badge className={statusStyles[productStatus]}>
                          {statusLabels[productStatus]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono">{product.sku}</span> • {product.category?.name || "Ohne Kategorie"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <Badge className={typeStyles[productType]}>
                      {typeLabels[productType]}
                    </Badge>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">VK-Preis</p>
                      <p className="font-mono font-bold">CHF {Number(product.salePrice).toLocaleString()}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Marge</p>
                      <p className={cn(
                        "font-mono font-medium",
                        margin >= 50 ? "text-success" : margin >= 30 ? "text-warning" : "text-destructive"
                      )}>
                        {margin.toFixed(1)}%
                      </p>
                    </div>
                    
                    {!product.isService && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Bestand</p>
                        <p className={cn(
                          "font-mono font-medium",
                          Number(product.stockQuantity) > 20 ? "text-success" : Number(product.stockQuantity) > 5 ? "text-warning" : "text-destructive"
                        )}>
                          {Number(product.stockQuantity)} {product.unit}
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
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, product.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const productType = getProductType(product);
            const productStatus = getProductStatus(product);
            
            return (
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
                  <Badge className={statusStyles[productStatus]}>
                    {statusLabels[productStatus]}
                  </Badge>
                </div>
                
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-mono">{product.sku}</span>
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge className={typeStyles[productType]}>
                    {typeLabels[productType]}
                  </Badge>
                  <span className="font-mono font-bold">CHF {Number(product.salePrice).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Price List Dialog */}
      <Dialog open={priceListOpen} onOpenChange={setPriceListOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preisliste</span>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPriceList}>
                <Download className="h-4 w-4" />
                PDF Export
              </Button>
            </DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikelnummer</TableHead>
                <TableHead>Bezeichnung</TableHead>
                <TableHead>Einheit</TableHead>
                <TableHead className="text-right">Preis (CHF)</TableHead>
                <TableHead className="text-right">MwSt.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.filter(p => p.isActive).map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell className="text-right font-mono">{Number(product.salePrice).toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.vatRate === 'STANDARD' ? '8.1%' : product.vatRate === 'REDUCED' ? '2.6%' : '0%'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
