import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Calculator,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useEmployees } from "@/hooks/use-employees";

const months = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

const PayrollCreate = () => {
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const { data: employeeData, isLoading } = useEmployees({ pageSize: 200, status: 'ACTIVE' });
  
  const employees = useMemo(() => {
    const list = employeeData?.data || [];
    return list.map(e => ({
      id: e.id,
      name: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
      position: e.position || '',
      bruttoLohn: e.salary || 0,
      status: (e.status || 'ACTIVE').toLowerCase() === 'active' ? 'aktiv' : e.status?.toLowerCase() || '',
    }));
  }, [employeeData]);

  const [selectedMonth, setSelectedMonth] = useState(months[currentMonth]);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Auto-select all employees once loaded
  if (!initialized && employees.length > 0) {
    setSelectedEmployees(employees.map(e => e.id));
    setInitialized(true);
  }

  const [isProcessing, setIsProcessing] = useState(false);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(employees.map(e => e.id));
  };

  const deselectAll = () => {
    setSelectedEmployees([]);
  };

  const selectedTotal = employees
    .filter(e => selectedEmployees.includes(e.id))
    .reduce((sum, e) => sum + e.bruttoLohn, 0);

  const handleStartPayroll = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Bitte wählen Sie mindestens einen Mitarbeiter aus");
      return;
    }

    setIsProcessing(true);
    
    toast.info("Lohnlauf wird gestartet...", {
      description: `${selectedMonth} ${selectedYear} für ${selectedEmployees.length} Mitarbeitende`
    });

    setTimeout(() => {
      toast.success("Lohnlauf erfolgreich gestartet!", {
        description: "Die Lohnberechnungen werden durchgeführt"
      });
      setIsProcessing(false);
      navigate("/payroll");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Neuer Lohnlauf</h1>
          <p className="text-muted-foreground">Monatliche Lohnabrechnung erstellen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Periode auswählen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Abrechnungsperiode
            </CardTitle>
            <CardDescription>Wählen Sie den Monat für die Lohnabrechnung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Monat</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jahr</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Zusammenfassung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Zusammenfassung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Periode</span>
              <Badge variant="secondary">{selectedMonth} {selectedYear}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Mitarbeitende</span>
              <span className="font-semibold">{selectedEmployees.length} von {employees.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bruttolohnsumme</span>
              <span className="font-semibold text-lg">CHF {formatCHF(selectedTotal)}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Sozialabzüge werden automatisch berechnet</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Ablauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
                <span>Periode und Mitarbeitende auswählen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
                <span>Lohnlauf starten - Berechnung läuft</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
                <span>Lohnabrechnungen prüfen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">4</span>
                <span>Lohnlauf abschliessen & exportieren</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Mitarbeiterliste */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Mitarbeitende auswählen
              </CardTitle>
              <CardDescription>Wählen Sie die Mitarbeitenden für diesen Lohnlauf</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Alle auswählen
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Keine auswählen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {employees.map(employee => (
              <div
                key={employee.id}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedEmployees.includes(employee.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
                onClick={() => toggleEmployee(employee.id)}
              >
                <Checkbox
                  checked={selectedEmployees.includes(employee.id)}
                  onCheckedChange={() => toggleEmployee(employee.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{employee.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">CHF {formatCHF(employee.bruttoLohn)}</p>
                  <Badge variant="secondary" className="text-xs">{employee.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/payroll")}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleStartPayroll} 
          disabled={isProcessing || selectedEmployees.length === 0}
          className="min-w-[180px]"
        >
          {isProcessing ? (
            <>
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
              Wird berechnet...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Lohnlauf starten
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PayrollCreate;
