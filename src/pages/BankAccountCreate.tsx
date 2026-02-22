import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, Save } from "lucide-react";
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

export default function BankAccountCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    bank: "",
    iban: "",
    bic: "",
    type: "",
    currency: "CHF",
    openingBalance: "",
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bank || !formData.iban) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus (Bezeichnung, Bank, IBAN)");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await api.post("/bank-accounts", {
        name: formData.name.trim(),
        bankName: formData.bank.trim(),
        iban: formData.iban.replace(/\s/g, "").trim(),
        bic: formData.bic?.trim() || undefined,
        currency: formData.currency || "CHF",
        balance: formData.openingBalance ? parseFloat(formData.openingBalance) : 0,
        isDefault: formData.isDefault,
      });
      await queryClient.invalidateQueries({ queryKey: ["/bank-accounts"] });
      toast.success("Bankkonto erfolgreich angelegt");
      navigate("/bank-accounts");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Fehler beim Anlegen";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/bank-accounts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neues Bankkonto
          </h1>
          <p className="text-muted-foreground">
            Bankkonto für den Zahlungsverkehr anlegen
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
              <Label htmlFor="bank">Bank / Institut *</Label>
              <Input
                id="bank"
                placeholder="z.B. Deutsche Bank"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
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
              <Label htmlFor="type">Kontotyp</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kontotyp wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Girokonto</SelectItem>
                  <SelectItem value="savings">Sparkonto</SelectItem>
                  <SelectItem value="credit">Kreditkarte</SelectItem>
                </SelectContent>
              </Select>
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
          <Button type="button" variant="outline" onClick={() => navigate("/bank-accounts")}>
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
