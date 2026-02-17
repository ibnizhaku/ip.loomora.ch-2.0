import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Target, Calculator, Loader2 } from "lucide-react";
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
import { useCostCenters } from "@/hooks/use-cost-centers";
import { useCreateBudget } from "@/hooks/use-budgets";
import { useAccounts } from "@/hooks/use-finance";

const periodTypes = [
  { value: "YEARLY", label: "Jährlich" },
  { value: "QUARTERLY", label: "Quartalsweise" },
  { value: "MONTHLY", label: "Monatlich" },
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

const quarters = [
  { value: "1", label: "Q1" },
  { value: "2", label: "Q2" },
  { value: "3", label: "Q3" },
  { value: "4", label: "Q4" },
];

const months = [
  { value: "1", label: "Januar" }, { value: "2", label: "Februar" },
  { value: "3", label: "März" }, { value: "4", label: "April" },
  { value: "5", label: "Mai" }, { value: "6", label: "Juni" },
  { value: "7", label: "Juli" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "Oktober" },
  { value: "11", label: "November" }, { value: "12", label: "Dezember" },
];

export default function BudgetCreate() {
  const navigate = useNavigate();
  const createBudget = useCreateBudget();
  const { data: costCentersData, isLoading: costCentersLoading } = useCostCenters({ pageSize: 100 });
  const { data: accountsData, isLoading: accountsLoading } = useAccounts({});

  const costCenters = useMemo(() => {
    const items = costCentersData?.data || costCentersData || [];
    return Array.isArray(items) ? items : [];
  }, [costCentersData]);

  const accounts = useMemo(() => {
    const items = accountsData?.data || accountsData || [];
    return Array.isArray(items) ? items : [];
  }, [accountsData]);

  const [formData, setFormData] = useState({
    name: "",
    accountId: "",
    period: "YEARLY",
    year: String(currentYear),
    quarter: "",
    month: "",
    costCenter: "",
    plannedAmount: "",
    description: "",
    responsible: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.plannedAmount) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    try {
      await createBudget.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        period: formData.period as any,
        year: parseInt(formData.year),
        lines: [{
          accountId: formData.accountId || undefined as any,
          amount: parseFloat(formData.plannedAmount),
        }],
      });
      toast.success("Budget erfolgreich angelegt");
      navigate("/budgets");
    } catch {
      toast.error("Fehler beim Anlegen des Budgets");
    }
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
                  <Label htmlFor="accountId">Konto</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={accountsLoading ? "Laden..." : "Konto wählen"} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.code ? `${acc.code} - ` : ""}{acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="period">Budgetperiode *</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => setFormData({ ...formData, period: value, quarter: "", month: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodTypes.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Jahr *</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData({ ...formData, year: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.period === "QUARTERLY" && (
                  <div>
                    <Label>Quartal *</Label>
                    <Select
                      value={formData.quarter}
                      onValueChange={(value) => setFormData({ ...formData, quarter: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Quartal wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {quarters.map((q) => (
                          <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.period === "MONTHLY" && (
                  <div>
                    <Label>Monat *</Label>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData({ ...formData, month: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Monat wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="costCenter">Kostenstelle</Label>
                  <Select
                    value={formData.costCenter}
                    onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={costCentersLoading ? "Laden..." : "Optional zuordnen"} />
                    </SelectTrigger>
                    <SelectContent>
                      {costCenters.map((cc: any) => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.code ? `${cc.code} - ` : ""}{cc.name}
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
                {formData.period && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Periode</p>
                    <p className="font-medium">
                      {periodTypes.find(p => p.value === formData.period)?.label} {formData.year}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                <Button type="submit" className="flex-1 gap-2" disabled={createBudget.isPending}>
                  {createBudget.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
