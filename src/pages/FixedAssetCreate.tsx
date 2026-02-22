import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, Car, Monitor, Wrench, HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORY_MAP: Record<string, string> = {
  buildings: "BUILDINGS",
  machinery: "MACHINERY",
  vehicles: "VEHICLES",
  equipment: "FURNITURE",
  software: "SOFTWARE",
};

const categories = [
  { value: "buildings", label: "Gebäude & Grundstücke", icon: Building2, usefulLife: 33 },
  { value: "machinery", label: "Maschinen & Anlagen", icon: Wrench, usefulLife: 10 },
  { value: "vehicles", label: "Fahrzeuge", icon: Car, usefulLife: 6 },
  { value: "equipment", label: "Betriebs- & Geschäftsausstattung", icon: Monitor, usefulLife: 8 },
  { value: "software", label: "Software & IT", icon: HardDrive, usefulLife: 4 },
];

const depreciationMethods = [
  { value: "linear", label: "Linear (gleichmässig)" },
  { value: "degressive", label: "Degressiv (abnehmend)" },
];

export default function FixedAssetCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    acquisitionDate: "",
    acquisitionCost: "",
    usefulLife: "",
    depreciationMethod: "linear",
    assetAccountId: "",
    costCenterId: "",
    purchaseInvoiceId: "",
    location: "",
    serialNumber: "",
    notes: "",
  });

  const { data: purchaseInvoicesData } = useQuery({
    queryKey: ["/purchase-invoices"],
    queryFn: () => api.get<any>("/purchase-invoices?pageSize=200"),
  });
  const { data: costCentersData } = useQuery({
    queryKey: ["/cost-centers"],
    queryFn: () => api.get<any>("/cost-centers?pageSize=100"),
  });
  const { data: accountsData } = useQuery({
    queryKey: ["/finance/accounts"],
    queryFn: () => api.get<any>("/finance/accounts?pageSize=500"),
  });

  const purchaseInvoices = (purchaseInvoicesData as any)?.data ?? [];
  const costCenters = (costCentersData as any)?.data ?? [];
  const chartAccounts = (accountsData as any)?.data ?? [];
  const assetAccounts = chartAccounts.filter((a: any) => ["ASSET", "asset"].includes(a.type?.toUpperCase()));

  const handleCategoryChange = (value: string) => {
    const category = categories.find((c) => c.value === value);
    setFormData({
      ...formData,
      category: value,
      usefulLife: category?.usefulLife?.toString() || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.acquisitionDate || !formData.acquisitionCost || !formData.usefulLife) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/fixed-assets", {
        name: formData.name.trim(),
        category: CATEGORY_MAP[formData.category] || formData.category.toUpperCase(),
        acquisitionDate: formData.acquisitionDate,
        acquisitionCost: parseFloat(formData.acquisitionCost),
        usefulLife: parseInt(formData.usefulLife, 10),
        depreciationMethod: formData.depreciationMethod === "degressive" ? "DECLINING" : "LINEAR",
        serialNumber: formData.serialNumber?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        purchaseInvoiceId: formData.purchaseInvoiceId || undefined,
        costCenterId: formData.costCenterId || undefined,
        assetAccountId: formData.assetAccountId || undefined,
        description: formData.notes?.trim() || undefined,
      });
      toast.success("Anlage erfolgreich erfasst");
      navigate(`/fixed-assets/${res?.id || ""}`);
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.value === formData.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/fixed-assets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neue Anlage erfassen
          </h1>
          <p className="text-muted-foreground">
            Anlagegut zum Anlagevermögen hinzufügen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hauptdaten */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Anlagedaten</CardTitle>
              <CardDescription>Grundlegende Informationen zur Anlage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bezeichnung *</Label>
                <Input
                  id="name"
                  placeholder="z.B. CNC-Fräsmaschine Typ XY"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Kategorie *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategoryChange(cat.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                          formData.category === cat.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs text-center">{cat.label.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedCategory && (
                  <p className="text-sm text-muted-foreground">
                    Gewählt: {selectedCategory.label} (Standard-ND: {selectedCategory.usefulLife} Jahre)
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate">Anschaffungsdatum *</Label>
                  <Input
                    id="acquisitionDate"
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisitionCost">Anschaffungskosten (CHF) *</Label>
                  <Input
                    id="acquisitionCost"
                    type="number"
                    placeholder="0.00"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Standort</Label>
                  <Input
                    id="location"
                    placeholder="z.B. Produktionshalle A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Seriennummer</Label>
                  <Input
                    id="serialNumber"
                    placeholder="z.B. SN-123456"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Einkaufsrechnung (Lieferant)</Label>
                <Select
                  value={formData.purchaseInvoiceId || "__none__"}
                  onValueChange={(v) => setFormData({ ...formData, purchaseInvoiceId: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rechnung auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {purchaseInvoices.map((inv: any) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.number} – {inv.supplier?.name || "—"} – CHF {(inv.totalAmount ?? 0).toLocaleString("de-CH")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Bemerkungen</Label>
                <Textarea
                  id="notes"
                  placeholder="Zusätzliche Informationen zur Anlage..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Abschreibung */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Abschreibung (AfA)</CardTitle>
                <CardDescription>Parameter für die Wertminderung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usefulLife">Nutzungsdauer (Jahre)</Label>
                  <Input
                    id="usefulLife"
                    type="number"
                    placeholder="z.B. 10"
                    value={formData.usefulLife}
                    onChange={(e) => setFormData({ ...formData, usefulLife: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Gemäss Schweizer Steuerrichtlinien
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depreciationMethod">Abschreibungsmethode</Label>
                  <Select
                    value={formData.depreciationMethod}
                    onValueChange={(value) => setFormData({ ...formData, depreciationMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {depreciationMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.acquisitionCost && formData.usefulLife && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-sm font-medium">Jährliche AfA</p>
                    <p className="text-2xl font-bold text-primary">
                      CHF {(parseFloat(formData.acquisitionCost) / parseInt(formData.usefulLife)).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((100 / parseInt(formData.usefulLife))).toFixed(1)}% pro Jahr
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Buchhaltung</CardTitle>
                <CardDescription>Kontenzuordnung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Anlagekonto</Label>
                  <Select
                    value={formData.assetAccountId || "__none__"}
                    onValueChange={(v) => setFormData({ ...formData, assetAccountId: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Konto wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {assetAccounts.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.number} – {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Kostenstelle</Label>
                  <Select
                    value={formData.costCenterId || "__none__"}
                    onValueChange={(v) => setFormData({ ...formData, costCenterId: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {costCenters.map((cc: any) => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.number} – {cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/fixed-assets")}>
            Abbrechen
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Wird gespeichert..." : "Anlage erfassen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
