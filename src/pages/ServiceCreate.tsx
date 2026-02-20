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
import { useCreateServiceTicket } from "@/hooks/use-service-tickets";
import { useCustomers } from "@/hooks/use-customers";
import { useUsers } from "@/hooks/use-users";

export default function ServiceCreate() {
  const navigate = useNavigate();
  const createTicket = useCreateServiceTicket();
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const { data: usersData } = useUsers();
  const apiCustomers = (customersData as any)?.data || [];
  const apiUsers = Array.isArray(usersData) ? usersData : (usersData as any)?.data || [];

  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
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
    if (!title || !customerId || !category) {
      toast.error("Bitte füllen Sie die Pflichtfelder aus");
      return;
    }

    const categoryMap: Record<string, string> = {
      repair: "REPAIR",
      maintenance: "MAINTENANCE",
      installation: "INSTALLATION",
      consultation: "INSPECTION",
      complaint: "WARRANTY",
    };

    createTicket.mutate(
      {
        title,
        description: description || title,
        customerId,
        serviceType: categoryMap[category] || "REPAIR",
        priority: priority as any,
        assignedTechnicianId: assignee || undefined,
        scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
        equipmentInfo: equipment || undefined,
      } as any,
      {
        onSuccess: (data: any) => {
          toast.success("Service-Ticket erstellt");
          navigate(data?.id ? `/service/${data.id}` : "/service");
        },
        onError: () => toast.error("Fehler beim Erstellen des Tickets"),
      }
    );
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
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Kunde wählen" />
                </SelectTrigger>
                <SelectContent>
                  {apiCustomers.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName || c.name}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="LOW">Niedrig</SelectItem>
                  <SelectItem value="MEDIUM">Mittel</SelectItem>
                  <SelectItem value="HIGH">Hoch</SelectItem>
                  <SelectItem value="URGENT">Dringend</SelectItem>
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
                  {apiUsers.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
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
                        {scheduledTime} Uhr • {(() => { const u = apiUsers.find((u: any) => u.id === assignee); return u ? `${u.firstName} ${u.lastName}` : assignee; })()}
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
        <Button className="gap-2" onClick={handleSave} disabled={createTicket.isPending}>
          <Save className="h-4 w-4" />
          {createTicket.isPending ? "Wird erstellt..." : "Ticket erstellen"}
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
