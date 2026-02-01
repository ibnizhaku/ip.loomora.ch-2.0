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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  status: "active" | "inactive" | "prospect";
  totalRevenue: number;
  projects: number;
  lastContact: string;
  avatar?: string;
}

const customers: Customer[] = [
  {
    id: "1",
    name: "Michael Weber",
    company: "Fashion Store GmbH",
    email: "m.weber@fashionstore.de",
    phone: "+49 170 1234567",
    location: "München",
    status: "active",
    totalRevenue: 125000,
    projects: 5,
    lastContact: "vor 2 Tagen",
  },
  {
    id: "2",
    name: "Sandra Klein",
    company: "FinTech Solutions",
    email: "s.klein@fintech.de",
    phone: "+49 171 2345678",
    location: "Berlin",
    status: "active",
    totalRevenue: 280000,
    projects: 3,
    lastContact: "vor 5 Tagen",
  },
  {
    id: "3",
    name: "Thomas Bauer",
    company: "Sales Pro AG",
    email: "t.bauer@salespro.de",
    phone: "+49 172 3456789",
    location: "Hamburg",
    status: "active",
    totalRevenue: 95000,
    projects: 4,
    lastContact: "vor 1 Woche",
  },
  {
    id: "4",
    name: "Julia Hoffmann",
    company: "Data Analytics Inc.",
    email: "j.hoffmann@dataanalytics.de",
    phone: "+49 173 4567890",
    location: "Frankfurt",
    status: "prospect",
    totalRevenue: 0,
    projects: 0,
    lastContact: "vor 3 Tagen",
  },
  {
    id: "5",
    name: "Christian Müller",
    company: "Tech Innovations",
    email: "c.mueller@techinnovations.de",
    phone: "+49 174 5678901",
    location: "Köln",
    status: "inactive",
    totalRevenue: 45000,
    projects: 2,
    lastContact: "vor 1 Monat",
  },
  {
    id: "6",
    name: "Anna Schmidt",
    company: "Logistics Plus",
    email: "a.schmidt@logisticsplus.de",
    phone: "+49 175 6789012",
    location: "Stuttgart",
    status: "active",
    totalRevenue: 180000,
    projects: 6,
    lastContact: "gestern",
  },
];

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  prospect: { label: "Interessent", color: "bg-info/10 text-info" },
};

export default function Customers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Button className="gap-2" onClick={() => navigate("/customers/new")}>
          <Plus className="h-4 w-4" />
          Neuer Kunde
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{customers.length}</p>
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
              <p className="text-2xl font-bold">
                {customers.filter((c) => c.status === "active").length}
              </p>
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
              <p className="text-2xl font-bold">
                {customers.filter((c) => c.status === "prospect").length}
              </p>
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
                CHF {(customers.reduce((acc, c) => acc + c.totalRevenue, 0) / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
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
            {filteredCustomers.map((customer, index) => (
              <TableRow
                key={customer.id}
                className="cursor-pointer animate-fade-in hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/customers/${customer.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={customer.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.company}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {customer.location}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[customer.status].color}>
                    {statusConfig[customer.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  CHF {customer.totalRevenue.toLocaleString("de-CH")}
                </TableCell>
                <TableCell className="text-right">{customer.projects}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>E-Mail senden</DropdownMenuItem>
                      <DropdownMenuItem>Anrufen</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
