import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
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
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { TaskListItem } from "@/components/tasks/TaskListItem";

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

const defaultStatusCfg = { label: "Unbekannt", color: "text-muted-foreground", icon: Circle };
const defaultPriorityCfg = { label: "Unbekannt", color: "bg-muted text-muted-foreground" };

export default function Tasks() {
  const queryClient = useQueryClient();
  const { data: apiData } = useQuery({ queryKey: ["/tasks"], queryFn: () => api.get<any>("/tasks") });
  const tasks: any[] = apiData?.data || [];
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast.success("Aufgabe erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Aufgabe");
    },
  });

  const statusToggleMutation = useMutation({
    mutationFn: ({ taskId, newStatus }: { taskId: string; newStatus: string }) =>
      api.put(`/tasks/${taskId}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast.success("Status aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Status");
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const allProjects = Array.from(new Set(tasks.map((t: any) => String(t.project))));
  const hasActiveFilters = priorityFilters.length > 0 || projectFilters.length > 0;

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.project || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(t.priority);
    const matchesProject = projectFilters.length === 0 || projectFilters.includes(t.project);
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Split into active and completed tasks
  const activeTasks = filteredTasks.filter((t) => t.status !== "done" && t.status !== "DONE");
  const completedTasks = filteredTasks.filter((t) => t.status === "done" || t.status === "DONE");

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const toggleProjectFilter = (project: string) => {
    setProjectFilters(prev => 
      prev.includes(project) ? prev.filter(p => p !== project) : [...prev, project]
    );
  };

  const clearAllFilters = () => {
    setPriorityFilters([]);
    setProjectFilters([]);
  };

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo" || t.status === "TODO").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress" || t.status === "IN_PROGRESS").length,
    review: tasks.filter((t) => t.status === "review" || t.status === "REVIEW").length,
    done: tasks.filter((t) => t.status === "done" || t.status === "DONE").length,
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
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Projekt</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {allProjects.map((project) => (
                    <div key={project} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`project-${project}`}
                        checked={projectFilters.includes(project)}
                        onCheckedChange={() => toggleProjectFilter(project)}
                      />
                      <label htmlFor={`project-${project}`} className="text-sm cursor-pointer truncate">
                        {project}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Task List */}
      <div className="space-y-3">
        {activeTasks.map((task, index) => (
          <TaskListItem
            key={task.id}
            task={task}
            index={index}
            statusConfig={statusConfig}
            priorityConfig={priorityConfig}
            defaultStatusCfg={defaultStatusCfg}
            defaultPriorityCfg={defaultPriorityCfg}
            onNavigate={(id) => navigate(`/tasks/${id}`)}
            onToggleStatus={(taskId, currentStatus) => {
              const newStatus = currentStatus === "done" || currentStatus === "DONE" ? "TODO" : "DONE";
              statusToggleMutation.mutate({ taskId, newStatus });
            }}
            onDelete={(taskId) => {
              if (confirm("Aufgabe wirklich löschen?")) {
                deleteMutation.mutate(taskId);
              }
            }}
          />
        ))}
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Keine Aufgaben gefunden</p>
          </div>
        )}
      </div>

      {/* Completed Tasks - Collapsible */}
      {completedTasks.length > 0 && (
        <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 w-full py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left">
              {showCompleted ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-medium text-sm">
                Erledigte Aufgaben ({completedTasks.length})
              </span>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {completedTasks.map((task, index) => (
              <TaskListItem
                key={task.id}
                task={task}
                index={index}
                statusConfig={statusConfig}
                priorityConfig={priorityConfig}
                defaultStatusCfg={defaultStatusCfg}
                defaultPriorityCfg={defaultPriorityCfg}
                onNavigate={(id) => navigate(`/tasks/${id}`)}
                onToggleStatus={(taskId, currentStatus) => {
                  const newStatus = currentStatus === "done" || currentStatus === "DONE" ? "TODO" : "DONE";
                  statusToggleMutation.mutate({ taskId, newStatus });
                }}
                onDelete={(taskId) => {
                  if (confirm("Aufgabe wirklich löschen?")) {
                    deleteMutation.mutate(taskId);
                  }
                }}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
