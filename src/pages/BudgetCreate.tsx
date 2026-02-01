import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Target, Calculator } from "lucide-react";
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
import { toast } from "sonner";

const categories = [
  { value: "operating", label: "Betriebskosten (OPEX)" },
  { value: "capex", label: "Investitionen (CAPEX)" },
  { value: "personnel", label: "Personalkosten" },
  { value: "marketing", label: "Marketing & Vertrieb" },
  { value: "it", label: "IT & Technologie" },
  { value: "administration", label: "Verwaltung" },
  { value: "research", label: "Forschung & Entwicklung" },
];

const periods = [
  { value: "2024", label: "Geschäftsjahr 2024" },
  { value: "2025", label: "Geschäftsjahr 2025" },
  { value: "q1-2024", label: "Q1 2024" },
  { value: "q2-2024", label: "Q2 2024" },
  { value: "q3-2024", label: "Q3 2024" },
  { value: "q4-2024", label: "Q4 2024" },
];

const costCenters = [
  { value: "1000", label: "1000 - Produktion" },
  { value: "2000", label: "2000 - Vertrieb" },
  { value: "3000", label: "3000 - Verwaltung" },
  { value: "4000", label: "4000 - IT" },
  { value: "5000", label: "5000 - Marketing" },
];

export default function BudgetCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    period: "2024",
    costCenter: "",
    plannedAmount: "",
    description: "",
    responsible: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.plannedAmount) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    toast.success("Budget erfolgreich angelegt");
    navigate("/budgets");
  };

  const plannedAmount = parseFloat(formData.plannedAmount) || 0;
  const monthlyBudget = plannedAmount / 12;
  const quarterlyBudget = plannedAmount / 4;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/budgets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Budget anlegen
          </h1>
          <p className="text-muted-foreground">
            Neues Budget für die Budgetverwaltung erfassen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Budget-Grunddaten
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Budgetname *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Marketing & Werbung"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie wählen" />
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
                <div>
                  <Label htmlFor="period">Budgetperiode *</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="costCenter">Kostenstelle</Label>
                  <Select
                    value={formData.costCenter}
                    onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional zuordnen" />
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
                <div>
                  <Label htmlFor="responsible">Verantwortlich</Label>
                  <Input
                    id="responsible"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Name des Budgetverantwortlichen"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Budgetbetrag
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="plannedAmount">Geplantes Budget (CHF) *</Label>
                  <Input
                    id="plannedAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.plannedAmount}
                    onChange={(e) => setFormData({ ...formData, plannedAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Beschreibung / Verwendungszweck</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Wofür wird dieses Budget verwendet?"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Budgetübersicht</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Jahresbudget</p>
                  <p className="text-2xl font-bold text-primary">
                    CHF {plannedAmount.toLocaleString("de-CH")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Pro Quartal</p>
                    <p className="font-semibold">
                      CHF {quarterlyBudget.toLocaleString("de-CH", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Pro Monat</p>
                    <p className="font-semibold">
                      CHF {monthlyBudget.toLocaleString("de-CH", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                {formData.category && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Kategorie</p>
                    <p className="font-medium">
                      {categories.find(c => c.value === formData.category)?.label}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                <Button type="submit" className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Speichern
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/budgets")}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
