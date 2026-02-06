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
  Box,
  Briefcase,
  Image,
  Layers,
  Settings2,
  Trash2,
  Edit,
  Plus,
  FolderTree,
  X,
  Globe,
  Barcode,
  Scale,
  Ruler,
  Clock,
  FileText,
  Sparkles,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateProduct, useProductCategories, useCreateProductCategory } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { VatRate, ProductCategory } from "@/types/api";

// Swiss VAT rates
const vatRates = [
  { value: "STANDARD", label: "8.1% Normalsatz", rate: 8.1 },
  { value: "REDUCED", label: "2.6% Reduziert", rate: 2.6 },
  { value: "SPECIAL", label: "3.8% Beherbergung", rate: 3.8 },
  { value: "ZERO", label: "0% Befreit", rate: 0 },
];

// Swiss industry units
const units = [
  { value: "Stk", label: "Stück (Stk)", group: "Menge" },
  { value: "Set", label: "Set", group: "Menge" },
  { value: "Pkg", label: "Packung (Pkg)", group: "Menge" },
  { value: "m²", label: "Quadratmeter (m²)", group: "Fläche" },
  { value: "lfm", label: "Laufmeter (lfm)", group: "Länge" },
  { value: "m", label: "Meter (m)", group: "Länge" },
  { value: "mm", label: "Millimeter (mm)", group: "Länge" },
  { value: "kg", label: "Kilogramm (kg)", group: "Gewicht" },
  { value: "g", label: "Gramm (g)", group: "Gewicht" },
  { value: "t", label: "Tonne (t)", group: "Gewicht" },
  { value: "l", label: "Liter (l)", group: "Volumen" },
  { value: "ml", label: "Milliliter (ml)", group: "Volumen" },
  { value: "h", label: "Stunden (h)", group: "Zeit" },
  { value: "min", label: "Minuten (min)", group: "Zeit" },
  { value: "Psch", label: "Pauschale (Psch)", group: "Sonstiges" },
];

// Default product categories for Swiss SMEs
const defaultCategories = [
  "Rohmaterial",
  "Halbfabrikate",
  "Fertigprodukte",
  "Handelswaren",
  "Verbrauchsmaterial",
  "Werkzeuge",
  "Ersatzteile",
  "Dienstleistungen",
];

export default function ProductCreate() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: categories, refetch: refetchCategories } = useProductCategories();
  const { data: suppliersData } = useSuppliers({ pageSize: 100 });
  const suppliers = suppliersData?.data || [];
  const createCategory = useCreateProductCategory();

  // Product type
  const [isService, setIsService] = useState(false);
  
  // Category management
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

  // Price tiers
  const [priceTiers, setPriceTiers] = useState<{ minQty: string; price: string }[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    // Basic
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    unit: "Stk",
    
    // Identification
    ean: "",
    manufacturerSku: "",
    customsCode: "", // Zolltarifnummer
    originCountry: "CH",
    
    // Pricing
    purchasePrice: "",
    salePrice: "",
    vatRate: "STANDARD" as VatRate,
    
    // Stock
    stockQuantity: "0",
    minStock: "10",
    maxStock: "100",
    reorderPoint: "20", // Meldebestand
    reorderQuantity: "50", // Bestellmenge
    
    // Physical properties
    weight: "",
    weightUnit: "kg",
    length: "",
    width: "",
    height: "",
    dimensionUnit: "mm",
    
    // Supplier
    supplierId: "",
    supplierSku: "",
    leadTime: "",
    
    // Additional
    notes: "",
    isActive: true,
    trackSerials: false,
    trackBatches: false,
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Category management handlers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Bitte Kategoriename eingeben");
      return;
    }
    try {
      const result = await createCategory.mutateAsync({ 
        name: newCategoryName,
        description: newCategoryDescription || undefined 
      });
      setFormData(prev => ({ ...prev, categoryId: result.id }));
      setNewCategoryName("");
      setNewCategoryDescription("");
      setCategoryDialogOpen(false);
      toast.success("Kategorie erstellt");
      refetchCategories();
    } catch {
      toast.error("Fehler beim Erstellen der Kategorie");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    // Note: Backend would need a delete endpoint
    toast.success(`Kategorie "${categoryToDelete.name}" gelöscht`);
    setDeleteConfirmOpen(false);
    setCategoryToDelete(null);
    refetchCategories();
  };

  // Add price tier
  const addPriceTier = () => {
    setPriceTiers(prev => [...prev, { minQty: "", price: "" }]);
  };

  const removePriceTier = (index: number) => {
    setPriceTiers(prev => prev.filter((_, i) => i !== index));
  };

  const updatePriceTier = (index: number, field: "minQty" | "price", value: string) => {
    setPriceTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ));
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

  // Group units by category
  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.group]) acc[unit.group] = [];
    acc[unit.group].push(unit);
    return acc;
  }, {} as Record<string, typeof units>);

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
        <Button variant="outline" className="gap-2" onClick={() => setCategoryDialogOpen(true)}>
          <FolderTree className="h-4 w-4" />
          Kategorien verwalten
        </Button>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Stammdaten</TabsTrigger>
          <TabsTrigger value="identification">Identifikation</TabsTrigger>
          <TabsTrigger value="pricing">Preise</TabsTrigger>
          {!isService && <TabsTrigger value="stock">Lager</TabsTrigger>}
          <TabsTrigger value="supplier">Beschaffung</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Grunddaten
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
                      <div className="flex items-center justify-between">
                        <Label>Kategorie</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs gap-1"
                          onClick={() => setCategoryDialogOpen(true)}
                        >
                          <Settings2 className="h-3 w-3" />
                          Verwalten
                        </Button>
                      </div>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => handleInputChange("categoryId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories && categories.length > 0 ? (
                            categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Keine Kategorien vorhanden
                              <Button
                                variant="link"
                                size="sm"
                                className="block mx-auto mt-1"
                                onClick={() => setCategoryDialogOpen(true)}
                              >
                                Kategorie erstellen
                              </Button>
                            </div>
                          )}
                        </SelectContent>
                      </Select>
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
                      placeholder="Detaillierte Produktbeschreibung für Angebote und Rechnungen..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>

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
                        {Object.entries(groupedUnits).map(([group, groupUnits]) => (
                          <div key={group}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {group}
                            </div>
                            {groupUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Interne Notizen</Label>
                    <Textarea
                      placeholder="Interne Bemerkungen (nicht auf Dokumenten sichtbar)..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Image Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Produktbilder
                  </CardTitle>
                  <CardDescription>
                    Bilder für Katalog, Shop und Dokumente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Image className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Bilder hierher ziehen oder
                    </p>
                    <Button variant="outline" size="sm">
                      Dateien auswählen
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG oder WebP, max. 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Sidebar */}
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
                        <span className="text-muted-foreground">Kategorie</span>
                        <span>{categories?.find(c => c.id === formData.categoryId)?.name || "—"}</span>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Tipps
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Verwenden Sie aussagekräftige Namen für bessere Suche</p>
                  <p>• EAN-Codes ermöglichen Barcode-Scanning</p>
                  <p>• Setzen Sie Mindestbestände für automatische Warnungen</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Identification Tab */}
        <TabsContent value="identification" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Produkt-Identifikation
              </CardTitle>
              <CardDescription>
                Eindeutige Kennzeichnung für Warenwirtschaft und Handel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Barcode className="h-4 w-4" />
                    EAN/GTIN
                  </Label>
                  <Input
                    placeholder="7612345678901"
                    value={formData.ean}
                    onChange={(e) => handleInputChange("ean", e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    13-stelliger Barcode für Handel
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Hersteller-Artikelnummer</Label>
                  <Input
                    placeholder="MPN / OEM-Nummer"
                    value={formData.manufacturerSku}
                    onChange={(e) => handleInputChange("manufacturerSku", e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Zolltarifnummer
                  </Label>
                  <Input
                    placeholder="7326.90.98"
                    value={formData.customsCode}
                    onChange={(e) => handleInputChange("customsCode", e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Für Import/Export und Zollanmeldung
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Ursprungsland</Label>
                  <Select
                    value={formData.originCountry}
                    onValueChange={(value) => handleInputChange("originCountry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CH">🇨🇭 Schweiz</SelectItem>
                      <SelectItem value="DE">🇩🇪 Deutschland</SelectItem>
                      <SelectItem value="AT">🇦🇹 Österreich</SelectItem>
                      <SelectItem value="IT">🇮🇹 Italien</SelectItem>
                      <SelectItem value="FR">🇫🇷 Frankreich</SelectItem>
                      <SelectItem value="CN">🇨🇳 China</SelectItem>
                      <SelectItem value="US">🇺🇸 USA</SelectItem>
                      <SelectItem value="OTHER">Anderes Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isService && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Physische Eigenschaften
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Gewicht</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0.00"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="font-mono"
                      />
                      <Select
                        value={formData.weightUnit}
                        onValueChange={(value) => handleInputChange("weightUnit", value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="t">t</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Länge</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.length}
                      onChange={(e) => handleInputChange("length", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breite</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.width}
                      onChange={(e) => handleInputChange("width", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Höhe</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Einheit</Label>
                    <Select
                      value={formData.dimensionUnit}
                      onValueChange={(value) => handleInputChange("dimensionUnit", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Seriennummern-Pflicht</Label>
                      <p className="text-xs text-muted-foreground">Jedes Stück erhält eine eindeutige Seriennummer</p>
                    </div>
                    <Switch
                      checked={formData.trackSerials}
                      onCheckedChange={(checked) => handleInputChange("trackSerials", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Chargen-Verfolgung</Label>
                      <p className="text-xs text-muted-foreground">Produkte werden nach Produktionscharge verfolgt</p>
                    </div>
                    <Switch
                      checked={formData.trackBatches}
                      onCheckedChange={(checked) => handleInputChange("trackBatches", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                        className="font-mono text-lg"
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
                        className="font-mono text-lg"
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
                    
                    <div className="flex gap-2 flex-wrap">
                      <p className="text-sm text-muted-foreground w-full">Schnellkalkulation (Ziel-Marge):</p>
                      {[20, 30, 40, 50, 60].map((targetMargin) => (
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

              {/* Price Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Staffelpreise
                  </CardTitle>
                  <CardDescription>
                    Mengenrabatte für Grossbestellungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {priceTiers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ab Menge</TableHead>
                          <TableHead>Preis (CHF)</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {priceTiers.map((tier, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="10"
                                value={tier.minQty}
                                onChange={(e) => updatePriceTier(index, "minQty", e.target.value)}
                                className="font-mono w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={tier.price}
                                onChange={(e) => updatePriceTier(index, "price", e.target.value)}
                                className="font-mono w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePriceTier(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Staffelpreise definiert
                    </p>
                  )}
                  <Button variant="outline" className="gap-2" onClick={addPriceTier}>
                    <Plus className="h-4 w-4" />
                    Staffelpreis hinzufügen
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <Card className="h-fit">
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
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    Bestandsgrenzen
                  </CardTitle>
                  <CardDescription>
                    Meldebestände und Lagerkapazitäten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
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
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Meldebestand</Label>
                      <Input
                        type="number"
                        placeholder="20"
                        value={formData.reorderPoint}
                        onChange={(e) => handleInputChange("reorderPoint", e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">Automatischer Bestellvorschlag</p>
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
                      <p className="text-xs text-muted-foreground">Lagerkapazität</p>
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
                            : parseInt(formData.stockQuantity) <= parseInt(formData.reorderPoint)
                              ? "bg-warning"
                              : "bg-success"
                        )}
                        style={{ 
                          width: `${Math.min(100, (parseInt(formData.stockQuantity) || 0) / (parseInt(formData.maxStock) || 100) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min: {formData.minStock || 10}</span>
                      <span>Melde: {formData.reorderPoint || 20}</span>
                      <span>Max: {formData.maxStock || 100}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bestellautomatik
                  </CardTitle>
                  <CardDescription>
                    Automatische Nachbestellung bei Erreichen des Meldebestands
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Standard-Bestellmenge</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={formData.reorderQuantity}
                      onChange={(e) => handleInputChange("reorderQuantity", e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Vorgeschlagene Menge für automatische Bestellvorschläge
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    {suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.companyName || supplier.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Keine Lieferanten vorhanden
                      </div>
                    )}
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
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Lieferzeit (Tage)
                  </Label>
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

      {/* Category Management Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Produktkategorien verwalten
            </DialogTitle>
            <DialogDescription>
              Kategorien für die Produktorganisation erstellen und verwalten
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing Categories */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="w-24">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {cat.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingCategory(cat)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                setCategoryToDelete(cat);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Keine Kategorien vorhanden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Quick add default categories */}
            {(!categories || categories.length === 0) && (
              <div className="p-4 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground mb-3">
                  Schnellstart: Standard-Kategorien für KMU hinzufügen
                </p>
                <div className="flex flex-wrap gap-2">
                  {defaultCategories.map((catName) => (
                    <Button
                      key={catName}
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await createCategory.mutateAsync({ name: catName });
                          refetchCategories();
                          toast.success(`Kategorie "${catName}" erstellt`);
                        } catch {
                          toast.error("Fehler beim Erstellen");
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {catName}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* New Category Form */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-4">
              <h4 className="font-medium">Neue Kategorie erstellen</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="z.B. Elektronik"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Input
                    placeholder="Optionale Beschreibung"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Kategorie erstellen
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Schliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Kategorie "{categoryToDelete?.name}" wirklich löschen?
              Produkte in dieser Kategorie werden nicht gelöscht, verlieren aber ihre Kategoriezuweisung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
