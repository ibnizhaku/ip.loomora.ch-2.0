import { useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  FileText,
  MessageSquare,
  Paperclip,
  Plus,
  Trash2,
  Copy,
  Pause,
  Play,
  Archive,
  Upload,
  File,
  FileImage,
  FileType,
  Loader2,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ProjectChat } from "@/components/project/ProjectChat";
import { useProject, useDeleteProject, useUpdateProject } from "@/hooks/use-projects";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDropzone } from "react-dropzone";
import { useDMSDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/use-documents";

const statusConfig: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Planung", color: "bg-muted text-muted-foreground" },
  ACTIVE: { label: "Aktiv", color: "bg-success/10 text-success" },
  ON_HOLD: { label: "Pausiert", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Abgeschlossen", color: "bg-info/10 text-info" },
  CANCELLED: { label: "Abgebrochen", color: "bg-destructive/10 text-destructive" },
};

const taskStatusConfig = {
  todo: { label: "Offen", color: "bg-muted text-muted-foreground" },
  "in-progress": { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  done: { label: "Erledigt", color: "bg-success/10 text-success" },
  PENDING: { label: "Offen", color: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  DONE: { label: "Erledigt", color: "bg-success/10 text-success" },
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id || '');
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load project documents from backend
  const { data: projectDocsData } = useDMSDocuments({ projectId: id });
  const uploadDocumentMutation = useUploadDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const projectDocs = projectDocsData?.data || [];

  // File upload handling - persists real files to backend
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadDocumentMutation.mutate({
        file,
        projectId: id,
      });
    });
    toast.success(`${acceptedFiles.length} Datei(en) hochgeladen`);
  }, [id, uploadDocumentMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Projekt erfolgreich gelöscht');
      navigate('/projects');
    } catch (error) {
      toast.error('Fehler beim Löschen des Projekts');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !project) return;
    try {
      await updateProject.mutateAsync({ id, data: { status: newStatus } });
      toast.success(`Status auf "${statusConfig[newStatus]?.label || newStatus}" geändert`);
    } catch (error) {
      toast.error('Fehler beim Ändern des Status');
    }
  };

  const handleDuplicate = () => {
    toast.info('Projekt duplizieren wird implementiert');
  };

  const removeFile = (fileId: string) => {
    deleteDocumentMutation.mutate(fileId, {
      onSuccess: () => toast.success('Datei entfernt'),
      onError: (err: any) => toast.error(err.message || 'Fehler beim Entfernen'),
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType === 'application/pdf') return FileType;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-CH');
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'CHF 0';
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate progress based on tasks
  const calculateProgress = () => {
    if (!project?.tasks?.length) return project?.progress || 0;
    const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE' || t.status === 'done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

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
        <Button variant="link" onClick={() => navigate('/projects')}>
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const progress = calculateProgress();
  const status = project.status?.toUpperCase().replace('-', '_') || 'PLANNING';
  const statusInfo = statusConfig[status] || statusConfig.PLANNING;

  // Team und Tasks aus Backend-Daten aufbereiten
  const team = project.members?.map((m: any) => ({
    initials: `${m.employee?.firstName?.[0] || ''}${m.employee?.lastName?.[0] || ''}`,
    name: `${m.employee?.firstName || ''} ${m.employee?.lastName || ''}`,
    role: m.employee?.position || 'Mitarbeiter',
  })) || [];

  const tasks = project.tasks || [];

  const milestones = [
    { id: "1", title: "Phase 1: Grundfunktionen", date: formatDate(project.startDate), completed: progress >= 33 },
    { id: "2", title: "Phase 2: Kernfunktionen", date: formatDate(project.endDate), completed: progress >= 66 },
    { id: "3", title: "Phase 3: Launch", date: formatDate(project.endDate), completed: progress >= 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <p className="text-muted-foreground">
            {project.client || project.customer?.name || project.customer?.companyName || 'Kein Kunde zugewiesen'}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate(`/projects/${id}/edit`)}>
          <Edit className="h-4 w-4" />
          Bearbeiten
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {status !== 'ACTIVE' && (
              <DropdownMenuItem onClick={() => handleStatusChange('ACTIVE')}>
                <Play className="h-4 w-4 mr-2" />
                Aktivieren
              </DropdownMenuItem>
            )}
            {status === 'ACTIVE' && (
              <DropdownMenuItem onClick={() => handleStatusChange('ON_HOLD')}>
                <Pause className="h-4 w-4 mr-2" />
                Pausieren
              </DropdownMenuItem>
            )}
            {status !== 'COMPLETED' && (
              <DropdownMenuItem onClick={() => handleStatusChange('COMPLETED')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Abschliessen
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleStatusChange('CANCELLED')}>
              <Archive className="h-4 w-4 mr-2" />
              Archivieren
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zeitraum</p>
              <p className="font-medium">
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Banknote className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">
                {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-medium">{team.length} Mitglieder</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <CheckCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fortschritt</p>
              <p className="font-medium">{progress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Gesamtfortschritt Erklärung */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Gesamtfortschritt</h3>
            <p className="text-sm text-muted-foreground">
              Berechnet aus erledigten Aufgaben ({tasks.filter((t: any) => t.status === 'DONE' || t.status === 'done').length} von {tasks.length})
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />

        <div className="flex justify-between mt-6">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={cn(
                "text-center",
                index === 0 && "text-left",
                index === milestones.length - 1 && "text-right"
              )}
            >
              <div
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full mb-2",
                  milestone.completed ? "bg-success text-success-foreground" : "bg-muted"
                )}
              >
                {milestone.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <p className="text-sm font-medium">{milestone.title}</p>
              <p className="text-xs text-muted-foreground">{milestone.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="files">Dateien</TabsTrigger>
          <TabsTrigger value="activity">Aktivität</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Aufgaben ({tasks.length})</h3>
            <Button size="sm" className="gap-2" onClick={() => navigate('/tasks/new')}>
              <Plus className="h-4 w-4" />
              Neue Aufgabe
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Keine Aufgaben vorhanden</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/tasks/new')}
                className="mt-2"
              >
                Erste Aufgabe erstellen
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card divide-y divide-border">
              {tasks.map((task: any) => {
                const taskStatus = (task.status || 'PENDING').toUpperCase().replace('-', '_');
                const taskConfig = taskStatusConfig[taskStatus as keyof typeof taskStatusConfig] || taskStatusConfig.PENDING;
                
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          taskStatus === "DONE" && "bg-success",
                          taskStatus === "IN_PROGRESS" && "bg-warning",
                          taskStatus === "PENDING" && "bg-muted-foreground"
                        )}
                      />
                      <span className={cn(taskStatus === "DONE" && "line-through text-muted-foreground")}>
                        {task.title || task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={taskConfig.color}>
                        {taskConfig.label}
                      </Badge>
                      {task.assignee && (
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-secondary">
                            {task.assignee.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Projekt-Chat</h3>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              {team.length} online
            </Badge>
          </div>
          <ProjectChat team={team} projectId={id} />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Teammitglieder ({team.length})</h3>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Mitglied hinzufügen
            </Button>
          </div>

          {team.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Noch keine Teammitglieder zugewiesen</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {team.map((member: any) => (
                <div
                  key={member.initials}
                  className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Dateien ({projectDocs.length})</h3>
          </div>

          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={cn(
              "rounded-2xl border-2 border-dashed bg-card p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Dateien hier ablegen...</p>
            ) : (
              <>
                <p className="font-medium">Dateien hier ablegen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  oder klicken zum Auswählen (Bilder, PDF, Word, Excel)
                </p>
              </>
            )}
          </div>

          {/* Uploaded Files List */}
          {projectDocs.length > 0 && (
            <div className="space-y-2">
              {projectDocs.map((file: any) => {
                const FileIcon = getFileIcon(file.mimeType || '');
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.fileSize || 0)} · {file.createdAt ? new Date(file.createdAt).toLocaleDateString('de-CH') : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="font-semibold">Letzte Aktivitäten</h3>

          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aktivitäten werden geladen...</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie das Projekt "{project.name}" löschen möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
