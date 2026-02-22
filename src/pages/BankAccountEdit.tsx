import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function BankAccountEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    iban: "",
    bic: "",
    currency: "CHF",
    isDefault: false,
  });

  useEffect(() => {
    if (!id) return;
    api
      .get<any>(`/bank-accounts/${id}`)
      .then((data) => {
        setFormData({
          name: data.name ?? "",
          bankName: data.bankName ?? "",
          iban: data.iban ?? "",
          bic: data.bic ?? "",
          currency: data.currency ?? "CHF",
          isDefault: data.isDefault ?? false,
        });
      })
      .catch(() => toast.error("Bankkonto konnte nicht geladen werden"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.name || !formData.bankName || !formData.iban) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus (Bezeichnung, Bank, IBAN)");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/bank-accounts/${id}`, {
        name: formData.name.trim(),
        bankName: formData.bankName.trim(),
        iban: formData.iban.replace(/\s/g, "").trim(),
        bic: formData.bic?.trim() || undefined,
        currency: formData.currency || "CHF",
        isDefault: formData.isDefault,
      });
      await queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["/bank-accounts"] });
      toast.success("Bankkonto aktualisiert");
      navigate(`/bank-accounts/${id}`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Fehler beim Speichern";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/bank-accounts/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Bankkonto bearbeiten
          </h1>
          <p className="text-muted-foreground">
            Kontodaten anpassen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Landmark className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Kontodaten</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Kontobezeichnung *</Label>
              <Input
                id="name"
                placeholder="z.B. Geschäftskonto Hauptkonto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank / Institut *</Label>
              <Input
                id="bankName"
                placeholder="z.B. Deutsche Bank"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                placeholder="DE89 3704 0044 0532 0130 00"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bic">BIC / SWIFT</Label>
              <Input
                id="bic"
                placeholder="COBADEFFXXX"
                value={formData.bic}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value })}
                className="font-mono"
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
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="CHF">CHF - Schweizer Franken</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - Britisches Pfund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
              />
              <Label htmlFor="isDefault">Als Standardkonto festlegen</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/bank-accounts/${id}`)}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </form>
    </div>
  );
}
