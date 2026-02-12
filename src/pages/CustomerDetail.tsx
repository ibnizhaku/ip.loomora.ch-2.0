import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Calendar,
  Euro,
  FolderKanban,
  FileText,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomer, useDeleteCustomer } from "@/hooks/use-customers";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const projectStatusConfig = {
  PLANNING: { label: "Planung", color: "bg-info/10 text-info" },
  ACTIVE: { label: "Aktiv", color: "bg-success/10 text-success" },
  PAUSED: { label: "Pausiert", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Abgeschlossen", color: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "Abgebrochen", color: "bg-destructive/10 text-destructive" },
};

const invoiceStatusConfig = {
  DRAFT: { label: "Entwurf", color: "bg-muted text-muted-foreground" },
  SENT: { label: "Versendet", color: "bg-info/10 text-info" },
  PAID: { label: "Bezahlt", color: "bg-success/10 text-success" },
  PARTIAL: { label: "Teilbezahlt", color: "bg-warning/10 text-warning" },
  OVERDUE: { label: "Überfällig", color: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Storniert", color: "bg-muted text-muted-foreground" },
};

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id);
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customer) return;
    if (confirm(`Möchten Sie "${customer.name}" wirklich löschen?`)) {
      try {
        await deleteCustomer.mutateAsync(customer.id);
        toast.success(`${customer.name} wurde gelöscht`);
        navigate("/customers");
      } catch (error) {
        toast.error("Fehler beim Löschen. Möglicherweise gibt es verknüpfte Daten.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-bold">Kunde nicht gefunden</h1>
        </div>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Der Kunde konnte nicht geladen werden.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!customer.isActive) return { label: "Inaktiv", color: "bg-muted text-muted-foreground" };
    if (!customer.totalRevenue || customer.totalRevenue === 0) return { label: "Interessent", color: "bg-info/10 text-info" };
    return { label: "Aktiv", color: "bg-success/10 text-success" };
  };

  const status = getStatusBadge();
  const projects = (customer as any).projects || [];
  const invoices = (customer as any).invoices || [];
  const contacts = (customer as any).contacts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-medium text-lg">
                {(customer.companyName || customer.name)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {customer.companyName || customer.name}
              </h1>
              <p className="text-muted-foreground">{customer.number} • {customer.name}</p>
            </div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate(`/customers/${id}/edit`)}>
          <Edit className="h-4 w-4" />
          Bearbeiten
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/quotes/new")}>
              Angebot erstellen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/invoices/new")}>
              Rechnung erstellen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/projects/new")}>
              Projekt anlegen
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Top Row: Übersicht (left) + Kontaktdaten (right) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left - Übersicht */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Übersicht</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Kunde seit
              </div>
              <span className="font-medium">
                {format(new Date(customer.createdAt), "dd.MM.yyyy", { locale: de })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Euro className="h-4 w-4" />
                Gesamtumsatz
              </div>
              <span className="font-medium text-success">
                CHF {(customer.totalRevenue || 0).toLocaleString("de-CH")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Offene Rechnungen
              </div>
              <span className="font-medium text-warning">
                {customer.openInvoices || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderKanban className="h-4 w-4" />
                Projekte
              </div>
              <span className="font-medium">{customer.projectCount || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Zahlungsziel
              </div>
              <span className="font-medium">{customer.paymentTermDays} Tage</span>
            </div>
          </div>
        </div>

        {/* Right - Kontaktdaten */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Kontaktdaten</h3>

          <div className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-Mail</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
            )}

            {customer.website && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {customer.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {(customer.street || customer.city) && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    {customer.street && <p className="font-medium">{customer.street}</p>}
                    <p className="text-muted-foreground">
                      {customer.zipCode} {customer.city}
                    </p>
                    {customer.country && <p className="text-muted-foreground">{customer.country}</p>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full Width - Tabs */}
      <div>
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projekte</TabsTrigger>
            <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
            <TabsTrigger value="contacts">Ansprechpartner</TabsTrigger>
            <TabsTrigger value="notes">Notizen</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Projekte ({projects.length})</h3>
              <Button size="sm" className="gap-2" onClick={() => navigate("/projects/new")}>
                <Plus className="h-4 w-4" />
                Neues Projekt
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Noch keine Projekte vorhanden
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project: any) => {
                  const projectStatus = projectStatusConfig[project.status as keyof typeof projectStatusConfig] || projectStatusConfig.PLANNING;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.number}
                          </p>
                        </div>
                      </div>
                      <Badge className={projectStatus.color}>
                        {projectStatus.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Rechnungen ({invoices.length})</h3>
              <Button size="sm" className="gap-2" onClick={() => navigate("/invoices/new")}>
                <Plus className="h-4 w-4" />
                Neue Rechnung
              </Button>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Noch keine Rechnungen vorhanden
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice: any) => {
                  const invStatus = invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig] || invoiceStatusConfig.DRAFT;
                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invoice.date || invoice.createdAt), "dd.MM.yyyy", { locale: de })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">CHF {(invoice.totalAmount || 0).toLocaleString("de-CH")}</span>
                        <Badge className={invStatus.color}>
                          {invStatus.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Ansprechpartner ({contacts.length})</h3>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Kontakt hinzufügen
              </Button>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Noch keine Ansprechpartner vorhanden
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {contacts.map((contact: any) => (
                  <div
                    key={contact.id}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-sm text-muted-foreground">{contact.position}</p>
                        </div>
                      </div>
                      {contact.isPrimary && (
                        <Badge variant="outline" className="text-xs">
                          Hauptkontakt
                        </Badge>
                      )}
                    </div>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notizen</h3>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Notiz hinzufügen
              </Button>
            </div>

            {customer.notes ? (
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="whitespace-pre-wrap">{customer.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Keine Notizen vorhanden
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}