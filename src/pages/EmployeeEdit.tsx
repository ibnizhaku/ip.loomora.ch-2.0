import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUpdateEmployee, useDepartments } from "@/hooks/use-employees";

export default function EmployeeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateEmployee = useUpdateEmployee();
  const { data: departments } = useDepartments();

  const { data: employee, isLoading } = useQuery({
    queryKey: ["employees", id],
    queryFn: () => api.get<any>(`/employees/${id}`),
    enabled: !!id,
  });

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    position: "", departmentId: "", hireDate: "",
    workloadPercent: "100",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        position: employee.position || "",
        departmentId: employee.departmentId || "",
        hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
        workloadPercent: String(employee.workloadPercent ?? 100),
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateEmployee.mutateAsync({
        id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          position: formData.position || undefined,
          departmentId: formData.departmentId || undefined,
          hireDate: formData.hireDate || undefined,
          workloadPercent: parseInt(formData.workloadPercent) || 100,
        },
      });
      toast.success("Mitarbeiter aktualisiert");
      navigate(`/hr/${id}`);
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/hr"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-display text-2xl font-bold">Mitarbeiter nicht gefunden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/hr/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">Mitarbeiter bearbeiten</h1>
          <p className="text-muted-foreground">{employee.firstName} {employee.lastName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Persönliche Daten</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vorname *</Label>
                  <Input value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Nachname *</Label>
                  <Input value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>E-Mail</Label>
                  <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Anstellung</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={formData.position} onChange={(e) => handleChange("position", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Abteilung</Label>
                <Select value={formData.departmentId} onValueChange={(v) => handleChange("departmentId", v)}>
                  <SelectTrigger><SelectValue placeholder="Abteilung wählen" /></SelectTrigger>
                  <SelectContent>
                    {(departments || []).map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Eintrittsdatum</Label>
                <Input type="date" value={formData.hireDate} onChange={(e) => handleChange("hireDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pensum (%)</Label>
                <Input type="number" min="0" max="100" value={formData.workloadPercent} onChange={(e) => handleChange("workloadPercent", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/hr/${id}`)} disabled={updateEmployee.isPending}>Abbrechen</Button>
          <Button type="submit" className="gap-2" disabled={updateEmployee.isPending}>
            {updateEmployee.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Änderungen speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
