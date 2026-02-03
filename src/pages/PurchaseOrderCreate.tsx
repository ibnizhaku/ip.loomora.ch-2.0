import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Building2, 
  Package,
  Calendar,
  FileText,
  Search,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock suppliers data
const suppliers = [
  { id: "1", name: "TechParts International", number: "LF-0001", city: "Zürich", paymentTerms: 30 },
  { id: "2", name: "Office Supplies Pro", number: "LF-0002", city: "Basel", paymentTerms: 14 },
  { id: "3", name: "Hardware Express", number: "LF-0003", city: "Bern", paymentTerms: 30 },
  { id: "4", name: "Component World", number: "LF-0004", city: "Genf", paymentTerms: 45 },
  { id: "5", name: "Server Solutions", number: "LF-0005", city: "Luzern", paymentTerms: 30 },
];

// Mock products that can be ordered
const availableProducts = [
  { id: "1", sku: "COMP-001", name: "Intel Core i7 Prozessor", unit: "Stk", price: 320, supplierId: "1" },
  { id: "2", sku: "COMP-002", name: "DDR5 RAM 32GB Kit", unit: "Stk", price: 145, supplierId: "1" },
  { id: "3", sku: "COMP-003", name: "NVMe SSD 1TB", unit: "Stk", price: 89, supplierId: "1" },
  { id: "4", sku: "OFF-001", name: "Druckerpapier A4 500 Blatt", unit: "Pkg", price: 8.50, supplierId: "2" },
  { id: "5", sku: "OFF-002", name: "Kugelschreiber Set (10 Stk)", unit: "Set", price: 12, supplierId: "2" },
  { id: "6", sku: "HW-001", name: "Netzwerkkabel Cat6 3m", unit: "Stk", price: 5.50, supplierId: "3" },
  { id: "7", sku: "HW-002", name: "USB-C Hub 7-Port", unit: "Stk", price: 45, supplierId: "3" },
  { id: "8", sku: "SRV-001", name: "Server Rack 42U", unit: "Stk", price: 890, supplierId: "5" },
];

interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export default function PurchaseOrderCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"supplier" | "products" | "review">("supplier");
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<typeof suppliers[0] | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");

  // Filter products by selected supplier
  const supplierProducts = selectedSupplier 
    ? availableProducts.filter(p => p.supplierId === selectedSupplier.id)
    : availableProducts;

  const filteredProducts = supplierProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (product: typeof availableProducts[0]) => {
    const existingItem = items.find(item => item.productId === product.id);
    if (existingItem) {
      setItems(items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setItems([...items, {
        id: crypto.randomUUID(),
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unit: product.unit,
        unitPrice: product.price,
        total: product.price,
      }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const updatePrice = (itemId: string, unitPrice: number) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, unitPrice, total: item.quantity * unitPrice }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * 0.081; // 8.1% Swiss VAT
  const total = subtotal + vat;

  const handleSubmit = () => {
    if (!selectedSupplier) {
      toast.error("Bitte wählen Sie einen Lieferanten");
      return;
    }
    if (items.length === 0) {
      toast.error("Bitte fügen Sie mindestens eine Position hinzu");
      return;
    }
    
    // In real app, this would call the API
    toast.success("Bestellung erfolgreich erstellt");
    navigate("/purchase-orders");
  };

  const canProceedToProducts = !!selectedSupplier;
  const canProceedToReview = items.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/purchase-orders")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Neue Einkaufsbestellung</h1>
          <p className="text-muted-foreground">Bestellung bei einem Lieferanten aufgeben</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep("supplier")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            step === "supplier" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          )}
        >
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background/20 text-sm font-medium">
            {selectedSupplier ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className="font-medium">Lieferant</span>
        </button>
        <div className="h-px w-8 bg-border" />
        <button
          onClick={() => canProceedToProducts && setStep("products")}
          disabled={!canProceedToProducts}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            step === "products" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
            !canProceedToProducts && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background/20 text-sm font-medium">
            {items.length > 0 ? <Check className="h-4 w-4" /> : "2"}
          </div>
          <span className="font-medium">Produkte</span>
        </button>
        <div className="h-px w-8 bg-border" />
        <button
          onClick={() => canProceedToReview && setStep("review")}
          disabled={!canProceedToReview}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            step === "review" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
            !canProceedToReview && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-background/20 text-sm font-medium">
            3
          </div>
          <span className="font-medium">Überprüfen</span>
        </button>
      </div>

      {/* Step 1: Supplier Selection */}
      {step === "supplier" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lieferant auswählen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Lieferant *</Label>
              <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={supplierOpen}
                    className="w-full justify-between h-auto py-3"
                  >
                    {selectedSupplier ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{selectedSupplier.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedSupplier.number} • {selectedSupplier.city}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Lieferant auswählen...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Lieferant suchen..." />
                    <CommandList>
                      <CommandEmpty>Kein Lieferant gefunden.</CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier) => (
                          <CommandItem
                            key={supplier.id}
                            value={supplier.name}
                            onSelect={() => {
                              setSelectedSupplier(supplier);
                              setSupplierOpen(false);
                              // Clear items if switching supplier
                              if (selectedSupplier?.id !== supplier.id) {
                                setItems([]);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex items-center justify-center h-8 w-8 rounded bg-muted">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{supplier.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {supplier.number} • {supplier.city}
                                </div>
                              </div>
                              <Badge variant="outline">{supplier.paymentTerms} Tage</Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedSupplier && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-medium">Lieferantendetails</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nummer:</span>
                    <span className="ml-2">{selectedSupplier.number}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Standort:</span>
                    <span className="ml-2">{selectedSupplier.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zahlungsziel:</span>
                    <span className="ml-2">{selectedSupplier.paymentTerms} Tage</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verfügbare Artikel:</span>
                    <span className="ml-2">{supplierProducts.length}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep("products")} 
                disabled={!selectedSupplier}
              >
                Weiter zu Produkten
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Product Selection */}
      {step === "products" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Catalog */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produkte von {selectedSupplier?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Produkte suchen..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Produkte gefunden
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const inCart = items.find(i => i.productId === product.id);
                    return (
                      <div
                        key={product.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                          inCart ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        )}
                        onClick={() => addProduct(product)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center h-10 w-10 rounded bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.sku} • {product.unit}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            CHF {product.price.toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                          </span>
                          {inCart && (
                            <Badge variant="default">{inCart.quantity}×</Badge>
                          )}
                          <Button size="sm" variant={inCart ? "secondary" : "outline"}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Bestellpositionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Produkte hinzugefügt</p>
                  <p className="text-sm">Klicken Sie auf Produkte, um sie hinzuzufügen</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.sku}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center"
                            min={1}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zwischensumme</span>
                      <span>CHF {subtotal.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MwSt. 8.1%</span>
                      <span>CHF {vat.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>CHF {total.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("supplier")}>
                  Zurück
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setStep("review")} 
                  disabled={items.length === 0}
                >
                  Weiter zur Überprüfung
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === "review" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bestellübersicht
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supplier Info */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Lieferant</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-background">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{selectedSupplier?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSupplier?.number} • {selectedSupplier?.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Bestellpositionen ({items.length})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel</TableHead>
                      <TableHead className="text-right">Menge</TableHead>
                      <TableHead className="text-right">Einzelpreis</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.sku}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="text-right">
                          CHF {item.unitPrice.toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          CHF {item.total.toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Additional Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delivery">Gewünschtes Lieferdatum</Label>
                  <Input
                    id="delivery"
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Ihre Referenz</Label>
                  <Input
                    id="reference"
                    placeholder="z.B. Projekt XYZ"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Bemerkungen</Label>
                <Textarea
                  id="notes"
                  placeholder="Spezielle Anweisungen oder Hinweise für den Lieferanten..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Total */}
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Positionen</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artikel gesamt</span>
                  <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zwischensumme</span>
                  <span>CHF {subtotal.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MwSt. 8.1%</span>
                  <span>CHF {vat.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>CHF {total.toLocaleString("de-CH", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Zahlungsziel: {selectedSupplier?.paymentTerms} Tage</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={handleSubmit}>
                  Bestellung aufgeben
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setStep("products")}>
                  Zurück
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
