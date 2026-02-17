import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Target, Loader2 } from "lucide-react";
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
import { useCostCenters, useCreateCostCenter } from "@/hooks/use-cost-centers";
import { useEmployees } from "@/hooks/use-employees";

export default function CostCenterCreate() {
  const navigate = useNavigate();
  const createCostCenter = useCreateCostCenter();

  const { data: costCentersData, isLoading: ccLoading } = useCostCenters({ pageSize: 100 });
  const { data: employeesData, isLoading: empLoading } = useEmployees({ pageSize: 100 });

  const parentCostCenters = useMemo(() => {
    const items = (costCentersData as any)?.data || costCentersData || [];
    return Array.isArray(items) ? items : [];
  }, [costCentersData]);

  const employees = useMemo(() => {
    const items = (employeesData as any)?.data || employeesData || [];
    return Array.isArray(items) ? items : [];
  }, [employeesData]);

  const [formData, setFormData] = useState({
    number: "",
    name: "",
    parentId: "",
    managerId: "",
    budgetAmount: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.number || !formData.name) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    try {
      await createCostCenter.mutateAsync({
        code: formData.number,
        name: formData.name,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined,
        managerId: formData.managerId || undefined,
        budget: formData.budgetAmount ? parseFloat(formData.budgetAmount) : undefined,
      } as any);
      toast.success(`Kostenstelle ${formData.number} erfolgreich angelegt`);
      navigate("/cost-centers");
    } catch {
      toast.error("Fehler beim Anlegen der Kostenstelle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/cost-centers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neue Kostenstelle anlegen
          </h1>
          <p className="text-muted-foreground">
            Verantwortungsbereich für Kostenrechnung definieren
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stammdaten */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Stammdaten</CardTitle>
              <CardDescription>Grundlegende Informationen zur Kostenstelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="number">Kostenstellennummer *</Label>
                  <Input
                    id="number"
                    placeholder="z.B. 1000"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Eindeutige Nummer für die Kostenstelle
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Bezeichnung *</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Produktion Halle A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parentId">Übergeordnete Kostenstelle</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={ccLoading ? "Laden..." : "Optional zuordnen"} />
                    </SelectTrigger>
                    <SelectContent>
                      {parentCostCenters.map((cc: any) => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.code || cc.number ? `${cc.code || cc.number} - ` : ""}{cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerId">Verantwortlich</Label>
                  <Select
                    value={formData.managerId}
                    onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={empLoading ? "Laden..." : "Verantwortlichen wählen..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Aufgabenbereich und Zuständigkeiten beschreiben..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budgetplanung</CardTitle>
                <CardDescription>Jahresbudget für Kostenstelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Jahresbudget (CHF)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  />
                </div>

                {formData.budgetAmount && (
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monatsbudget</span>
                      <span className="font-mono font-medium">
                        CHF {(parseFloat(formData.budgetAmount) / 12).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quartalsbudget</span>
                      <span className="font-mono font-medium">
                        CHF {(parseFloat(formData.budgetAmount) / 4).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontierung</CardTitle>
                <CardDescription>Automatische Zuordnung</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Kostenrechnung</p>
                    <p className="text-muted-foreground">
                      Buchungen werden automatisch dieser Kostenstelle zugeordnet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/cost-centers")}>
            Abbrechen
          </Button>
          <Button type="submit" className="gap-2" disabled={createCostCenter.isPending}>
            {createCostCenter.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kostenstelle anlegen
          </Button>
        </div>
      </form>
    </div>
  );
}
