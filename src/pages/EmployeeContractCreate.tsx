import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileSignature, User, Clock, Coins, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// GAV Metallbau Lohnklassen mit Mindestlöhnen 2024
const gavClasses = [
  { value: "A", label: "Klasse A - Kader/Spezialisten", minSalary: 7500, description: "Führungskräfte, Spezialisten mit besonderen Qualifikationen" },
  { value: "B", label: "Klasse B - Facharbeiter mit BM", minSalary: 6200, description: "Metallbauer EFZ mit Berufsmatur oder >5 Jahre Erfahrung" },
  { value: "C", label: "Klasse C - Facharbeiter EFZ", minSalary: 5400, description: "Metallbauer/Metallbaukonstrukteur EFZ" },
  { value: "D", label: "Klasse D - Angelernte", minSalary: 4600, description: "Angelernte Mitarbeiter mit Branchenerfahrung" },
  { value: "E", label: "Klasse E - Hilfskräfte", minSalary: 4200, description: "Hilfskräfte ohne Berufsausbildung" },
  { value: "F", label: "Klasse F - Lernende", minSalary: 700, description: "Lernende im 1.-4. Lehrjahr" },
];

const contractTypes = [
  { value: "unbefristet", label: "Unbefristet" },
  { value: "befristet", label: "Befristet" },
  { value: "temporär", label: "Temporär" },
  { value: "praktikum", label: "Praktikum" },
  { value: "lehrvertrag", label: "Lehrvertrag" },
];

const noticePeriods = [
  { value: "7_tage", label: "7 Tage (Probezeit)" },
  { value: "1_monat", label: "1 Monat" },
  { value: "2_monate", label: "2 Monate" },
  { value: "3_monate", label: "3 Monate" },
  { value: "gem_or", label: "Gem. OR (Lehrvertrag)" },
];

// GAV Ferienanspruch nach Alter
const getVacationDays = (age: number): number => {
  if (age < 20) return 25;
  if (age >= 60) return 30;
  if (age >= 50) return 25;
  return 20;
};

const employees = [
  { id: "EMP-007", name: "Neuer Mitarbeiter" },
  { id: "EMP-001", name: "Max Keller" },
  { id: "EMP-002", name: "Anna Meier" },
  { id: "EMP-003", name: "Thomas Brunner" },
];

export default function EmployeeContractCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    contractType: "",
    gavClass: "",
    startDate: "",
    endDate: "",
    probationMonths: "3",
    workload: "100",
    weeklyHours: "42.5",
    baseSalary: "",
    noticePeriod: "2_monate",
    vacationDays: "20",
    has13thSalary: true,
    hasExpenseAllowance: false,
    expenseAllowance: "",
    department: "",
    jobTitle: "",
    workLocation: "",
    notes: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGavClassChange = (value: string) => {
    const gavClass = gavClasses.find(g => g.value === value);
    const workloadFactor = parseFloat(formData.workload) / 100;
    const suggestedSalary = gavClass ? Math.round(gavClass.minSalary * workloadFactor) : "";
    
    setFormData((prev) => ({
      ...prev,
      gavClass: value,
      baseSalary: suggestedSalary.toString(),
    }));
  };

  const handleWorkloadChange = (value: string) => {
    const workload = parseFloat(value) || 100;
    const weeklyHours = (42.5 * workload / 100).toFixed(1);
    const gavClass = gavClasses.find(g => g.value === formData.gavClass);
    const suggestedSalary = gavClass ? Math.round(gavClass.minSalary * workload / 100) : formData.baseSalary;

    setFormData((prev) => ({
      ...prev,
      workload: value,
      weeklyHours,
      baseSalary: suggestedSalary.toString(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.contractType || !formData.gavClass || !formData.startDate || !formData.baseSalary) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    
    const selectedGav = gavClasses.find(g => g.value === formData.gavClass);
    const minSalary = selectedGav ? selectedGav.minSalary * parseFloat(formData.workload) / 100 : 0;
    
    if (parseFloat(formData.baseSalary) < minSalary) {
      toast.error(`Lohn unterschreitet GAV-Minimum von CHF ${minSalary.toLocaleString("de-CH")}`);
      return;
    }
    
    toast.success("Arbeitsvertrag wurde erfolgreich erstellt");
    navigate("/employee-contracts");
  };

  const selectedGavClass = gavClasses.find(g => g.value === formData.gavClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/employee-contracts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Neuer Arbeitsvertrag
          </h1>
          <p className="text-muted-foreground">
            Vertrag nach GAV Metallbau Schweiz erstellen
          </p>
        </div>
      </div>

      {/* GAV Info Banner */}
      <Card className="border-info/30 bg-info/5">
        <CardContent className="flex items-start gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Info className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-info">GAV Metallbau Schweiz</h3>
            <p className="text-sm text-muted-foreground">
              Wochenarbeitszeit: 42.5 Std. | 13. Monatslohn: obligatorisch | Mindestferien: 20-30 Tage (altersabhängig) | Probezeit: max. 3 Monate
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Vertragsart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Vertragsart
              </CardTitle>
              <CardDescription>Art und Laufzeit des Arbeitsvertrags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Mitarbeiter *</Label>
                <Select value={formData.employeeId} onValueChange={(v) => handleChange("employeeId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Vertragstyp *</Label>
                <Select value={formData.contractType} onValueChange={(v) => handleChange("contractType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vertragstyp wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Vertragsbeginn *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                </div>
                {(formData.contractType === "befristet" || formData.contractType === "temporär" || formData.contractType === "lehrvertrag") && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Vertragsende</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="probationMonths">Probezeit (Monate)</Label>
                  <Select value={formData.probationMonths} onValueChange={(v) => handleChange("probationMonths", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Monat</SelectItem>
                      <SelectItem value="2">2 Monate</SelectItem>
                      <SelectItem value="3">3 Monate (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Kündigungsfrist</Label>
                  <Select value={formData.noticePeriod} onValueChange={(v) => handleChange("noticePeriod", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noticePeriods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GAV Lohnklasse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                GAV Lohnklasse
              </CardTitle>
              <CardDescription>Einstufung nach Gesamtarbeitsvertrag Metallbau</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gavClass">Lohnklasse *</Label>
                <Select value={formData.gavClass} onValueChange={handleGavClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="GAV Klasse wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {gavClasses.map((gClass) => (
                      <SelectItem key={gClass.value} value={gClass.value}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Klasse {gClass.value}</Badge>
                          <span>{gClass.label.split(" - ")[1]}</span>
                          <span className="text-muted-foreground">ab CHF {gClass.minSalary.toLocaleString("de-CH")}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedGavClass && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-medium">{selectedGavClass.label}</p>
                  <p className="text-muted-foreground">{selectedGavClass.description}</p>
                  <p className="mt-2 font-mono">
                    Mindestlohn: CHF {selectedGavClass.minSalary.toLocaleString("de-CH")} (100%)
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="baseSalary">Bruttolohn (CHF/Monat) *</Label>
                <Input
                  id="baseSalary"
                  type="number"
                  placeholder="5400"
                  value={formData.baseSalary}
                  onChange={(e) => handleChange("baseSalary", e.target.value)}
                />
                {selectedGavClass && formData.baseSalary && (
                  <p className={`text-sm ${parseFloat(formData.baseSalary) < selectedGavClass.minSalary * parseFloat(formData.workload) / 100 ? "text-destructive" : "text-success"}`}>
                    {parseFloat(formData.baseSalary) >= selectedGavClass.minSalary * parseFloat(formData.workload) / 100 
                      ? "✓ Entspricht GAV-Minimum" 
                      : `✗ Unter GAV-Minimum von CHF ${Math.round(selectedGavClass.minSalary * parseFloat(formData.workload) / 100).toLocaleString("de-CH")}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Checkbox
                  id="has13thSalary"
                  checked={formData.has13thSalary}
                  onCheckedChange={(checked) => handleChange("has13thSalary", !!checked)}
                />
                <Label htmlFor="has13thSalary" className="font-normal">
                  13. Monatslohn (GAV-obligatorisch)
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="hasExpenseAllowance"
                  checked={formData.hasExpenseAllowance}
                  onCheckedChange={(checked) => handleChange("hasExpenseAllowance", !!checked)}
                />
                <Label htmlFor="hasExpenseAllowance" className="font-normal">
                  Pauschalspesen
                </Label>
              </div>
              {formData.hasExpenseAllowance && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="expenseAllowance">Spesenpauschale (CHF/Monat)</Label>
                  <Input
                    id="expenseAllowance"
                    type="number"
                    placeholder="200"
                    value={formData.expenseAllowance}
                    onChange={(e) => handleChange("expenseAllowance", e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arbeitszeit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Arbeitszeit
              </CardTitle>
              <CardDescription>Pensum und Wochenarbeitszeit nach GAV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workload">Beschäftigungsgrad (%)</Label>
                  <Select value={formData.workload} onValueChange={handleWorkloadChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                      <SelectItem value="80">80%</SelectItem>
                      <SelectItem value="70">70%</SelectItem>
                      <SelectItem value="60">60%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyHours">Wochenstunden</Label>
                  <Input
                    id="weeklyHours"
                    value={formData.weeklyHours}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">GAV: 42.5 Std./Woche bei 100%</p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium text-sm">Zuschläge nach GAV Metallbau</h4>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Überstunden (Mo-Sa)</span>
                    <span className="font-mono">+25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sonntagsarbeit</span>
                    <span className="font-mono">+50%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nachtarbeit (23-06 Uhr)</span>
                    <span className="font-mono">+25%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ferien */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ferien & Arbeitsort
              </CardTitle>
              <CardDescription>Ferienanspruch nach GAV (altersabhängig)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vacationDays">Ferientage pro Jahr</Label>
                <Select value={formData.vacationDays} onValueChange={(v) => handleChange("vacationDays", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 Tage (20-49 Jahre)</SelectItem>
                    <SelectItem value="25">25 Tage (unter 20 oder 50-59 Jahre)</SelectItem>
                    <SelectItem value="30">30 Tage (ab 60 Jahre)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <h4 className="font-medium mb-2">GAV Ferienanspruch</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>• Bis 20 Jahre: 25 Arbeitstage (5 Wochen)</p>
                  <p>• 20-49 Jahre: 20 Arbeitstage (4 Wochen)</p>
                  <p>• 50-59 Jahre: 25 Arbeitstage (5 Wochen)</p>
                  <p>• Ab 60 Jahre: 30 Arbeitstage (6 Wochen)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Abteilung</Label>
                <Input
                  id="department"
                  placeholder="z.B. Produktion, Montage"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Stellenbezeichnung</Label>
                <Input
                  id="jobTitle"
                  placeholder="z.B. Metallbauer EFZ"
                  value={formData.jobTitle}
                  onChange={(e) => handleChange("jobTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workLocation">Arbeitsort</Label>
                <Input
                  id="workLocation"
                  placeholder="z.B. Werkstatt Zürich"
                  value={formData.workLocation}
                  onChange={(e) => handleChange("workLocation", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/employee-contracts")}>
            Abbrechen
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Vertrag erstellen
          </Button>
        </div>
      </form>
    </div>
  );
}
