import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
  type: "project" | "invoice" | "customer" | "task";
}

const activities: Activity[] = [
  {
    id: "1",
    user: { name: "Anna Schmidt", initials: "AS" },
    action: "hat Rechnung erstellt für",
    target: "Weber GmbH",
    time: "vor 5 Min.",
    type: "invoice",
  },
  {
    id: "2",
    user: { name: "Thomas Müller", initials: "TM" },
    action: "hat Projekt abgeschlossen",
    target: "Website Redesign",
    time: "vor 23 Min.",
    type: "project",
  },
  {
    id: "3",
    user: { name: "Lisa Weber", initials: "LW" },
    action: "hat neuen Kunden hinzugefügt",
    target: "Tech Solutions AG",
    time: "vor 1 Std.",
    type: "customer",
  },
  {
    id: "4",
    user: { name: "Max Keller", initials: "MK" },
    action: "hat Aufgabe zugewiesen an",
    target: "Frontend Team",
    time: "vor 2 Std.",
    type: "task",
  },
  {
    id: "5",
    user: { name: "Sarah Koch", initials: "SK" },
    action: "hat Kommentar hinzugefügt zu",
    target: "Mobile App Projekt",
    time: "vor 3 Std.",
    type: "project",
  },
];

const typeColors = {
  project: "bg-info/10 text-info",
  invoice: "bg-success/10 text-success",
  customer: "bg-primary/10 text-primary",
  task: "bg-warning/10 text-warning",
};

export function RecentActivity() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Letzte Aktivitäten</h3>
        <button className="text-sm text-primary hover:underline">
          Alle anzeigen
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-muted/50",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Avatar className="h-10 w-10 ring-2 ring-border">
              <AvatarImage src={activity.user.avatar} />
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
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    typeColors[activity.type]
                  )}
                >
                  {activity.type === "project" && "Projekt"}
                  {activity.type === "invoice" && "Rechnung"}
                  {activity.type === "customer" && "Kunde"}
                  {activity.type === "task" && "Aufgabe"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
