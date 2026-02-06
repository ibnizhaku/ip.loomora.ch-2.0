import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  History,
  ShoppingCart,
  Truck,
  BarChart3,
  Save,
  Printer,
  ArrowRightLeft,
  ClipboardCheck,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initialItemData = {
  id: "ART-00145",
  name: "Server-Rack 42HE Premium",
  category: "Hardware",
  subcategory: "Server-Infrastruktur",
  status: "Verfügbar",
  sku: "SR-42HE-PREM",
  ean: "4012345678901",
  description: "Professionelles Server-Rack mit 42 Höheneinheiten. Inklusive Kabelmanagement, Lüftereinheit und abschließbaren Türen.",
  unit: "Stk",
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
    id: "SUP-001",
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

const warehouses = [
  { id: "1", name: "Hauptlager" },
  { id: "2", name: "Aussenlager Ost" },
  { id: "3", name: "Nebenlager" },
];

const formatCHF = (value: number) => {
  return value.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const InventoryItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [itemData, setItemData] = useState(initialItemData);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: itemData.name,
    description: itemData.description,
    sku: itemData.sku,
    ean: itemData.ean,
    category: itemData.category,
    subcategory: itemData.subcategory,
    unit: itemData.unit,
    purchasePrice: String(itemData.pricing.purchasePrice),
    sellingPrice: String(itemData.pricing.sellingPrice),
    minimum: String(itemData.stock.minimum),
    maximum: String(itemData.stock.maximum),
    reorderPoint: String(itemData.stock.reorderPoint),
    warehouse: itemData.location.warehouse,
    rack: itemData.location.rack,
    shelf: itemData.location.shelf,
    bin: itemData.location.bin,
  });
  
  // Reorder form state
  const [reorderForm, setReorderForm] = useState({
    quantity: "10",
    supplier: itemData.supplier.id,
    notes: "",
    expectedDate: "",
  });
  
  // Inventory adjustment state
  const [inventoryForm, setInventoryForm] = useState({
    actualStock: String(itemData.stock.current),
    reason: "inventory",
    notes: "",
  });
  
  // Transfer state
  const [transferForm, setTransferForm] = useState({
    targetWarehouse: "",
    quantity: "1",
    notes: "",
  });

  const stockPercentage = (itemData.stock.current / itemData.stock.maximum) * 100;
  const isLowStock = itemData.stock.available <= itemData.stock.reorderPoint;

  // Calculate margin dynamically
  const calculateMargin = (purchase: number, sale: number) => {
    if (sale === 0) return 0;
    return ((sale - purchase) / sale) * 100;
  };

  // Handle edit save
  const handleSaveEdit = () => {
    const purchasePrice = parseFloat(editForm.purchasePrice) || 0;
    const sellingPrice = parseFloat(editForm.sellingPrice) || 0;
    const margin = calculateMargin(purchasePrice, sellingPrice);
    
    setItemData(prev => ({
      ...prev,
      name: editForm.name,
      description: editForm.description,
      sku: editForm.sku,
      ean: editForm.ean,
      category: editForm.category,
      subcategory: editForm.subcategory,
      unit: editForm.unit,
      pricing: {
        ...prev.pricing,
        purchasePrice,
        sellingPrice,
        margin: Math.round(margin * 10) / 10,
      },
      stock: {
        ...prev.stock,
        minimum: parseInt(editForm.minimum) || 0,
        maximum: parseInt(editForm.maximum) || 100,
        reorderPoint: parseInt(editForm.reorderPoint) || 5,
      },
      location: {
        warehouse: editForm.warehouse,
        rack: editForm.rack,
        shelf: editForm.shelf,
        bin: editForm.bin,
      },
    }));
    
    setEditDialogOpen(false);
    toast.success("Artikel wurde aktualisiert");
  };

  // Handle reorder
  const handleReorder = () => {
    const quantity = parseInt(reorderForm.quantity) || 0;
    if (quantity <= 0) {
      toast.error("Bitte gültige Menge eingeben");
      return;
    }
    
    toast.success(`Bestellung über ${quantity} ${itemData.unit} wurde erstellt`);
    setReorderDialogOpen(false);
    navigate("/purchase-orders/new");
  };

  // Handle inventory adjustment
  const handleInventoryAdjustment = () => {
    const actualStock = parseInt(inventoryForm.actualStock) || 0;
    const difference = actualStock - itemData.stock.current;
    
    // Add to movements
    const newMovement = {
      date: new Date().toLocaleDateString("de-CH"),
      type: "Inventur",
      quantity: difference,
      reference: `INV-${Date.now().toString().slice(-6)}`,
      balance: actualStock,
    };
    
    setItemData(prev => ({
      ...prev,
      stock: {
        ...prev.stock,
        current: actualStock,
        available: actualStock - prev.stock.reserved,
      },
      movements: [newMovement, ...prev.movements],
    }));
    
    setInventoryDialogOpen(false);
    toast.success(`Bestand auf ${actualStock} ${itemData.unit} korrigiert (${difference >= 0 ? "+" : ""}${difference})`);
  };

  // Handle transfer
  const handleTransfer = () => {
    const quantity = parseInt(transferForm.quantity) || 0;
    if (quantity <= 0 || quantity > itemData.stock.available) {
      toast.error("Ungültige Menge für Umlagerung");
      return;
    }
    
    // Add to movements
    const newMovement = {
      date: new Date().toLocaleDateString("de-CH"),
      type: "Umlagerung",
      quantity: -quantity,
      reference: `UML-${Date.now().toString().slice(-6)}`,
      balance: itemData.stock.current - quantity,
    };
    
    setItemData(prev => ({
      ...prev,
      stock: {
        ...prev.stock,
        current: prev.stock.current - quantity,
        available: prev.stock.available - quantity,
      },
      movements: [newMovement, ...prev.movements],
    }));
    
    setTransferDialogOpen(false);
    toast.success(`${quantity} ${itemData.unit} wurden nach "${transferForm.targetWarehouse}" umgelagert`);
  };

  // Handle deactivate
  const handleDeactivate = () => {
    setDeactivateDialogOpen(false);
    toast.success("Artikel wurde deaktiviert");
    navigate("/inventory");
  };

  // Handle print label
  const handlePrintLabel = () => {
    toast.success("Etikett wird gedruckt...");
  };

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
          <Button variant="outline" size="sm" onClick={() => setReorderDialogOpen(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Nachbestellen
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setEditForm({
              name: itemData.name,
              description: itemData.description,
              sku: itemData.sku,
              ean: itemData.ean,
              category: itemData.category,
              subcategory: itemData.subcategory,
              unit: itemData.unit,
              purchasePrice: String(itemData.pricing.purchasePrice),
              sellingPrice: String(itemData.pricing.sellingPrice),
              minimum: String(itemData.stock.minimum),
              maximum: String(itemData.stock.maximum),
              reorderPoint: String(itemData.stock.reorderPoint),
              warehouse: itemData.location.warehouse,
              rack: itemData.location.rack,
              shelf: itemData.location.shelf,
              bin: itemData.location.bin,
            });
            setEditDialogOpen(true);
          }}>
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
              <DropdownMenuItem onClick={() => setInventoryDialogOpen(true)}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Inventur buchen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTransferDialogOpen(true)}>
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Umlagerung
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintLabel}>
                <Printer className="h-4 w-4 mr-2" />
                Etikett drucken
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setDeactivateDialogOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Deaktivieren
              </DropdownMenuItem>
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
            <Button size="sm" onClick={() => setReorderDialogOpen(true)}>
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
                <div className="text-3xl font-bold">CHF {formatCHF(itemData.pricing.sellingPrice)}</div>
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
                      <span className="font-medium">CHF {formatCHF(itemData.pricing.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verkaufspreis</span>
                      <span className="font-medium">CHF {formatCHF(itemData.pricing.sellingPrice)}</span>
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
                          {movement.quantity > 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          {movement.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono hover:text-primary cursor-pointer">
                          {movement.reference}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        movement.quantity > 0 ? "text-success" : "text-destructive"
                      )}>
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
                    CHF {formatCHF(itemData.stock.current * itemData.pricing.purchasePrice)}
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-success/5 border border-success/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Gesamtwert (VK)</p>
                  <p className="text-3xl font-bold text-success">
                    CHF {formatCHF(itemData.stock.current * itemData.pricing.sellingPrice)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Artikel bearbeiten</DialogTitle>
            <DialogDescription>
              Stammdaten und Einstellungen des Artikels anpassen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-medium">Stammdaten</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Artikelname</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={editForm.sku}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>EAN</Label>
                  <Input
                    value={editForm.ean}
                    onChange={(e) => setEditForm(prev => ({ ...prev, ean: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unterkategorie</Label>
                  <Input
                    value={editForm.subcategory}
                    onChange={(e) => setEditForm(prev => ({ ...prev, subcategory: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="font-medium">Preise</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Einkaufspreis (CHF)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.purchasePrice}
                    onChange={(e) => setEditForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verkaufspreis (CHF)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.sellingPrice}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Berechnete Marge</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border bg-muted/50">
                    <span className={cn(
                      "font-mono font-medium",
                      calculateMargin(
                        parseFloat(editForm.purchasePrice) || 0,
                        parseFloat(editForm.sellingPrice) || 0
                      ) >= 30 ? "text-success" : "text-warning"
                    )}>
                      {calculateMargin(
                        parseFloat(editForm.purchasePrice) || 0,
                        parseFloat(editForm.sellingPrice) || 0
                      ).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Bestandsgrenzen</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Mindestbestand</Label>
                  <Input
                    type="number"
                    value={editForm.minimum}
                    onChange={(e) => setEditForm(prev => ({ ...prev, minimum: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meldebestand</Label>
                  <Input
                    type="number"
                    value={editForm.reorderPoint}
                    onChange={(e) => setEditForm(prev => ({ ...prev, reorderPoint: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximalbestand</Label>
                  <Input
                    type="number"
                    value={editForm.maximum}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maximum: e.target.value }))}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-medium">Lagerort</h4>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Lager</Label>
                  <Select
                    value={editForm.warehouse}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, warehouse: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.name}>{wh.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Regal</Label>
                  <Input
                    value={editForm.rack}
                    onChange={(e) => setEditForm(prev => ({ ...prev, rack: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fach</Label>
                  <Input
                    value={editForm.shelf}
                    onChange={(e) => setEditForm(prev => ({ ...prev, shelf: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lagerplatz</Label>
                  <Input
                    value={editForm.bin}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bin: e.target.value }))}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reorder Dialog */}
      <Dialog open={reorderDialogOpen} onOpenChange={setReorderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nachbestellung erstellen</DialogTitle>
            <DialogDescription>
              Bestellung beim Lieferanten aufgeben
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{itemData.name}</span>
                <Badge variant="outline">{itemData.sku}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Lieferant: {itemData.supplier.name}
              </div>
              <div className="text-sm text-muted-foreground">
                Aktueller Bestand: {itemData.stock.current} {itemData.unit}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bestellmenge</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setReorderForm(prev => ({
                    ...prev,
                    quantity: String(Math.max(1, parseInt(prev.quantity) - 1))
                  }))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={reorderForm.quantity}
                  onChange={(e) => setReorderForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="font-mono text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setReorderForm(prev => ({
                    ...prev,
                    quantity: String(parseInt(prev.quantity) + 1)
                  }))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground">{itemData.unit}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Erwartetes Lieferdatum</Label>
              <Input
                type="date"
                value={reorderForm.expectedDate}
                onChange={(e) => setReorderForm(prev => ({ ...prev, expectedDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea
                placeholder="Optionale Bemerkungen zur Bestellung..."
                value={reorderForm.notes}
                onChange={(e) => setReorderForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex justify-between text-sm mb-1">
                <span>Geschätzter Bestellwert</span>
                <span className="font-mono font-medium">
                  CHF {formatCHF((parseInt(reorderForm.quantity) || 0) * itemData.pricing.purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Lieferzeit</span>
                <span>{itemData.supplier.deliveryTime}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReorderDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleReorder}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Bestellung erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inventory Adjustment Dialog */}
      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventur buchen</DialogTitle>
            <DialogDescription>
              Bestand aufgrund einer Inventurzählung korrigieren
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aktueller Buchbestand</span>
                <span className="font-mono font-bold">{itemData.stock.current} {itemData.unit}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gezählter Bestand</Label>
              <Input
                type="number"
                value={inventoryForm.actualStock}
                onChange={(e) => setInventoryForm(prev => ({ ...prev, actualStock: e.target.value }))}
                className="font-mono text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Grund</Label>
              <Select
                value={inventoryForm.reason}
                onValueChange={(value) => setInventoryForm(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Jahresinventur</SelectItem>
                  <SelectItem value="spot-check">Stichprobe</SelectItem>
                  <SelectItem value="damage">Beschädigung</SelectItem>
                  <SelectItem value="shrinkage">Schwund</SelectItem>
                  <SelectItem value="correction">Korrektur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea
                placeholder="Optionale Bemerkungen..."
                value={inventoryForm.notes}
                onChange={(e) => setInventoryForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {parseInt(inventoryForm.actualStock) !== itemData.stock.current && (
              <div className={cn(
                "p-4 rounded-lg border",
                parseInt(inventoryForm.actualStock) > itemData.stock.current
                  ? "bg-success/5 border-success/20"
                  : "bg-destructive/5 border-destructive/20"
              )}>
                <div className="flex justify-between">
                  <span>Differenz</span>
                  <span className={cn(
                    "font-mono font-bold",
                    parseInt(inventoryForm.actualStock) > itemData.stock.current
                      ? "text-success"
                      : "text-destructive"
                  )}>
                    {parseInt(inventoryForm.actualStock) > itemData.stock.current ? "+" : ""}
                    {parseInt(inventoryForm.actualStock) - itemData.stock.current} {itemData.unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInventoryDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleInventoryAdjustment}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Inventur buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Umlagerung</DialogTitle>
            <DialogDescription>
              Artikel in ein anderes Lager umlagern
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Von</span>
                <span className="font-medium">{itemData.location.warehouse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verfügbar</span>
                <span className="font-mono">{itemData.stock.available} {itemData.unit}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ziellager</Label>
              <Select
                value={transferForm.targetWarehouse}
                onValueChange={(value) => setTransferForm(prev => ({ ...prev, targetWarehouse: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lager auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses
                    .filter(wh => wh.name !== itemData.location.warehouse)
                    .map((wh) => (
                      <SelectItem key={wh.id} value={wh.name}>{wh.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Menge</Label>
              <Input
                type="number"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: e.target.value }))}
                className="font-mono"
                max={itemData.stock.available}
              />
            </div>

            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea
                placeholder="Optionale Bemerkungen..."
                value={transferForm.notes}
                onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleTransfer}
              disabled={!transferForm.targetWarehouse}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Umlagern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel deaktivieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Artikel "{itemData.name}" wird deaktiviert und erscheint nicht mehr in der Lagerliste.
              Diese Aktion kann rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} className="bg-destructive text-destructive-foreground">
              Deaktivieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryItemDetail;
