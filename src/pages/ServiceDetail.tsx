import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench, Clock, User, MessageSquare, CheckCircle2, AlertTriangle, FileText, Calendar, MoreHorizontal, Timer, Edit, Trash2, Printer, RotateCcw, UserPlus, Copy, Ban, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaintenancePlanDialog } from "@/components/service/MaintenancePlanDialog";
import { ServiceReportDialog } from "@/components/service/ServiceReportDialog";
import { ServiceCompleteDialog } from "@/components/service/ServiceCompleteDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useServiceTicket, useUpdateServiceTicket, useDeleteServiceTicket } from "@/hooks/use-service-tickets";
import { useEmployees } from "@/hooks/use-employees";

const statusConfig: Record<string, { label: string; color: string }> = {
  "offen": { label: "Offen", color: "bg-info/10 text-info" },
  "in-bearbeitung": { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  "warten": { label: "Warten auf Kunde", color: "bg-muted text-muted-foreground" },
  "erledigt": { label: "Erledigt", color: "bg-success/10 text-success" },
  "storniert": { label: "Storniert", color: "bg-destructive/10 text-destructive" },
  "OPEN": { label: "Offen", color: "bg-info/10 text-info" },
  "SCHEDULED": { label: "Geplant", color: "bg-muted text-muted-foreground" },
  "IN_PROGRESS": { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  "WAITING_PARTS": { label: "Warten auf Teile", color: "bg-muted text-muted-foreground" },
  "COMPLETED": { label: "Erledigt", color: "bg-success/10 text-success" },
  "CANCELLED": { label: "Storniert", color: "bg-destructive/10 text-destructive" },
};

const prioritätConfig: Record<string, { label: string; color: string }> = {
  niedrig: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
  mittel: { label: "Mittel", color: "bg-info/10 text-info" },
  hoch: { label: "Hoch", color: "bg-warning/10 text-warning" },
  kritisch: { label: "Kritisch", color: "bg-destructive/10 text-destructive" },
  LOW: { label: "Niedrig", color: "bg-muted text-muted-foreground" },
  MEDIUM: { label: "Mittel", color: "bg-info/10 text-info" },
  HIGH: { label: "Hoch", color: "bg-warning/10 text-warning" },
  URGENT: { label: "Kritisch", color: "bg-destructive/10 text-destructive" },
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: apiTicket, isLoading } = useServiceTicket(id || "");
  const { data: employeesData } = useEmployees({ pageSize: 200 });
  const technicians = (employeesData as any)?.data?.map((e: any) => ({
    id: e.id,
    name: `${e.firstName} ${e.lastName}`,
    kürzel: `${(e.firstName || "")[0] || ""}${(e.lastName || "")[0] || ""}`,
  })) || [];
  // All hooks must be before early returns
  const [comment, setComment] = useState("");
  const [serviceData, setServiceData] = useState<any>({
    id: "", titel: "", beschreibung: "", kunde: "", kundenNr: "", kontakt: "", telefon: "", email: "", standort: "",
    status: "OPEN", priorität: "MEDIUM", kategorie: "", erstelltAm: "", fälligBis: "", zugewiesen: "",
    geschätzteZeit: 0, effektiveZeit: 0, materialkosten: 0,
  });
  const [aktivitäten, setAktivitäten] = useState<any[]>([]);
  const [timeTrackingOpen, setTimeTrackingOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignTechnicianOpen, setAssignTechnicianOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [timeHours, setTimeHours] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [timeDate, setTimeDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeNotes, setTimeNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [dataInitialized, setDataInitialized] = useState(false);

  // Sync API data to state once loaded
  if (apiTicket && !dataInitialized) {
    const ticket = apiTicket as any;
    const mapped = {
      id: ticket.number || ticket.id,
      titel: ticket.title || "",
      beschreibung: ticket.description || "",
      kunde: ticket.customer?.name || "",
      kundenNr: ticket.customerId || "",
      kontakt: "", telefon: "", email: "", standort: "",
      status: ticket.status || "OPEN",
      priorität: ticket.priority || "MEDIUM",
      kategorie: ticket.serviceType || "",
      erstelltAm: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString("de-CH") : "",
      fälligBis: ticket.scheduledDate ? new Date(ticket.scheduledDate).toLocaleString("de-CH") : "",
      zugewiesen: ticket.technician ? `${ticket.technician.firstName} ${ticket.technician.lastName}` : "",
      geschätzteZeit: ticket.estimatedHours || 0,
      effektiveZeit: ticket.actualHours || 0,
      materialkosten: ticket.billedAmount || 0,
    };
    setServiceData(mapped);
    setNewStatus(mapped.status);
    setEditTitle(mapped.titel);
    setEditDescription(mapped.beschreibung);
    setEditPriority(mapped.priorität);
    setEditCategory(mapped.kategorie);
    setDataInitialized(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!apiTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/service"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Ticket nicht gefunden</h1>
            <p className="text-muted-foreground">Das angeforderte Service-Ticket existiert nicht.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/service")}>Zurück</Button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const addActivity = (typ: string, text: string) => {
    const newActivity = {
      zeit: new Date().toLocaleString("de-CH"),
      user: "Ich",
      typ,
      text,
    };
    setAktivitäten([newActivity, ...aktivitäten]);
  };

  const handleAddComment = () => {
    if (!comment.trim()) {
      toast.error("Bitte geben Sie einen Kommentar ein");
      return;
    }
    addActivity("Notiz", comment);
    toast.success("Kommentar hinzugefügt");
    setComment("");
  };

  // Zeit erfassen
  const handleTimeTracking = () => {
    if (!timeHours && !timeMinutes) {
      toast.error("Bitte Zeit eingeben");
      return;
    }
    
    const totalHours = (parseFloat(timeHours || "0")) + (parseFloat(timeMinutes || "0") / 60);
    
    setServiceData(prev => ({
      ...prev,
      effektiveZeit: prev.effektiveZeit + totalHours,
      status: prev.status === "offen" ? "in-bearbeitung" : prev.status,
    }));
    
    addActivity("Zeit", `${totalHours.toFixed(2)} Stunden erfasst${timeNotes ? `: ${timeNotes}` : ""}`);
    toast.success(`${totalHours.toFixed(2)} Std. erfasst`);
    
    setTimeHours("");
    setTimeMinutes("");
    setTimeNotes("");
    setTimeTrackingOpen(false);
  };

  // Status ändern
  const handleStatusChange = () => {
    setServiceData(prev => ({ ...prev, status: newStatus }));
    addActivity("Status", `Status geändert zu "${statusConfig[newStatus]?.label || newStatus}"`);
    toast.success("Status geändert");
    setStatusChangeOpen(false);
  };

  // Bearbeiten
  const handleEdit = () => {
    setServiceData(prev => ({
      ...prev,
      titel: editTitle,
      beschreibung: editDescription,
      priorität: editPriority,
      kategorie: editCategory,
    }));
    addActivity("Bearbeitet", "Ticket-Details aktualisiert");
    toast.success("Ticket aktualisiert");
    setEditOpen(false);
  };

  // Techniker zuweisen
  const handleAssignTechnician = () => {
    if (!selectedTechnician) {
      toast.error("Bitte Techniker auswählen");
      return;
    }
    
    const tech = technicians.find(t => t.id === selectedTechnician);
    setServiceData(prev => ({ ...prev, zugewiesen: tech?.name || "" }));
    addActivity("Zuweisung", `Ticket zugewiesen an ${tech?.name}`);
    toast.success(`${tech?.name} zugewiesen`);
    setAssignTechnicianOpen(false);
  };

  // Löschen
  const handleDelete = () => {
    toast.success("Ticket gelöscht");
    navigate("/service");
  };

  // Drucken
  const handlePrint = () => {
    toast.info("Ticket wird gedruckt...");
    window.print();
  };

  // Duplizieren
  const handleDuplicate = () => {
    toast.success("Ticket dupliziert - neues Ticket erstellt");
    navigate("/service");
  };

  const handleComplete = () => {
    setServiceData(prev => ({ ...prev, status: "erledigt" }));
    addActivity("Status", "Ticket abgeschlossen");
    toast.success("Ticket abgeschlossen");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/service">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{serviceData.id}</h1>
            <Badge className={statusConfig[serviceData.status]?.color}>
              {statusConfig[serviceData.status]?.label}
            </Badge>
            <Badge className={prioritätConfig[serviceData.priorität]?.color}>
              {prioritätConfig[serviceData.priorität]?.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{serviceData.titel}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTimeTrackingOpen(true)}>
            <Timer className="mr-2 h-4 w-4" />
            Zeit erfassen
          </Button>
          <MaintenancePlanDialog 
            ticketId={serviceData.id}
            customerName={serviceData.kunde}
          />
          <ServiceReportDialog
            ticketId={serviceData.id}
            ticketTitle={serviceData.titel}
            customerName={serviceData.kunde}
            technicianName={serviceData.zugewiesen}
          />
          <ServiceCompleteDialog
            ticketId={serviceData.id}
            ticketTitle={serviceData.titel}
            onComplete={handleComplete}
          />
          
          {/* 3-Punkt-Menü */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={() => setTimeTrackingOpen(true)}>
                <Timer className="mr-2 h-4 w-4" />
                Zeit erfassen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Status ändern
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedTechnician(technicians.find(t => t.name === serviceData.zugewiesen)?.id || "");
                setAssignTechnicianOpen(true);
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Techniker zuweisen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setEditTitle(serviceData.titel);
                setEditDescription(serviceData.beschreibung);
                setEditPriority(serviceData.priorität);
                setEditCategory(serviceData.kategorie);
                setEditOpen(true);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Drucken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("PDF wird generiert...")}>
                <FileText className="mr-2 h-4 w-4" />
                PDF exportieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fällig bis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{serviceData.fälligBis.split(" ")[0]}</p>
            <p className="text-sm text-muted-foreground">{serviceData.fälligBis.split(" ")[1]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeitaufwand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{serviceData.effektiveZeit.toFixed(1)} / {serviceData.geschätzteZeit} Std.</p>
            <p className="text-sm text-muted-foreground">erfasst / geplant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(serviceData.materialkosten)}</p>
            <p className="text-sm text-muted-foreground">Verbrauch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Zugewiesen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{serviceData.zugewiesen.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{serviceData.zugewiesen}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Beschreibung */}
        <Card>
          <CardHeader>
            <CardTitle>Beschreibung</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{serviceData.beschreibung}</p>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Kategorie</p>
                <Badge variant="outline">{serviceData.kategorie}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p>{serviceData.erstelltAm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kunde */}
        <Card>
          <CardHeader>
            <CardTitle>Kundendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-muted-foreground text-sm">Firma</p>
              <Link to={`/customers/${serviceData.kundenNr}`} className="font-medium text-primary hover:underline">
                {serviceData.kunde}
              </Link>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Ansprechpartner</p>
              <p className="font-medium">{serviceData.kontakt}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${serviceData.telefon}`} className="hover:underline">{serviceData.telefon}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${serviceData.email}`} className="hover:underline">{serviceData.email}</a>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p>{serviceData.standort}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivitäten */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Aktivitäten</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea 
              placeholder="Kommentar hinzufügen..." 
              className="flex-1"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleAddComment}>Senden</Button>
          </div>
          <Separator />
          <div className="space-y-4">
            {aktivitäten.map((akt, i) => (
              <div key={i} className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{akt.user}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{akt.typ}</Badge>
                    <span className="text-xs text-muted-foreground">{akt.zeit}</span>
                  </div>
                  <p className="text-sm mt-1">{akt.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zeit erfassen Dialog */}
      <Dialog open={timeTrackingOpen} onOpenChange={setTimeTrackingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Zeit erfassen
            </DialogTitle>
            <DialogDescription>
              Arbeitszeit auf dieses Ticket buchen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="font-medium">{serviceData.titel}</p>
              <p className="text-sm text-muted-foreground">{serviceData.kunde}</p>
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
              Neuen Status für dieses Ticket festlegen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label>Neuer Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="offen">Offen</SelectItem>
                <SelectItem value="in-bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="warten">Warten auf Kunde</SelectItem>
                <SelectItem value="erledigt">Erledigt</SelectItem>
                <SelectItem value="storniert">Storniert</SelectItem>
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

      {/* Bearbeiten Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket bearbeiten</DialogTitle>
            <DialogDescription>
              Ticket-Details anpassen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorität</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="niedrig">Niedrig</SelectItem>
                    <SelectItem value="mittel">Mittel</SelectItem>
                    <SelectItem value="hoch">Hoch</SelectItem>
                    <SelectItem value="kritisch">Kritisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Reparatur">Reparatur</SelectItem>
                    <SelectItem value="Wartung">Wartung</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Reklamation">Reklamation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEdit}>
              Speichern
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
              Techniker für dieses Ticket auswählen
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
              Möchten Sie das Ticket "{serviceData.id}" wirklich löschen?
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
