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

// Mock product data
const product = {
  id: "1",
  sku: "PROD-001",
  ean: "7612345678901",
  name: "Edelstahl Blech 2mm",
  description: "Hochwertiges Edelstahlblech für Metallbauarbeiten. Korrosionsbeständig, langlebig und vielseitig einsetzbar.",
  category: "Rohmaterial",
  type: "physical" as const,
  unit: "m²",
  status: "active" as const,
  price: 89.50,
  costPrice: 52.00,
  margin: 41.9,
  taxRate: 8.1,
  stock: 145,
  minStock: 50,
  maxStock: 300,
  reservedStock: 23,
  supplier: "Stahl AG Zürich",
  supplierSku: "STZ-ED2MM",
  leadTime: 5,
  weight: 15.8,
  dimensions: "1000 x 2000 mm",
  createdAt: "15.03.2023",
  updatedAt: "28.01.2024",
};

const priceHistory = [
  { date: "01.01.2024", price: 89.50, change: 2.3 },
  { date: "01.10.2023", price: 87.50, change: 0 },
  { date: "01.07.2023", price: 87.50, change: -3.2 },
  { date: "01.04.2023", price: 90.40, change: 5.1 },
  { date: "15.03.2023", price: 86.00, change: 0 },
];

const stockMovements = [
  { date: "28.01.2024", type: "Eingang", quantity: 50, reference: "BE-2024-0045", balance: 145 },
  { date: "25.01.2024", type: "Ausgang", quantity: -12, reference: "LS-2024-0089", balance: 95 },
  { date: "22.01.2024", type: "Ausgang", quantity: -8, reference: "LS-2024-0082", balance: 107 },
  { date: "18.01.2024", type: "Reservierung", quantity: -23, reference: "AU-2024-0034", balance: 115 },
  { date: "15.01.2024", type: "Eingang", quantity: 30, reference: "BE-2024-0032", balance: 138 },
];

const relatedDocuments = [
  { type: "Rechnung", number: "RE-2024-0156", date: "25.01.2024", amount: 1074 },
  { type: "Lieferschein", number: "LS-2024-0089", date: "25.01.2024", quantity: 12 },
  { type: "Bestellung", number: "BE-2024-0045", date: "20.01.2024", quantity: 50 },
  { type: "Angebot", number: "AN-2024-0078", date: "18.01.2024", quantity: 30 },
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const stockPercentage = (product.stock / product.maxStock) * 100;
  const availableStock = product.stock - product.reservedStock;

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
              {product.name}
            </h1>
            <Badge className="bg-success/10 text-success">Aktiv</Badge>
          </div>
          <p className="text-muted-foreground">
            <span className="font-mono">{product.sku}</span> • {product.category}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
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
              <p className="text-2xl font-bold font-mono">CHF {product.price.toFixed(2)}</p>
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
              <p className="text-2xl font-bold text-success font-mono">{product.margin}%</p>
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
              <p className="text-2xl font-bold font-mono">{product.stock} {product.unit}</p>
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
              <p className="text-2xl font-bold font-mono">{product.reservedStock} {product.unit}</p>
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
                <p className="text-muted-foreground mb-6">{product.description}</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Artikelnummer</span>
                      <span className="font-mono font-medium">{product.sku}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">EAN/GTIN</span>
                      <span className="font-mono font-medium">{product.ean}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Kategorie</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Produkttyp</span>
                      <Badge className={typeStyles[product.type]}>{typeLabels[product.type]}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Einheit</span>
                      <span className="font-medium">{product.unit}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Gewicht</span>
                      <span className="font-mono">{product.weight} kg/{product.unit}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Abmessungen</span>
                      <span className="font-mono">{product.dimensions}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">MwSt.-Satz</span>
                      <span className="font-mono">{product.taxRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Lieferanteninformationen</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lieferant</span>
                    <span className="font-medium">{product.supplier}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lieferanten-SKU</span>
                    <span className="font-mono">{product.supplierSku}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Einkaufspreis</span>
                    <span className="font-mono">CHF {product.costPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Lieferzeit</span>
                    <span className="font-mono">{product.leadTime} Tage</span>
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
                    <span className="font-mono font-bold">{product.stock} {product.unit}</span>
                  </div>
                  <Progress value={stockPercentage} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {product.minStock}</span>
                    <span>Max: {product.maxStock}</span>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Verfügbar</p>
                      <p className="text-xl font-bold text-success font-mono">{availableStock}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Reserviert</p>
                      <p className="text-xl font-bold text-warning font-mono">{product.reservedStock}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Lagerwert</p>
                      <p className="text-xl font-bold font-mono">CHF {(product.stock * product.costPrice).toLocaleString()}</p>
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
                    <p className="text-2xl font-bold font-mono">CHF {product.costPrice.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Verkaufspreis</p>
                    <p className="text-2xl font-bold font-mono text-primary">CHF {product.price.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Marge</p>
                    <p className="text-2xl font-bold font-mono text-success">{product.margin}%</p>
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
                          {doc.amount ? `CHF ${doc.amount.toLocaleString()}` : `${doc.quantity} ${product.unit}`}
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
              <Badge className={typeStyles[product.type]}>{typeLabels[product.type]}</Badge>
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
                <span className="font-mono">{product.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktualisiert</span>
                <span className="font-mono">{product.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
