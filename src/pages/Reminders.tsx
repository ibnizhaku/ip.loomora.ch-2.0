import { useState, useEffect } from "react";
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
  LayoutGrid,
  List,
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
import { useOverdueInvoices, useCreateReminder, useCreateBatchReminders, useReminders } from "@/hooks/use-reminders";

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


// Overdue invoices now fetched from API below

const formatCHF = (amount: number | undefined | null) => {
  const n = Number(amount ?? 0);
  return `CHF ${n.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;
};

type DeliveryMethod = "email" | "post" | "both";

// History tab component for completed reminders
const HistoryTab = () => {
  const { data: historyData, isLoading } = useReminders({ status: "SENT" });
  const { data: paidData } = useReminders({ status: "PAID" });
  const { data: cancelledData } = useReminders({ status: "CANCELLED" });

  const allHistory = [
    ...(historyData?.data || []),
    ...(paidData?.data || []),
    ...(cancelledData?.data || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Verlauf wird geladen...</p>
      </div>
    );
  }

  if (allHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Noch keine abgeschlossenen Mahnungen</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mahnung</TableHead>
          <TableHead>Kunde</TableHead>
          <TableHead>Rechnung</TableHead>
          <TableHead>Stufe</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Betrag</TableHead>
          <TableHead>Datum</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {allHistory.map((r: any) => {
          const statusColors: Record<string, string> = {
            SENT: "bg-blue-500/10 text-blue-500",
            PAID: "bg-emerald-500/10 text-emerald-500",
            CANCELLED: "bg-muted text-muted-foreground",
          };
          return (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.number || r.id?.substring(0, 8)}</TableCell>
              <TableCell>{r.customer?.name || '—'}</TableCell>
              <TableCell>{r.invoice?.number || '—'}</TableCell>
              <TableCell>
                <Badge className={levelConfig[r.level]?.color || "bg-muted text-muted-foreground"} variant="outline">
                  {levelConfig[r.level]?.label || `Stufe ${r.level}`}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[r.status] || "bg-muted text-muted-foreground"}>
                  {r.status === "SENT" ? "Versendet" : r.status === "PAID" ? "Bezahlt" : "Storniert"}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCHF(r.totalAmount)}</TableCell>
              <TableCell className="text-muted-foreground">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString("de-CH") : "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const Reminders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/reminders"],
    queryFn: () => api.get<any>("/reminders"),
  });
  const initialReminders = (apiData?.data || []).map((r: any) => ({
    ...r,
    amount: Number(r.amount ?? r.total ?? r.totalAmount ?? 0),
  }));

  // Fetch overdue invoices from API
  const { data: overdueInvoicesData, refetch: refetchOverdue } = useOverdueInvoices();
  const overdueInvoices: any[] = Array.isArray(overdueInvoicesData) ? overdueInvoicesData : [];

  // Create reminder mutation
  const createReminderMutation = useCreateReminder();

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
  const reminders = initialReminders;
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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
      (r.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.invoice || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilters.length === 0 || levelFilters.includes(r.level);
    return matchesSearch && matchesLevel;
  });

  const selectedReminderData = reminders.filter((r) => selectedReminders.includes(r.id));
  const totalAmount = selectedReminderData.reduce((sum, r) => sum + r.amount, 0);
  const totalFees = selectedReminderData.reduce((sum, r) => sum + (levelConfig[Math.min(r.level + 1, 5)] || levelConfig[1]).fee, 0);
  const grandTotal = totalAmount + totalFees;

  const totalOutstanding = reminders.reduce((sum, r) => sum + r.amount, 0);
  const avgOverdue = reminders.length > 0 ? Math.round(reminders.reduce((sum, r) => sum + r.daysOverdue, 0) / reminders.length) : 0;
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

    const totalSteps = selectedReminders.length;
    for (let i = 0; i < totalSteps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSendingProgress(((i + 1) / totalSteps) * 100);
    }

    // Refresh data from API after bulk operation
    await queryClient.invalidateQueries({ queryKey: ["/reminders"] });

    setIsSending(false);
    setBulkStep(5);
  };

  const handleCreateReminder = async (invoiceId?: string) => {
    if (!invoiceId) {
      setCreateDialogOpen(true);
      return;
    }
    try {
      await createReminderMutation.mutateAsync({ invoiceId });
      await refetchOverdue();
      queryClient.invalidateQueries({ queryKey: ["/reminders"] });
      toast.success("Mahnung wurde erfolgreich erstellt");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Fehler beim Erstellen der Mahnung");
    }
  };

  const handleSendNextReminder = async (reminder: Reminder) => {
    const nextLevel = Math.min(reminder.level + 1, 5);
    const levelInfo = levelConfig[nextLevel] || levelConfig[1];
    const fee = levelInfo.fee;
    try {
      await api.put(`/reminders/${reminder.id}`, { level: nextLevel });
      queryClient.invalidateQueries({ queryKey: ["/reminders"] });
      toast.success(
        `${levelInfo.label} für ${reminder.customer || ""} gesendet` +
        (fee > 0 ? ` (+ CHF ${fee.toFixed(2)} Mahngebühr)` : "")
      );
    } catch {
      toast.error("Fehler beim Aktualisieren der Mahnung");
    }
  };

  const handleRecordPayment = (reminder: Reminder) => {
    queryClient.invalidateQueries({ queryKey: ["/reminders"] });
    toast.success(`Zahlung für ${reminder.invoice} erfasst`);
  };

  const handleExtendDeadline = (reminder: Reminder) => {
    toast.success(`Zahlungsfrist für ${reminder.invoice} verlängert`);
  };

  const handleTransferToCollection = async (reminder: Reminder) => {
    try {
      await api.put(`/reminders/${reminder.id}`, { level: 5 });
      queryClient.invalidateQueries({ queryKey: ["/reminders"] });
      toast.success(`${reminder.invoice} an Inkasso übergeben`);
    } catch {
      toast.error("Fehler beim Inkasso-Transfer");
    }
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
            <Button
              size="sm"
              disabled={createReminderMutation.isPending}
              onClick={async () => {
                for (const inv of overdueInvoices) {
                  await handleCreateReminder(inv.id);
                }
                await refetchOverdue();
                await queryClient.invalidateQueries({ queryKey: ["/reminders"] });
              }}
            >
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
          {/* Filters + View Toggle */}
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
            <div className="flex items-center gap-2">
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
              <div className="flex items-center rounded-lg border border-border bg-card p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", viewMode === "table" && "bg-primary/10 text-primary")}
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", viewMode === "cards" && "bg-primary/10 text-primary")}
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Card View */}
          {viewMode === "cards" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReminders.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                  Keine Mahnungen gefunden
                </div>
              ) : (
                filteredReminders.map((reminder, index) => {
                  const level = levelConfig[reminder.level] || levelConfig[1];
                  return (
                    <div
                      key={reminder.id}
                      className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/reminders/${reminder.id}`)}
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedReminders.includes(reminder.id)}
                          onCheckedChange={() => toggleReminderSelection(reminder.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onSelect={() => navigate(`/reminders/${reminder.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => toast.success("PDF wird heruntergeladen...")}>
                              <Download className="h-4 w-4 mr-2" />
                              PDF herunterladen
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {reminder.level < 5 && (
                              <DropdownMenuItem onSelect={() => handleSendNextReminder(reminder)}>
                                <Send className="h-4 w-4 mr-2" />
                                {(levelConfig[Math.min(reminder.level + 1, 5)] || levelConfig[1]).label} senden
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => handleRecordPayment(reminder)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Zahlung erfassen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{reminder.id}</p>
                          <p className="text-sm text-muted-foreground">Rechnung: {reminder.invoice}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{reminder.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <Clock className="h-4 w-4" />
                          <span>{reminder.daysOverdue} Tage überfällig</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Letzte Mahnung: {reminder.lastReminder}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                        <Badge className={level.color}>{level.label}</Badge>
                        <span className="font-semibold">{formatCHF(reminder.amount)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Table */}
          {viewMode === "table" && (
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
                    const level = levelConfig[reminder.level] || levelConfig[1];
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
                              <DropdownMenuItem onSelect={() => navigate(`/reminders/${reminder.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => toast.success("PDF wird heruntergeladen...")}>
                                <Download className="h-4 w-4 mr-2" />
                                PDF herunterladen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {reminder.level < 5 && (
                                <DropdownMenuItem onSelect={() => handleSendNextReminder(reminder)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  {(levelConfig[Math.min(reminder.level + 1, 5)] || levelConfig[1]).label} senden
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onSelect={() => toast.success("Kunde wird angerufen...")}>
                                <Phone className="h-4 w-4 mr-2" />
                                Anrufen
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleExtendDeadline(reminder)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Zahlungsfrist verlängern
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleRecordPayment(reminder)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Zahlung erfassen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {reminder.level < 5 && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onSelect={() => handleTransferToCollection(reminder)}
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
          )}
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
                          {invoice.number || invoice.id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {typeof invoice.customer === 'object'
                          ? (invoice.customer as any)?.companyName || (invoice.customer as any)?.name
                          : invoice.customer}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-destructive/10 text-destructive">
                          {invoice.daysOverdue} Tage
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCHF(invoice.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          disabled={createReminderMutation.isPending}
                          onClick={() => handleCreateReminder(invoice.id)}
                        >
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
            <CardHeader>
              <CardTitle>Mahnverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryTab />
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
                    {selectedReminderData.map((r) => {
                      const currentLevel = levelConfig[r.level] || levelConfig[1];
                      const nextLevel = levelConfig[Math.min(r.level + 1, 5)] || levelConfig[1];
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{typeof r.customer === 'object' ? (r.customer as any)?.name || (r.customer as any)?.companyName : (r.customer || "")}</TableCell>
                          <TableCell>{typeof r.invoice === 'object' ? (r.invoice as any)?.number || (r.invoice as any)?.id : (r.invoice || "")}</TableCell>
                          <TableCell>
                            <Badge className={currentLevel.color}>
                              {currentLevel.label}
                            </Badge>
                            <ChevronRight className="inline h-3 w-3 mx-1" />
                            <Badge className={nextLevel.color}>
                              {nextLevel.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCHF(r.amount)}</TableCell>
                        </TableRow>
                      );
                    })}
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
                        <span>{typeof r.customer === 'object' ? (r.customer as any)?.name || (r.customer as any)?.companyName : r.customer}</span>
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
                    <strong>{typeof selectedReminderData[0]?.customer === 'object' ? (selectedReminderData[0]?.customer as any)?.name || (selectedReminderData[0]?.customer as any)?.companyName : selectedReminderData[0]?.customer}</strong><br />
                    z.Hd. Buchhaltung<br />
                    Kundenstrasse 10<br />
                    8000 Zürich
                  </div>
                  <div className="mt-8 text-right">
                    Zürich, {new Date().toLocaleDateString("de-CH")}
                  </div>
                  <div className="mt-4">
                    <strong className="text-lg">
                      {(levelConfig[Math.min((selectedReminderData[0]?.level || 1) + 1, 5)] || levelConfig[1]).label}
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
                        <td className="py-2">{typeof selectedReminderData[0]?.invoice === 'object' ? (selectedReminderData[0]?.invoice as any)?.number || (selectedReminderData[0]?.invoice as any)?.id : selectedReminderData[0]?.invoice}</td>
                        <td className="py-2">{selectedReminderData[0]?.dueDate}</td>
                        <td className="text-right py-2">{formatCHF(selectedReminderData[0]?.amount || 0)}</td>
                      </tr>
                      {(selectedReminderData[0]?.level || 0) >= 1 && (
                        <tr>
                          <td className="py-2" colSpan={2}>Mahngebühr</td>
                          <td className="text-right py-2">
                            {formatCHF((levelConfig[Math.min((selectedReminderData[0]?.level || 1) + 1, 5)] || levelConfig[1]).fee)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t font-bold">
                        <td className="py-2" colSpan={2}>Total</td>
                        <td className="text-right py-2">
                          {formatCHF((selectedReminderData[0]?.amount || 0) + (levelConfig[Math.min((selectedReminderData[0]?.level || 1) + 1, 5)] || levelConfig[1]).fee)}
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
                    <p className="font-medium">{invoice.number || invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {typeof invoice.customer === 'object'
                        ? (invoice.customer as any)?.companyName || (invoice.customer as any)?.name
                        : invoice.customer}
                    </p>
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
