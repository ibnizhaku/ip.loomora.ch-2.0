import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Send,
  Eye,
  FileText,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
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

interface Invoice {
  id: string;
  number: string;
  client: string;
  project: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  issueDate: string;
  dueDate: string;
}

const invoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-001",
    client: "Fashion Store GmbH",
    project: "E-Commerce Platform",
    amount: 15000,
    status: "paid",
    issueDate: "15.01.2024",
    dueDate: "15.02.2024",
  },
  {
    id: "2",
    number: "INV-2024-002",
    client: "FinTech Solutions",
    project: "Mobile Banking App",
    amount: 25000,
    status: "pending",
    issueDate: "20.01.2024",
    dueDate: "20.02.2024",
  },
  {
    id: "3",
    number: "INV-2024-003",
    client: "Sales Pro AG",
    project: "CRM Integration",
    amount: 8500,
    status: "overdue",
    issueDate: "01.01.2024",
    dueDate: "31.01.2024",
  },
  {
    id: "4",
    number: "INV-2024-004",
    client: "Data Analytics Inc.",
    project: "Dashboard Redesign",
    amount: 5000,
    status: "draft",
    issueDate: "01.02.2024",
    dueDate: "01.03.2024",
  },
  {
    id: "5",
    number: "INV-2024-005",
    client: "Tech Innovations",
    project: "API Development",
    amount: 12000,
    status: "pending",
    issueDate: "25.01.2024",
    dueDate: "25.02.2024",
  },
  {
    id: "6",
    number: "INV-2024-006",
    client: "Logistics Plus",
    project: "Inventory System",
    amount: 18000,
    status: "paid",
    issueDate: "10.01.2024",
    dueDate: "10.02.2024",
  },
];

const statusConfig = {
  paid: {
    label: "Bezahlt",
    color: "bg-success/10 text-success",
    icon: CheckCircle,
  },
  pending: {
    label: "Ausstehend",
    color: "bg-warning/10 text-warning",
    icon: Clock,
  },
  overdue: {
    label: "Überfällig",
    color: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
  draft: {
    label: "Entwurf",
    color: "bg-muted text-muted-foreground",
    icon: FileText,
  },
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter(
    (i) =>
      i.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((acc, i) => acc + i.amount, 0);
  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Rechnungen
          </h1>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Ihre Rechnungen
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Rechnung
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
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">
                €{invoices.reduce((acc, i) => acc + i.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bezahlt</p>
              <p className="text-2xl font-bold">€{totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold">€{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
              <p className="text-2xl font-bold">€{totalOverdue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechnungen suchen..."
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
              <TableHead>Rechnung</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Fällig am</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice, index) => {
              const StatusIcon = statusConfig[invoice.status].icon;
              return (
                <TableRow
                  key={invoice.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{invoice.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.project}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusConfig[invoice.status].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[invoice.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    €{invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.dueDate}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Send className="h-4 w-4" />
                          Per E-Mail senden
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
