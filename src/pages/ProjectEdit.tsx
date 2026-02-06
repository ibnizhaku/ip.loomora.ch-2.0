import { useParams } from "react-router-dom";
import { ProjectForm } from "@/components/project/ProjectForm";
import { useProject } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";

export default function ProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Projekt nicht gefunden</p>
      </div>
    );
  }

  return <ProjectForm mode="edit" initialData={project} />;
}
