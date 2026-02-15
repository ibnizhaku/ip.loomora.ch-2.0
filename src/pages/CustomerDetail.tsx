import { useState } from "react";
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
  Users,
  Truck,
  ShoppingCart,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomer, useDeleteCustomer, useCreateCustomerContact } from "@/hooks/use-customers";
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

const orderStatusConfig = {
  DRAFT: { label: "Entwurf", color: "bg-muted text-muted-foreground" },
  CONFIRMED: { label: "Bestätigt", color: "bg-info/10 text-info" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  COMPLETED: { label: "Abgeschlossen", color: "bg-success/10 text-success" },
  CANCELLED: { label: "Storniert", color: "bg-destructive/10 text-destructive" },
};

const taskStatusConfig = {
  TODO: { label: "Offen", color: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "bg-warning/10 text-warning" },
  DONE: { label: "Erledigt", color: "bg-success/10 text-success" },
};

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id);
  const deleteCustomer = useDeleteCustomer();
  const createContact = useCreateCustomerContact();

  // Contact dialog state
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    isPrimary: false,
  });

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

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createContact.mutateAsync({
        customerId: id,
        data: {
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          email: contactForm.email || undefined,
          phone: contactForm.phone || undefined,
          position: contactForm.position || undefined,
          isPrimary: contactForm.isPrimary,
        },
      });
      toast.success("Kontakt hinzugefügt");
      setContactDialogOpen(false);
      setContactForm({ firstName: "", lastName: "", email: "", phone: "", position: "", isPrimary: false });
    } catch (error) {
      toast.error("Fehler beim Hinzufügen des Kontakts");
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
    return { label: "Aktiv", color: "bg-success/10 text-success" };
  };

  const status = getStatusBadge();
  const projects = (customer as any).projects || [];
  const invoices = (customer as any).invoices || [];
  const contacts = (customer as any).contacts || [];
  const deliveryNotes = (customer as any).deliveryNotes || [];
  const orders = (customer as any).orders || [];
  const tasks = (customer as any).tasks || [];

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
            <Badge className={`${status.color} h-6 leading-none`}>{status.label}</Badge>
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
            <DropdownMenuItem onClick={() => navigate(`/quotes/new?customerId=${id}`)}>
              Angebot erstellen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/invoices/new?customerId=${id}`)}>
              Rechnung erstellen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/projects/new?customerId=${id}`)}>
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

      {/* Ansprechpartner Section */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Ansprechpartner ({contacts.length})</h3>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setContactDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Kontakt hinzufügen
          </Button>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground rounded-xl border border-dashed">
            Noch keine Ansprechpartner vorhanden
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/20 transition-all"
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
                {contact.phone && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kontakt hinzufügen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-firstName">Vorname *</Label>
                <Input
                  id="contact-firstName"
                  value={contactForm.firstName}
                  onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-lastName">Nachname *</Label>
                <Input
                  id="contact-lastName"
                  value={contactForm.lastName}
                  onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">E-Mail</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Telefon</Label>
              <Input
                id="contact-phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-position">Position</Label>
              <Input
                id="contact-position"
                value={contactForm.position}
                onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={contactForm.isPrimary}
                onCheckedChange={(checked) => setContactForm(prev => ({ ...prev, isPrimary: checked }))}
              />
              <Label>Hauptkontakt</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createContact.isPending} className="gap-2">
                {createContact.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Hinzufügen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full Width - Tabs */}
      <div>
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects">Projekte</TabsTrigger>
            <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
            <TabsTrigger value="delivery-notes">Lieferscheine</TabsTrigger>
            <TabsTrigger value="orders">Aufträge</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
            <TabsTrigger value="notes">Notizen</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Projekte ({projects.length})</h3>
              <Button size="sm" className="gap-2" onClick={() => navigate(`/projects/new?customerId=${id}`)}>
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
              <Button size="sm" className="gap-2" onClick={() => navigate(`/invoices/new?customerId=${id}`)}>
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

          <TabsContent value="delivery-notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Lieferscheine ({deliveryNotes.length})</h3>
              <Button size="sm" className="gap-2" onClick={() => navigate(`/delivery-notes/new?customerId=${id}`)}>
                <Plus className="h-4 w-4" />
                Neuer Lieferschein
              </Button>
            </div>

            {deliveryNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Noch keine Lieferscheine vorhanden
              </div>
            ) : (
              <div className="space-y-3">
                {deliveryNotes.map((note: any) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => navigate(`/delivery-notes/${note.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{note.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {note.date ? format(new Date(note.date), "dd.MM.yyyy", { locale: de }) : "—"}
                        </p>
                      </div>
                    </div>
                    <Badge className={note.status === 'DELIVERED' ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                      {note.status === 'DELIVERED' ? 'Geliefert' : note.status || 'Entwurf'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Aufträge ({orders.length})</h3>
              <Button size="sm" className="gap-2" onClick={() => navigate(`/orders/new?customerId=${id}`)}>
                <Plus className="h-4 w-4" />
                Neuer Auftrag
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Noch keine Aufträge vorhanden
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => {
                  const ordStatus = orderStatusConfig[order.status as keyof typeof orderStatusConfig] || orderStatusConfig.DRAFT;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{order.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.date ? format(new Date(order.date), "dd.MM.yyyy", { locale: de }) : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {order.total && (
                          <span className="font-medium">CHF {(order.total || 0).toLocaleString("de-CH")}</span>
                        )}
                        <Badge className={ordStatus.color}>
                          {ordStatus.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Aufgaben ({tasks.length})</h3>
              <Button size="sm" className="gap-2" onClick={() => navigate(`/tasks/new?customerId=${id}`)}>
                <Plus className="h-4 w-4" />
                Neue Aufgabe
              </Button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground rounded-xl border border-dashed">
                Noch keine Aufgaben vorhanden
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: any) => {
                  const tStatus = taskStatusConfig[task.status as keyof typeof taskStatusConfig] || taskStatusConfig.TODO;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <CheckSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.dueDate || "Kein Fälligkeitsdatum"}
                          </p>
                        </div>
                      </div>
                      <Badge className={tStatus.color}>
                        {tStatus.label}
                      </Badge>
                    </div>
                  );
                })}
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
