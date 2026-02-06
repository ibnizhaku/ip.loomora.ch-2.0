import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "@/hooks/use-projects";

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "In Arbeit", color: "bg-success text-success-foreground" },
  planning: { label: "Planung", color: "bg-info text-info-foreground" },
  "on-hold": { label: "Pausiert", color: "bg-muted text-muted-foreground" },
  completed: { label: "Abgeschlossen", color: "bg-primary text-primary-foreground" },
  cancelled: { label: "Storniert", color: "bg-destructive text-destructive-foreground" },
  review: { label: "Abnahme", color: "bg-warning text-warning-foreground" },
  paused: { label: "Pausiert", color: "bg-muted text-muted-foreground" },
};

export function ProjectsOverview() {
  const navigate = useNavigate();
  const { data, isLoading } = useProjects({ 
    status: 'ACTIVE',
    pageSize: 5,
  });

  const projects = data?.data || [];

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Laufende Aufträge</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Laufende Aufträge</h3>
          <button 
            onClick={() => navigate('/projects')}
            className="text-sm text-primary hover:underline"
          >
            Alle Aufträge
          </button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>Keine aktiven Aufträge vorhanden.</p>
          <button 
            onClick={() => navigate('/projects/new')}
            className="mt-2 text-primary hover:underline text-sm"
          >
            Ersten Auftrag anlegen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Laufende Aufträge</h3>
        <button 
          onClick={() => navigate('/projects')}
          className="text-sm text-primary hover:underline"
        >
          Alle Aufträge
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => {
          const statusKey = project.status?.toLowerCase().replace('_', '-') || 'active';
          const config = statusConfig[statusKey] || statusConfig.active;

          return (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={cn(
                "group p-4 rounded-xl border border-border transition-all duration-300 cursor-pointer",
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
                  <p className="text-sm text-muted-foreground">
                    {project.client || project.customer?.name || 'Kein Kunde'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      config.color
                    )}
                  >
                    {config.label}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fortschritt</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-2">
                      {(project.team || []).slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium ring-2 ring-card"
                        >
                          {member}
                        </div>
                      ))}
                      {(project.team?.length || 0) > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-card">
                          +{(project.team?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  {project.endDate && (
                    <span className="text-xs text-muted-foreground">
                      Fällig: {new Date(project.endDate).toLocaleDateString('de-CH', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
