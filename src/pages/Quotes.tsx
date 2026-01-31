import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Send,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface Quote {
  id: string;
  number: string;
  client: string;
  project: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  createdDate: string;
  validUntil: string;
  items: number;
}

const quotes: Quote[] = [
  {
    id: "1",
    number: "ANG-2024-001",
    client: "Fashion Store GmbH",
    project: "E-Commerce Erweiterung",
    amount: 28500,
    status: "accepted",
    createdDate: "15.01.2024",
    validUntil: "15.02.2024",
    items: 5,
  },
  {
    id: "2",
    number: "ANG-2024-002",
    client: "FinTech Solutions",
    project: "Mobile App Phase 2",
    amount: 45000,
    status: "sent",
    createdDate: "20.01.2024",
    validUntil: "20.02.2024",
    items: 8,
  },
  {
    id: "3",
    number: "ANG-2024-003",
    client: "Sales Pro AG",
    project: "CRM Customization",
    amount: 12000,
    status: "draft",
    createdDate: "25.01.2024",
    validUntil: "25.02.2024",
    items: 3,
  },
  {
    id: "4",
    number: "ANG-2024-004",
    client: "Tech Innovations",
    project: "API Gateway",
    amount: 35000,
    status: "declined",
    createdDate: "10.01.2024",
    validUntil: "10.02.2024",
    items: 6,
  },
  {
    id: "5",
    number: "ANG-2024-005",
    client: "Logistics Plus",
    project: "Tracking System",
    amount: 22000,
    status: "expired",
    createdDate: "01.01.2024",
    validUntil: "31.01.2024",
    items: 4,
  },
  {
    id: "6",
    number: "ANG-2024-006",
    client: "Data Analytics Inc.",
    project: "Dashboard Premium",
    amount: 18500,
    status: "sent",
    createdDate: "28.01.2024",
    validUntil: "28.02.2024",
    items: 5,
  },
];

const statusConfig = {
  draft: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Versendet", color: "bg-info/10 text-info", icon: Send },
  accepted: { label: "Angenommen", color: "bg-success/10 text-success", icon: CheckCircle },
  declined: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Abgelaufen", color: "bg-warning/10 text-warning", icon: Clock },
};

export default function Quotes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuotes = quotes.filter(
    (q) =>
      q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: quotes.reduce((acc, q) => acc + q.amount, 0),
    accepted: quotes.filter((q) => q.status === "accepted").reduce((acc, q) => acc + q.amount, 0),
    pending: quotes.filter((q) => q.status === "sent").reduce((acc, q) => acc + q.amount, 0),
    conversionRate: Math.round(
      (quotes.filter((q) => q.status === "accepted").length /
        quotes.filter((q) => q.status !== "draft").length) *
        100
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Angebote
          </h1>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Ihre Angebote
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/quotes/new")}>
          <Plus className="h-4 w-4" />
          Neues Angebot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Euro className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtwert</p>
              <p className="text-2xl font-bold">€{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Angenommen</p>
              <p className="text-2xl font-bold">€{stats.accepted.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Send className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">€{stats.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <ArrowRight className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion</p>
              <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Angebote suchen..."
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
              <TableHead>Angebot</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Gültig bis</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote, index) => {
              const StatusIcon = statusConfig[quote.status].icon;
              return (
                <TableRow
                  key={quote.id}
                  className="cursor-pointer animate-fade-in hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/quotes/${quote.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">{quote.number}</span>
                        <p className="text-xs text-muted-foreground">
                          {quote.items} Positionen
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{quote.client}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.project}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusConfig[quote.status].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[quote.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    €{quote.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {quote.validUntil}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>Anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="h-4 w-4" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Send className="h-4 w-4" />
                          Versenden
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ArrowRight className="h-4 w-4" />
                          In Rechnung umwandeln
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
