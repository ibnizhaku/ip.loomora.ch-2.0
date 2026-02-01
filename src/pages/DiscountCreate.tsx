import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Percent, Tag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function DiscountCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    usageLimitPerCustomer: "1",
    validFrom: "",
    validUntil: "",
    newCustomersOnly: false,
    combinable: false,
    active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Rabattcode erfolgreich erstellt");
    navigate("/discounts");
  };

  const getTypeIcon = () => {
    switch (formData.type) {
      case "percentage":
        return <Percent className="h-5 w-5" />;
      case "fixed":
        return <Tag className="h-5 w-5" />;
      case "shipping":
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <Percent className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/discounts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neuer Rabattcode</h1>
          <p className="text-muted-foreground">Erstellen Sie einen neuen Rabatt oder Gutschein</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten</CardTitle>
                <CardDescription>Informationen zum Rabattcode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Rabattcode *</Label>
                    <Input
                      id="code"
                      placeholder="z.B. WINTER2024"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Bezeichnung</Label>
                    <Input
                      id="name"
                      placeholder="z.B. Winter-Aktion 2024"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Rabatttyp *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Prozent-Rabatt</SelectItem>
                        <SelectItem value="fixed">Festbetrag</SelectItem>
                        <SelectItem value="shipping">Kostenloser Versand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      {formData.type === "percentage" ? "Rabatt (%)" : formData.type === "fixed" ? "Rabatt (CHF)" : "Versandkosten"}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={formData.type === "shipping" ? "0" : "z.B. 20"}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      disabled={formData.type === "shipping"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bedingungen</CardTitle>
                <CardDescription>Einschränkungen für die Nutzung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderValue">Mindestbestellwert (CHF)</Label>
                    <Input
                      id="minOrderValue"
                      type="number"
                      placeholder="z.B. 50"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Maximaler Rabatt (CHF)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      placeholder="z.B. 100"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Nutzungslimit gesamt</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      placeholder="Unbegrenzt"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageLimitPerCustomer">Limit pro Kunde</Label>
                    <Input
                      id="usageLimitPerCustomer"
                      type="number"
                      placeholder="1"
                      value={formData.usageLimitPerCustomer}
                      onChange={(e) => setFormData({ ...formData, usageLimitPerCustomer: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gültigkeit</CardTitle>
                <CardDescription>Zeitraum für die Nutzung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Gültig ab *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Gültig bis *</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getTypeIcon()}
                  </div>
                  <code className="text-lg font-mono font-bold">
                    {formData.code || "CODE"}
                  </code>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.type === "percentage" && formData.value && `${formData.value}% Rabatt`}
                    {formData.type === "fixed" && formData.value && `CHF ${formData.value} Rabatt`}
                    {formData.type === "shipping" && "Kostenloser Versand"}
                    {!formData.value && formData.type !== "shipping" && "Rabatt definieren"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Sofort aktivieren</Label>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newCustomersOnly">Nur für Neukunden</Label>
                  <Switch
                    id="newCustomersOnly"
                    checked={formData.newCustomersOnly}
                    onCheckedChange={(checked) => setFormData({ ...formData, newCustomersOnly: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="combinable">Mit anderen kombinierbar</Label>
                  <Switch
                    id="combinable"
                    checked={formData.combinable}
                    onCheckedChange={(checked) => setFormData({ ...formData, combinable: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Rabattcode erstellen
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/discounts")}>
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
