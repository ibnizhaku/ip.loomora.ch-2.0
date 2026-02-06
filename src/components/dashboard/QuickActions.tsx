import { Plus, FileText, Users, FolderPlus, Clock, Factory } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  icon: typeof Plus;
  color: string;
  bgColor: string;
  path: string;
}

const actions: QuickAction[] = [
  {
    title: "Neuer Auftrag",
    description: "Kundenauftrag anlegen",
    icon: FolderPlus,
    color: "text-primary",
    bgColor: "bg-primary/10 group-hover:bg-primary/20",
    path: "/projects/new",
  },
  {
    title: "Betriebszeit",
    description: "Zeit erfassen",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10 group-hover:bg-warning/20",
    path: "/time-tracking",
  },
  {
    title: "Neue Rechnung",
    description: "Rechnung schreiben",
    icon: FileText,
    color: "text-success",
    bgColor: "bg-success/10 group-hover:bg-success/20",
    path: "/invoices/new",
  },
  {
    title: "Werkstatt",
    description: "Fertigungsauftrag",
    icon: Factory,
    color: "text-info",
    bgColor: "bg-info/10 group-hover:bg-info/20",
    path: "/production",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <h3 className="font-display font-semibold text-lg mb-4">Schnellaktionen</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className={cn(
              "group flex flex-col items-center gap-3 p-4 rounded-xl border border-border",
              "transition-all duration-300 hover:border-primary/30 hover:shadow-soft",
              "animate-scale-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                action.bgColor
              )}
            >
              <action.icon className={cn("h-6 w-6", action.color)} />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">{action.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
