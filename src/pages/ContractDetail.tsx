import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  FileSignature,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  MoreHorizontal,
  Bell,
  FileText,
  History,
  RefreshCw,
  Ban,
  Receipt,
  Copy,
  Printer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

const initialContractData = {
  id: "VT-2024-0012",
  title: "Wartungsvertrag Server-Infrastruktur",
  type: "Servicevertrag",
  status: "Aktiv",
  partner: {
    name: "Digital Solutions AG",
    contact: "Thomas Müller",
    type: "Kunde"
  },
  startDate: "01.01.2024",
  endDate: "31.12.2024",
  autoRenewal: true,
  renewalNotice: "3 Monate",
  value: {
    monthly: 2500,
    annual: 30000
  },
  progress: 8,
  daysRemaining: 337,
  services: [
    { name: "24/7 Monitoring", included: true },
    { name: "Monatliche Wartung", included: true },
    { name: "Sicherheitsupdates", included: true },
    { name: "Backup-Management", included: true },
    { name: "Notfall-Support (4h SLA)", included: true },
    { name: "Hardware-Ersatz", included: false },
  ],
  payments: [
    { date: "01.01.2024", amount: 2500, status: "Bezahlt" },
  ],
  documents: [
    { name: "Vertrag_VT-2024-0012.pdf", date: "01.01.2024", size: "245 KB" },
    { name: "SLA_Anhang.pdf", date: "01.01.2024", size: "128 KB" },
    { name: "Leistungsbeschreibung.pdf", date: "01.01.2024", size: "89 KB" },
  ],
  history: [
    { date: "01.01.2024", action: "Vertrag aktiviert", user: "System" },
    { date: "28.12.2023", action: "Vertrag unterzeichnet", user: "Thomas Müller" },
    { date: "20.12.2023", action: "Vertrag erstellt", user: "Max Keller" },
  ],
  notes: "Verlängerung um ein weiteres Jahr geplant. Kunde zufrieden mit bisherigem Service."
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileSignature },
  "Aktiv": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Läuft aus": { color: "bg-warning/10 text-warning", icon: AlertTriangle },
  "Beendet": { color: "bg-muted text-muted-foreground", icon: Clock },
  "Gekündigt": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [contractData, setContractData] = useState(initialContractData);
  const [historyEntries, setHistoryEntries] = useState(initialContractData.history);
  
  // Dialog states
  const [renewOpen, setRenewOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Renewal form
  const [renewDuration, setRenewDuration] = useState("12");
  const [renewStartDate, setRenewStartDate] = useState("2025-01-01");
  const [renewAdjustPrice, setRenewAdjustPrice] = useState(false);
  const [renewNewPrice, setRenewNewPrice] = useState(contractData.value.monthly.toString());
  
  // Termination form
  const [terminationDate, setTerminationDate] = useState("");
  const [terminationReason, setTerminationReason] = useState("");
  const [terminationNotes, setTerminationNotes] = useState("");
  
  // Invoice form
  const [invoicePeriod, setInvoicePeriod] = useState("monthly");
  const [invoiceMonth, setInvoiceMonth] = useState("01");
  const [invoiceYear, setInvoiceYear] = useState("2024");
  
  // Edit form
  const [editTitle, setEditTitle] = useState(contractData.title);
  const [editType, setEditType] = useState(contractData.type);
  const [editNotes, setEditNotes] = useState(contractData.notes);

  const status = statusConfig[contractData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  const addHistoryEntry = (action: string) => {
    const newEntry = {
      date: new Date().toLocaleDateString("de-CH"),
      action,
      user: "Aktueller Benutzer",
    };
    setHistoryEntries([newEntry, ...historyEntries]);
  };

  // Vertrag verlängern
  const handleRenew = () => {
    const duration = parseInt(renewDuration);
    const newEndDate = new Date(renewStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + duration);
    
    setContractData(prev => ({
      ...prev,
      endDate: newEndDate.toLocaleDateString("de-CH"),
      value: renewAdjustPrice ? {
        monthly: parseFloat(renewNewPrice),
        annual: parseFloat(renewNewPrice) * 12,
      } : prev.value,
      daysRemaining: Math.floor((newEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      progress: 0,
    }));
    
    addHistoryEntry(`Vertrag verlängert um ${duration} Monate bis ${newEndDate.toLocaleDateString("de-CH")}`);
    toast.success("Vertrag wurde verlängert");
    setRenewOpen(false);
  };

  // Vertrag kündigen
  const handleTerminate = () => {
    if (!terminationReason) {
      toast.error("Bitte Kündigungsgrund angeben");
      return;
    }
    
    setContractData(prev => ({
      ...prev,
      status: "Gekündigt",
      endDate: terminationDate || prev.endDate,
    }));
    
    addHistoryEntry(`Vertrag gekündigt: ${terminationReason}`);
    toast.warning("Vertrag wurde gekündigt");
    setTerminateOpen(false);
  };

  // Rechnung erstellen
  const handleCreateInvoice = () => {
    const amount = invoicePeriod === "monthly" 
      ? contractData.value.monthly 
      : invoicePeriod === "quarterly" 
        ? contractData.value.monthly * 3
        : contractData.value.annual;
    
    const periodLabel = invoicePeriod === "monthly" 
      ? `${invoiceMonth}/${invoiceYear}`
      : invoicePeriod === "quarterly"
        ? `Q${Math.ceil(parseInt(invoiceMonth) / 3)}/${invoiceYear}`
        : invoiceYear;
    
    addHistoryEntry(`Rechnung erstellt für Periode ${periodLabel}: CHF ${amount.toLocaleString("de-CH")}`);
    toast.success(`Rechnung für CHF ${amount.toLocaleString("de-CH")} erstellt`);
    setCreateInvoiceOpen(false);
    
    // Optional: Navigate to invoice
    // navigate(`/invoices/new?contractId=${contractData.id}`);
  };

  // Bearbeiten
  const handleEdit = () => {
    setContractData(prev => ({
      ...prev,
      title: editTitle,
      type: editType,
      notes: editNotes,
    }));
    
    addHistoryEntry("Vertragsdaten aktualisiert");
    toast.success("Vertrag aktualisiert");
    setEditOpen(false);
  };

  // Duplizieren
  const handleDuplicate = () => {
    addHistoryEntry("Vertrag dupliziert");
    toast.success("Vertrag wurde dupliziert");
    // navigate('/contracts/new?from=' + contractData.id);
  };

  // Löschen
  const handleDelete = () => {
    toast.success("Vertrag gelöscht");
    navigate("/contracts");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/contracts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{contractData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {contractData.status}
              </Badge>
              {contractData.autoRenewal && (
                <Badge variant="outline">Auto-Verlängerung</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{contractData.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCreateInvoiceOpen(true)}>
            <Receipt className="h-4 w-4 mr-2" />
            Rechnung erstellen
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRenewOpen(true)} disabled={contractData.status === "Gekündigt"}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Verlängern
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={() => setRenewOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verlängern
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateInvoiceOpen(true)}>
                <Receipt className="h-4 w-4 mr-2" />
                Rechnung erstellen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("PDF wird generiert...")}>
                <Download className="h-4 w-4 mr-2" />
                PDF Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Erinnerung wird erstellt...")}>
                <Bell className="h-4 w-4 mr-2" />
                Erinnerung setzen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setTerminateOpen(true)}
                className="text-warning focus:text-warning"
                disabled={contractData.status === "Gekündigt"}
              >
                <Ban className="h-4 w-4 mr-2" />
                Kündigen
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Vertragslaufzeit</p>
              <p className="text-lg font-semibold">{contractData.startDate} - {contractData.endDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Verbleibend</p>
              <p className="text-lg font-semibold">{contractData.daysRemaining} Tage</p>
            </div>
          </div>
          <Progress value={contractData.progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {contractData.progress}% der Laufzeit verstrichen
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="payments">Zahlungen</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="history">Verlauf</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Leistungsumfang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {contractData.services.map((service, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          service.included ? "bg-success/5 border border-success/20" : "bg-muted/50"
                        }`}
                      >
                        {service.included ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={service.included ? "font-medium" : "text-muted-foreground"}>
                          {service.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notizen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{contractData.notes}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Zahlungsübersicht</CardTitle>
                  <Button size="sm" onClick={() => setCreateInvoiceOpen(true)}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Neue Rechnung
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractData.payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                            <Receipt className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">Monatliche Zahlung</p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">CHF {payment.amount.toLocaleString("de-CH")}</p>
                          <Badge className="bg-success/10 text-success">{payment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Vertragsdokumente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contractData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.date} • {doc.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Vertragsverlauf</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {historyEntries.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <History className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {index < historyEntries.length - 1 && (
                            <div className="w-px h-8 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{entry.action}</p>
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Partner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vertragspartner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to="/customers/1" className="font-medium hover:text-primary">
                    {contractData.partner.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{contractData.partner.contact}</p>
                </div>
              </div>
              <Badge variant="secondary">{contractData.partner.type}</Badge>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vertragswert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monatlich</span>
                <span className="font-semibold">CHF {contractData.value.monthly.toLocaleString("de-CH")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jährlich</span>
                <span className="font-semibold text-primary">CHF {contractData.value.annual.toLocaleString("de-CH")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vertragsart</span>
                <span className="font-medium">{contractData.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Startdatum</span>
                <span className="font-medium">{contractData.startDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enddatum</span>
                <span className="font-medium">{contractData.endDate}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kündigungsfrist</span>
                <span className="font-medium">{contractData.renewalNotice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto-Verlängerung</span>
                <span className="font-medium">{contractData.autoRenewal ? "Ja" : "Nein"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verlängern Dialog */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Vertrag verlängern
            </DialogTitle>
            <DialogDescription>
              Laufzeit des Vertrags {contractData.id} verlängern
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg border bg-muted/50">
              <p className="font-medium">{contractData.title}</p>
              <p className="text-sm text-muted-foreground">Aktuell gültig bis: {contractData.endDate}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Verlängerungsdauer</Label>
              <Select value={renewDuration} onValueChange={setRenewDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="6">6 Monate</SelectItem>
                  <SelectItem value="12">12 Monate</SelectItem>
                  <SelectItem value="24">24 Monate</SelectItem>
                  <SelectItem value="36">36 Monate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Neues Startdatum</Label>
              <Input
                type="date"
                value={renewStartDate}
                onChange={(e) => setRenewStartDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="adjustPrice"
                checked={renewAdjustPrice}
                onChange={(e) => setRenewAdjustPrice(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="adjustPrice">Preis anpassen</Label>
            </div>
            
            {renewAdjustPrice && (
              <div className="space-y-2">
                <Label>Neuer Monatspreis (CHF)</Label>
                <Input
                  type="number"
                  value={renewNewPrice}
                  onChange={(e) => setRenewNewPrice(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Jahreswert: CHF {(parseFloat(renewNewPrice || "0") * 12).toLocaleString("de-CH")}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleRenew}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verlängern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kündigen Dialog */}
      <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <Ban className="h-5 w-5" />
              Vertrag kündigen
            </DialogTitle>
            <DialogDescription>
              Kündigung für Vertrag {contractData.id} einleiten
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-warning/20 bg-warning/5">
              <p className="font-medium">{contractData.title}</p>
              <p className="text-sm text-muted-foreground">
                Kündigungsfrist: {contractData.renewalNotice}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Kündigungsgrund *</Label>
              <Select value={terminationReason} onValueChange={setTerminationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Grund auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Kundenwunsch">Kundenwunsch</SelectItem>
                  <SelectItem value="Vertragsverletzung">Vertragsverletzung</SelectItem>
                  <SelectItem value="Projektabschluss">Projektabschluss</SelectItem>
                  <SelectItem value="Insolvenz">Insolvenz</SelectItem>
                  <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Kündigungsdatum</Label>
              <Input
                type="date"
                value={terminationDate}
                onChange={(e) => setTerminationDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leer lassen für Vertragsende ({contractData.endDate})
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Bemerkungen</Label>
              <Textarea
                placeholder="Zusätzliche Informationen zur Kündigung..."
                value={terminationNotes}
                onChange={(e) => setTerminationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleTerminate}>
              <Ban className="mr-2 h-4 w-4" />
              Kündigung bestätigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rechnung erstellen Dialog */}
      <Dialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Rechnung erstellen
            </DialogTitle>
            <DialogDescription>
              Neue Rechnung für Vertrag {contractData.id} erstellen
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Abrechnungszeitraum</Label>
              <Select value={invoicePeriod} onValueChange={setInvoicePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monat</Label>
                <Select value={invoiceMonth} onValueChange={setInvoiceMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jahr</Label>
                <Select value={invoiceYear} onValueChange={setInvoiceYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rechnungsbetrag</span>
                <span className="text-xl font-bold">
                  CHF {(
                    invoicePeriod === "monthly" 
                      ? contractData.value.monthly 
                      : invoicePeriod === "quarterly"
                        ? contractData.value.monthly * 3
                        : contractData.value.annual
                  ).toLocaleString("de-CH")}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateInvoiceOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateInvoice}>
              <Receipt className="mr-2 h-4 w-4" />
              Rechnung erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bearbeiten Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vertrag bearbeiten</DialogTitle>
            <DialogDescription>
              Vertragsdaten aktualisieren
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bezeichnung</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Vertragsart</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Servicevertrag">Servicevertrag</SelectItem>
                  <SelectItem value="Wartungsvertrag">Wartungsvertrag</SelectItem>
                  <SelectItem value="Lizenzvertrag">Lizenzvertrag</SelectItem>
                  <SelectItem value="Rahmenvertrag">Rahmenvertrag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Notizen</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
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

      {/* Löschen AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vertrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Vertrag "{contractData.id}" wirklich löschen?
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
};

export default ContractDetail;
