import { useParams, Link } from "react-router-dom";
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
  Users
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

const taskData = {
  id: "TASK-2024-0145",
  title: "API-Integration für Zahlungsgateway",
  description: "Integration des Stripe Payment Gateways für die E-Commerce Plattform. Beinhaltet die Implementierung von Kreditkarten-Zahlungen, SEPA-Lastschrift und Apple Pay.",
  status: "In Bearbeitung",
  priority: "Hoch",
  project: {
    id: "PRJ-001",
    name: "E-Commerce Plattform",
  },
  assignee: {
    name: "Anna Schmidt",
    avatar: "",
    initials: "AS"
  },
  reporter: {
    name: "Max Keller",
    avatar: "",
    initials: "MK"
  },
  createdAt: "20.01.2024",
  dueDate: "05.02.2024",
  estimatedHours: 24,
  loggedHours: 16,
  subtasks: [
    { id: 1, title: "Stripe SDK installieren und konfigurieren", completed: true },
    { id: 2, title: "Checkout-Flow implementieren", completed: true },
    { id: 3, title: "Webhook-Handler erstellen", completed: true },
    { id: 4, title: "SEPA-Lastschrift Integration", completed: false },
    { id: 5, title: "Apple Pay Integration", completed: false },
    { id: 6, title: "Tests schreiben", completed: false },
  ],
  comments: [
    { id: 1, user: { name: "Max Keller", initials: "MK" }, text: "Bitte auch die Fehlerbehandlung für fehlgeschlagene Zahlungen berücksichtigen.", date: "22.01.2024 14:30" },
    { id: 2, user: { name: "Anna Schmidt", initials: "AS" }, text: "Webhook-Handler ist jetzt implementiert und getestet. SEPA folgt als nächstes.", date: "25.01.2024 09:15" },
  ],
  attachments: [
    { name: "Stripe_API_Dokumentation.pdf", size: "2.4 MB", date: "20.01.2024" },
    { name: "Payment_Flow_Diagram.png", size: "456 KB", date: "21.01.2024" },
  ],
  activity: [
    { date: "28.01.2024 10:30", action: "Subtask 'Webhook-Handler erstellen' abgeschlossen", user: "Anna Schmidt" },
    { date: "25.01.2024 16:45", action: "Zeitbuchung: 4 Stunden", user: "Anna Schmidt" },
    { date: "22.01.2024 14:30", action: "Kommentar hinzugefügt", user: "Max Keller" },
    { date: "20.01.2024 09:00", action: "Aufgabe erstellt", user: "Max Keller" },
  ]
};

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

const TaskDetail = () => {
  const { id } = useParams();
  const status = statusConfig[taskData.status] || statusConfig["Offen"];
  const priority = priorityConfig[taskData.priority] || priorityConfig["Mittel"];
  const StatusIcon = status.icon;
  const completedSubtasks = taskData.subtasks.filter(s => s.completed).length;
  const progressPercent = (completedSubtasks / taskData.subtasks.length) * 100;

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
              <span className="text-sm font-mono text-muted-foreground">{taskData.id}</span>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {taskData.status}
              </Badge>
              <Badge className={priority.color}>
                <Flag className="h-3 w-3 mr-1" />
                {taskData.priority}
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-bold mt-1">{taskData.title}</h1>
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
              <DropdownMenuItem>Status ändern</DropdownMenuItem>
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
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
              <p className="text-muted-foreground">{taskData.description}</p>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unteraufgaben</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {completedSubtasks} von {taskData.subtasks.length} erledigt
                </p>
              </div>
              <Button variant="outline" size="sm">
                Hinzufügen
              </Button>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-2 mb-4" />
              <div className="space-y-2">
                {taskData.subtasks.map((subtask) => (
                  <div 
                    key={subtask.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      subtask.completed ? "bg-success/5 border-success/20" : "bg-muted/50"
                    }`}
                  >
                    <div className={`flex h-5 w-5 items-center justify-center rounded ${
                      subtask.completed ? "bg-success text-success-foreground" : "border-2 border-muted-foreground/30"
                    }`}>
                      {subtask.completed && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <span className={subtask.completed ? "line-through text-muted-foreground" : ""}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kommentare ({taskData.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskData.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{comment.user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">MK</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea placeholder="Kommentar schreiben..." className="min-h-[80px]" />
                  <Button size="sm">Kommentar hinzufügen</Button>
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
                {taskData.activity.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{entry.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span>{entry.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <AvatarFallback className="text-xs">{taskData.assignee.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{taskData.assignee.name}</span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">ERSTELLT VON</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{taskData.reporter.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{taskData.reporter.name}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Projekt</span>
                  <Link to={`/projects/${taskData.project.id}`} className="font-medium hover:text-primary flex items-center gap-1">
                    <FolderKanban className="h-4 w-4" />
                    {taskData.project.name}
                  </Link>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Erstellt am</span>
                  <span className="font-medium">{taskData.createdAt}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fällig am</span>
                  <span className="font-medium">{taskData.dueDate}</span>
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
                <span className="font-medium">{taskData.estimatedHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gebucht</span>
                <span className="font-medium">{taskData.loggedHours}h</span>
              </div>
              <Progress value={(taskData.loggedHours / taskData.estimatedHours) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((taskData.loggedHours / taskData.estimatedHours) * 100)}% der geschätzten Zeit
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
                Anhänge ({taskData.attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {taskData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                    <div className="truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                Datei anhängen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
