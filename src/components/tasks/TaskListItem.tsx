import {
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskListItemProps {
  task: any;
  index: number;
  statusConfig: Record<string, { label: string; color: string; icon: any }>;
  priorityConfig: Record<string, { label: string; color: string }>;
  defaultStatusCfg: { label: string; color: string; icon: any };
  defaultPriorityCfg: { label: string; color: string };
  onNavigate: (id: string) => void;
  onToggleStatus: (taskId: string, currentStatus: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskListItem({
  task,
  index,
  statusConfig,
  priorityConfig,
  defaultStatusCfg,
  defaultPriorityCfg,
  onNavigate,
  onToggleStatus,
  onDelete,
}: TaskListItemProps) {
  const sc = statusConfig[task.status] || defaultStatusCfg;
  const StatusIcon = sc.icon;
  const isDone = task.status === "done" || task.status === "DONE";

  return (
    <div
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onNavigate(task.id)}
    >
      <Checkbox
        checked={isDone}
        className="mt-1"
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={() => onToggleStatus(task.id, task.status)}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {task.number && (
                <span className="text-xs font-mono text-muted-foreground">{task.number}</span>
              )}
              <h3
                className={cn(
                  "font-medium hover:text-primary transition-colors",
                  isDone && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNavigate(task.id)}>Details anzeigen</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate(task.id)}>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Badge
            variant="outline"
            className={cn("gap-1", sc.color)}
          >
            <StatusIcon className="h-3 w-3" />
            {sc.label}
          </Badge>
          <Badge className={(priorityConfig[task.priority] || defaultPriorityCfg).color}>
            {(priorityConfig[task.priority] || defaultPriorityCfg).label}
          </Badge>

          {task.dueDate && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {task.dueDate}
            </div>
          )}

          {task.assignee && (
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-secondary">
                  {typeof task.assignee === 'string' 
                    ? task.assignee 
                    : `${task.assignee.firstName?.[0] || ''}${task.assignee.lastName?.[0] || ''}`}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 ml-auto">
              {task.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {task.project && (
          <p className="text-xs text-muted-foreground mt-2">
            {typeof task.project === 'string' ? task.project : task.project.name}
          </p>
        )}
      </div>
    </div>
  );
}
