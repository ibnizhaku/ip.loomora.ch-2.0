import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, Car, Monitor, Wrench, HardDrive } from "lucide-react";
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

const accounts = [
  { value: "1500", label: "1500 - Maschinen und Apparate" },
  { value: "1510", label: "1510 - Mobiliar und Einrichtungen" },
  { value: "1520", label: "1520 - Büromaschinen, IT" },
  { value: "1530", label: "1530 - Fahrzeuge" },
  { value: "1540", label: "1540 - Werkzeuge und Geräte" },
  { value: "1600", label: "1600 - Geschäftsliegenschaften" },
];

export default function FixedAssetCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    acquisitionDate: "",
    acquisitionCost: "",
    usefulLife: "",
    depreciationMethod: "linear",
    account: "",
    location: "",
    serialNumber: "",
    supplier: "",
    invoiceNumber: "",
    notes: "",
  });

  const handleCategoryChange = (value: string) => {
    const category = categories.find((c) => c.value === value);
    setFormData({
      ...formData,
      category: value,
      usefulLife: category?.usefulLife?.toString() || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.acquisitionDate || !formData.acquisitionCost) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    // Generate inventory number
    const year = new Date().getFullYear();
    const inventoryNumber = `AV-${year}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;

    toast.success(`Anlage ${inventoryNumber} erfolgreich erfasst`);
    navigate("/fixed-assets");
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Lieferant</Label>
                  <Input
                    id="supplier"
                    placeholder="Name des Lieferanten"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Rechnungsnummer</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="z.B. RE-2024-001"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
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
                  <Label htmlFor="account">Anlagekonto</Label>
                  <Select
                    value={formData.account}
                    onValueChange={(value) => setFormData({ ...formData, account: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Konto wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.value} value={acc.value}>
                          {acc.label}
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
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Anlage erfassen
          </Button>
        </div>
      </form>
    </div>
  );
}
