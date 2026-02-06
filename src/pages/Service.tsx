import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const initialTickets: ServiceTicket[] = [
  {
    id: "1",
    number: "SRV-2024-001",
    title: "Treppenstufe locker",
    customer: "Bauherr AG",
    type: "repair",
    priority: "high",
    status: "in_progress",
    assignedTo: "T. Brunner",
    scheduledDate: "01.02.2024",
    estimatedHours: 3,
    actualHours: 1.5,
    description: "Stufe 12 der Metalltreppe hat sich gelöst",
  },
  {
    id: "2",
    number: "SRV-2024-002",
    title: "Jährliche Wartung Brandschutztüren",
    customer: "Logistik Center Zürich",
    type: "maintenance",
    priority: "normal",
    status: "open",
    scheduledDate: "15.02.2024",
    estimatedHours: 8,
    description: "Wartungsvertrag - 12 Brandschutztüren",
  },
  {
    id: "3",
    number: "SRV-2024-003",
    title: "Geländer Korrosionsschaden",
    customer: "Immobilien Müller",
    type: "warranty",
    priority: "normal",
    status: "waiting",
    assignedTo: "A. Meier",
    estimatedHours: 4,
    description: "Garantiefall - Korrosion nach 6 Monaten",
  },
  {
    id: "4",
    number: "SRV-2024-004",
    title: "Abnahme Carport",
    customer: "Privat Schneider",
    type: "inspection",
    priority: "low",
    status: "completed",
    assignedTo: "M. Keller",
    scheduledDate: "25.01.2024",
    completedDate: "25.01.2024",
    estimatedHours: 1,
    actualHours: 1,
    description: "Endabnahme und Übergabe",
  },
];

const technicians = [
  { id: "1", name: "T. Brunner", kürzel: "TB" },
  { id: "2", name: "A. Meier", kürzel: "AM" },
  { id: "3", name: "M. Keller", kürzel: "MK" },
  { id: "4", name: "P. Schmidt", kürzel: "PS" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ticketList, setTicketList] = useState<ServiceTicket[]>(initialTickets);
  
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
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleTimeTracking = () => {
    if (!selectedTicket || (!timeHours && !timeMinutes)) {
      toast.error("Bitte Zeit eingeben");
      return;
    }
    
    const totalHours = (parseFloat(timeHours || "0")) + (parseFloat(timeMinutes || "0") / 60);
    
    setTicketList(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          actualHours: (t.actualHours || 0) + totalHours,
          status: t.status === "open" ? "in_progress" : t.status,
        };
      }
      return t;
    }));
    
    toast.success(`${totalHours.toFixed(2)} Std. auf ${selectedTicket.number} erfasst`);
    setTimeTrackingOpen(false);
    setSelectedTicket(null);
  };

  // Status ändern
  const openStatusChange = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setStatusChangeOpen(true);
  };

  const handleStatusChange = () => {
    if (!selectedTicket) return;
    
    setTicketList(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: newStatus as ServiceTicket["status"],
          completedDate: newStatus === "completed" ? new Date().toLocaleDateString("de-CH") : t.completedDate,
        };
      }
      return t;
    }));
    
    toast.success(`Status von ${selectedTicket.number} geändert`);
    setStatusChangeOpen(false);
    setSelectedTicket(null);
  };

  // Techniker zuweisen
  const openAssignTechnician = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setSelectedTechnician(ticket.assignedTo ? technicians.find(t => t.name === ticket.assignedTo)?.id || "" : "");
    setAssignTechnicianOpen(true);
  };

  const handleAssignTechnician = () => {
    if (!selectedTicket || !selectedTechnician) {
      toast.error("Bitte Techniker auswählen");
      return;
    }
    
    const tech = technicians.find(t => t.id === selectedTechnician);
    
    setTicketList(prev => prev.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, assignedTo: tech?.name };
      }
      return t;
    }));
    
    toast.success(`${tech?.name} zu ${selectedTicket.number} zugewiesen`);
    setAssignTechnicianOpen(false);
    setSelectedTicket(null);
  };

  // Löschen
  const openDelete = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    setSelectedTicket(ticket);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedTicket) return;
    setTicketList(ticketList.filter(t => t.id !== selectedTicket.id));
    toast.success("Ticket gelöscht");
    setDeleteOpen(false);
    setSelectedTicket(null);
  };

  const handleDuplicate = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    const newTicket: ServiceTicket = {
      ...ticket,
      id: Date.now().toString(),
      number: `SRV-2024-${String(ticketList.length + 1).padStart(3, '0')}`,
      status: "open",
      actualHours: undefined,
      completedDate: undefined,
    };
    setTicketList([...ticketList, newTicket]);
    toast.success("Ticket dupliziert");
  };

  const handleCreateReport = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    toast.success(`Rapport für ${ticket.number} wird erstellt...`);
  };

  const handlePrint = (e: React.MouseEvent, ticket: ServiceTicket) => {
    e.stopPropagation();
    toast.info(`Drucke ${ticket.number}...`);
    window.print();
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
          <Button className="gap-2" onClick={() => navigate("/service/new")}>
            <Plus className="h-4 w-4" />
            Service-Ticket
          </Button>
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
                    <Badge className={typeStyles[ticket.type]}>
                      {typeLabels[ticket.type]}
                    </Badge>
                    <Badge className={statusStyles[ticket.status]}>
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge className={priorityStyles[ticket.priority]}>
                      {priorityLabels[ticket.priority]}
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={(e) => openDelete(e, ticket)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
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
