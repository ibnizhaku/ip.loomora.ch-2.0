import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ArrowDownRight, ArrowUpRight } from "lucide-react";
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

const costCenters = [
  { value: "verwaltung", label: "Verwaltung" },
  { value: "vertrieb", label: "Vertrieb" },
  { value: "produktion", label: "Produktion" },
  { value: "fuhrpark", label: "Fuhrpark" },
  { value: "marketing", label: "Marketing" },
];

const taxRates = [
  { value: "0", label: "0% (steuerfrei)" },
  { value: "2.6", label: "2.6% (reduziert)" },
  { value: "3.8", label: "3.8% (Beherbergung)" },
  { value: "8.1", label: "8.1% (Normalsatz)" },
];

const incomeCategories = [
  { value: "barverkauf", label: "Barverkauf" },
  { value: "bankabhebung", label: "Bankabhebung" },
  { value: "sonstiges", label: "Sonstige Einnahme" },
];

const expenseCategories = [
  { value: "material", label: "Büromaterial" },
  { value: "porto", label: "Porto & Versand" },
  { value: "bewirtung", label: "Bewirtung" },
  { value: "tanken", label: "Tankquittung" },
  { value: "bank", label: "Bankeinzahlung" },
  { value: "sonstiges", label: "Sonstige Ausgabe" },
];

export default function CashBookCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available cash registers
  const { data: registersData } = useQuery({
    queryKey: ["/cash-book/registers"],
    queryFn: () => api.get<any>("/cash-book/registers"),
  });
  const registers = registersData?.data || registersData || [];
  const defaultRegister = registers[0];

  const [formData, setFormData] = useState({
    type: "" as "income" | "expense" | "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    category: "",
    taxRate: "8.1",
    costCenter: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.amount || !formData.description) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    if (!defaultRegister) {
      toast.error("Keine Kasse gefunden. Bitte zuerst eine Kasse anlegen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const vatRateMap: Record<string, string> = {
        "0": "EXEMPT",
        "2.6": "REDUCED",
        "3.8": "SPECIAL",
        "8.1": "STANDARD",
      };

      const payload = {
        date: formData.date,
        type: formData.type === "income" ? "RECEIPT" : "PAYMENT",
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category || undefined,
        vatRate: vatRateMap[formData.taxRate] || "STANDARD",
        reference: formData.notes || undefined,
      };

      const result = await api.post<any>(
        `/cash-book/registers/${defaultRegister.id}/transactions`,
        payload
      );

      const docNumber = result?.number || `KB-${new Date().getFullYear()}-XXX`;
      toast.success(`Kassenbuchung ${docNumber} erfasst`);
      navigate("/cash-book");
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Speichern der Kassenbuchung");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = formData.type === "income" ? incomeCategories : expenseCategories;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cash-book")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neue Kassenbuchung
          </h1>
          <p className="text-muted-foreground">
            Bargeldtransaktion erfassen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hauptdaten */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Buchungsdaten</CardTitle>
              <CardDescription>Art und Details der Transaktion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buchungsart */}
              <div className="space-y-2">
                <Label>Buchungsart *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                      formData.type === "income"
                        ? "border-success bg-success/5"
                        : "border-border hover:border-success/50"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <ArrowDownRight className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Einnahme</p>
                      <p className="text-sm text-muted-foreground">Geld in die Kasse</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                      formData.type === "expense"
                        ? "border-destructive bg-destructive/5"
                        : "border-border hover:border-destructive/50"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                      <ArrowUpRight className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Ausgabe</p>
                      <p className="text-sm text-muted-foreground">Geld aus der Kasse</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Betrag (CHF) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.05"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Input
                  id="description"
                  placeholder="z.B. Büromaterial Papeterie"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {formData.type && (
                <div className="space-y-2">
                  <Label htmlFor="category">Kategorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Bemerkungen</Label>
                <Textarea
                  id="notes"
                  placeholder="Zusätzliche Informationen..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Steuer & Kostenstelle */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>MWST</CardTitle>
                <CardDescription>Schweizer Mehrwertsteuer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Steuersatz</Label>
                  <Select
                    value={formData.taxRate}
                    onValueChange={(value) => setFormData({ ...formData, taxRate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taxRates.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.amount && parseFloat(formData.taxRate) > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Netto</span>
                      <span className="font-mono">
                        CHF {(parseFloat(formData.amount) / (1 + parseFloat(formData.taxRate) / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>MWST ({formData.taxRate}%)</span>
                      <span className="font-mono">
                        CHF {(parseFloat(formData.amount) - parseFloat(formData.amount) / (1 + parseFloat(formData.taxRate) / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Brutto</span>
                      <span className="font-mono">CHF {parseFloat(formData.amount).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kostenstelle</CardTitle>
                <CardDescription>Zuordnung für Kostenrechnung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="costCenter">Kostenstelle</Label>
                  <Select
                    value={formData.costCenter}
                    onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {costCenters.map((cc) => (
                        <SelectItem key={cc.value} value={cc.value}>
                          {cc.label}
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
          <Button type="button" variant="outline" onClick={() => navigate("/cash-book")}>
            Abbrechen
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            {isSubmitting ? "Wird gespeichert..." : "Buchung erfassen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
