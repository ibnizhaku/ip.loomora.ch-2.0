import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in-progress" | "review" | "done";
  dueDate: string;
  tags: string[];
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Landing Page Design fertigstellen",
    description: "Alle Sektionen der Landing Page finalisieren",
    project: "E-Commerce Platform",
    assignee: "LW",
    priority: "high",
    status: "in-progress",
    dueDate: "05.02.2024",
    tags: ["Design", "Frontend"],
  },
  {
    id: "2",
    title: "API Endpoints dokumentieren",
    description: "Swagger-Dokumentation für alle REST-Endpoints",
    project: "Mobile Banking App",
    assignee: "TM",
    priority: "medium",
    status: "todo",
    dueDate: "08.02.2024",
    tags: ["Backend", "Dokumentation"],
  },
  {
    id: "3",
    title: "Unit Tests schreiben",
    description: "Tests für Authentication-Modul",
    project: "Mobile Banking App",
    assignee: "AS",
    priority: "high",
    status: "review",
    dueDate: "03.02.2024",
    tags: ["Testing", "Backend"],
  },
  {
    id: "4",
    title: "Performance-Optimierung",
    description: "Ladezeiten der Dashboard-Komponenten verbessern",
    project: "Dashboard Redesign",
    assignee: "MK",
    priority: "medium",
    status: "todo",
    dueDate: "10.02.2024",
    tags: ["Performance", "Frontend"],
  },
  {
    id: "5",
    title: "Kundenfeedback einarbeiten",
    description: "Änderungen aus dem Review-Meeting umsetzen",
    project: "CRM Integration",
    assignee: "SK",
    priority: "low",
    status: "done",
    dueDate: "01.02.2024",
    tags: ["Review", "UX"],
  },
  {
    id: "6",
    title: "Datenbank-Migration",
    description: "Schema-Updates für v2.0",
    project: "E-Commerce Platform",
    assignee: "AS",
    priority: "high",
    status: "in-progress",
    dueDate: "06.02.2024",
    tags: ["Backend", "Database"],
  },
];

const statusConfig = {
  todo: { label: "Zu erledigen", color: "text-muted-foreground", icon: Circle },
  "in-progress": { label: "In Bearbeitung", color: "text-info", icon: Clock },
  review: { label: "Review", color: "text-warning", icon: AlertCircle },
  done: { label: "Erledigt", color: "text-success", icon: CheckCircle2 },
};

const priorityConfig = {
  high: { label: "Hoch", color: "bg-destructive/10 text-destructive" },
  medium: { label: "Mittel", color: "bg-warning/10 text-warning" },
  low: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
};

export default function Tasks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Aufgaben
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Aufgaben und Projekte
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/tasks/new")}>
          <Plus className="h-4 w-4" />
          Neue Aufgabe
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const StatusIcon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedStatus(selectedStatus === key ? "all" : key)}
              className={cn(
                "rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30",
                selectedStatus === key && "border-primary ring-1 ring-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <StatusIcon className={cn("h-5 w-5", config.color)} />
                <div>
                  <p className="text-2xl font-bold">
                    {tasksByStatus[key as keyof typeof tasksByStatus]}
                  </p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Aufgaben suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task, index) => {
          const StatusIcon = statusConfig[task.status].icon;
          return (
            <div
              key={task.id}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <Checkbox
                checked={task.status === "done"}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className={cn(
                        "font-medium hover:text-primary transition-colors",
                        task.status === "done" && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>Details anzeigen</DropdownMenuItem>
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>Status ändern</DropdownMenuItem>
                      <DropdownMenuItem>Zuweisen</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge
                    variant="outline"
                    className={cn("gap-1", statusConfig[task.status].color)}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[task.status].label}
                  </Badge>
                  <Badge className={priorityConfig[task.priority].color}>
                    {priorityConfig[task.priority].label}
                  </Badge>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {task.dueDate}
                  </div>

                  <div className="flex items-center gap-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-secondary">
                        {task.assignee}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 ml-auto">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {task.project}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
