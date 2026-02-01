import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Banknote,
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
import { cn } from "@/lib/utils";

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  rating: number;
  status: "active" | "inactive" | "new";
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
}

const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Klaus Meier",
    company: "TechParts GmbH",
    email: "k.meier@techparts.de",
    phone: "+49 170 1234567",
    location: "München",
    category: "Elektronik",
    rating: 5,
    status: "active",
    totalOrders: 45,
    totalValue: 125000,
    lastOrder: "vor 3 Tagen",
  },
  {
    id: "2",
    name: "Sandra Fischer",
    company: "Office Supplies AG",
    email: "s.fischer@officesupplies.de",
    phone: "+49 171 2345678",
    location: "Hamburg",
    category: "Bürobedarf",
    rating: 4,
    status: "active",
    totalOrders: 28,
    totalValue: 45000,
    lastOrder: "vor 1 Woche",
  },
  {
    id: "3",
    name: "Peter Wagner",
    company: "Software Solutions",
    email: "p.wagner@softsol.de",
    phone: "+49 172 3456789",
    location: "Berlin",
    category: "Software",
    rating: 5,
    status: "active",
    totalOrders: 12,
    totalValue: 89000,
    lastOrder: "vor 2 Wochen",
  },
  {
    id: "4",
    name: "Maria Hoffmann",
    company: "Packaging Pro",
    email: "m.hoffmann@packagingpro.de",
    phone: "+49 173 4567890",
    location: "Köln",
    category: "Verpackung",
    rating: 3,
    status: "inactive",
    totalOrders: 8,
    totalValue: 12000,
    lastOrder: "vor 2 Monaten",
  },
  {
    id: "5",
    name: "Thomas Schulz",
    company: "Hardware Depot",
    email: "t.schulz@hwdepot.de",
    phone: "+49 174 5678901",
    location: "Frankfurt",
    category: "Hardware",
    rating: 4,
    status: "new",
    totalOrders: 2,
    totalValue: 8500,
    lastOrder: "vor 1 Tag",
  },
];

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  new: { label: "Neu", color: "bg-info/10 text-info" },
};

export default function Suppliers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Lieferanten
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lieferantenbeziehungen
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/suppliers/new")}>
          <Plus className="h-4 w-4" />
          Neuer Lieferant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{suppliers.length}</p>
              <p className="text-sm text-muted-foreground">Lieferanten</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Building2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {suppliers.filter((s) => s.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Aktiv</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Banknote className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                CHF {(suppliers.reduce((acc, s) => acc + s.totalValue, 0) / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-muted-foreground">Bestellwert</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Star className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(suppliers.reduce((acc, s) => acc + s.rating, 0) / suppliers.length).toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Ø Bewertung</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Lieferanten suchen..."
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
              <TableHead>Lieferant</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Bewertung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Bestellwert</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier, index) => (
              <TableRow
                key={supplier.id}
                className="cursor-pointer animate-fade-in hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {supplier.company
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{supplier.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{supplier.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      {supplier.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {supplier.location}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < supplier.rating
                            ? "text-warning fill-warning"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig[supplier.status].color}>
                    {statusConfig[supplier.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <p className="font-medium">
                      CHF {supplier.totalValue.toLocaleString("de-CH")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {supplier.totalOrders} Bestellungen
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>Bestellung aufgeben</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Deaktivieren
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
