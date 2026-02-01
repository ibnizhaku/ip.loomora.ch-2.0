import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Grid3X3, List, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "completed" | "paused" | "planning";
  progress: number;
  budget: number;
  spent: number;
  team: string[];
  startDate: string;
  endDate: string;
  priority: "high" | "medium" | "low";
}

const projects: Project[] = [
  {
    id: "1",
    name: "E-Commerce Platform",
    client: "Fashion Store GmbH",
    status: "active",
    progress: 75,
    budget: 45000,
    spent: 33750,
    team: ["AS", "TM", "LW"],
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    priority: "high",
  },
  {
    id: "2",
    name: "Mobile Banking App",
    client: "FinTech Solutions",
    status: "active",
    progress: 45,
    budget: 80000,
    spent: 36000,
    team: ["MK", "SK"],
    startDate: "2024-02-01",
    endDate: "2024-05-30",
    priority: "high",
  },
  {
    id: "3",
    name: "CRM Integration",
    client: "Sales Pro AG",
    status: "completed",
    progress: 100,
    budget: 25000,
    spent: 24200,
    team: ["AS", "MK", "TM", "LW"],
    startDate: "2023-11-01",
    endDate: "2024-01-31",
    priority: "medium",
  },
  {
    id: "4",
    name: "Dashboard Redesign",
    client: "Data Analytics Inc.",
    status: "active",
    progress: 30,
    budget: 15000,
    spent: 4500,
    team: ["SK", "LW"],
    startDate: "2024-02-15",
    endDate: "2024-04-15",
    priority: "low",
  },
  {
    id: "5",
    name: "API Development",
    client: "Tech Innovations",
    status: "planning",
    progress: 0,
    budget: 35000,
    spent: 0,
    team: ["TM", "MK"],
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    priority: "medium",
  },
  {
    id: "6",
    name: "Inventory System",
    client: "Logistics Plus",
    status: "paused",
    progress: 60,
    budget: 28000,
    spent: 16800,
    team: ["AS", "SK"],
    startDate: "2023-12-01",
    endDate: "2024-02-28",
    priority: "low",
  },
];

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success text-success-foreground" },
  completed: { label: "Abgeschlossen", color: "bg-info text-info-foreground" },
  paused: { label: "Pausiert", color: "bg-warning text-warning-foreground" },
  planning: { label: "Planung", color: "bg-muted text-muted-foreground" },
};

const priorityConfig = {
  high: { label: "Hoch", color: "bg-destructive/10 text-destructive" },
  medium: { label: "Mittel", color: "bg-warning/10 text-warning" },
  low: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
};

export default function Projects() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Projekte
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Ihre Projekte an einem Ort
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/projects/new")}>
          <Plus className="h-4 w-4" />
          Neues Projekt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Projekte suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="flex rounded-lg border border-border p-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Gesamt", value: projects.length, color: "text-foreground", filter: null },
          {
            label: "Aktiv",
            value: projects.filter((p) => p.status === "active").length,
            color: "text-success",
            filter: "active",
          },
          {
            label: "Abgeschlossen",
            value: projects.filter((p) => p.status === "completed").length,
            color: "text-info",
            filter: "completed",
          },
          {
            label: "Pausiert",
            value: projects.filter((p) => p.status === "paused").length,
            color: "text-warning",
            filter: "paused",
          },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setStatusFilter(statusFilter === stat.filter ? null : stat.filter)}
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30",
              statusFilter === stat.filter && "border-primary ring-1 ring-primary"
            )}
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Projects Grid/List */}
      <div
        className={cn(
          "grid gap-4",
          view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}
      >
        {filteredProjects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className={cn(
              "group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-soft animate-fade-in cursor-pointer",
              view === "list" && "flex items-center gap-6"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={cn("flex-1", view === "list" && "flex items-center gap-6")}>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.client}
                    </p>
                  </div>
                  <Badge className={statusConfig[project.status].color}>
                    {statusConfig[project.status].label}
                  </Badge>
                </div>

                {view === "grid" && (
                  <>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fortschritt</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member) => (
                          <div
                            key={member}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-2 ring-card"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                      <Badge
                        variant="outline"
                        className={priorityConfig[project.priority].color}
                      >
                        {priorityConfig[project.priority].label}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                          €{project.spent.toLocaleString()} / €
                          {project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {view === "list" && (
                <>
                  <div className="w-48">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Fortschritt</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member) => (
                      <div
                        key={member}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-2 ring-card"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                  <Badge
                    variant="outline"
                    className={priorityConfig[project.priority].color}
                  >
                    {priorityConfig[project.priority].label}
                  </Badge>
                  <div className="text-right">
                    <p className="font-medium">
                      €{project.budget.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Budget</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
