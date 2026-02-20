import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Plus,
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Trash2,
  Copy,
  Timer,
  RotateCcw,
  UserPlus,
  Printer,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UpcomingMaintenanceDialog } from "@/components/service/UpcomingMaintenanceDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ServiceTicket {
  id: string;
  number: string;
  title: string;
  customer: string;
  type: "repair" | "maintenance" | "inspection" | "warranty";
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting" | "completed" | "cancelled";
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  description: string;
}



const typeStyles = {
  repair: "bg-destructive/10 text-destructive",
  maintenance: "bg-info/10 text-info",
  inspection: "bg-success/10 text-success",
  warranty: "bg-warning/10 text-warning",
};

const typeLabels = {
  repair: "Reparatur",
  maintenance: "Wartung",
  inspection: "Abnahme",
  warranty: "Garantie",
};

const priorityStyles = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

const priorityLabels = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
  urgent: "Dringend",
};

const statusStyles = {
  open: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  waiting: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  open: "Offen",
  in_progress: "In Bearbeitung",
  waiting: "Wartend",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

export default function Service() {
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch service tickets from API
  const { data: apiData } = useQuery({
    queryKey: ["/service-tickets"],
    queryFn: () => api.get<any>("/service-tickets"),
  });
  // Fetch users for technician assignment
  const { data: usersData } = useQuery({
    queryKey: ["/users"],
    queryFn: () => api.get<any>("/users"),
  });
  const technicians = (usersData?.data || []).map((u: any) => ({
    id: u.id,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || u.name || u.id,
    kürzel: `${(u.firstName || "?")[0]}${(u.lastName || "?")[0]}`.toUpperCase(),
  }));

  const ticketList: ServiceTicket[] = (apiData?.data || []).map((raw: any) => ({
    id: raw.id || "",
    number: raw.number || "",
    title: raw.title || raw.subject || "–",
    customer: raw.customer?.companyName || raw.customer?.name || raw.customerName || "–",
    type: (raw.type || "repair").toLowerCase(),
    priority: (raw.priority || "normal").toLowerCase(),
    status: (raw.status || "open").toLowerCase().replace("-", "_"),
    assignedTo: raw.assignedTo || raw.assignedUser?.name || undefined,
    scheduledDate: raw.scheduledDate ? new Date(raw.scheduledDate).toLocaleDateString("de-CH") : undefined,
    completedDate: raw.completedDate ? new Date(raw.completedDate).toLocaleDateString("de-CH") : undefined,
    estimatedHours: Number(raw.estimatedHours || 0),
    actualHours: raw.actualHours != null ? Number(raw.actualHours) : undefined,
    description: raw.description || "",
  }));

  const [statusFilter, setStatusFilter] = useState("all");

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/service-tickets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/service-tickets"] });
      toast.success("Ticket erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen des Tickets");
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/service-tickets/${id}`, { status: status.toUpperCase() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/service-tickets"] });
    },
    onError: () => toast.error("Fehler beim Statuswechsel"),
  });

  const assignTechnicianMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      api.patch(`/service-tickets/${id}`, { assignedUserId: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/service-tickets"] });
    },
    onError: () => toast.error("Fehler bei Zuweisung"),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/service-tickets/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/service-tickets"] });
      toast.success("Ticket dupliziert");
    },
    onError: () => toast.error("Fehler beim Duplizieren"),
  });

  const timeEntryMutation = useMutation({
    mutationFn: ({ ticketId, hours, notes, date }: { ticketId: string; hours: number; notes: string; date: string }) =>
      api.post("/time-entries", {
        taskId: ticketId,
        hours,
        notes,
        date,
        type: "service",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/service-tickets"] });
    },
    onError: () => toast.error("Fehler bei Zeiterfassung"),
  });
  
  // Dialog states
  const [timeTrackingOpen, setTimeTrackingOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [assignTechnicianOpen, setAssignTechnicianOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  
  // Form states
  const [timeHours, setTimeHours] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeDate, setTimeDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeNotes, setTimeNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const openTickets = ticketList.filter((t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting").length;
  const completedTickets = ticketList.filter((t) => t.status === "completed").length;
  const urgentTickets = ticketList.filter((t) => t.priority === "urgent" || t.priority === "high").length;

  const filteredTickets = ticketList.filter((ticket) => {
    const matchesSearch = (ticket.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.customer || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Zeit erfassen
  const openTimeTracking = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setTimeHours("");
    setTimeMinutes("");
    setTimeNotes("");
    setTimeTrackingOpen(true);
  };

  const handleTimeTracking = async () => {
    if (!selectedTicket || (!timeHours && !timeMinutes)) {
      toast.error("Bitte Zeit eingeben");
      return;
    }
    const totalHours = (parseFloat(timeHours || "0")) + (parseFloat(timeMinutes || "0") / 60);
    try {
      await timeEntryMutation.mutateAsync({
        ticketId: selectedTicket.id,
        hours: totalHours,
        notes: timeNotes,
        date: timeDate,
      });
      toast.success(`${totalHours.toFixed(2)} Std. auf ${selectedTicket.number} erfasst`);
      setTimeTrackingOpen(false);
      setSelectedTicket(null);
    } catch { /* error already handled in mutation */ }
  };

  // Status ändern
  const openStatusChange = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setStatusChangeOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTicket) return;
    try {
      await statusChangeMutation.mutateAsync({ id: selectedTicket.id, status: newStatus });
      toast.success(`Status von ${selectedTicket.number} geändert`);
      setStatusChangeOpen(false);
      setSelectedTicket(null);
    } catch { /* error already handled */ }
  };

  // Techniker zuweisen
  const openAssignTechnician = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setSelectedTechnician(ticket.assignedTo ? technicians.find(t => t.name === ticket.assignedTo)?.id || "" : "");
    setAssignTechnicianOpen(true);
  };

  const handleAssignTechnician = async () => {
    if (!selectedTicket || !selectedTechnician) {
      toast.error("Bitte Techniker auswählen");
      return;
    }
    const tech = technicians.find(t => t.id === selectedTechnician);
    try {
      await assignTechnicianMutation.mutateAsync({ id: selectedTicket.id, userId: selectedTechnician });
      toast.success(`${tech?.name} zu ${selectedTicket.number} zugewiesen`);
      setAssignTechnicianOpen(false);
      setSelectedTicket(null);
    } catch { /* error already handled */ }
  };

  // Löschen
  const openDelete = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedTicket) return;
    deleteMutation.mutate(selectedTicket.id);
    setDeleteOpen(false);
    setSelectedTicket(null);
  };

  const handleDuplicate = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    duplicateMutation.mutate(ticket.id);
  };

  const handleCreateReport = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    navigate(`/service/${ticket.id}/report`);
  };

  const handlePrint = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    window.open(`/api/service-tickets/${ticket.id}/pdf`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Wartung & Service
          </h1>
          <p className="text-muted-foreground">
            Service-Tickets und Wartungsverträge verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <UpcomingMaintenanceDialog />
          {canWrite('service-tickets') && (
            <Button className="gap-2" onClick={() => navigate("/service/new")}>
              <Plus className="h-4 w-4" />
              Service-Ticket
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => setStatusFilter("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tickets gesamt</p>
              <p className="text-2xl font-bold">{ticketList.length}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "open" ? "border-warning ring-2 ring-warning/20" : "border-border"
          )}
          onClick={() => setStatusFilter("open")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold text-warning">{openTickets}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dringend</p>
              <p className="text-2xl font-bold text-destructive">{urgentTickets}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "completed" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("completed")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Erledigt (MTD)</p>
              <p className="text-2xl font-bold text-success">{completedTickets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ticket suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="open">Offen</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="waiting">Wartend</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.map((ticket, index) => (
          <div
            key={ticket.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/service/${ticket.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  ticket.priority === "urgent" || ticket.priority === "high" 
                    ? "bg-destructive/10" 
                    : "bg-muted"
                )}>
                  <Wrench className={cn(
                    "h-6 w-6",
                    ticket.priority === "urgent" || ticket.priority === "high" 
                      ? "text-destructive" 
                      : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <Badge className={typeStyles[ticket.type] || typeStyles.repair}>
                      {typeLabels[ticket.type] || ticket.type}
                    </Badge>
                    <Badge className={statusStyles[ticket.status] || statusStyles.open}>
                      {statusLabels[ticket.status] || ticket.status}
                    </Badge>
                    <Badge className={priorityStyles[ticket.priority] || priorityStyles.normal}>
                      {priorityLabels[ticket.priority] || ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-mono">{ticket.number}</span> • {ticket.customer}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {ticket.description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6" onClick={(e) => e.stopPropagation()}>
                {ticket.assignedTo && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Zugewiesen</p>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{ticket.assignedTo}</span>
                    </div>
                  </div>
                )}

                {ticket.scheduledDate && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Termin</p>
                    <p className="font-mono text-sm">{ticket.scheduledDate}</p>
                  </div>
                )}

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Stunden</p>
                  <p className="font-mono text-sm">
                    {ticket.actualHours !== undefined 
                      ? `${ticket.actualHours} / ${ticket.estimatedHours}` 
                      : `~${ticket.estimatedHours}`}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    <DropdownMenuItem onClick={() => navigate(`/service/${ticket.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details anzeigen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/service/${ticket.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => openTimeTracking(e, ticket)}>
                      <Timer className="h-4 w-4 mr-2" />
                      Zeit erfassen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => openStatusChange(e, ticket)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Status ändern
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => openAssignTechnician(e, ticket)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Techniker zuweisen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => handleDuplicate(e, ticket)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplizieren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleCreateReport(e, ticket)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Rapport erstellen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handlePrint(e, ticket)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Drucken
                    </DropdownMenuItem>
                    {canDelete('service-tickets') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={(e) => openDelete(e, ticket)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-muted-foreground rounded-xl border border-border bg-card">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Tickets gefunden</p>
            <p className="text-sm">Passen Sie die Filter an oder erstellen Sie ein neues Ticket</p>
          </div>
        )}
      </div>

      {/* Zeit erfassen Dialog */}
      <Dialog open={timeTrackingOpen} onOpenChange={setTimeTrackingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Zeit erfassen
            </DialogTitle>
            <DialogDescription>
              Arbeitszeit auf {selectedTicket?.number} buchen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="font-medium">{selectedTicket?.title}</p>
              <p className="text-sm text-muted-foreground">{selectedTicket?.customer}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stunden</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="0"
                  value={timeHours}
                  onChange={(e) => setTimeHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Minuten</Label>
                <Select value={timeMinutes} onValueChange={setTimeMinutes}>
                  <SelectTrigger>
                    <SelectValue placeholder="0" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="0">0 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Datum</Label>
              <Input
                type="date"
                value={timeDate}
                onChange={(e) => setTimeDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea
                placeholder="Was wurde gemacht..."
                value={timeNotes}
                onChange={(e) => setTimeNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimeTrackingOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleTimeTracking}>
              <Timer className="mr-2 h-4 w-4" />
              Zeit buchen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status ändern Dialog */}
      <Dialog open={statusChangeOpen} onOpenChange={setStatusChangeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Status ändern</DialogTitle>
            <DialogDescription>
              Neuen Status für {selectedTicket?.number} festlegen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Neuer Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="waiting">Wartend</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStatusChange}>
              Status ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Techniker zuweisen Dialog */}
      <Dialog open={assignTechnicianOpen} onOpenChange={setAssignTechnicianOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Techniker zuweisen
            </DialogTitle>
            <DialogDescription>
              Techniker für {selectedTicket?.number} auswählen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Techniker</Label>
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Techniker wählen" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTechnicianOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAssignTechnician}>
              Zuweisen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Löschen AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Ticket "{selectedTicket?.number}" wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
