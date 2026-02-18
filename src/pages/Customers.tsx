import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Loader2,
  LayoutGrid,
  List,
  FolderKanban,
  Send,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useCustomers, useCustomerStats, useDeleteCustomer } from "@/hooks/use-customers";
import { usePermissions } from "@/hooks/use-permissions";
import { useEmailAccount } from "@/hooks/use-email-account";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  prospect: { label: "Interessent", color: "bg-info/10 text-info" },
};

type StatusFilter = "active" | "inactive" | "prospect";

interface EmailModalState {
  open: boolean;
  email: string;
  customerName: string;
}

function CustomerEmailModal({ state, onClose }: { state: EmailModalState; onClose: () => void }) {
  const navigate = useNavigate();
  const { hasEmailAccount, fromEmail, fromName, isLoading } = useEmailAccount();
  const [to, setTo] = useState(state.email);
  const [subject, setSubject] = useState(`Kontaktaufnahme – ${state.customerName}`);
  const [message, setMessage] = useState(`Sehr geehrte Damen und Herren,\n\n\n\nMit freundlichen Grüssen\n${fromName ?? ""}`);

  const sendMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean }>("/mail/send", { to: to.trim(), subject, message, documentType: "customer" }),
    onSuccess: () => {
      toast.success("E-Mail erfolgreich versendet");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "E-Mail konnte nicht versendet werden");
    },
  });

  if (isLoading) return null;

  if (!hasEmailAccount) {
    return (
      <Dialog open={state.open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Kein E-Mail-Konto konfiguriert
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Bitte konfigurieren Sie unter <strong>Einstellungen → E-Mail</strong> ein SMTP-Konto.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button onClick={() => { onClose(); navigate("/settings"); }}>
              <Settings className="h-4 w-4 mr-2" /> Zu Einstellungen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={state.open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> E-Mail senden
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fromEmail && (
            <div className="text-xs text-muted-foreground rounded-md bg-muted px-3 py-2">
              Von: {fromName} &lt;{fromEmail}&gt;
            </div>
          )}
          <div className="space-y-1.5">
            <Label>An</Label>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="empfaenger@example.ch" />
          </div>
          <div className="space-y-1.5">
            <Label>Betreff</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Nachricht</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending || !to.trim()}>
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Senden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [statusFilter, setStatusFilter] = useState<StatusFilter[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [emailModal, setEmailModal] = useState<EmailModalState>({ open: false, email: "", customerName: "" });

  const { data, isLoading, error } = useCustomers({ search: searchQuery, pageSize: 100 });
  const stats = useCustomerStats();
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.data || [];

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      try {
        await deleteCustomer.mutateAsync(id);
        toast.success(`${name} wurde gelöscht`);
      } catch (error) {
        toast.error("Fehler beim Löschen");
      }
    }
  };

  const openEmailModal = (email: string, customerName: string) => {
    setEmailModal({ open: true, email, customerName });
  };

  const getCustomerStatus = (customer: any): "active" | "inactive" | "prospect" => {
    if (customer.isProspect || customer.status === "prospect") return "prospect";
    if (!customer.isActive) return "inactive";
    return "active";
  };

  const toggleStatusFilter = (s: StatusFilter) => {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filteredCustomers = statusFilter.length === 0
    ? customers
    : customers.filter((c) => statusFilter.includes(getCustomerStatus(c)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Kunden
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kundenbeziehungen
          </p>
        </div>
        {canWrite('customers') && (
          <Button className="gap-2" onClick={() => navigate("/customers/new")}>
            <Plus className="h-4 w-4" />
            Neuer Kunde
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "—" : stats.total}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Building2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "—" : stats.active}</p>
              <p className="text-sm text-muted-foreground">Aktive Kunden</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <User className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.isLoading ? "—" : stats.prospects}</p>
              <p className="text-sm text-muted-foreground">Interessenten</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Building2 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.isLoading ? "—" : `CHF ${(stats.totalRevenue / 1000).toFixed(0)}k`}
              </p>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kunden suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={cn(statusFilter.length > 0 && "border-primary text-primary")}>
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Status filtern</p>
              <div className="space-y-2">
                {(["active", "inactive", "prospect"] as StatusFilter[]).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={statusFilter.includes(s)}
                      onCheckedChange={() => toggleStatusFilter(s)}
                    />
                    {statusConfig[s].label}
                  </label>
                ))}
              </div>
              {statusFilter.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs" onClick={() => setStatusFilter([])}>
                  Filter zurücksetzen
                </Button>
              )}
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Fehler beim Laden der Kunden</p>
          <p className="text-sm text-muted-foreground mt-1">
            Stellen Sie sicher, dass der Backend-Server läuft (VITE_API_URL)
          </p>
        </div>
      )}

      <CustomerEmailModal state={emailModal} onClose={() => setEmailModal({ open: false, email: "", customerName: "" })} />

      {/* Card View */}
      {!isLoading && !error && viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground rounded-xl border border-dashed">
              {searchQuery || statusFilter.length > 0 ? "Keine Kunden gefunden" : "Noch keine Kunden vorhanden"}
            </div>
          ) : (
            filteredCustomers.map((customer, index) => {
              const status = getCustomerStatus(customer);
              return (
                <div
                  key={customer.id}
                  className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  {/* Top: Avatar + Name + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                          {(customer.companyName || customer.name)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{customer.companyName || customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.number}</p>
                      </div>
                    </div>
                    <Badge className={statusConfig[status].color}>
                      {statusConfig[status].label}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                     {customer.name && customer.companyName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {customer.name}
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {(customer.phone || customer.mobile) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        {customer.phone || customer.mobile}
                      </div>
                    )}
                    {customer.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {customer.zipCode} {customer.city}
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                     <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-medium text-success">CHF {(customer.totalRevenue || 0).toLocaleString("de-CH")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FolderKanban className="h-3.5 w-3.5 text-primary" />
                      {customer.projectCount || 0} Projekte
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => navigate(`/customers/${customer.id}`)}>
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate(`/customers/${customer.id}/edit`)}>
                          Bearbeiten
                        </DropdownMenuItem>
                        {customer.email && (
                          <DropdownMenuItem onSelect={() => openEmailModal(customer.email, customer.companyName || customer.name)}>
                            E-Mail senden
                          </DropdownMenuItem>
                        )}
                        {canDelete('customers') && (
                          <DropdownMenuItem 
                            className="text-destructive"
                            onSelect={() => handleDelete(customer.id, customer.name)}
                          >
                            Löschen
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && viewMode === "table" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Kunde</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Umsatz</TableHead>
                <TableHead className="text-right">Projekte</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter.length > 0 ? "Keine Kunden gefunden" : "Noch keine Kunden vorhanden"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const status = getCustomerStatus(customer);
                  return (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer animate-fade-in hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {(customer.companyName || customer.name)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.companyName || customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.companyName ? customer.name : customer.number}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {customer.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[status].color}>
                          {statusConfig[status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        CHF {(customer.totalRevenue || 0).toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell className="text-right">{customer.projectCount || 0}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => navigate(`/customers/${customer.id}/edit`)}>
                              Bearbeiten
                            </DropdownMenuItem>
                            {customer.email && (
                              <DropdownMenuItem onSelect={() => openEmailModal(customer.email, customer.companyName || customer.name)}>
                                E-Mail senden
                              </DropdownMenuItem>
                            )}
                            {canDelete('customers') && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={() => handleDelete(customer.id, customer.name)}
                              >
                                Löschen
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}