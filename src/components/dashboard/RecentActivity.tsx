import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRecentActivity } from "@/hooks/use-dashboard";
import { Loader2, FileText, FolderKanban, CheckSquare, User } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const typeColors = {
  project: "bg-info/10 text-info",
  invoice: "bg-success/10 text-success",
  customer: "bg-primary/10 text-primary",
  task: "bg-warning/10 text-warning",
};

const typeLabels = {
  project: "Projekt",
  invoice: "Rechnung",
  customer: "Kunde",
  task: "Aufgabe",
};

const typeIcons = {
  project: FolderKanban,
  invoice: FileText,
  customer: User,
  task: CheckSquare,
};

export function RecentActivity() {
  const navigate = useNavigate();
  const { data, isLoading } = useRecentActivity();

  const handleActivityClick = (activity: { entityType: string; entityId?: string }) => {
    if (!activity.entityId) return;

    const routes: Record<string, string> = {
      invoice: `/invoices/${activity.entityId}`,
      project: `/projects/${activity.entityId}`,
      task: `/tasks/${activity.entityId}`,
      customer: `/customers/${activity.entityId}`,
    };

    const route = routes[activity.entityType.toLowerCase()];
    if (route) {
      navigate(route);
    }
  };

  // Transform backend data to display format
  const activities = [];

  // Add invoices to activities
  if (data?.invoices) {
    data.invoices.forEach((inv: any) => {
      activities.push({
        id: `inv-${inv.id}`,
        user: {
          name: inv.customer?.name || 'System',
          initials: (inv.customer?.name || 'SY').substring(0, 2).toUpperCase(),
        },
        action: `Rechnung ${inv.number} erstellt`,
        target: inv.customer?.name || 'Kunde',
        time: inv.createdAt,
        type: 'invoice' as const,
        entityType: 'invoice',
        entityId: inv.id,
      });
    });
  }

  // Add projects to activities
  if (data?.projects) {
    data.projects.forEach((proj: any) => {
      activities.push({
        id: `proj-${proj.id}`,
        user: {
          name: 'Projekt',
          initials: 'PR',
        },
        action: proj.status === 'COMPLETED' ? 'Projekt abgeschlossen' : 'Projekt aktualisiert',
        target: proj.name,
        time: proj.updatedAt,
        type: 'project' as const,
        entityType: 'project',
        entityId: proj.id,
      });
    });
  }

  // Add tasks to activities
  if (data?.tasks) {
    data.tasks.forEach((task: any) => {
      activities.push({
        id: `task-${task.id}`,
        user: {
          name: 'Aufgabe',
          initials: 'AU',
        },
        action: 'Aufgabe erledigt',
        target: task.title || task.name,
        time: task.updatedAt,
        type: 'task' as const,
        entityType: 'task',
        entityId: task.id,
      });
    });
  }

  // Sort by time and take latest 8
  const sortedActivities = activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: de });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Letzte Aktivitäten</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (sortedActivities.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Letzte Aktivitäten</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>Keine aktuellen Aktivitäten vorhanden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Letzte Aktivitäten</h3>
        <button 
          onClick={() => navigate('/activity')}
          className="text-sm text-primary hover:underline"
        >
          Alle anzeigen
        </button>
      </div>

      <div className="space-y-4">
        {sortedActivities.map((activity, index) => {
          const TypeIcon = typeIcons[activity.type];
          
          return (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className={cn(
                "flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-muted/50 cursor-pointer",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar className="h-10 w-10 ring-2 ring-border">
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
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      typeColors[activity.type]
                    )}
                  >
                    <TypeIcon className="h-3 w-3" />
                    {typeLabels[activity.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(activity.time)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
