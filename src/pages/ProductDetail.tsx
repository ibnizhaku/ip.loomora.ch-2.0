import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShoppingCart,
  Warehouse,
  Tag,
  History,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEntityHistory } from "@/hooks/use-audit-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const typeStyles: Record<string, string> = {
  physical: "bg-blue-500/10 text-blue-600",
  service: "bg-purple-500/10 text-purple-600",
  digital: "bg-success/10 text-success",
};

const typeLabels: Record<string, string> = {
  physical: "Physisch",
  service: "Dienstleistung",
  digital: "Digital",
};

function mapVatRate(vatRate?: string): number {
  if (!vatRate) return 0;
  const upper = vatRate.toUpperCase();
  if (upper === "STANDARD") return 8.1;
  if (upper === "REDUCED") return 2.6;
  if (upper === "ZERO" || upper === "EXEMPT") return 0;
  return 0;
}

function mapProductDetail(raw: any) {
  if (!raw) return null;

  const salePrice = Number(raw.salePrice || raw.price || 0);
  const purchasePrice = Number(raw.purchasePrice || raw.costPrice || 0);
  const margin = salePrice > 0
    ? ((salePrice - purchasePrice) / salePrice) * 100
    : 0;
  const stock = Number(raw.stockQuantity ?? raw.stock ?? 0);
  const minStock = Number(raw.minStockQuantity ?? raw.minStock ?? 0);
  const maxStock = Number(raw.maxStockQuantity ?? raw.maxStock ?? 100);
  const reservedStock = Number(raw.reservedQuantity ?? raw.reservedStock ?? 0);

  const productType = raw.isService ? "service" : "physical";
  const category = typeof raw.category === "object" ? raw.category?.name : raw.category || "";

  const formatDate = (d?: string) => {
    if (!d) return "-";
    try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
  };

  return {
    ...raw,
    price: salePrice,
    costPrice: purchasePrice,
    margin: Math.round(margin * 10) / 10,
    stock,
    minStock,
    maxStock,
    reservedStock,
    type: productType,
    status: raw.isActive !== false ? "active" : "inactive",
    category,
    taxRate: mapVatRate(raw.vatRate),
    ean: raw.ean || raw.gtin || "-",
    weight: raw.weight || 0,
    dimensions: raw.dimensions || "-",
    supplier: raw.supplier?.companyName || raw.supplier?.name || raw.supplierName || "-",
    supplierSku: raw.supplierSku || raw.supplierArticleNumber || "-",
    leadTime: raw.leadTime || raw.deliveryTime || 0,
    createdAt: formatDate(raw.createdAt),
    updatedAt: formatDate(raw.updatedAt),
    priceHistory: raw.priceHistory || [],
    stockMovements: raw.stockMovements || [],
    relatedDocuments: raw.relatedDocuments || [],
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: apiData } = useQuery({
    queryKey: ["/products", id],
    queryFn: () => api.get<any>(`/products/${id}`),
    enabled: !!id,
  });

  const { data: auditHistory } = useEntityHistory("PRODUCT", id || "");
  const product = mapProductDetail(apiData?.data || null);
  const priceHistory = product?.priceHistory || [];
  const stockMovements = product?.stockMovements || [];
  const relatedDocuments = product?.relatedDocuments || [];

  const stockPercentage = product?.stock && product?.maxStock ? (product.stock / product.maxStock) * 100 : 0;
  const availableStock = (product?.stock || 0) - (product?.reservedStock || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {product?.name || ""}
            </h1>
            {product?.status === "active" && (
              <Badge className="bg-success/10 text-success">Aktiv</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            <span className="font-mono">{product?.sku || id}</span> • {product?.category || ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/products/${id}/edit`)}>
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistiken
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Deaktivieren
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">VK-Preis</p>
              <p className="text-2xl font-bold font-mono">CHF {(product?.price || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Marge</p>
              <p className="text-2xl font-bold text-success font-mono">{product?.margin || 0}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Warehouse className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lagerbestand</p>
              <p className="text-2xl font-bold font-mono">{product?.stock || 0} {product?.unit || ""}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <ShoppingCart className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reserviert</p>
              <p className="text-2xl font-bold font-mono">{product?.reservedStock || 0} {product?.unit || ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="stock">Lager</TabsTrigger>
              <TabsTrigger value="prices">Preise</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Produktinformationen</h3>
                <p className="text-muted-foreground mb-6">{product?.description || ""}</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Artikelnummer</span>
                      <span className="font-mono font-medium">{product?.sku || id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">EAN/GTIN</span>
                      <span className="font-mono font-medium">{product?.ean || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Kategorie</span>
                      <span className="font-medium">{product?.category || ""}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Produkttyp</span>
                      {product?.type && (
                        <Badge className={typeStyles[product.type] || "bg-muted text-muted-foreground"}>{typeLabels[product.type] || product.type}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Einheit</span>
                      <span className="font-medium">{product?.unit || ""}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Gewicht</span>
                      <span className="font-mono">{product?.weight || 0} kg/{product?.unit || ""}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Abmessungen</span>
                      <span className="font-mono">{product?.dimensions || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">MwSt.-Satz</span>
                      <span className="font-mono">{product?.taxRate || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Lieferanteninformationen</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lieferant</span>
                    <span className="font-medium">{product?.supplier || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lieferanten-SKU</span>
                    <span className="font-mono">{product?.supplierSku || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Einkaufspreis</span>
                    <span className="font-mono">CHF {(product?.costPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lieferzeit</span>
                    <span className="font-mono">{product?.leadTime || 0} Tage</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stock" className="space-y-6 mt-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Lagerübersicht</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Wareneingang
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Lagerbestand</span>
                    <span className="font-mono font-bold">{product?.stock || 0} {product?.unit || ""}</span>
                  </div>
                  <Progress value={stockPercentage} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {product?.minStock || 0}</span>
                    <span>Max: {product?.maxStock || 0}</span>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Verfügbar</p>
                      <p className="text-xl font-bold text-success font-mono">{availableStock}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Reserviert</p>
                      <p className="text-xl font-bold text-warning font-mono">{product?.reservedStock || 0}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Lagerwert</p>
                      <p className="text-xl font-bold font-mono">CHF {((product?.stock || 0) * (product?.costPrice || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Lagerbewegungen</h3>
                <div className="space-y-2">
                  {stockMovements.map((movement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          movement.quantity > 0 ? "bg-success/10" : "bg-warning/10"
                        )}>
                          {movement.quantity > 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{movement.type}</p>
                          <p className="text-sm text-muted-foreground font-mono">{movement.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-mono font-medium",
                          movement.quantity > 0 ? "text-success" : "text-warning"
                        )}>
                          {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">{movement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prices" className="space-y-6 mt-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Preisstruktur</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Einkaufspreis</p>
                    <p className="text-2xl font-bold font-mono">CHF {(product?.costPrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Verkaufspreis</p>
                    <p className="text-2xl font-bold font-mono text-primary">CHF {(product?.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Marge</p>
                    <p className="text-2xl font-bold font-mono text-success">{product?.margin || 0}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Preisentwicklung</h3>
                <div className="space-y-2">
                  {priceHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{entry.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-medium">CHF {entry.price.toFixed(2)}</span>
                        {entry.change !== 0 && (
                          <Badge className={entry.change > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                            {entry.change > 0 ? "+" : ""}{entry.change}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Verknüpfte Dokumente</h3>
                <div className="space-y-2">
                  {relatedDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-muted-foreground font-mono">{doc.number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">
                          {doc.amount ? `CHF ${doc.amount.toLocaleString()}` : `${doc.quantity} ${product?.unit || ""}`}
                        </p>
                        <p className="text-sm text-muted-foreground">{doc.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="text-center">
              {product?.type && (
                <Badge className={typeStyles[product.type] || "bg-muted text-muted-foreground"}>{typeLabels[product.type] || product.type}</Badge>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Schnellaktionen</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Wareneingang buchen
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <ShoppingCart className="h-4 w-4" />
                Bestellung erstellen
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Tag className="h-4 w-4" />
                Preis anpassen
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyse anzeigen
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Metadaten</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Erstellt</span>
                <span className="font-mono">{product?.createdAt || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktualisiert</span>
                <span className="font-mono">{product?.updatedAt || "-"}</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Verlauf
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!auditHistory || auditHistory.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">Noch keine Einträge</p>
              ) : (
                <div className="space-y-4">
                  {auditHistory.map((log: any, index: number) => (
                    <div key={log.id || index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {log.action === "CREATE" ? "Erstellt" : log.action === "UPDATE" ? "Bearbeitet" : log.action === "DELETE" ? "Gelöscht" : log.action === "SEND" ? "Versendet" : log.action === "APPROVE" ? "Genehmigt" : log.action === "REJECT" ? "Abgelehnt" : log.description || log.action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(log.createdAt || log.timestamp).toLocaleString("de-CH")}</span>
                          <span>•</span>
                          <span>{log.user ? `${log.user.firstName} ${log.user.lastName}`.trim() : "System"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
