import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Calendar,
  Clock,
  Euro,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ProjectChat } from "@/components/project/ProjectChat";

// Mock project data
const project = {
  id: "1",
  name: "E-Commerce Platform",
  client: "Fashion Store GmbH",
  description:
    "Entwicklung einer modernen E-Commerce-Plattform mit Produktkatalog, Warenkorb, Checkout und Kundenkonto. Integration von Zahlungsanbietern und Versanddienstleistern.",
  status: "active",
  progress: 75,
  budget: 45000,
  spent: 33750,
  startDate: "15.01.2024",
  endDate: "15.03.2024",
  priority: "high",
  team: [
    { initials: "AS", name: "Anna Schmidt", role: "Lead Developer" },
    { initials: "TM", name: "Thomas Müller", role: "Backend Developer" },
    { initials: "LW", name: "Lisa Weber", role: "UI Designer" },
  ],
  tasks: [
    { id: "1", title: "Produktkatalog implementieren", status: "done", assignee: "AS" },
    { id: "2", title: "Warenkorb-Logik", status: "done", assignee: "TM" },
    { id: "3", title: "Checkout-Prozess", status: "in-progress", assignee: "AS" },
    { id: "4", title: "Payment Integration", status: "in-progress", assignee: "TM" },
    { id: "5", title: "UI Polishing", status: "todo", assignee: "LW" },
    { id: "6", title: "Testing & QA", status: "todo", assignee: "AS" },
  ],
  milestones: [
    { id: "1", title: "Phase 1: Grundfunktionen", date: "31.01.2024", completed: true },
    { id: "2", title: "Phase 2: E-Commerce Core", date: "28.02.2024", completed: false },
    { id: "3", title: "Phase 3: Launch", date: "15.03.2024", completed: false },
  ],
  activities: [
    { id: "1", user: "Anna Schmidt", action: "hat Task abgeschlossen", target: "Warenkorb UI", time: "vor 2 Std." },
    { id: "2", user: "Thomas Müller", action: "hat Kommentar hinzugefügt", target: "Payment Integration", time: "vor 4 Std." },
    { id: "3", user: "Lisa Weber", action: "hat Datei hochgeladen", target: "Design_Final.fig", time: "vor 1 Tag" },
  ],
};

const taskStatusConfig = {
  todo: { label: "Offen", color: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  done: { label: "Erledigt", color: "bg-success/10 text-success" },
};

export default function ProjectDetail() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge className="bg-success/10 text-success">Aktiv</Badge>
          </div>
          <p className="text-muted-foreground">{project.client}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Bearbeiten
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zeitraum</p>
              <p className="font-medium">
                {project.startDate} - {project.endDate}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Euro className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">
                €{project.spent.toLocaleString()} / €{project.budget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-medium">{project.team.length} Mitglieder</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <CheckCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fortschritt</p>
              <p className="font-medium">{project.progress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Gesamtfortschritt</h3>
          <span className="text-2xl font-bold">{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-3" />

        <div className="flex justify-between mt-6">
          {project.milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={cn(
                "text-center",
                index === 0 && "text-left",
                index === project.milestones.length - 1 && "text-right"
              )}
            >
              <div
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full mb-2",
                  milestone.completed ? "bg-success text-success-foreground" : "bg-muted"
                )}
              >
                {milestone.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <p className="text-sm font-medium">{milestone.title}</p>
              <p className="text-xs text-muted-foreground">{milestone.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="files">Dateien</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Aufgaben ({project.tasks.length})</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Neue Aufgabe
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      task.status === "done" && "bg-success",
                      task.status === "in-progress" && "bg-warning",
                      task.status === "todo" && "bg-muted-foreground"
                    )}
                  />
                  <span className={cn(task.status === "done" && "line-through text-muted-foreground")}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={taskStatusConfig[task.status as keyof typeof taskStatusConfig].color}>
                    {taskStatusConfig[task.status as keyof typeof taskStatusConfig].label}
                  </Badge>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-secondary">
                      {task.assignee}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Projekt-Chat</h3>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              {project.team.length} online
            </Badge>
          </div>
          <ProjectChat team={project.team} />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Teammitglieder ({project.team.length})</h3>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Mitglied hinzufügen
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {project.team.map((member) => (
              <div
                key={member.initials}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Dateien</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Hochladen
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Dateien hier ablegen oder klicken zum Hochladen
            </p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="font-semibold">Letzte Aktivitäten</h3>

          <div className="space-y-4">
            {project.activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-secondary">
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
