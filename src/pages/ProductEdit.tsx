import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useProduct, useUpdateProduct, useProductCategories } from "@/hooks/use-products";
import { useSuppliers } from "@/hooks/use-suppliers";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rawProduct, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const { data: categories } = useProductCategories();
  const { data: suppliersData } = useSuppliers({ pageSize: 100 });
  const suppliers = suppliersData?.data || [];

  const product = (rawProduct as any)?.data || rawProduct;

  const [formData, setFormData] = useState({
    name: "", sku: "", description: "", unit: "Stk",
    salePrice: "", purchasePrice: "", vatRate: "STANDARD",
    stockQuantity: "0", minStock: "10",
    categoryId: "", supplierId: "",
    isService: false, isActive: true, notes: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        unit: product.unit || "Stk",
        salePrice: String(product.salePrice || product.price || ""),
        purchasePrice: String(product.purchasePrice || product.costPrice || ""),
        vatRate: product.vatRate || "STANDARD",
        stockQuantity: String(product.stockQuantity ?? product.stock ?? 0),
        minStock: String(product.minStockQuantity ?? product.minStock ?? 10),
        categoryId: product.categoryId || (typeof product.category === "object" ? product.category?.id : "") || "",
        supplierId: product.supplierId || "",
        isService: product.isService || false,
        isActive: product.isActive !== false,
        notes: product.notes || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateProduct.mutateAsync({
        id,
        data: {
          name: formData.name,
          sku: formData.sku || undefined,
          description: formData.description || undefined,
          unit: formData.unit,
          salePrice: parseFloat(formData.salePrice) || 0,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          vatRate: formData.vatRate as any,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          minStock: parseInt(formData.minStock) || 0,
          isService: formData.isService,
          categoryId: formData.categoryId || undefined,
          supplierId: formData.supplierId || undefined,
        },
      });
      toast.success("Produkt aktualisiert");
      navigate(`/products/${id}`);
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/products"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-display text-2xl font-bold">Produkt nicht gefunden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/products/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">Produkt bearbeiten</h1>
          <p className="text-muted-foreground">{product.name} — {product.sku || id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Stammdaten</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Artikelnummer (SKU)</Label>
                  <Input value={formData.sku} onChange={(e) => handleChange("sku", e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => handleChange("categoryId", v)}>
                    <SelectTrigger><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Produktname *</Label>
                <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Select value={formData.unit} onValueChange={(v) => handleChange("unit", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stk">Stück</SelectItem>
                    <SelectItem value="m">Meter</SelectItem>
                    <SelectItem value="m²">Quadratmeter</SelectItem>
                    <SelectItem value="kg">Kilogramm</SelectItem>
                    <SelectItem value="h">Stunden</SelectItem>
                    <SelectItem value="Psch">Pauschale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.isService} onCheckedChange={(v) => handleChange("isService", v)} />
                <Label>Dienstleistung</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.isActive} onCheckedChange={(v) => handleChange("isActive", v)} />
                <Label>Aktiv</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Preise</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Einkaufspreis (CHF)</Label>
                    <Input type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => handleChange("purchasePrice", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Verkaufspreis (CHF) *</Label>
                    <Input type="number" step="0.01" value={formData.salePrice} onChange={(e) => handleChange("salePrice", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>MwSt.-Satz</Label>
                  <Select value={formData.vatRate} onValueChange={(v) => handleChange("vatRate", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">8.1% Normalsatz</SelectItem>
                      <SelectItem value="REDUCED">2.6% Reduziert</SelectItem>
                      <SelectItem value="ZERO">0% Befreit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {!formData.isService && (
              <Card>
                <CardHeader><CardTitle>Lager</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Bestand</Label>
                      <Input type="number" value={formData.stockQuantity} onChange={(e) => handleChange("stockQuantity", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mindestbestand</Label>
                      <Input type="number" value={formData.minStock} onChange={(e) => handleChange("minStock", e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>Lieferant</CardTitle></CardHeader>
              <CardContent>
                <Select value={formData.supplierId} onValueChange={(v) => handleChange("supplierId", v)}>
                  <SelectTrigger><SelectValue placeholder="Lieferant wählen" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.companyName || s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/products/${id}`)} disabled={updateProduct.isPending}>Abbrechen</Button>
          <Button type="submit" className="gap-2" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Änderungen speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
