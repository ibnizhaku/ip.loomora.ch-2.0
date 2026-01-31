import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Euro,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  History,
  ShoppingCart,
  Truck,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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

const itemData = {
  id: "ART-00145",
  name: "Server-Rack 42HE Premium",
  category: "Hardware",
  subcategory: "Server-Infrastruktur",
  status: "Verfügbar",
  sku: "SR-42HE-PREM",
  ean: "4012345678901",
  description: "Professionelles Server-Rack mit 42 Höheneinheiten. Inklusive Kabelmanagement, Lüftereinheit und abschließbaren Türen.",
  stock: {
    current: 8,
    reserved: 2,
    available: 6,
    minimum: 3,
    maximum: 20,
    reorderPoint: 5
  },
  pricing: {
    purchasePrice: 650,
    sellingPrice: 899,
    margin: 27.7,
    lastPurchase: "15.01.2024"
  },
  supplier: {
    name: "TechParts International",
    articleNo: "TP-SR42P",
    deliveryTime: "3-5 Tage"
  },
  location: {
    warehouse: "Hauptlager",
    rack: "A",
    shelf: "12",
    bin: "A12-04"
  },
  movements: [
    { date: "28.01.2024", type: "Ausgang", quantity: -2, reference: "LS-2024-0089", balance: 8 },
    { date: "22.01.2024", type: "Eingang", quantity: 5, reference: "EK-2024-0045", balance: 10 },
    { date: "15.01.2024", type: "Ausgang", quantity: -3, reference: "LS-2024-0078", balance: 5 },
    { date: "10.01.2024", type: "Eingang", quantity: 8, reference: "EK-2024-0038", balance: 8 },
  ],
  sales: {
    last30Days: 5,
    last90Days: 18,
    lastYear: 67,
    avgPerMonth: 5.6
  }
};

const InventoryItemDetail = () => {
  const { id } = useParams();
  const stockPercentage = (itemData.stock.current / itemData.stock.maximum) * 100;
  const isLowStock = itemData.stock.available <= itemData.stock.reorderPoint;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">{itemData.name}</h1>
                <Badge className={isLowStock ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}>
                  {itemData.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono">{itemData.id}</span>
                <span>•</span>
                <span>{itemData.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nachbestellen
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Inventur buchen</DropdownMenuItem>
              <DropdownMenuItem>Umlagerung</DropdownMenuItem>
              <DropdownMenuItem>Etikett drucken</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Deaktivieren</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert for low stock */}
      {isLowStock && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <div className="flex-1">
              <p className="font-semibold">Niedriger Bestand</p>
              <p className="text-sm text-muted-foreground">
                Der verfügbare Bestand ({itemData.stock.available}) liegt unter dem Meldebestand ({itemData.stock.reorderPoint}).
              </p>
            </div>
            <Button size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Jetzt bestellen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{itemData.stock.current}</div>
                <p className="text-sm text-muted-foreground">Gesamtbestand</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={stockPercentage} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">Max: {itemData.stock.maximum}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-success">{itemData.stock.available}</div>
                <p className="text-sm text-muted-foreground">Verfügbar</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {itemData.stock.reserved} reserviert
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">€{itemData.pricing.sellingPrice}</div>
                <p className="text-sm text-muted-foreground">Verkaufspreis</p>
              </div>
              <Badge className="bg-success/10 text-success">{itemData.pricing.margin}% Marge</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{itemData.sales.avgPerMonth}</div>
                <p className="text-sm text-muted-foreground">Ø Verkäufe/Monat</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="movements">Bewegungen</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Artikeldetails</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{itemData.description}</p>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Artikelnummer</span>
                      <span className="font-mono">{itemData.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SKU</span>
                      <span className="font-mono">{itemData.sku}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">EAN</span>
                      <span className="font-mono">{itemData.ean}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kategorie</span>
                      <span>{itemData.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unterkategorie</span>
                      <span>{itemData.subcategory}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Einkaufspreis</span>
                      <span className="font-medium">€{itemData.pricing.purchasePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verkaufspreis</span>
                      <span className="font-medium">€{itemData.pricing.sellingPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Marge</span>
                      <span className="font-medium text-success">{itemData.pricing.margin}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Letzter Einkauf</span>
                      <span>{itemData.pricing.lastPurchase}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Supplier */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Warehouse className="h-4 w-4" />
                    Lagerort
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lager</span>
                    <span className="font-medium">{itemData.location.warehouse}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Regal</span>
                    <span className="font-medium">{itemData.location.rack}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fach</span>
                    <span className="font-medium">{itemData.location.shelf}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lagerplatz</span>
                    <span className="font-mono font-bold">{itemData.location.bin}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Lieferant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/suppliers/1" className="font-medium hover:text-primary">
                    {itemData.supplier.name}
                  </Link>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Art.-Nr. Lieferant</span>
                    <span className="font-mono">{itemData.supplier.articleNo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lieferzeit</span>
                    <span>{itemData.supplier.deliveryTime}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bestandsgrenzen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mindestbestand</span>
                    <span className="font-medium">{itemData.stock.minimum}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meldebestand</span>
                    <span className="font-medium text-warning">{itemData.stock.reorderPoint}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maximalbestand</span>
                    <span className="font-medium">{itemData.stock.maximum}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Lagerbewegungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Art</TableHead>
                    <TableHead>Referenz</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead className="text-right">Bestand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemData.movements.map((movement, index) => (
                    <TableRow key={index}>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {movement.type === "Eingang" ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          {movement.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link to="#" className="font-mono hover:text-primary">
                          {movement.reference}
                        </Link>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        movement.quantity > 0 ? "text-success" : "text-destructive"
                      }`}>
                        {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">{movement.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Verkaufsstatistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                  <span>Letzte 30 Tage</span>
                  <span className="text-2xl font-bold">{itemData.sales.last30Days}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                  <span>Letzte 90 Tage</span>
                  <span className="text-2xl font-bold">{itemData.sales.last90Days}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                  <span>Letztes Jahr</span>
                  <span className="text-2xl font-bold">{itemData.sales.lastYear}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bestandswert</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Gesamtwert (EK)</p>
                  <p className="text-3xl font-bold">
                    €{(itemData.stock.current * itemData.pricing.purchasePrice).toLocaleString()}
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-success/5 border border-success/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Gesamtwert (VK)</p>
                  <p className="text-3xl font-bold text-success">
                    €{(itemData.stock.current * itemData.pricing.sellingPrice).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryItemDetail;
