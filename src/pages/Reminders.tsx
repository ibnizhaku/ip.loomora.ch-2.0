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
  XCircle,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Swiss 5-stage reminder system with fees (Schweizer Mahnwesen)
const levelConfig: Record<number, { label: string; color: string; fee: number }> = {
  1: { label: "1. Mahnung", color: "bg-muted text-muted-foreground", fee: 0 },
  2: { label: "2. Mahnung", color: "bg-warning/10 text-warning", fee: 20 },
  3: { label: "3. Mahnung", color: "bg-orange-500/10 text-orange-500", fee: 30 },
  4: { label: "4. Mahnung", color: "bg-destructive/10 text-destructive", fee: 50 },
  5: { label: "Inkasso", color: "bg-destructive text-destructive-foreground", fee: 100 },
};

interface Reminder {
  id: string;
  invoice: string;
  customer: string;
  dueDate: string;
  amount: number;
  level: number;
  lastReminder: string;
  daysOverdue: number;
  selected?: boolean;
}

const initialReminders: Reminder[] = [
  { id: "MA-2024-0028", invoice: "RE-2024-0156", customer: "Müller & Partner GmbH", dueDate: "19.01.2024", amount: 8262.55, level: 2, lastReminder: "27.01.2024", daysOverdue: 12 },
  { id: "MA-2024-0027", invoice: "RE-2024-0148", customer: "Innovation Labs", dueDate: "15.01.2024", amount: 4580.00, level: 3, lastReminder: "25.01.2024", daysOverdue: 16 },
  { id: "MA-2024-0026", invoice: "RE-2024-0142", customer: "Weber Elektronik", dueDate: "22.01.2024", amount: 2890.00, level: 1, lastReminder: "28.01.2024", daysOverdue: 9 },
  { id: "MA-2024-0025", invoice: "RE-2024-0135", customer: "StartUp Solutions", dueDate: "10.01.2024", amount: 12500.00, level: 4, lastReminder: "20.01.2024", daysOverdue: 21 },
  { id: "MA-2024-0024", invoice: "RE-2024-0128", customer: "Digital Consulting", dueDate: "18.01.2024", amount: 3450.00, level: 2, lastReminder: "26.01.2024", daysOverdue: 13 },
];

const overdueInvoices = [
  { id: "RE-2024-0160", customer: "Tech Industries", dueDate: "25.01.2024", amount: 5680.00, daysOverdue: 6, remindersSent: 0 },
  { id: "RE-2024-0158", customer: "Media Solutions", dueDate: "23.01.2024", amount: 1890.00, daysOverdue: 8, remindersSent: 0 },
];

const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

const Reminders = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [levelFilters, setLevelFilters] = useState<number[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);

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
    setBulkDialogOpen(true);
  };

  const confirmBulkReminder = () => {
    const count = selectedReminders.length;
    toast.success(`${count} Sammel-Mahnung${count > 1 ? "en" : ""} wird versendet...`);
    setSelectedReminders([]);
    setBulkDialogOpen(false);
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

      {/* Bulk Reminder Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sammel-Mahnung versenden</DialogTitle>
            <DialogDescription>
              Sie sind dabei, {selectedReminders.length} Mahnung{selectedReminders.length > 1 ? "en" : ""} als Sammel-Mahnung zu versenden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Anzahl Mahnungen:</span>
                <span className="font-medium">{selectedReminders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gesamtbetrag:</span>
                <span className="font-medium">
                  {formatCHF(
                    reminders
                      .filter((r) => selectedReminders.includes(r.id))
                      .reduce((sum, r) => sum + r.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Mahngebühren:</span>
                <span className="font-medium text-warning">
                  {formatCHF(
                    reminders
                      .filter((r) => selectedReminders.includes(r.id))
                      .reduce((sum, r) => sum + levelConfig[Math.min(r.level + 1, 5)].fee, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={confirmBulkReminder}>
              <Send className="h-4 w-4 mr-2" />
              Mahnungen versenden
            </Button>
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
