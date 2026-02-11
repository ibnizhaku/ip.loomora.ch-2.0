import { useParams, Link, useNavigate } from "react-router-dom";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTask, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  "TODO": { label: "Zu erledigen", color: "bg-muted text-muted-foreground", icon: CheckSquare },
  "IN_PROGRESS": { label: "In Bearbeitung", color: "bg-info/10 text-info", icon: Clock },
  "REVIEW": { label: "Review", color: "bg-warning/10 text-warning", icon: AlertCircle },
  "DONE": { label: "Erledigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "CANCELLED": { label: "Abgebrochen", color: "bg-destructive/10 text-destructive", icon: Trash2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  "LOW": { label: "Niedrig", color: "bg-muted text-muted-foreground" },
  "MEDIUM": { label: "Mittel", color: "bg-info/10 text-info" },
  "HIGH": { label: "Hoch", color: "bg-warning/10 text-warning" },
};

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading, error } = useTask(id || "");
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();

  const handleDelete = () => {
    if (!id) return;
    deleteTask.mutate(id, {
      onSuccess: () => {
        toast({ title: "Aufgabe gelöscht", description: "Die Aufgabe wurde erfolgreich gelöscht." });
        navigate("/tasks");
      },
      onError: () => {
        toast({ title: "Fehler", description: "Die Aufgabe konnte nicht gelöscht werden.", variant: "destructive" });
      },
    });
  };

  const handleStatusChange = (newStatus: string) => {
    if (!id) return;
    updateTask.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => {
        toast({ title: "Status geändert", description: `Status wurde aktualisiert.` });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-4">
        <Link to="/tasks">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">Aufgabe nicht gefunden</h2>
            <p className="text-muted-foreground mt-2">Die angeforderte Aufgabe existiert nicht oder wurde gelöscht.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[task.status] || statusConfig["TODO"];
  const priority = priorityConfig[task.priority] || priorityConfig["MEDIUM"];
  const StatusIcon = status.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
    } catch {
      return dateStr;
    }
  };

  const assigneeInitials = task.assignee 
    ? `${task.assignee.firstName?.charAt(0) || ""}${task.assignee.lastName?.charAt(0) || ""}` 
    : "??";
  const assigneeName = task.assignee 
    ? `${task.assignee.firstName} ${task.assignee.lastName}` 
    : "Nicht zugewiesen";

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
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <Badge className={priority.color}>
                <Flag className="h-3 w-3 mr-1" />
                {priority.label}
              </Badge>
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <h1 className="font-display text-2xl font-bold mt-1">{task.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${id}/edit`)}>
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
              <DropdownMenuItem onClick={() => handleStatusChange("TODO")}>Zu erledigen</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")}>In Bearbeitung</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("REVIEW")}>Review</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("DONE")}>Erledigt</DropdownMenuItem>
              <Separator className="my-1" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Aufgabe löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden. Die Aufgabe wird dauerhaft gelöscht.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              <p className="text-muted-foreground">
                {task.description || "Keine Beschreibung vorhanden."}
              </p>
            </CardContent>
          </Card>

          {/* Comments placeholder - backend needed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kommentare
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                Kommentare werden nach der Backend-Erweiterung verfügbar sein.
              </p>
              <Separator className="my-4" />
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">Du</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea placeholder="Kommentar schreiben..." className="min-h-[80px]" disabled />
                  <Button size="sm" disabled>Kommentar hinzufügen</Button>
                </div>
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

              <div className="space-y-3">
                {task.project && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projekt</span>
                    <Link to={`/projects/${task.project.id}`} className="font-medium hover:text-primary flex items-center gap-1">
                      <FolderKanban className="h-4 w-4" />
                      {task.project.name}
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Erstellt am</span>
                  <span className="font-medium">{formatDate(task.createdAt)}</span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fällig am</span>
                    <span className="font-medium">{formatDate(task.dueDate)}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Erledigt am</span>
                    <span className="font-medium">{formatDate(task.completedAt)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zeiterfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/time")}>
                <Clock className="h-4 w-4 mr-2" />
                Zeit buchen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
