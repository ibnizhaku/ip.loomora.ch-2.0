import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Package,
  Tag,
  Warehouse,
  Building2,
  Calculator,
  Info,
  Percent,
  Box,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateProduct, useProductCategories, useCreateProductCategory } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { VatRate } from "@/types/api";

// Swiss VAT rates
const vatRates = [
  { value: "STANDARD", label: "8.1% Normalsatz", rate: 8.1 },
  { value: "REDUCED", label: "2.6% Reduziert", rate: 2.6 },
  { value: "SPECIAL", label: "3.8% Beherbergung", rate: 3.8 },
  { value: "ZERO", label: "0% Befreit", rate: 0 },
];

// Swiss industry units
const units = [
  { value: "Stk", label: "Stück (Stk)" },
  { value: "m²", label: "Quadratmeter (m²)" },
  { value: "lfm", label: "Laufmeter (lfm)" },
  { value: "m", label: "Meter (m)" },
  { value: "kg", label: "Kilogramm (kg)" },
  { value: "l", label: "Liter (l)" },
  { value: "h", label: "Stunden (h)" },
  { value: "Psch", label: "Pauschale (Psch)" },
  { value: "Set", label: "Set" },
  { value: "Pkg", label: "Packung (Pkg)" },
];

export default function ProductCreate() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: categories } = useProductCategories();
  const { data: suppliersData } = useSuppliers({ pageSize: 100 });
  const suppliers = suppliersData?.data || [];
  const createCategory = useCreateProductCategory();

  const [isService, setIsService] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    unit: "Stk",
    purchasePrice: "",
    salePrice: "",
    vatRate: "STANDARD" as VatRate,
    stockQuantity: "0",
    minStock: "10",
    maxStock: "100",
    supplierId: "",
    supplierSku: "",
    leadTime: "",
    weight: "",
    dimensions: "",
    ean: "",
  });

  // Calculate margin
  const margin = useMemo(() => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;
    if (sale === 0) return 0;
    return ((sale - purchase) / sale) * 100;
  }, [formData.purchasePrice, formData.salePrice]);

  // Calculate sale price from target margin
  const calculateSalePriceFromMargin = (targetMargin: number) => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    if (purchase === 0 || targetMargin >= 100) return;
    const salePrice = purchase / (1 - targetMargin / 100);
    setFormData(prev => ({ ...prev, salePrice: salePrice.toFixed(2) }));
  };

  // Get VAT amount
  const getVatAmount = () => {
    const sale = parseFloat(formData.salePrice) || 0;
    const vatRate = vatRates.find(v => v.value === formData.vatRate)?.rate || 0;
    return sale * (vatRate / (100 + vatRate));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const result = await createCategory.mutateAsync({ name: newCategoryName });
      setFormData(prev => ({ ...prev, categoryId: result.id }));
      setNewCategoryName("");
      setShowNewCategory(false);
      toast.success("Kategorie erstellt");
    } catch {
      toast.error("Fehler beim Erstellen der Kategorie");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Bitte Produktname eingeben");
      return;
    }
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      toast.error("Bitte gültigen Verkaufspreis eingeben");
      return;
    }

    try {
      await createProduct.mutateAsync({
        sku: formData.sku || undefined,
        name: formData.name,
        description: formData.description || undefined,
        unit: formData.unit,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        salePrice: parseFloat(formData.salePrice),
        vatRate: formData.vatRate,
        stockQuantity: isService ? 0 : parseInt(formData.stockQuantity) || 0,
        minStock: isService ? 0 : parseInt(formData.minStock) || 0,
        maxStock: isService ? undefined : parseInt(formData.maxStock) || undefined,
        isService,
        categoryId: formData.categoryId || undefined,
        supplierId: formData.supplierId || undefined,
      });
      toast.success("Produkt erfolgreich angelegt");
      navigate("/products");
    } catch {
      toast.error("Fehler beim Anlegen des Produkts");
    }
  };

  const formatCHF = (value: string) => {
    const num = parseFloat(value) || 0;
    return num.toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Neues Produkt anlegen</h1>
          <p className="text-muted-foreground">Artikel- oder Dienstleistungsstamm erfassen</p>
        </div>
      </div>

      {/* Product Type Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                isService ? "bg-purple-500/10" : "bg-blue-500/10"
              )}>
                {isService ? (
                  <Briefcase className="h-6 w-6 text-purple-600" />
                ) : (
                  <Box className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <p className="font-semibold">{isService ? "Dienstleistung" : "Physisches Produkt"}</p>
                <p className="text-sm text-muted-foreground">
                  {isService 
                    ? "Keine Lagerverwaltung, stundenbasierte Abrechnung" 
                    : "Mit Lagerverwaltung und Bestandsführung"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-sm", !isService && "font-medium")}>Produkt</span>
              <Switch
                checked={isService}
                onCheckedChange={setIsService}
              />
              <span className={cn("text-sm", isService && "font-medium")}>Dienstleistung</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="pricing">Preise & Kalkulation</TabsTrigger>
          {!isService && <TabsTrigger value="stock">Lager</TabsTrigger>}
          <TabsTrigger value="supplier">Lieferant</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Stammdaten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Artikelnummer (SKU)</Label>
                      <Input
                        placeholder="Automatisch oder manuell"
                        value={formData.sku}
                        onChange={(e) => handleInputChange("sku", e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leer lassen für automatische Generierung
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>EAN/GTIN</Label>
                      <Input
                        placeholder="7612345678901"
                        value={formData.ean}
                        onChange={(e) => handleInputChange("ean", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Produktname *</Label>
                    <Input
                      placeholder="z.B. Edelstahl Blech 2mm"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea
                      placeholder="Detaillierte Produktbeschreibung..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Einheit</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => handleInputChange("unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Kategorie</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setShowNewCategory(!showNewCategory)}
                        >
                          {showNewCategory ? "Abbrechen" : "+ Neue Kategorie"}
                        </Button>
                      </div>
                      {showNewCategory ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Kategoriename"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                          />
                          <Button size="sm" onClick={handleCreateCategory}>
                            Erstellen
                          </Button>
                        </div>
                      ) : (
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) => handleInputChange("categoryId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isService && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Physische Eigenschaften
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Gewicht (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.weight}
                          onChange={(e) => handleInputChange("weight", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Abmessungen</Label>
                        <Input
                          placeholder="z.B. 1000 x 2000 mm"
                          value={formData.dimensions}
                          onChange={(e) => handleInputChange("dimensions", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vorschau</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        isService ? "bg-purple-500/10" : "bg-blue-500/10"
                      )}>
                        {isService ? (
                          <Briefcase className="h-6 w-6 text-purple-600" />
                        ) : (
                          <Package className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{formData.name || "Produktname"}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {formData.sku || "SKU-XXXXX"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Typ</span>
                        <Badge className={isService ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600"}>
                          {isService ? "Dienstleistung" : "Physisch"}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Einheit</span>
                        <span>{formData.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VK-Preis</span>
                        <span className="font-mono font-medium">
                          CHF {formatCHF(formData.salePrice)}
                        </span>
                      </div>
                      {margin > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Marge</span>
                          <span className={cn(
                            "font-mono font-medium",
                            margin >= 50 ? "text-success" : margin >= 30 ? "text-warning" : "text-destructive"
                          )}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Preiskalkulation
                  </CardTitle>
                  <CardDescription>
                    Einkaufs- und Verkaufspreise mit automatischer Margenberechnung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Einkaufspreis (CHF)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Verkaufspreis (CHF) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.salePrice}
                        onChange={(e) => handleInputChange("salePrice", e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  {/* Margin Calculator */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Berechnete Marge</span>
                      <span className={cn(
                        "text-2xl font-bold font-mono",
                        margin >= 50 ? "text-success" : margin >= 30 ? "text-warning" : margin > 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <p className="text-sm text-muted-foreground">Schnellkalkulation:</p>
                      {[20, 30, 40, 50].map((targetMargin) => (
                        <Button
                          key={targetMargin}
                          variant="outline"
                          size="sm"
                          onClick={() => calculateSalePriceFromMargin(targetMargin)}
                          disabled={!formData.purchasePrice}
                        >
                          {targetMargin}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>MwSt.-Satz</Label>
                    <Select
                      value={formData.vatRate}
                      onValueChange={(value: VatRate) => handleInputChange("vatRate", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vatRates.map((vat) => (
                          <SelectItem key={vat.value} value={vat.value}>
                            {vat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Preisübersicht
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Einkaufspreis</span>
                    <span className="font-mono">CHF {formatCHF(formData.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">VK netto</span>
                    <span className="font-mono">CHF {formatCHF(formData.salePrice)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">MwSt. ({vatRates.find(v => v.value === formData.vatRate)?.rate}%)</span>
                    <span className="font-mono">CHF {getVatAmount().toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold">
                    <span>VK brutto</span>
                    <span className="font-mono text-primary">
                      CHF {(parseFloat(formData.salePrice) || 0).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Deckungsbeitrag</span>
                    <span className={cn(
                      "font-mono font-bold",
                      margin >= 30 ? "text-success" : "text-warning"
                    )}>
                      CHF {((parseFloat(formData.salePrice) || 0) - (parseFloat(formData.purchasePrice) || 0)).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stock Tab */}
        {!isService && (
          <TabsContent value="stock" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Lagerverwaltung
                </CardTitle>
                <CardDescription>
                  Bestandsgrenzen und Meldebestände definieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Anfangsbestand</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mindestbestand</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.minStock}
                      onChange={(e) => handleInputChange("minStock", e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Warnung bei Unterschreitung</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximalbestand</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.maxStock}
                      onChange={(e) => handleInputChange("maxStock", e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Für Kapazitätsplanung</p>
                  </div>
                </div>

                {/* Stock Preview */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Bestandsvorschau</span>
                    <span className="font-mono">
                      {formData.stockQuantity || 0} / {formData.maxStock || 100} {formData.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        parseInt(formData.stockQuantity) <= parseInt(formData.minStock) 
                          ? "bg-destructive" 
                          : "bg-success"
                      )}
                      style={{ 
                        width: `${Math.min(100, (parseInt(formData.stockQuantity) || 0) / (parseInt(formData.maxStock) || 100) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Min: {formData.minStock || 10}</span>
                    <span>Max: {formData.maxStock || 100}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Supplier Tab */}
        <TabsContent value="supplier" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lieferanteninformationen
              </CardTitle>
              <CardDescription>
                Standardlieferant und Beschaffungsdaten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Standardlieferant</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => handleInputChange("supplierId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lieferant auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.companyName || supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Lieferanten-Artikelnummer</Label>
                  <Input
                    placeholder="Lieferanten-SKU"
                    value={formData.supplierSku}
                    onChange={(e) => handleInputChange("supplierSku", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lieferzeit (Tage)</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.leadTime}
                    onChange={(e) => handleInputChange("leadTime", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate("/products")}>
          Abbrechen
        </Button>
        <Button 
          className="gap-2" 
          onClick={handleSubmit}
          disabled={createProduct.isPending}
        >
          <Save className="h-4 w-4" />
          {createProduct.isPending ? "Wird gespeichert..." : "Produkt anlegen"}
        </Button>
      </div>
    </div>
  );
}
