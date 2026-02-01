import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock customer data
const customer = {
  id: "1",
  name: "Michael Weber",
  company: "Fashion Store GmbH",
  email: "m.weber@fashionstore.de",
  phone: "+49 170 1234567",
  mobile: "+49 151 9876543",
  website: "www.fashionstore.de",
  address: {
    street: "Maximilianstraße 25",
    zip: "80539",
    city: "München",
    country: "Deutschland",
  },
  status: "active",
  since: "15.03.2022",
  totalRevenue: 125000,
  openInvoices: 15000,
  projects: [
    { id: "1", name: "E-Commerce Platform", status: "active", value: 45000 },
    { id: "2", name: "Mobile App", status: "completed", value: 35000 },
    { id: "3", name: "SEO Optimization", status: "completed", value: 12000 },
  ],
  invoices: [
    { id: "1", number: "INV-2024-001", amount: 15000, status: "pending", date: "15.01.2024" },
    { id: "2", number: "INV-2023-089", amount: 12500, status: "paid", date: "15.12.2023" },
    { id: "3", number: "INV-2023-078", amount: 8500, status: "paid", date: "01.11.2023" },
  ],
  contacts: [
    { id: "1", name: "Michael Weber", role: "Geschäftsführer", email: "m.weber@fashionstore.de", primary: true },
    { id: "2", name: "Sandra Klein", role: "Marketing Leiterin", email: "s.klein@fashionstore.de", primary: false },
    { id: "3", name: "Peter Hoffmann", role: "IT Leiter", email: "p.hoffmann@fashionstore.de", primary: false },
  ],
  notes: [
    { id: "1", content: "Bevorzugt Kommunikation per E-Mail", date: "01.02.2024", author: "Max Keller" },
    { id: "2", content: "Interesse an weiteren Projekten ab Q2", date: "15.01.2024", author: "Anna Schmidt" },
  ],
};

const projectStatusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  completed: { label: "Abgeschlossen", color: "bg-info/10 text-info" },
  paused: { label: "Pausiert", color: "bg-warning/10 text-warning" },
};

const invoiceStatusConfig = {
  paid: { label: "Bezahlt", color: "bg-success/10 text-success" },
  pending: { label: "Offen", color: "bg-warning/10 text-warning" },
  overdue: { label: "Überfällig", color: "bg-destructive/10 text-destructive" },
};

export default function CustomerDetail() {
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
                {customer.company
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {customer.company}
              </h1>
              <p className="text-muted-foreground">{customer.name}</p>
            </div>
            <Badge className="bg-success/10 text-success ml-2">Aktiv</Badge>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Edit className="h-4 w-4" />
          Bearbeiten
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Contact Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Kontaktdaten</h3>

            <div className="space-y-4">
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

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={`https://${customer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {customer.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{customer.address.street}</p>
                  <p className="text-muted-foreground">
                    {customer.address.zip} {customer.address.city}
                  </p>
                  <p className="text-muted-foreground">{customer.address.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Übersicht</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Kunde seit
                </div>
                <span className="font-medium">{customer.since}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  Gesamtumsatz
                </div>
                <span className="font-medium text-success">
                  CHF {customer.totalRevenue.toLocaleString("de-CH")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Offene Rechnungen
                </div>
                <span className="font-medium text-warning">
                  CHF {customer.openInvoices.toLocaleString("de-CH")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderKanban className="h-4 w-4" />
                  Projekte
                </div>
                <span className="font-medium">{customer.projects.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="projects">Projekte</TabsTrigger>
              <TabsTrigger value="invoices">Rechnungen</TabsTrigger>
              <TabsTrigger value="contacts">Ansprechpartner</TabsTrigger>
              <TabsTrigger value="notes">Notizen</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Projekte ({customer.projects.length})</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Neues Projekt
                </Button>
              </div>

              <div className="space-y-3">
                {customer.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          CHF {project.value.toLocaleString("de-CH")}
                        </p>
                      </div>
                    </div>
                    <Badge className={projectStatusConfig[project.status as keyof typeof projectStatusConfig].color}>
                      {projectStatusConfig[project.status as keyof typeof projectStatusConfig].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Rechnungen ({customer.invoices.length})</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Neue Rechnung
                </Button>
              </div>

              <div className="space-y-3">
                {customer.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">CHF {invoice.amount.toLocaleString("de-CH")}</span>
                      <Badge className={invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig].color}>
                        {invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ansprechpartner ({customer.contacts.length})</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Kontakt hinzufügen
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {customer.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {contact.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        </div>
                      </div>
                      {contact.primary && (
                        <Badge variant="outline" className="text-xs">
                          Hauptkontakt
                        </Badge>
                      )}
                    </div>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {contact.email}
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notizen ({customer.notes.length})</h3>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Notiz hinzufügen
                </Button>
              </div>

              <div className="space-y-3">
                {customer.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border border-border bg-card"
                  >
                    <p className="mb-2">{note.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {note.author} • {note.date}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
