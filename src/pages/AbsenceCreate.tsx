import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useEmployees } from "@/hooks/use-employees";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const absenceTypes = [
  { value: "VACATION", label: "Ferien" },
  { value: "SICK", label: "Krankheit" },
  { value: "ACCIDENT", label: "Unfall" },
  { value: "MATERNITY", label: "Mutterschaft" },
  { value: "PATERNITY", label: "Vaterschaft" },
  { value: "MILITARY", label: "Militär" },
  { value: "TRAINING", label: "Weiterbildung" },
  { value: "SPECIAL", label: "Sonderurlaub" },
  { value: "UNPAID", label: "Unbezahlter Urlaub" },
];

export default function AbsenceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ pageSize: 200 });
  const employees = (employeesData as any)?.data || employeesData || [];

  const [formData, setFormData] = useState({
    employeeId: "",
    type: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  // Pre-fill employeeId from URL params
  useEffect(() => {
    const empId = searchParams.get("employeeId") || searchParams.get("employee");
    if (empId) {
      setFormData(prev => ({ ...prev, employeeId: empId }));
    }
  }, [searchParams]);

  const createAbsence = useMutation({
    mutationFn: (data: typeof formData) => api.post("/absences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/absences"] });
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      toast.success("Abwesenheit erfolgreich erfasst");
      navigate("/absences");
    },
    onError: () => toast.error("Fehler beim Erfassen der Abwesenheit"),
  });

  const handleSubmit = () => {
    if (!formData.employeeId || !formData.type || !formData.startDate) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    createAbsence.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue Abwesenheit</h1>
          <p className="text-muted-foreground">Abwesenheit erfassen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Abwesenheitsdetails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mitarbeiter *</Label>
            <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
              <SelectTrigger>
                <SelectValue placeholder={employeesLoading ? "Laden..." : "Mitarbeiter auswählen"} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(employees) && employees.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Abwesenheitstyp *</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                {absenceTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Von *</Label>
              <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bis</Label>
              <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bemerkung</Label>
            <Textarea placeholder="Optionale Bemerkung" rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit} disabled={createAbsence.isPending}>
          {createAbsence.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Abwesenheit erfassen
        </Button>
      </div>
    </div>
  );
}
