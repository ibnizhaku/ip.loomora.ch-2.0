import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Users } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  status: "active" | "review" | "completed" | "paused";
  team: string[];
  dueDate: string;
}

const projects: Project[] = [
  {
    id: "1",
    name: "E-Commerce Platform",
    client: "Fashion Store GmbH",
    progress: 75,
    status: "active",
    team: ["AS", "TM", "LW"],
    dueDate: "15. Feb",
  },
  {
    id: "2",
    name: "Mobile Banking App",
    client: "FinTech Solutions",
    progress: 45,
    status: "active",
    team: ["MK", "SK"],
    dueDate: "28. Feb",
  },
  {
    id: "3",
    name: "CRM Integration",
    client: "Sales Pro AG",
    progress: 90,
    status: "review",
    team: ["AS", "MK", "TM", "LW"],
    dueDate: "5. Feb",
  },
  {
    id: "4",
    name: "Dashboard Redesign",
    client: "Data Analytics Inc.",
    progress: 30,
    status: "active",
    team: ["SK", "LW"],
    dueDate: "10. Mär",
  },
];

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success text-success-foreground" },
  review: { label: "Review", color: "bg-warning text-warning-foreground" },
  completed: { label: "Fertig", color: "bg-info text-info-foreground" },
  paused: { label: "Pausiert", color: "bg-muted text-muted-foreground" },
};

export function ProjectsOverview() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Aktive Projekte</h3>
        <button className="text-sm text-primary hover:underline">
          Alle Projekte
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={cn(
              "group p-4 rounded-xl border border-border transition-all duration-300",
              "hover:border-primary/30 hover:shadow-soft",
              "animate-slide-in-right"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium group-hover:text-primary transition-colors">
                  {project.name}
                </h4>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    statusConfig[project.status].color
                  )}
                >
                  {statusConfig[project.status].label}
                </span>
                <button className="p-1 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fortschritt</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member) => (
                      <div
                        key={member}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-2 ring-card"
                      >
                        {member}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-card">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Fällig: {project.dueDate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
