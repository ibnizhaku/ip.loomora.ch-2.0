import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CheckSquare,
  Calendar,
  Clock,
  User,
  Flag,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Users,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Offen": { color: "bg-muted text-muted-foreground", icon: CheckSquare },
  "In Bearbeitung": { color: "bg-info/10 text-info", icon: Clock },
  "Review": { color: "bg-warning/10 text-warning", icon: AlertCircle },
  "Erledigt": { color: "bg-success/10 text-success", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { color: string }> = {
  "Niedrig": { color: "bg-muted text-muted-foreground" },
  "Mittel": { color: "bg-info/10 text-info" },
  "Hoch": { color: "bg-warning/10 text-warning" },
  "Kritisch": { color: "bg-destructive/10 text-destructive" },
};

const statusMap: Record<string, string> = {
  TODO: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  REVIEW: "Review",
  DONE: "Erledigt",
};

const priorityMap: Record<string, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
};

const statusOptions = [
  { value: "TODO", label: "Offen" },
  { value: "IN_PROGRESS", label: "In Bearbeitung" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Erledigt" },
];

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading, error } = useQuery({
    queryKey: ["/tasks", id],
    queryFn: () => api.get<any>(`/tasks/${id}`),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks", id] });
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast.success("Aufgabe aktualisiert");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Aufgabe");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast.success("Aufgabe gelöscht");
      navigate("/tasks");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Aufgabe");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Aufgabe nicht gefunden</p>
        <Link to="/tasks">
          <Button variant="outline">Zurück zur Übersicht</Button>
        </Link>
      </div>
    );
  }

  // Map backend data to display format
  const statusLabel = statusMap[task.status] || "Offen";
  const priorityLabel = priorityMap[task.priority] || "Mittel";
  const status = statusConfig[statusLabel] || statusConfig["Offen"];
  const priority = priorityConfig[priorityLabel] || priorityConfig["Mittel"];
  const StatusIcon = status.icon;

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s: any) => s.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const timeEntries = task.timeEntries || [];
  const loggedMinutes = timeEntries.reduce((sum: number, te: any) => sum + (te.duration || 0), 0);
  const loggedHours = Math.round((loggedMinutes / 60) * 10) / 10;
  const estimatedHours = task.estimatedHours ? Number(task.estimatedHours) : 0;
  const timePercent = estimatedHours > 0 ? Math.round((loggedHours / estimatedHours) * 100) : 0;

  const assigneeName = task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Nicht zugewiesen";
  const assigneeInitials = task.assignee ? `${task.assignee.firstName.charAt(0)}${task.assignee.lastName.charAt(0)}` : "–";
  const reporterName = task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : "Unbekannt";
  const reporterInitials = task.createdBy ? `${task.createdBy.firstName.charAt(0)}${task.createdBy.lastName.charAt(0)}` : "–";

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "–";
    try {
      return new Date(dateStr).toLocaleDateString("de-CH");
    } catch {
      return "–";
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({ status: newStatus });
  };

  const handleDelete = () => {
    if (confirm("Aufgabe wirklich löschen?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-muted-foreground">{task.id.substring(0, 12)}</span>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusLabel}
              </Badge>
              <Badge className={priority.color}>
                <Flag className="h-3 w-3 mr-1" />
                {priorityLabel}
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-bold mt-1">{task.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions
                .filter((opt) => opt.value !== task.status)
                .map((opt) => (
                  <DropdownMenuItem key={opt.value} onClick={() => handleStatusChange(opt.value)}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{task.description || "Keine Beschreibung vorhanden."}</p>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unteraufgaben</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedSubtasks} von {subtasks.length} erledigt
                </p>
              </div>
              <Button variant="outline" size="sm">
                Hinzufügen
              </Button>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-2 mb-4" />
              <div className="space-y-2">
                {subtasks.map((subtask: any) => (
                  <div 
                    key={subtask.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      subtask.isCompleted ? "bg-success/5 border-success/20" : "bg-muted/50"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded ${
                      subtask.isCompleted ? "bg-success text-success-foreground" : "border-2 border-muted-foreground/30"
                    }`}>
                      {subtask.isCompleted && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <span className={subtask.isCompleted ? "line-through text-muted-foreground" : ""}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
                {subtasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Unteraufgaben vorhanden
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kommentare (0)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                Kommentare sind noch nicht verfügbar.
              </p>

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">–</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea placeholder="Kommentar schreiben..." className="min-h-[80px]" />
                  <Button size="sm" disabled>Kommentar hinzufügen</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivität</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeEntries.length > 0 ? (
                  timeEntries.map((entry: any, index: number) => (
                    <div key={entry.id || index} className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{entry.description || "Zeitbuchung"}: {entry.duration} Min.</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(entry.date)}</span>
                          <span>•</span>
                          <span>{entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : "–"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Aktivitäten vorhanden
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">ZUGEWIESEN AN</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{assigneeInitials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{assigneeName}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">ERSTELLT VON</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{reporterInitials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{reporterName}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Projekt</span>
                  {task.project ? (
                    <Link to={`/projects/${task.project.id}`} className="font-medium hover:text-primary flex items-center gap-1">
                      <FolderKanban className="h-4 w-4" />
                      {task.project.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Erstellt am</span>
                  <span className="font-medium">{formatDate(task.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fällig am</span>
                  <span className="font-medium">{formatDate(task.dueDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zeiterfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Geschätzt</span>
                <span className="font-medium">{estimatedHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gebucht</span>
                <span className="font-medium">{loggedHours}h</span>
              </div>
              <Progress value={timePercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {timePercent}% der geschätzten Zeit
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Zeit buchen
              </Button>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anhänge (0)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Anhänge vorhanden
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Datei anhängen
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          {(task.tags || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(task.tags || []).map((tag: any) => (
                    <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
