import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, Grid3X3, List, X, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProjects, useProjectStats } from "@/hooks/use-projects";

// Simulated current user ID (would come from auth context in production)
const CURRENT_USER_ID = "1";

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Aktiv", color: "bg-success text-success-foreground" },
  planning: { label: "Planung", color: "bg-muted text-muted-foreground" },
  "on-hold": { label: "Pausiert", color: "bg-warning text-warning-foreground" },
  completed: { label: "Abgeschlossen", color: "bg-info text-info-foreground" },
  cancelled: { label: "Abgebrochen", color: "bg-destructive text-destructive-foreground" },
  paused: { label: "Pausiert", color: "bg-warning text-warning-foreground" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "Hoch", color: "bg-destructive/10 text-destructive" },
  medium: { label: "Mittel", color: "bg-warning/10 text-warning" },
  low: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
};

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showOnlyMine = searchParams.get("mine") === "true";
  
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  // Backend API call - filter by managerId if showing only user's projects
  const { data, isLoading } = useProjects({
    search: searchQuery || undefined,
    status: statusFilter?.toUpperCase() || undefined,
    managerId: showOnlyMine ? CURRENT_USER_ID : undefined,
    pageSize: 50,
  });
  const { data: stats } = useProjectStats();

  const projects = data?.data || [];
  const hasActiveFilters = priorityFilters.length > 0 || statusFilters.length > 0;

  // Client-side filtering for priority and multiple status filters
  const filteredProjects = projects.filter((p) => {
    const projectStatus = p.status?.toLowerCase().replace('_', '-') || '';
    const projectPriority = p.priority?.toLowerCase() || '';
    
    const matchesStatusFilter = statusFilters.length === 0 || statusFilters.includes(projectStatus);
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(projectPriority);
    return matchesStatusFilter && matchesPriority;
  });

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setPriorityFilters([]);
    setStatusFilters([]);
    setStatusFilter(null);
    setSearchQuery("");
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'CHF 0';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {showOnlyMine ? "Meine Aufträge" : "Alle Aufträge & Projekte"}
            </h1>
            {showOnlyMine && (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                Mir zugewiesen
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {showOnlyMine 
              ? "Aufträge und Projekte, die Ihnen als Projektleiter zugewiesen sind"
              : "Verwalten Sie alle Kundenaufträge an einem Ort"
            }
          </p>
        </div>
        <div className="flex gap-2">
          {showOnlyMine ? (
            <Button variant="outline" onClick={() => navigate("/projects")}>
              Alle anzeigen
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/projects?mine=true")}>
              <User className="h-4 w-4 mr-2" />
              Nur meine
            </Button>
          )}
          <Button className="gap-2" onClick={() => navigate("/projects/new")}>
            <Plus className="h-4 w-4" />
            Neuer Auftrag
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Aufträge suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="end">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Filter</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto py-1 px-2 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Status</Label>
                  <div className="space-y-2">
                    {Object.entries(statusConfig).filter(([key]) => !['paused', 'cancelled'].includes(key)).map(([key, config]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${key}`}
                          checked={statusFilters.includes(key)}
                          onCheckedChange={() => toggleStatusFilter(key)}
                        />
                        <label htmlFor={`status-${key}`} className="text-sm cursor-pointer">
                          {config.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Priorität</Label>
                  <div className="space-y-2">
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`priority-${key}`}
                          checked={priorityFilters.includes(key)}
                          onCheckedChange={() => togglePriorityFilter(key)}
                        />
                        <label htmlFor={`priority-${key}`} className="text-sm cursor-pointer">
                          {config.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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

      {/* Stats - Using Backend Data */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Gesamt", value: stats?.total || data?.total || 0, color: "text-foreground", filter: null },
          {
            label: "Aktiv",
            value: stats?.active || 0,
            color: "text-success",
            filter: "active",
          },
          {
            label: "Abgeschlossen",
            value: stats?.completed || 0,
            color: "text-info",
            filter: "completed",
          },
          {
            label: "Pausiert",
            value: stats?.paused || 0,
            color: "text-warning",
            filter: "on-hold",
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-dashed border-border bg-muted/30">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          {showOnlyMine ? (
            <>
              <p className="text-muted-foreground mb-2">
                Ihnen sind noch keine Aufträge zugewiesen
              </p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                Aufträge werden hier angezeigt, sobald Sie als Projektleiter eingetragen sind
              </p>
              <Button variant="outline" onClick={() => navigate("/projects")}>
                Alle Aufträge anzeigen
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                {searchQuery || hasActiveFilters ? 'Keine Projekte gefunden' : 'Noch keine Projekte vorhanden'}
              </p>
              {!searchQuery && !hasActiveFilters && (
                <Button onClick={() => navigate('/projects/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Projekt erstellen
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Projects Grid/List */}
      {!isLoading && filteredProjects.length > 0 && (
        <div
          className={cn(
            "grid gap-4",
            view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          {filteredProjects.map((project, index) => {
            const projectStatus = project.status?.toLowerCase().replace('_', '-') || 'planning';
            const projectPriority = project.priority?.toLowerCase() || 'medium';
            const statusInfo = statusConfig[projectStatus] || statusConfig.planning;
            const priorityInfo = priorityConfig[projectPriority] || priorityConfig.medium;
            const progress = project.progress || 0;
            const team = project.team || [];
            const managerName = project.manager 
              ? (project.manager.firstName && project.manager.lastName 
                ? `${project.manager.firstName} ${project.manager.lastName}` 
                : (project.manager as any).name || null)
              : null;

            return (
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
                          {project.client || project.customer?.companyName || project.customer?.name || 'Kein Kunde'}
                        </p>
                        {managerName && (
                          <p className="text-xs text-muted-foreground/70 flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {managerName}
                          </p>
                        )}
                      </div>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {view === "grid" && (
                      <>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fortschritt</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {team.slice(0, 3).map((member, idx) => (
                              <div
                                key={idx}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-2 ring-card"
                              >
                                {member}
                              </div>
                            ))}
                            {team.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-card">
                                +{team.length - 3}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={priorityInfo.color}
                          >
                            {priorityInfo.label}
                          </Badge>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Budget</span>
                            <span className="font-medium">
                              {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {view === "list" && (
                    <>
                      {managerName && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {managerName}
                        </div>
                      )}
                      <div className="w-48">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Fortschritt</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="flex -space-x-2">
                        {team.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-2 ring-card"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                      <Badge
                        variant="outline"
                        className={priorityInfo.color}
                      >
                        {priorityInfo.label}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(project.budget)}
                        </p>
                        <p className="text-sm text-muted-foreground">Budget</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
