import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Wrench, Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TechnicianScheduleDialog } from "@/components/service/TechnicianScheduleDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const technicianNames: Record<string, string> = {
  mueller: "Thomas Müller",
  schmidt: "Peter Schmidt",
  weber: "Michael Weber",
  bauer: "Stefan Bauer",
};

export default function ServiceCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignee, setAssignee] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState("");
  
  // Scheduling state
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);

  const handleAssigneeChange = (value: string) => {
    setAssignee(value);
    // Open scheduling dialog when technician is selected
    if (value) {
      setScheduleDialogOpen(true);
    }
  };

  const handleSchedule = (date: Date, time: string) => {
    setScheduledDate(date);
    setScheduledTime(time);
    toast.success(`Termin geplant: ${format(date, "d. MMMM yyyy", { locale: de })} um ${time} Uhr`);
  };

  const clearSchedule = () => {
    setScheduledDate(null);
    setScheduledTime(null);
  };

  const handleSave = () => {
    if (!title || !customer || !category) {
      toast.error("Bitte füllen Sie die Pflichtfelder aus");
      return;
    }
    // Generate a new ticket ID (in real app would come from backend)
    const newTicketId = Date.now().toString();
    toast.success("Service-Ticket erstellt");
    // Navigate to the new ticket's detail page for further actions
    navigate(`/service/${newTicketId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/service")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neues Service-Ticket</h1>
          <p className="text-muted-foreground">Servicefall erfassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Ticket-Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titel *</Label>
              <Input 
                placeholder="Kurze Beschreibung des Problems" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kunde *</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech-innovations">Tech Innovations GmbH</SelectItem>
                  <SelectItem value="machinery-ag">Machinery AG</SelectItem>
                  <SelectItem value="precision-tools">Precision Tools</SelectItem>
                  <SelectItem value="industrial-systems">Industrial Systems AG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategorie *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repair">Reparatur</SelectItem>
                  <SelectItem value="maintenance">Wartung</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="consultation">Beratung</SelectItem>
                  <SelectItem value="complaint">Reklamation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zuweisung & Planung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Techniker</Label>
              <Select value={assignee} onValueChange={handleAssigneeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Techniker wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mueller">Thomas Müller</SelectItem>
                  <SelectItem value="schmidt">Peter Schmidt</SelectItem>
                  <SelectItem value="weber">Michael Weber</SelectItem>
                  <SelectItem value="bauer">Stefan Bauer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scheduled Appointment Display */}
            {assignee && (
              <div className="space-y-2">
                <Label>Geplanter Termin</Label>
                {scheduledDate && scheduledTime ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-success/5 border-success/20">
                    <Calendar className="h-4 w-4 text-success" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {format(scheduledDate, "EEEE, d. MMMM yyyy", { locale: de })}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {scheduledTime} Uhr • {technicianNames[assignee]}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={clearSchedule}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => setScheduleDialogOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Termin einplanen...
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Betroffenes Gerät/Anlage</Label>
              <Input 
                placeholder="z.B. CNC-Fräse Modell X500"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Problembeschreibung</Label>
              <Textarea 
                placeholder="Detaillierte Beschreibung des Problems..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/service")}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Ticket erstellen
        </Button>
      </div>

      {/* Technician Schedule Dialog */}
      {assignee && (
        <TechnicianScheduleDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          technicianId={assignee}
          onSchedule={handleSchedule}
        />
      )}
    </div>
  );
}
