import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleDelete = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    setTicketList(ticketList.filter(t => t.id !== ticketId));
    toast.success("Ticket gelöscht");
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
          <Button variant="outline" className="gap-2" onClick={() => navigate("/calendar")}>
            <Calendar className="h-4 w-4" />
            Wartungsplan
          </Button>
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
          <SelectContent>
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/service/${ticket.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/service/${ticket.id}`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleDuplicate(e, ticket)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplizieren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/time-tracking")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Zeit erfassen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleCreateReport(e, ticket)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Rapport erstellen
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, ticket.id)}>
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
    </div>
  );
}
