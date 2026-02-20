import { useState, useRef } from "react";
import { TagInput } from "@/components/tasks/TagInput";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
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
  Loader2,
  Plus,
  Send,
  Upload,
  Download,
  Eye,
  X,
  FileText,
  Image,
  File as FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEntityHistory } from "@/hooks/use-audit-log";

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

const priorityOptions = [
  { value: "LOW", label: "Niedrig" },
  { value: "MEDIUM", label: "Mittel" },
  { value: "HIGH", label: "Hoch" },
];

const approvalStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ausstehend", color: "bg-warning/10 text-warning" },
  approved: { label: "Genehmigt", color: "bg-success/10 text-success" },
  rejected: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive" },
};

const ROLES_CAN_BOOK_TIME = ['ADMIN', 'OWNER', 'HR', 'PROJECT_MANAGER', 'MANAGER'];

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeCompany } = useAuth();
  const userRole = activeCompany?.role?.toUpperCase() || '';
  const canBookTime = activeCompany?.isOwner || ROLES_CAN_BOOK_TIME.includes(userRole);

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSubtaskDialog, setShowSubtaskDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);

  // Form states
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentText, setCommentText] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeDescription, setTimeDescription] = useState("");

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

  const addSubtaskMutation = useMutation({
    mutationFn: (data: { title: string }) => api.post(`/tasks/${id}/subtasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks", id] });
      toast.success("Unteraufgabe hinzugefügt");
      setNewSubtaskTitle("");
      setShowSubtaskDialog(false);
    },
    onError: () => toast.error("Fehler beim Hinzufügen der Unteraufgabe"),
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, isCompleted }: { subtaskId: string; isCompleted: boolean }) =>
      api.put(`/tasks/${id}/subtasks/${subtaskId}`, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks", id] });
    },
    onError: () => toast.error("Fehler beim Aktualisieren der Unteraufgabe"),
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string }) => api.post(`/tasks/${id}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks", id] });
      toast.success("Kommentar hinzugefügt");
      setCommentText("");
    },
    onError: () => toast.error("Fehler beim Hinzufügen des Kommentars"),
  });

  const addTimeMutation = useMutation({
    mutationFn: (data: { duration: number; description?: string }) => api.post(`/tasks/${id}/time-entries`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks", id] });
      queryClient.invalidateQueries({ queryKey: ["time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/tasks"] });
      toast.success("Zeit gebucht");
      setTimeMinutes("");
      setTimeDescription("");
      setShowTimeDialog(false);
    },
    onError: () => toast.error("Fehler beim Buchen der Zeit"),
  });

  const addAttachmentMutation = useMutation({
    mutationFn: (formData: FormData) => api.upload(`/tasks/${id}/attachments`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/tasks", id] });
      toast.success("Datei angehängt");
    },
    onError: () => toast.error("Fehler beim Anhängen der Datei"),
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

  const statusLabel = statusMap[task.status] || "Offen";
  const priorityLabel = priorityMap[task.priority] || "Mittel";
  const status = statusConfig[statusLabel] || statusConfig["Offen"];
  const priority = priorityConfig[priorityLabel] || priorityConfig["Mittel"];
  const StatusIcon = status.icon;

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s: any) => s.isCompleted || s.status === 'DONE').length;
  const progressPercent = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const timeEntries = task.timeEntries || [];
  // approvedMinutes / pendingMinutes: für Einzelanzeige "Gebucht" / "Ausstehend"
  const approvedMinutes = timeEntries
    .filter((te: any) => te.approvalStatus === 'approved')
    .reduce((sum: number, te: any) => sum + (te.duration || 0), 0);
  const pendingMinutes = timeEntries
    .filter((te: any) => !te.approvalStatus || te.approvalStatus === 'pending')
    .reduce((sum: number, te: any) => sum + (te.duration || 0), 0);
  // Fallback: ALLE Einträge summieren (nicht nur approved)
  const totalMinutes = timeEntries
    .reduce((sum: number, te: any) => sum + (te.duration || 0), 0);
  const loggedMinutes = task.loggedMinutes ?? totalMinutes;
  const estimatedHours = task.estimatedHours ? Number(task.estimatedHours) : 0;
  const timePercent = estimatedHours > 0
    ? Math.round((loggedMinutes / (estimatedHours * 60)) * 100)
    : 0;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${String(m).padStart(2, '0')}min`;
  };

  const comments = task.comments || [];
  const attachments = task.attachments || [];

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

  const openEditDialog = () => {
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditStatus(task.status || "TODO");
    setEditPriority(task.priority || "MEDIUM");
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : "");
    setShowEditDialog(true);
  };

  const handleEditSave = () => {
    const payload: any = { title: editTitle };
    if (editDescription) payload.description = editDescription;
    if (editStatus) payload.status = editStatus;
    if (editPriority) payload.priority = editPriority;
    if (editDueDate) payload.dueDate = editDueDate;
    updateMutation.mutate(payload);
    setShowEditDialog(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addCommentMutation.mutate({ content: commentText.trim() });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    addSubtaskMutation.mutate({ title: newSubtaskTitle.trim() });
  };

  const handleAddTime = () => {
    const hours = parseFloat(timeMinutes);
    if (!hours || hours <= 0) return;
    const mins = Math.round(hours * 60);
    addTimeMutation.mutate({ duration: mins, description: timeDescription || undefined });
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const formData = new FormData();
      formData.append('file', file);
      addAttachmentMutation.mutate(formData);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    return FileIcon;
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
              <span className="text-sm font-mono text-muted-foreground">{task.number || task.id.substring(0, 12)}</span>
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
          <Button variant="outline" size="sm" onClick={openEditDialog}>
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
              <DropdownMenuItem onClick={() => toast.info("Aufgabe wird dupliziert...")}>Duplizieren</DropdownMenuItem>
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
              <Button variant="outline" size="sm" onClick={() => setShowSubtaskDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
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
                      subtask.isCompleted || subtask.status === 'DONE' ? "bg-success/5 border-success/20" : "bg-muted/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubtaskMutation.mutate({ 
                        subtaskId: subtask.id, 
                        isCompleted: !(subtask.isCompleted || subtask.status === 'DONE') 
                      })}
                      className={`flex h-5 w-5 items-center justify-center rounded cursor-pointer transition-colors ${
                        subtask.isCompleted || subtask.status === 'DONE' ? "bg-success text-success-foreground" : "border-2 border-muted-foreground/30 hover:border-primary"
                      }`}
                    >
                      {(subtask.isCompleted || subtask.status === 'DONE') && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <span className={(subtask.isCompleted || subtask.status === 'DONE') ? "line-through text-muted-foreground" : ""}>
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
                Kommentare ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.author ? `${comment.author.firstName?.[0] || ''}${comment.author.lastName?.[0] || ''}` : '–'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : 'Unbekannt'}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Kommentare vorhanden
                </p>
              )}

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">–</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea 
                    placeholder="Kommentar schreiben..." 
                    className="min-h-[80px]"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button 
                    size="sm" 
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                    onClick={handleAddComment}
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Kommentar hinzufügen
                  </Button>
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

          {/* Time Tracking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zeiterfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Geschätzt</span>
                <span className="font-medium">{formatMinutes(estimatedHours * 60)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gebucht</span>
                <span className="font-medium text-success">{formatMinutes(loggedMinutes)}</span>
              </div>
              {pendingMinutes > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ausstehend</span>
                  <span className="font-medium text-warning">{formatMinutes(pendingMinutes)}</span>
                </div>
              )}
              <Progress value={timePercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {timePercent}% der geschätzten Zeit
              </p>
              {canBookTime && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowTimeDialog(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Zeit buchen
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Anhänge ({attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attachments.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {attachments.map((att: any) => {
                    const AttFileIcon = getFileIcon(att.mimeType || '');
                    return (
                      <div key={att.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 group">
                        <AttFileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm flex-1 truncate">{att.fileName || att.name}</span>
                        {att.fileUrl && (
                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Anhänge vorhanden
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={addAttachmentMutation.isPending}
              >
                {addAttachmentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Datei anhängen
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileAttach}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagInput
                tags={(task.tags || []).map((t: any) => t.name || t)}
                onChange={() => {}}
                readOnly
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Aufgabe bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Titel</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priorität</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Fälligkeitsdatum</Label>
              <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Abbrechen</Button>
            <Button onClick={handleEditSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subtask Dialog */}
      <Dialog open={showSubtaskDialog} onOpenChange={setShowSubtaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unteraufgabe hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Titel</Label>
            <Input 
              value={newSubtaskTitle} 
              onChange={(e) => setNewSubtaskTitle(e.target.value)} 
              placeholder="Titel der Unteraufgabe"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubtaskDialog(false)}>Abbrechen</Button>
            <Button onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim() || addSubtaskMutation.isPending}>
              {addSubtaskMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Entry Dialog */}
      <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zeit buchen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Dauer (Stunden)</Label>
              <Input 
                type="number" 
                value={timeMinutes} 
                onChange={(e) => setTimeMinutes(e.target.value)} 
                placeholder="z.B. 0.5 (= 30 Min.)"
                min="0.1"
                step="0.1"
              />
            </div>
            <div>
              <Label>Beschreibung (optional)</Label>
              <Textarea 
                value={timeDescription} 
                onChange={(e) => setTimeDescription(e.target.value)} 
                placeholder="Was wurde gemacht?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeDialog(false)}>Abbrechen</Button>
            <Button onClick={handleAddTime} disabled={!timeMinutes || addTimeMutation.isPending}>
              {addTimeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Zeit buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
