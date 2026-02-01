import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  GraduationCap,
  Users,
  Calendar,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const employees = [
  { id: "1", name: "Thomas Müller" },
  { id: "2", name: "Lisa Weber" },
  { id: "3", name: "Michael Schneider" },
  { id: "4", name: "Sandra Fischer" },
  { id: "5", name: "Pedro Santos" },
  { id: "6", name: "Hans Keller" },
];

const trainingTypes = [
  { value: "workshop", label: "Workshop" },
  { value: "e-learning", label: "E-Learning" },
  { value: "coaching", label: "Coaching" },
  { value: "certification", label: "Zertifizierung" },
  { value: "online-course", label: "Online-Kurs" },
];

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 0 });
};

const TrainingCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    trainer: "",
    trainerType: "external",
    date: "",
    endDate: "",
    duration: "",
    location: "",
    maxParticipants: "",
    cost: "",
    description: "",
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.type || !formData.date) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    toast.success("Schulung erstellt", {
      description: `${formData.title} am ${formData.date}`
    });
    navigate("/training");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/training")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Neue Schulung planen</h1>
          <p className="text-muted-foreground">Weiterbildung für Mitarbeitende organisieren</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schulungsdetails */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Schulungsdetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  placeholder="z.B. Schweissen MIG/MAG Grundkurs"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Art der Schulung *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trainer">Trainer / Anbieter</Label>
                <Input
                  id="trainer"
                  placeholder="z.B. SUVA, SMU, Intern"
                  value={formData.trainer}
                  onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Trainertyp</Label>
                <Select
                  value={formData.trainerType}
                  onValueChange={(value) => setFormData({ ...formData, trainerType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Intern</SelectItem>
                    <SelectItem value="external">Extern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">Startdatum *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Enddatum</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Dauer</Label>
                <Input
                  id="duration"
                  placeholder="z.B. 2 Tage, 4 Stunden"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="location">Ort</Label>
                <Input
                  id="location"
                  placeholder="z.B. Werkstatt, Online, Zürich"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="z.B. 10"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Kosten (CHF)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Lernziele, Inhalte, Voraussetzungen..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Zusammenfassung */}
        <Card>
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Schulungsart</span>
                <span>{trainingTypes.find(t => t.value === formData.type)?.label || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Datum</span>
                <span>{formData.date || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Teilnehmer</span>
                <span>{selectedEmployees.length} von {formData.maxParticipants || "∞"}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Kosten</span>
                <span>CHF {formData.cost ? formatCHF(parseInt(formData.cost)) : "0"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teilnehmer auswählen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Teilnehmer auswählen
          </CardTitle>
          <CardDescription>Wählen Sie die Mitarbeitenden für diese Schulung aus</CardDescription>
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
                <span className="font-medium">{employee.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/training")}>
          Abbrechen
        </Button>
        <Button onClick={handleSubmit}>
          Schulung erstellen
        </Button>
      </div>
    </div>
  );
};

export default TrainingCreate;
