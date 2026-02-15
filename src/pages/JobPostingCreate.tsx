import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useDepartments } from "@/hooks/use-departments";
import { useCreateJobPosting } from "@/hooks/use-recruiting";

const employmentTypes = [
  { value: "fulltime", label: "Vollzeit" },
  { value: "parttime", label: "Teilzeit" },
  { value: "temporary", label: "Temporär" },
  { value: "apprentice", label: "Lehrstelle" },
];

const JobPostingCreate = () => {
  const navigate = useNavigate();
  const { data: departmentsData, isLoading: deptsLoading } = useDepartments({ pageSize: 100 });
  const departments = (departmentsData as any)?.data || departmentsData || [];
  const createJob = useCreateJobPosting();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employmentType: "fulltime",
    workload: "100",
    deadline: "",
    salary: "",
    description: "",
    requirements: "",
    benefits: "",
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.department || !formData.location) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    createJob.mutate({
      title: formData.title,
      department: formData.department,
      location: formData.location,
      employmentType: formData.employmentType,
      description: formData.description,
      requirements: formData.requirements,
      responsibilities: formData.benefits,
      closingDate: formData.deadline || undefined,
      status: "Aktiv",
    } as any, {
      onSuccess: () => {
        toast.success("Stellenausschreibung erstellt", { description: formData.title });
        navigate("/recruiting");
      },
      onError: () => toast.error("Fehler beim Erstellen"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/recruiting")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Neue Stellenausschreibung</h1>
          <p className="text-muted-foreground">Offene Position ausschreiben</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stellendetails */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Stellendetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Stellentitel *</Label>
                <Input
                  id="title"
                  placeholder="z.B. Metallbauer EFZ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Abteilung *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={deptsLoading ? "Laden..." : "Auswählen..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(departments) && departments.map((dept: any) => (
                      <SelectItem key={dept.id || dept} value={dept.name || dept}>
                        {dept.name || dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Standort *</Label>
                <Input
                  id="location"
                  placeholder="z.B. Zürich, Region Zürich"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Anstellungsart</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="workload">Pensum (%)</Label>
                <Input
                  id="workload"
                  placeholder="100"
                  value={formData.workload}
                  onChange={(e) => setFormData({ ...formData, workload: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Bewerbungsfrist</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Lohnrahmen (CHF)</Label>
                <Input
                  id="salary"
                  placeholder="z.B. 5'200 - 6'800"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zusammenfassung */}
        <Card>
          <CardHeader>
            <CardTitle>Vorschau</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">{formData.title || "Stellentitel"}</h3>
              {formData.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {formData.location}
                </div>
              )}
              {formData.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Bis {formData.deadline}
                </div>
              )}
              {formData.workload && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {formData.workload}% Pensum
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beschreibungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Stellenbeschreibung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Aufgabenbeschreibung</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Beschreiben Sie die Hauptaufgaben und Verantwortlichkeiten..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">Anforderungen</Label>
            <Textarea
              id="requirements"
              rows={4}
              placeholder="Ausbildung, Erfahrung, Fähigkeiten..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Wir bieten</Label>
            <Textarea
              id="benefits"
              rows={4}
              placeholder="Benefits, Weiterbildung, Arbeitsumfeld..."
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/recruiting")}>
          Abbrechen
        </Button>
        <Button variant="secondary" onClick={() => toast.info("Als Entwurf gespeichert")}>
          Als Entwurf speichern
        </Button>
        <Button onClick={handleSubmit} disabled={createJob.isPending}>
          {createJob.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Stelle veröffentlichen
        </Button>
      </div>
    </div>
  );
};

export default JobPostingCreate;