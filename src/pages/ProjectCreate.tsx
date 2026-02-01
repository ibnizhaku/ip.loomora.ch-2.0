import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Euro,
  Users,
  FolderKanban,
  Flag,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const clients = [
  { id: "1", name: "Fashion Store GmbH" },
  { id: "2", name: "FinTech Solutions" },
  { id: "3", name: "Sales Pro AG" },
  { id: "4", name: "Data Analytics Inc." },
  { id: "5", name: "Tech Innovations" },
];

const teamMembers = [
  { id: "1", name: "Anna Schmidt", initials: "AS", role: "Lead Developer" },
  { id: "2", name: "Thomas Müller", initials: "TM", role: "Backend Developer" },
  { id: "3", name: "Lisa Weber", initials: "LW", role: "UI Designer" },
  { id: "4", name: "Michael Keller", initials: "MK", role: "Project Manager" },
  { id: "5", name: "Sarah Koch", initials: "SK", role: "Frontend Developer" },
];

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<{ id: number; title: string; date: string }[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: "", date: "" });
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

  const addMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.date) {
      setMilestones([...milestones, { id: Date.now(), ...newMilestone }]);
      setNewMilestone({ title: "", date: "" });
    }
  };

  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeam(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = () => {
    navigate("/projects");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Neues Projekt</h1>
          <p className="text-muted-foreground">Erstellen Sie ein neues Projekt</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit}>
          <Save className="h-4 w-4" />
          Projekt erstellen
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projektinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Projektname *</Label>
                <Input 
                  id="name" 
                  placeholder="z.B. E-Commerce Platform" 
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description" 
                  placeholder="Beschreiben Sie das Projekt im Detail..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Kunde</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team ({selectedTeam.length} ausgewählt)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => toggleTeamMember(member.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTeam.includes(member.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Checkbox checked={selectedTeam.includes(member.id)} />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Meilensteine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Meilenstein-Titel"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="flex-1"
                />
                <Input 
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                  className="w-40"
                />
                <Button onClick={addMilestone} disabled={!newMilestone.title.trim() || !newMilestone.date}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {milestones.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Meilensteine hinzugefügt
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status & Priorität</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="planning">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planung</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="paused">Pausiert</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priorität
                </Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        Niedrig
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        Mittel
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        Hoch
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zeitraum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Startdatum *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Enddatum *</Label>
                <Input type="date" />
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gesamtbudget (€)</Label>
                <Input type="number" placeholder="0.00" min="0" step="100" />
              </div>
              <div className="space-y-2">
                <Label>Stundensatz (€/Std.)</Label>
                <Input type="number" placeholder="0.00" min="0" step="5" />
              </div>
              <p className="text-xs text-muted-foreground">
                Das Budget kann nach Projektstart angepasst werden.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
