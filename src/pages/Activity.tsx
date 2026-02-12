import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecentActivity } from "@/hooks/use-dashboard";
import { Loader2, FileText, FolderKanban, CheckSquare, User, Filter, ArrowLeft } from "lucide-react";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeColors: Record<string, string> = {
  project: "bg-info/10 text-info",
  invoice: "bg-success/10 text-success",
  customer: "bg-primary/10 text-primary",
  task: "bg-warning/10 text-warning",
};

const typeLabels: Record<string, string> = {
  project: "Projekt",
  invoice: "Rechnung",
  customer: "Kunde",
  task: "Aufgabe",
};

const typeIcons: Record<string, React.ElementType> = {
  project: FolderKanban,
  invoice: FileText,
  customer: User,
  task: CheckSquare,
};

interface ActivityItem {
  id: string;
  user: { name: string; initials: string };
  action: string;
  target: string;
  time: string;
  type: string;
  entityType: string;
  entityId?: string;
}

export default function Activity() {
  const navigate = useNavigate();
  const { data, isLoading } = useRecentActivity();
  const [filterType, setFilterType] = useState<string>("all");

  const activities: ActivityItem[] = [];

  if (data?.invoices) {
    data.invoices.forEach((inv: any) => {
      activities.push({
        id: `inv-${inv.id}`,
        user: {
          name: inv.customer?.name || "System",
          initials: (inv.customer?.name || "SY").substring(0, 2).toUpperCase(),
        },
        action: `Rechnung ${inv.number} erstellt`,
        target: inv.customer?.name || "Kunde",
        time: inv.createdAt,
        type: "invoice",
        entityType: "invoice",
        entityId: inv.id,
      });
    });
  }

  if (data?.projects) {
    data.projects.forEach((proj: any) => {
      activities.push({
        id: `proj-${proj.id}`,
        user: { name: "Projekt", initials: "PR" },
        action: proj.status === "COMPLETED" ? "Projekt abgeschlossen" : "Projekt aktualisiert",
        target: proj.name,
        time: proj.updatedAt,
        type: "project",
        entityType: "project",
        entityId: proj.id,
      });
    });
  }

  if (data?.tasks) {
    data.tasks.forEach((task: any) => {
      activities.push({
        id: `task-${task.id}`,
        user: { name: "Aufgabe", initials: "AU" },
        action: "Aufgabe erledigt",
        target: task.title || task.name,
        time: task.updatedAt,
        type: "task",
        entityType: "task",
        entityId: task.id,
      });
    });
  }

  const filtered = filterType === "all"
    ? activities
    : activities.filter((a) => a.type === filterType);

  const sorted = filtered.sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const handleClick = (activity: ActivityItem) => {
    if (!activity.entityId) return;
    const routes: Record<string, string> = {
      invoice: `/invoices/${activity.entityId}`,
      project: `/projects/${activity.entityId}`,
      task: `/tasks/${activity.entityId}`,
      customer: `/customers/${activity.entityId}`,
    };
    const route = routes[activity.entityType];
    if (route) navigate(route);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true, locale: de }),
        absolute: format(date, "dd.MM.yyyy HH:mm", { locale: de }),
      };
    } catch {
      return { relative: dateString, absolute: dateString };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Alle Aktivitäten
            </h1>
            <p className="text-muted-foreground">
              Chronologische Übersicht aller Änderungen
            </p>
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtern nach..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="invoice">Rechnungen</SelectItem>
            <SelectItem value="project">Projekte</SelectItem>
            <SelectItem value="task">Aufgaben</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {["invoice", "project", "task"].map((type) => {
          const count = activities.filter((a) => a.type === type).length;
          const Icon = typeIcons[type];
          return (
            <div
              key={type}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setFilterType(filterType === type ? "all" : type)}
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeColors[type])}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{typeLabels[type]}n</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity List */}
      <div className="rounded-2xl bg-card border border-border">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Keine Aktivitäten vorhanden.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sorted.map((activity, index) => {
              const TypeIcon = typeIcons[activity.type];
              const time = formatTime(activity.time);

              return (
                <div
                  key={activity.id}
                  onClick={() => handleClick(activity)}
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-border mt-0.5">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                      {activity.user.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium text-primary">{activity.target}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          typeColors[activity.type]
                        )}
                      >
                        {TypeIcon && <TypeIcon className="h-3 w-3" />}
                        {typeLabels[activity.type]}
                      </span>
                      <span className="text-xs text-muted-foreground" title={time.absolute}>
                        {time.relative}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
