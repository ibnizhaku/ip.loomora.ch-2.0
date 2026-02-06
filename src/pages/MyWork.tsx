import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  X, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Circle, 
  FolderKanban,
  Play,
  Calendar,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

// Simulated current user ID (would come from auth context in production)
const CURRENT_USER_ID = "1";

// Mock data for user's assigned tasks/work items
const mockMyWork = [
  {
    id: "w1",
    title: "Zuschnitt Stahlprofile",
    projectId: "p1",
    projectName: "Stahltreppe Bürogebäude",
    projectNumber: "PRJ-2024-001",
    phase: "Fertigung",
    dueDate: "2024-02-15",
    status: "IN_PROGRESS",
    priority: "HIGH",
    estimatedHours: 8,
    loggedHours: 4.5,
    assignedTo: "1",
  },
  {
    id: "w2",
    title: "Schweissarbeiten Geländer",
    projectId: "p1",
    projectName: "Stahltreppe Bürogebäude",
    projectNumber: "PRJ-2024-001",
    phase: "Fertigung",
    dueDate: "2024-02-18",
    status: "PENDING",
    priority: "HIGH",
    estimatedHours: 12,
    loggedHours: 0,
    assignedTo: "1",
  },
  {
    id: "w3",
    title: "Oberflächenbehandlung",
    projectId: "p3",
    projectName: "Industrietor elektrisch",
    projectNumber: "PRJ-2024-003",
    phase: "Nachbearbeitung",
    dueDate: "2024-02-20",
    status: "PENDING",
    priority: "MEDIUM",
    estimatedHours: 6,
    loggedHours: 0,
    assignedTo: "1",
  },
  {
    id: "w4",
    title: "Montage vor Ort",
    projectId: "p4",
    projectName: "Balkongeländer Residenz",
    projectNumber: "PRJ-2023-004",
    phase: "Montage",
    dueDate: "2024-02-10",
    status: "DONE",
    priority: "HIGH",
    estimatedHours: 16,
    loggedHours: 18,
    assignedTo: "1",
  },
  {
    id: "w5",
    title: "CNC-Bearbeitung Fassadenelemente",
    projectId: "p5",
    projectName: "Fassadenverkleidung Hotel",
    projectNumber: "PRJ-2024-005",
    phase: "Fertigung",
    dueDate: "2024-02-22",
    status: "IN_PROGRESS",
    priority: "HIGH",
    estimatedHours: 24,
    loggedHours: 8,
    assignedTo: "1",
  },
  {
    id: "w6",
    title: "Qualitätskontrolle",
    projectId: "p5",
    projectName: "Fassadenverkleidung Hotel",
    projectNumber: "PRJ-2024-005",
    phase: "QS",
    dueDate: "2024-02-25",
    status: "PENDING",
    priority: "MEDIUM",
    estimatedHours: 4,
    loggedHours: 0,
    assignedTo: "1",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Offen", color: "bg-muted text-muted-foreground", icon: Circle },
  IN_PROGRESS: { label: "In Arbeit", color: "bg-warning/15 text-warning", icon: Play },
  DONE: { label: "Erledigt", color: "bg-success/15 text-success", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  HIGH: { label: "Hoch", color: "bg-destructive/10 text-destructive border-destructive/20" },
  MEDIUM: { label: "Mittel", color: "bg-warning/10 text-warning border-warning/20" },
  LOW: { label: "Niedrig", color: "bg-muted text-muted-foreground border-border" },
};

const phaseConfig: Record<string, string> = {
  "Planung": "bg-info/10 text-info",
  "Fertigung": "bg-primary/10 text-primary",
  "Nachbearbeitung": "bg-secondary text-secondary-foreground",
  "Montage": "bg-success/10 text-success",
  "QS": "bg-warning/10 text-warning",
};

export default function MyWork() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [isLoading] = useState(false);

  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0;

  // Filter work items
  const filteredWork = mockMyWork.filter((item) => {
    // Only show items assigned to current user
    if (item.assignedTo !== CURRENT_USER_ID) return false;
    
    // Search filter
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(item.status);
    
    // Priority filter
    const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(item.priority);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const stats = {
    total: filteredWork.length,
    pending: filteredWork.filter(w => w.status === "PENDING").length,
    inProgress: filteredWork.filter(w => w.status === "IN_PROGRESS").length,
    done: filteredWork.filter(w => w.status === "DONE").length,
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilters(prev => 
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const clearAllFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setSearchQuery("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleLogTime = (workItem: typeof mockMyWork[0]) => {
    // Navigate to time tracking with pre-filled data
    navigate(`/time-tracking?projectId=${workItem.projectId}&taskId=${workItem.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Meine Arbeit
          </h1>
          <p className="text-muted-foreground">
            Ihre zugewiesenen Tätigkeiten und Fertigungsschritte
          </p>
        </div>
        <Button onClick={() => navigate("/time-tracking")} className="gap-2">
          <Clock className="h-4 w-4" />
          Zeit erfassen
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tätigkeit oder Projekt suchen..."
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
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <div className="space-y-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Alle Aufgaben", value: stats.total, color: "text-foreground", filter: null },
          { label: "Offen", value: stats.pending, color: "text-muted-foreground", filter: "PENDING" },
          { label: "In Arbeit", value: stats.inProgress, color: "text-warning", filter: "IN_PROGRESS" },
          { label: "Erledigt", value: stats.done, color: "text-success", filter: "DONE" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => {
              if (stat.filter) {
                setStatusFilters(prev => 
                  prev.includes(stat.filter) ? [] : [stat.filter]
                );
              } else {
                setStatusFilters([]);
              }
            }}
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30",
              stat.filter && statusFilters.includes(stat.filter) && "border-primary ring-1 ring-primary",
              !stat.filter && statusFilters.length === 0 && "border-primary/50"
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
      {!isLoading && filteredWork.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-dashed border-border bg-muted/30">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-2">
            Keine offenen Aufgaben
          </p>
          <p className="text-sm text-muted-foreground/70">
            Alle Ihre Tätigkeiten sind erledigt oder es wurden Ihnen noch keine zugewiesen.
          </p>
        </div>
      )}

      {/* Work Items List */}
      {!isLoading && filteredWork.length > 0 && (
        <div className="space-y-3">
          {filteredWork.map((item, index) => {
            const statusInfo = statusConfig[item.status] || statusConfig.PENDING;
            const priorityInfo = priorityConfig[item.priority] || priorityConfig.MEDIUM;
            const phaseColor = phaseConfig[item.phase] || "bg-muted text-muted-foreground";
            const StatusIcon = statusInfo.icon;
            const progress = item.estimatedHours > 0 
              ? Math.round((item.loggedHours / item.estimatedHours) * 100) 
              : 0;

            return (
              <Card
                key={item.id}
                className={cn(
                  "group transition-all duration-200 hover:border-primary/30 hover:shadow-soft animate-fade-in",
                  item.status === "DONE" && "opacity-60"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      statusInfo.color
                    )}>
                      <StatusIcon className="h-5 w-5" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {/* Task Title */}
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          
                          {/* Project Reference */}
                          <button 
                            onClick={() => navigate(`/projects/${item.projectId}`)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mt-0.5"
                          >
                            <FolderKanban className="h-3.5 w-3.5" />
                            <span className="truncate">{item.projectNumber} – {item.projectName}</span>
                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>

                        {/* Priority Badge */}
                        <Badge variant="outline" className={cn("shrink-0", priorityInfo.color)}>
                          {priorityInfo.label}
                        </Badge>
                      </div>

                      {/* Meta Info Row */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        {/* Phase */}
                        <Badge variant="secondary" className={cn("font-normal", phaseColor)}>
                          {item.phase}
                        </Badge>

                        {/* Due Date */}
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(item.dueDate)}
                        </span>

                        {/* Time Progress */}
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {item.loggedHours}h / {item.estimatedHours}h
                          {progress > 100 && (
                            <span className="text-destructive font-medium">({progress}%)</span>
                          )}
                        </span>

                        {/* Status */}
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button */}
                    {item.status !== "DONE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLogTime(item)}
                        className="shrink-0 gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Zeit erfassen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
