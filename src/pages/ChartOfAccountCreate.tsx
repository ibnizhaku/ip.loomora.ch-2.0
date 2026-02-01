import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Save, Info } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const parentAccounts = [
  { id: "1", number: "1", name: "Aktiven" },
  { id: "2", number: "2", name: "Passiven" },
  { id: "3", number: "28", name: "Eigenkapital" },
  { id: "4", number: "3", name: "Betriebsertrag aus Lieferungen und Leistungen" },
  { id: "5", number: "4", name: "Aufwand für Material, Handelswaren, Dienstleistungen" },
  { id: "6", number: "5", name: "Personalaufwand" },
  { id: "7", number: "6", name: "Übriger betrieblicher Aufwand" },
  { id: "8", number: "7", name: "Betrieblicher Nebenerfolg" },
  { id: "9", number: "8", name: "Betriebsfremder und ausserordentlicher Erfolg" },
  { id: "10", number: "9", name: "Abschluss" },
];

export default function ChartOfAccountCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    number: "",
    name: "",
    type: "",
    parentId: "",
    currency: "CHF",
    openingBalance: "",
    description: "",
    taxRelevant: false,
    costCenterRequired: false,
  });

  const getAccountType = (parentId: string) => {
    switch (parentId) {
      case "1": return "asset";
      case "2": return "liability";
      case "3": return "equity";
      case "4": return "revenue";
      case "5":
      case "6":
      case "7": return "expense";
      default: return "";
    }
  };

  const handleParentChange = (parentId: string) => {
    const type = getAccountType(parentId);
    setFormData({ ...formData, parentId, type });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number || !formData.name || !formData.parentId) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Konto erfolgreich angelegt");
      navigate("/chart-of-accounts");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chart-of-accounts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neues Konto anlegen
          </h1>
          <p className="text-muted-foreground">
            Konto im Schweizer Kontenrahmen KMU erstellen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Kontodaten</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parentId">Übergeordnete Kontogruppe *</Label>
              <Select
                value={formData.parentId}
                onValueChange={handleParentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kontogruppe wählen" />
                </SelectTrigger>
                <SelectContent>
                  {parentAccounts.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      <span className="font-mono mr-2">{parent.number}</span>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Kontonummer *</Label>
              <Input
                id="number"
                placeholder="z.B. 1025"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                4-stellig nach Schweizer Kontenrahmen KMU
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Kontobezeichnung *</Label>
              <Input
                id="name"
                placeholder="z.B. Bank Raiffeisen"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Währung</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">CHF - Schweizer Franken</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openingBalance">Anfangssaldo</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Beschreibung / Verwendungszweck</Label>
              <Textarea
                id="description"
                placeholder="Optionale Beschreibung des Kontos..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
              <Info className="h-5 w-5 text-info" />
            </div>
            <h2 className="font-display text-lg font-semibold">Erweiterte Einstellungen</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">MWST-relevant</p>
                <p className="text-sm text-muted-foreground">
                  Konto wird für MWST-Abrechnung berücksichtigt
                </p>
              </div>
              <Switch
                checked={formData.taxRelevant}
                onCheckedChange={(checked) => setFormData({ ...formData, taxRelevant: checked })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Kostenstelle erforderlich</p>
                <p className="text-sm text-muted-foreground">
                  Bei Buchung muss Kostenstelle angegeben werden
                </p>
              </div>
              <Switch
                checked={formData.costCenterRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, costCenterRequired: checked })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/chart-of-accounts")}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Wird gespeichert..." : "Konto anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
