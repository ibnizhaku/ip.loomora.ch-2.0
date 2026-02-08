import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Building2,
  Clock,
  CheckCircle2,
  Send,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Eye,
  Download,
  Banknote,
  FileText,
  Gavel,
  Printer,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Swiss 5-stage reminder system with fees (Schweizer Mahnwesen)
const levelConfig: Record<number, { label: string; color: string; fee: number; days: number }> = {
  1: { label: "1. Mahnung", color: "bg-muted text-muted-foreground", fee: 0, days: 10 },
  2: { label: "2. Mahnung", color: "bg-warning/10 text-warning", fee: 20, days: 10 },
  3: { label: "3. Mahnung", color: "bg-orange-500/10 text-orange-500", fee: 30, days: 10 },
  4: { label: "4. Mahnung", color: "bg-destructive/10 text-destructive", fee: 50, days: 10 },
  5: { label: "Inkasso", color: "bg-destructive text-destructive-foreground", fee: 100, days: 0 },
};

interface Reminder {
  id: string;
  invoice: string;
  customer: string;
  customerEmail?: string;
  dueDate: string;
  amount: number;
  level: number;
  lastReminder: string;
  daysOverdue: number;
}


const overdueInvoices = [
  { id: "RE-2024-0160", customer: "Tech Industries", customerEmail: "ap@tech-industries.ch", dueDate: "25.01.2024", amount: 5680.00, daysOverdue: 6, remindersSent: 0 },
  { id: "RE-2024-0158", customer: "Media Solutions", customerEmail: "finance@media-solutions.ch", dueDate: "23.01.2024", amount: 1890.00, daysOverdue: 8, remindersSent: 0 },
];

const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

type DeliveryMethod = "email" | "post" | "both";

const Reminders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/reminders"],
    queryFn: () => api.get<any>("/reminders"),
  });
  const initialReminders = apiData?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/reminders"] });
      toast.success("Mahnung erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Mahnung");
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [levelFilters, setLevelFilters] = useState<number[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  
  // Multi-step wizard state
  const [bulkStep, setBulkStep] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("email");
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);

  const toggleLevelFilter = (level: number) => {
    setLevelFilters((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const resetFilters = () => {
    setLevelFilters([]);
  };

  const hasActiveFilters = levelFilters.length > 0;

  const filteredReminders = reminders.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.invoice.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilters.length === 0 || levelFilters.includes(r.level);
    return matchesSearch && matchesLevel;
  });

  const selectedReminderData = reminders.filter((r) => selectedReminders.includes(r.id));
  const totalAmount = selectedReminderData.reduce((sum, r) => sum + r.amount, 0);
  const totalFees = selectedReminderData.reduce((sum, r) => sum + levelConfig[Math.min(r.level + 1, 5)].fee, 0);
  const grandTotal = totalAmount + totalFees;

  const totalOutstanding = reminders.reduce((sum, r) => sum + r.amount, 0);
  const avgOverdue = Math.round(reminders.reduce((sum, r) => sum + r.daysOverdue, 0) / reminders.length);
  const inkassoCount = reminders.filter((r) => r.level >= 4).length;

  const stats = [
    { title: "Offene Forderungen", value: formatCHF(totalOutstanding), color: "text-destructive", icon: Banknote },
    { title: "Mahnungen aktiv", value: String(reminders.length), color: "text-warning", icon: FileText },
    { title: "Ø Überfälligkeit", value: `${avgOverdue} Tage`, color: "text-muted-foreground", icon: Clock },
    { title: "Inkasso-Fälle", value: String(inkassoCount), color: "text-destructive", icon: Gavel },
  ];

  const toggleReminderSelection = (id: string) => {
    setSelectedReminders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAllReminders = () => {
    if (selectedReminders.length === filteredReminders.length) {
      setSelectedReminders([]);
    } else {
      setSelectedReminders(filteredReminders.map((r) => r.id));
    }
  };

  const handleBulkReminder = () => {
    if (selectedReminders.length === 0) {
      toast.error("Bitte wählen Sie mindestens eine Mahnung aus");
      return;
    }
    setBulkStep(1);
    setDeliveryMethod("email");
    setIsSending(false);
    setSendingProgress(0);
    setBulkDialogOpen(true);
  };

  const closeBulkDialog = () => {
    setBulkDialogOpen(false);
    setBulkStep(1);
    setIsSending(false);
    setSendingProgress(0);
  };

  const confirmBulkReminder = async () => {
    setIsSending(true);
    setSendingProgress(0);

    // Simulate sending process
    const totalSteps = selectedReminders.length;
    for (let i = 0; i < totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSendingProgress(((i + 1) / totalSteps) * 100);
    }

    // Update reminder levels
    setReminders((prev) =>
      prev.map((r) => {
        if (selectedReminders.includes(r.id)) {
          const newLevel = Math.min(r.level + 1, 5);
          const today = new Date().toLocaleDateString("de-CH");
          return { ...r, level: newLevel, lastReminder: today };
        }
        return r;
      })
    );

    setIsSending(false);
    setBulkStep(5); // Success step
  };

  const handleCreateReminder = (invoiceId?: string) => {
    if (invoiceId) {
      toast.success(`1. Mahnung für ${invoiceId} wird erstellt...`);
    } else {
      setCreateDialogOpen(true);
    }
  };

  const handleSendNextReminder = (reminder: Reminder) => {
    const nextLevel = Math.min(reminder.level + 1, 5);
    const fee = levelConfig[nextLevel].fee;
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, level: nextLevel } : r
      )
    );
    toast.success(
      `${levelConfig[nextLevel].label} für ${reminder.customer} gesendet` +
      (fee > 0 ? ` (+ CHF ${fee.toFixed(2)} Mahngebühr)` : "")
    );
  };

  const handleRecordPayment = (reminder: Reminder) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
    toast.success(`Zahlung für ${reminder.invoice} erfasst`);
  };

  const handleExtendDeadline = (reminder: Reminder) => {
    toast.success(`Zahlungsfrist für ${reminder.invoice} verlängert`);
  };

  const handleTransferToCollection = (reminder: Reminder) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, level: 5 } : r
      )
    );
    toast.success(`${reminder.invoice} an Inkasso übergeben`);
  };

  const finishBulkProcess = () => {
    toast.success(`${selectedReminders.length} Mahnungen erfolgreich versendet`);
    setSelectedReminders([]);
    closeBulkDialog();
  };

  // Wizard step titles
  const stepTitles = [
    "Übersicht",
    "Versandart",
    "Vorschau",
    "Bestätigung",
    "Abgeschlossen",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mahnwesen</h1>
          <p className="text-muted-foreground">Verwalten Sie überfällige Rechnungen und Mahnungen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkReminder}>
            <Mail className="h-4 w-4 mr-2" />
            Sammel-Mahnung
            {selectedReminders.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{selectedReminders.length}</Badge>
            )}
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Mahnung erstellen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert */}
      {overdueInvoices.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <div className="flex-1">
              <p className="font-semibold">Neue überfällige Rechnungen</p>
              <p className="text-sm text-muted-foreground">
                {overdueInvoices.length} Rechnungen sind überfällig und wurden noch nicht gemahnt.
              </p>
            </div>
            <Button size="sm" onClick={() => {
              overdueInvoices.forEach((inv) => handleCreateReminder(inv.id));
            }}>
              Mahnungen erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Aktive Mahnungen</TabsTrigger>
          <TabsTrigger value="overdue">Überfällig ohne Mahnung</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Mahnungen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(hasActiveFilters && "border-primary text-primary")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 bg-popover" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Zurücksetzen
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mahnstufe</Label>
                    <div className="space-y-2">
                      {Object.entries(levelConfig).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`level-${key}`}
                            checked={levelFilters.includes(parseInt(key))}
                            onCheckedChange={() => toggleLevelFilter(parseInt(key))}
                          />
                          <label htmlFor={`level-${key}`} className="text-sm cursor-pointer flex items-center gap-2">
                            <Badge className={value.color} variant="outline">{value.label}</Badge>
                            {value.fee > 0 && (
                              <span className="text-xs text-muted-foreground">+CHF {value.fee}</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedReminders.length === filteredReminders.length && filteredReminders.length > 0}
                        onCheckedChange={selectAllReminders}
                      />
                    </TableHead>
                    <TableHead>Mahnung</TableHead>
                    <TableHead>Rechnung</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Fällig seit</TableHead>
                    <TableHead className="text-right">Offener Betrag</TableHead>
                    <TableHead>Mahnstufe</TableHead>
                    <TableHead>Letzte Mahnung</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReminders.map((reminder) => {
                    const level = levelConfig[reminder.level];
                    return (
                      <TableRow 
                        key={reminder.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/reminders/${reminder.id}`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedReminders.includes(reminder.id)}
                            onCheckedChange={() => toggleReminderSelection(reminder.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{reminder.id}</TableCell>
                        <TableCell>
                          <span 
                            className="hover:text-primary cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${reminder.invoice}`); }}
                          >
                            {reminder.invoice}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {reminder.customer}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-destructive">
                            <Clock className="h-4 w-4" />
                            {reminder.daysOverdue} Tage
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCHF(reminder.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={level.color}>{level.label}</Badge>
                        </TableCell>
                        <TableCell>{reminder.lastReminder}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem onClick={() => navigate(`/reminders/${reminder.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success("PDF wird heruntergeladen...")}>
                                <Download className="h-4 w-4 mr-2" />
                                PDF herunterladen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {reminder.level < 5 && (
                                <DropdownMenuItem onClick={() => handleSendNextReminder(reminder)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  {levelConfig[Math.min(reminder.level + 1, 5)].label} senden
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => toast.success("Kunde wird angerufen...")}>
                                <Phone className="h-4 w-4 mr-2" />
                                Anrufen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExtendDeadline(reminder)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Zahlungsfrist verlängern
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRecordPayment(reminder)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Zahlung erfassen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {reminder.level < 5 && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleTransferToCollection(reminder)}
                                >
                                  <Gavel className="h-4 w-4 mr-2" />
                                  An Inkasso übergeben
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnung</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Fälligkeitsdatum</TableHead>
                    <TableHead>Überfällig seit</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link to={`/invoices/${invoice.id}`} className="font-medium hover:text-primary">
                          {invoice.id}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-destructive/10 text-destructive">
                          {invoice.daysOverdue} Tage
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCHF(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleCreateReminder(invoice.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Mahnen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Mahnverlauf wird hier angezeigt</p>
              <p className="text-sm">Abgeschlossene Mahnverfahren und Zahlungseingänge</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Multi-Step Bulk Reminder Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={(open) => !isSending && (open ? setBulkDialogOpen(true) : closeBulkDialog())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sammel-Mahnung versenden</DialogTitle>
            <DialogDescription>
              {bulkStep < 5 ? `Schritt ${bulkStep} von 4: ${stepTitles[bulkStep - 1]}` : "Versand abgeschlossen"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress indicator */}
          {bulkStep < 5 && (
            <div className="flex items-center gap-2 py-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      step < bulkStep
                        ? "bg-primary text-primary-foreground"
                        : step === bulkStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step < bulkStep ? <Check className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={cn("h-1 flex-1 rounded", step < bulkStep ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Overview */}
          {bulkStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Folgende {selectedReminders.length} Mahnung{selectedReminders.length > 1 ? "en" : ""} wurden ausgewählt:
              </p>
              <ScrollArea className="h-[200px] rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kunde</TableHead>
                      <TableHead>Rechnung</TableHead>
                      <TableHead>Aktuelle Stufe</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedReminderData.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.customer}</TableCell>
                        <TableCell>{r.invoice}</TableCell>
                        <TableCell>
                          <Badge className={levelConfig[r.level].color}>
                            {levelConfig[r.level].label}
                          </Badge>
                          <ChevronRight className="inline h-3 w-3 mx-1" />
                          <Badge className={levelConfig[Math.min(r.level + 1, 5)].color}>
                            {levelConfig[Math.min(r.level + 1, 5)].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCHF(r.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span>Anzahl Mahnungen:</span>
                  <span className="font-medium">{selectedReminders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Offene Forderungen:</span>
                  <span className="font-medium">{formatCHF(totalAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Mahngebühren (neu):</span>
                  <span className="font-medium text-warning">{formatCHF(totalFees)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Gesamtforderung:</span>
                  <span>{formatCHF(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Method */}
          {bulkStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Wählen Sie die Versandart für die Mahnungen:
              </p>
              <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)}>
                <div className="space-y-3">
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50",
                    deliveryMethod === "email" && "border-primary bg-primary/5"
                  )}>
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <span className="font-medium">Per E-Mail</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Schneller Versand an die hinterlegte E-Mail-Adresse
                      </p>
                    </Label>
                  </div>
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50",
                    deliveryMethod === "post" && "border-primary bg-primary/5"
                  )}>
                    <RadioGroupItem value="post" id="post" />
                    <Label htmlFor="post" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Printer className="h-5 w-5 text-primary" />
                        <span className="font-medium">Per Post (Druck)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        PDF-Dokumente zum Ausdrucken und Versenden per Post
                      </p>
                    </Label>
                  </div>
                  <div className={cn(
                    "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50",
                    deliveryMethod === "both" && "border-primary bg-primary/5"
                  )}>
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        <span className="font-medium">E-Mail + Post</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sowohl per E-Mail als auch als PDF zum Drucken
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              {(deliveryMethod === "email" || deliveryMethod === "both") && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">E-Mail-Empfänger:</p>
                  <div className="space-y-1">
                    {selectedReminderData.map((r) => (
                      <div key={r.id} className="text-sm flex justify-between">
                        <span>{r.customer}</span>
                        <span className="text-muted-foreground">{r.customerEmail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview */}
          {bulkStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vorschau der Mahnschreiben (Schweizer Standard):
              </p>
              <ScrollArea className="h-[300px] rounded-lg border bg-white p-4">
                <div className="space-y-4 text-sm">
                  <div className="text-right text-muted-foreground">
                    Muster AG<br />
                    Musterstrasse 1<br />
                    8000 Zürich<br />
                    CHE-123.456.789 MWST
                  </div>
                  <div className="mt-8">
                    <strong>{selectedReminderData[0]?.customer}</strong><br />
                    z.Hd. Buchhaltung<br />
                    Kundenstrasse 10<br />
                    8000 Zürich
                  </div>
                  <div className="mt-8 text-right">
                    Zürich, {new Date().toLocaleDateString("de-CH")}
                  </div>
                  <div className="mt-4">
                    <strong className="text-lg">
                      {levelConfig[Math.min((selectedReminderData[0]?.level || 1) + 1, 5)].label}
                    </strong>
                  </div>
                  <p className="mt-4">
                    Sehr geehrte Damen und Herren
                  </p>
                  <p>
                    Trotz unserer bisherigen Zahlungserinnerungen mussten wir feststellen, dass 
                    die nachstehende Rechnung noch nicht beglichen wurde:
                  </p>
                  <table className="w-full mt-4 text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Rechnung</th>
                        <th className="text-left py-2">Datum</th>
                        <th className="text-right py-2">Betrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">{selectedReminderData[0]?.invoice}</td>
                        <td className="py-2">{selectedReminderData[0]?.dueDate}</td>
                        <td className="text-right py-2">{formatCHF(selectedReminderData[0]?.amount || 0)}</td>
                      </tr>
                      {(selectedReminderData[0]?.level || 0) >= 1 && (
                        <tr>
                          <td className="py-2" colSpan={2}>Mahngebühr</td>
                          <td className="text-right py-2">
                            {formatCHF(levelConfig[Math.min((selectedReminderData[0]?.level || 1) + 1, 5)].fee)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t font-bold">
                        <td className="py-2" colSpan={2}>Total</td>
                        <td className="text-right py-2">
                          {formatCHF((selectedReminderData[0]?.amount || 0) + levelConfig[Math.min((selectedReminderData[0]?.level || 1) + 1, 5)].fee)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-4">
                    Wir bitten Sie, den ausstehenden Betrag innert 10 Tagen auf unser Konto 
                    zu überweisen. Bei Fragen stehen wir Ihnen gerne zur Verfügung.
                  </p>
                  <p className="mt-4">
                    Freundliche Grüsse<br />
                    <strong>Muster AG</strong>
                  </p>
                  <div className="mt-8 p-4 border rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center">
                      [QR-Einzahlungsschein wird hier generiert]
                    </p>
                  </div>
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                * Bei mehreren Mahnungen wird für jeden Kunden ein separates Schreiben erstellt.
              </p>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {bulkStep === 4 && !isSending && (
            <div className="space-y-4">
              <div className="rounded-lg border p-6 text-center">
                <Send className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Bereit zum Versand</h3>
                <p className="text-muted-foreground">
                  {selectedReminders.length} Mahnung{selectedReminders.length > 1 ? "en" : ""} per{" "}
                  {deliveryMethod === "email" ? "E-Mail" : deliveryMethod === "post" ? "Post" : "E-Mail und Post"} versenden?
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span>Versandart:</span>
                  <span className="font-medium">
                    {deliveryMethod === "email" ? "E-Mail" : deliveryMethod === "post" ? "Post (Druck)" : "E-Mail + Post"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Anzahl Mahnungen:</span>
                  <span className="font-medium">{selectedReminders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gesamtforderung inkl. Gebühren:</span>
                  <span className="font-medium">{formatCHF(grandTotal)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Sending Progress */}
          {bulkStep === 4 && isSending && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Mahnungen werden versendet...</h3>
                <p className="text-muted-foreground">
                  Bitte warten Sie, bis alle Mahnungen versendet wurden.
                </p>
              </div>
              <Progress value={sendingProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(sendingProgress)}% abgeschlossen
              </p>
            </div>
          )}

          {/* Step 5: Success */}
          {bulkStep === 5 && (
            <div className="space-y-4 py-8">
              <div className="text-center">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Versand erfolgreich!</h3>
                <p className="text-muted-foreground">
                  {selectedReminders.length} Mahnung{selectedReminders.length > 1 ? "en" : ""} wurde{selectedReminders.length > 1 ? "n" : ""} erfolgreich versendet.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span>Versendete Mahnungen:</span>
                  <span className="font-medium">{selectedReminders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Neue Mahngebühren:</span>
                  <span className="font-medium text-warning">{formatCHF(totalFees)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gesamtforderung:</span>
                  <span className="font-medium">{formatCHF(grandTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Versandart:</span>
                  <span className="font-medium">
                    {deliveryMethod === "email" ? "E-Mail" : deliveryMethod === "post" ? "Post (Druck)" : "E-Mail + Post"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nächste Mahnstufe fällig:</span>
                  <span className="font-medium">in 10 Tagen</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {bulkStep === 1 && (
              <>
                <Button variant="outline" onClick={closeBulkDialog}>Abbrechen</Button>
                <Button onClick={() => setBulkStep(2)}>
                  Weiter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
            {bulkStep === 2 && (
              <>
                <Button variant="outline" onClick={() => setBulkStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <Button onClick={() => setBulkStep(3)}>
                  Weiter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
            {bulkStep === 3 && (
              <>
                <Button variant="outline" onClick={() => setBulkStep(2)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <Button onClick={() => setBulkStep(4)}>
                  Weiter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
            {bulkStep === 4 && !isSending && (
              <>
                <Button variant="outline" onClick={() => setBulkStep(3)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <Button onClick={confirmBulkReminder}>
                  <Send className="h-4 w-4 mr-2" />
                  Jetzt versenden
                </Button>
              </>
            )}
            {bulkStep === 5 && (
              <Button onClick={finishBulkProcess}>
                <Check className="h-4 w-4 mr-2" />
                Fertig
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Reminder Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Mahnung erstellen</DialogTitle>
            <DialogDescription>
              Wählen Sie eine überfällige Rechnung aus, um eine Mahnung zu erstellen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {overdueInvoices.length > 0 ? (
              overdueInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted cursor-pointer"
                  onClick={() => {
                    handleCreateReminder(invoice.id);
                    setCreateDialogOpen(false);
                  }}
                >
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCHF(invoice.amount)}</p>
                    <Badge className="bg-destructive/10 text-destructive">
                      {invoice.daysOverdue} Tage überfällig
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine überfälligen Rechnungen</p>
                <p className="text-sm">Alle Rechnungen sind bezahlt oder noch nicht fällig.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Schliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reminders;
