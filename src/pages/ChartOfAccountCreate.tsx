import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Save, Info, Loader2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCreateAccount } from "@/hooks/use-finance";

const TYPE_OPTIONS = [
  { value: "ASSET", label: "Aktiven" },
  { value: "LIABILITY", label: "Passiven" },
  { value: "EQUITY", label: "Eigenkapital" },
  { value: "REVENUE", label: "Erlöse" },
  { value: "EXPENSE", label: "Aufwand" },
];

export default function ChartOfAccountCreate() {
  const navigate = useNavigate();
  const createAccount = useCreateAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: accountsData } = useQuery({
    queryKey: ["/finance/accounts"],
    queryFn: () => api.get<any>("/finance/accounts?pageSize=500"),
  });
  const accounts = (accountsData as any)?.data ?? [];

  const [formData, setFormData] = useState({
    number: "",
    name: "",
    type: "ASSET",
    parentId: "__none__",
    description: "",
    taxRelevant: false,
    costCenterRequired: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number || !formData.name) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAccount.mutateAsync({
        number: formData.number.trim(),
        name: formData.name.trim(),
        type: formData.type as any,
        parentId: formData.parentId && formData.parentId !== "__none__" ? formData.parentId : undefined,
        description: formData.description?.trim() || undefined,
      });
      toast.success("Konto erfolgreich angelegt");
      navigate("/chart-of-accounts");
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Anlegen des Kontos");
    } finally {
      setIsSubmitting(false);
    }
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
              <Label htmlFor="type">Kontotyp *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Übergeordnetes Konto (optional)</Label>
              <Select
                value={formData.parentId || "__none__"}
                onValueChange={(v) => setFormData({ ...formData, parentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Konto auswählen (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Keines —</SelectItem>
                  {accounts.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="font-mono mr-2">{a.number}</span>
                      {a.name}
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
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Wird gespeichert..." : "Konto anlegen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
