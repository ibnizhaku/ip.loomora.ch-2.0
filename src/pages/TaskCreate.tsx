import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Clock,
  Flag,
  FolderKanban,
  User,
  Tag,
  Paperclip,
  X
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

const projects = [
  { id: "1", name: "E-Commerce Platform" },
  { id: "2", name: "Mobile Banking App" },
  { id: "3", name: "Dashboard Redesign" },
  { id: "4", name: "CRM Integration" },
];

const teamMembers = [
  { id: "1", name: "Anna Schmidt", initials: "AS" },
  { id: "2", name: "Thomas Müller", initials: "TM" },
  { id: "3", name: "Michael Keller", initials: "MK" },
  { id: "4", name: "Sarah Weber", initials: "SW" },
];

const availableTags = [
  "Frontend", "Backend", "Design", "Testing", "Dokumentation", 
  "Performance", "Security", "UX", "Database", "API"
];

export default function TaskCreate() {
  const navigate = useNavigate();
  const [subtasks, setSubtasks] = useState<{ id: number; title: string }[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Date.now(), title: newSubtask.trim() }]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (id: number) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    // Would save the task here
    navigate("/tasks");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Neue Aufgabe</h1>
          <p className="text-muted-foreground">Erstellen Sie eine neue Aufgabe</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit}>
          <Save className="h-4 w-4" />
          Aufgabe erstellen
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input 
                  id="title" 
                  placeholder="Aufgabentitel eingeben..." 
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description" 
                  placeholder="Beschreiben Sie die Aufgabe im Detail..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Unteraufgaben</CardTitle>
              <span className="text-sm text-muted-foreground">
                {subtasks.length} Unteraufgaben
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Neue Unteraufgabe..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                />
                <Button onClick={addSubtask} disabled={!newSubtask.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {subtasks.length > 0 && (
                <div className="space-y-2">
                  {subtasks.map((subtask, index) => (
                    <div 
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="h-5 w-5 rounded border-2 border-muted-foreground/30" />
                      <span className="flex-1">{subtask.title}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeSubtask(subtask.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {subtasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Unteraufgaben hinzugefügt
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Anhänge
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attachments.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Dateien hierher ziehen oder klicken zum Auswählen
                  </p>
                  <Button variant="outline" size="sm">
                    Dateien auswählen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project & Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zuweisung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projekt
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Zugewiesen an
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status & Priorität</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="todo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Zu erledigen</SelectItem>
                    <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Erledigt</SelectItem>
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
                        <div className="h-2 w-2 rounded-full bg-info" />
                        Mittel
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        Hoch
                      </div>
                    </SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        Kritisch
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
                Termine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Startdatum</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Fälligkeitsdatum</Label>
                <Input type="date" />
              </div>
            </CardContent>
          </Card>

          {/* Time Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Zeitschätzung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Geschätzte Stunden</Label>
                <Input type="number" placeholder="0" min="0" step="0.5" />
              </div>
              <p className="text-xs text-muted-foreground">
                Die Zeiterfassung kann nach dem Erstellen der Aufgabe gestartet werden.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
