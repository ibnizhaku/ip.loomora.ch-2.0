import { useSearchParams } from "react-router-dom";
import { ProjectForm } from "@/components/project/ProjectForm";

export default function ProjectCreate() {
  const [searchParams] = useSearchParams();
  const defaultCustomerId = searchParams.get("customerId") || undefined;

  return <ProjectForm mode="create" defaultCustomerId={defaultCustomerId} />;
}
