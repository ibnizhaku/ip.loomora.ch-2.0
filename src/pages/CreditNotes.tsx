import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  Receipt,
  Building2,
  CheckCircle2,
  Clock,
  Euro,
  MoreHorizontal,
  FileText,
  ArrowDownLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dropdown-menu";

const creditNotes = [
  { id: "GS-2024-0015", invoice: "RE-2024-0145", customer: "Weber Elektronik GmbH", date: "28.01.2024", total: 1250.50, status: "Verbucht", reason: "Warenrückgabe" },
  { id: "GS-2024-0014", invoice: "RE-2024-0138", customer: "Digital Solutions AG", date: "25.01.2024", total: 890.00, status: "Verbucht", reason: "Preisanpassung" },
  { id: "GS-2024-0013", invoice: "RE-2024-0130", customer: "TechStart GmbH", date: "20.01.2024", total: 2100.00, status: "Entwurf", reason: "Kulanz" },
  { id: "GS-2024-0012", invoice: "RE-2024-0125", customer: "Müller & Partner", date: "15.01.2024", total: 450.75, status: "Verbucht", reason: "Teillieferung" },
  { id: "GS-2024-0011", invoice: "RE-2024-0118", customer: "Innovation Labs", date: "10.01.2024", total: 3200.00, status: "Verbucht", reason: "Reklamation" },
];

const statusConfig: Record<string, { color: string }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground" },
  "Verbucht": { color: "bg-success/10 text-success" },
  "Storniert": { color: "bg-destructive/10 text-destructive" },
};

const stats = [
  { title: "Gutschriften (Monat)", value: "€7.891", icon: ArrowDownLeft },
  { title: "Anzahl", value: "15", icon: FileText },
  { title: "Ø Betrag", value: "€526", icon: Euro },
  { title: "Offen", value: "2", icon: Clock },
];

const CreditNotes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = creditNotes.filter(note =>
    note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Gutschriften</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Gutschriften und Erstattungen</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neue Gutschrift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Gutschriften suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gutschrift-Nr.</TableHead>
                <TableHead>Rechnung</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Grund</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => {
                const status = statusConfig[note.status] || statusConfig["Entwurf"];
                return (
                  <TableRow key={note.id}>
                    <TableCell>
                      <Link to={`/credit-notes/${note.id}`} className="font-medium hover:text-primary">
                        {note.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/invoices/${note.invoice}`} className="text-muted-foreground hover:text-primary">
                        {note.invoice}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {note.customer}
                      </div>
                    </TableCell>
                    <TableCell>{note.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{note.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      -€{note.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{note.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                          <DropdownMenuItem>PDF herunterladen</DropdownMenuItem>
                          <DropdownMenuItem>Per E-Mail senden</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Stornieren</DropdownMenuItem>
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
    </div>
  );
};

export default CreditNotes;
