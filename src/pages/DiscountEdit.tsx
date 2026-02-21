import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Percent, Tag, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDiscount, useUpdateDiscount } from "@/hooks/use-ecommerce";

export default function DiscountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: discount, isLoading } = useDiscount(id);
  const updateDiscount = useUpdateDiscount();
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

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code || "",
        name: discount.name || "",
        type: discount.type || "percentage",
        value: String(discount.value ?? ""),
        minOrderValue: discount.minOrderValue ? String(discount.minOrderValue) : "",
        maxDiscount: "",
        usageLimit: discount.maxUses ? String(discount.maxUses) : "",
        usageLimitPerCustomer: "1",
        validFrom: discount.validFrom?.split("T")[0] || "",
        validUntil: discount.validUntil?.split("T")[0] || "",
        newCustomersOnly: false,
        combinable: false,
        active: discount.isActive ?? true,
      });
    }
  }, [discount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.code.trim()) {
      toast.error("Rabattcode ist erforderlich");
      return;
    }
    if (!formData.validFrom || !formData.validUntil) {
      toast.error("Gültigkeitszeitraum ist erforderlich");
      return;
    }
    try {
      await updateDiscount.mutateAsync({
        id,
        data: {
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim() || formData.code,
          type: formData.type,
          value: formData.type === "shipping" ? 0 : parseFloat(formData.value) || 0,
          minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : undefined,
          maxUses: formData.usageLimit ? parseInt(formData.usageLimit, 10) : undefined,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          isActive: formData.active,
        },
      });
      toast.success("Rabatt aktualisiert");
      navigate(`/discounts/${id}`);
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Speichern");
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/discounts")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <p className="text-muted-foreground">Rabatt nicht gefunden</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/discounts/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rabatt bearbeiten</h1>
          <p className="text-muted-foreground">{discount.code}</p>
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
                  <Label htmlFor="active">Aktiv</Label>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={updateDiscount.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/discounts/${id}`)}>
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
