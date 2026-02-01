import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  FileText,
  ArrowRightLeft,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
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
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  debitAccount: string;
  debitAccountName: string;
  creditAccount: string;
  creditAccountName: string;
  amount: number;
  type: "standard" | "opening" | "closing" | "adjustment";
  reference?: string;
  status: "draft" | "posted" | "reversed";
}

const entries: JournalEntry[] = [
  {
    id: "1",
    number: "BU-2024-0156",
    date: "31.01.2024",
    description: "Ausgangsrechnung RE-2024-089",
    debitAccount: "1400",
    debitAccountName: "Forderungen aus L+L",
    creditAccount: "4000",
    creditAccountName: "Umsatzerlöse 19%",
    amount: 15000,
    type: "standard",
    reference: "RE-2024-089",
    status: "posted",
  },
  {
    id: "2",
    number: "BU-2024-0155",
    date: "30.01.2024",
    description: "Bankzahlung Lieferant",
    debitAccount: "3300",
    debitAccountName: "Verbindlichkeiten aus L+L",
    creditAccount: "1200",
    creditAccountName: "Bank",
    amount: 5600,
    type: "standard",
    reference: "ER-2024-045",
    status: "posted",
  },
  {
    id: "3",
    number: "BU-2024-0154",
    date: "29.01.2024",
    description: "Gehaltszahlung Januar",
    debitAccount: "6000",
    debitAccountName: "Personalaufwand",
    creditAccount: "1200",
    creditAccountName: "Bank",
    amount: 45000,
    type: "standard",
    status: "posted",
  },
  {
    id: "4",
    number: "BU-2024-0153",
    date: "28.01.2024",
    description: "Abschreibung Maschinen",
    debitAccount: "6300",
    debitAccountName: "Abschreibungen",
    creditAccount: "0400",
    creditAccountName: "Maschinen",
    amount: 1250,
    type: "adjustment",
    status: "posted",
  },
  {
    id: "5",
    number: "BU-2024-0152",
    date: "27.01.2024",
    description: "Eingangsrechnung Software",
    debitAccount: "6800",
    debitAccountName: "Betriebskosten",
    creditAccount: "3300",
    creditAccountName: "Verbindlichkeiten aus L+L",
    amount: 2500,
    type: "standard",
    reference: "ER-2024-044",
    status: "posted",
  },
  {
    id: "6",
    number: "BU-2024-0151",
    date: "26.01.2024",
    description: "Bareinzahlung Kasse",
    debitAccount: "1200",
    debitAccountName: "Bank",
    creditAccount: "1600",
    creditAccountName: "Kasse",
    amount: 500,
    type: "standard",
    status: "draft",
  },
];

const typeStyles = {
  standard: "bg-primary/10 text-primary",
  opening: "bg-blue-500/10 text-blue-600",
  closing: "bg-purple-500/10 text-purple-600",
  adjustment: "bg-warning/10 text-warning",
};

const typeLabels = {
  standard: "Standard",
  opening: "Eröffnung",
  closing: "Abschluss",
  adjustment: "Korrektur",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  posted: "bg-success/10 text-success",
  reversed: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  draft: "Entwurf",
  posted: "Gebucht",
  reversed: "Storniert",
};

export default function JournalEntries() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [entryList, setEntryList] = useState(entries);

  const totalDebit = entryList.filter(e => e.status === "posted").reduce((acc, e) => acc + e.amount, 0);
  const totalCredit = totalDebit;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEntryList(entryList.map(entry => 
      entry.id === id ? { ...entry, status: "reversed" as const } : entry
    ));
    toast.success("Buchung storniert");
  };

  const handleDuplicate = (e: React.MouseEvent, entry: typeof entries[0]) => {
    e.stopPropagation();
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      number: `BU-2024-${String(entryList.length + 157).padStart(4, '0')}`,
      status: "draft" as const,
    };
    setEntryList([newEntry, ...entryList]);
    toast.success("Buchung dupliziert");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Buchungsjournal
          </h1>
          <p className="text-muted-foreground">
            Alle Buchungssätze chronologisch erfasst
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("DATEV Export wird erstellt...")}>
            <Download className="h-4 w-4" />
            DATEV Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/journal-entries/new")}>
            <Plus className="h-4 w-4" />
            Neue Buchung
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Buchungen gesamt</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <ArrowRightLeft className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Soll-Summe</p>
              <p className="text-2xl font-bold text-success">€{totalDebit.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <ArrowRightLeft className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Haben-Summe</p>
              <p className="text-2xl font-bold text-info">€{totalCredit.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offene Entwürfe</p>
              <p className="text-2xl font-bold">{entryList.filter(e => e.status === "draft").length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buchungen suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buchungsnr.</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Soll</TableHead>
              <TableHead>Haben</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entryList.map((entry, index) => (
              <TableRow
                key={entry.id}
                className="animate-fade-in cursor-pointer hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/journal-entries/${entry.id}`)}
              >
                <TableCell>
                  <span className="font-mono font-medium">{entry.number}</span>
                </TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    {entry.reference && (
                      <p className="text-sm text-muted-foreground">
                        Ref: {entry.reference}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-mono">{entry.debitAccount}</span>
                    <p className="text-muted-foreground text-xs">{entry.debitAccountName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-mono">{entry.creditAccount}</span>
                    <p className="text-muted-foreground text-xs">{entry.creditAccountName}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  €{entry.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={typeStyles[entry.type]}>
                    {typeLabels[entry.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusStyles[entry.status]}>
                    {statusLabels[entry.status]}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/journal-entries/${entry.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/journal-entries/${entry.id}`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDuplicate(e, entry)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplizieren
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, entry.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Stornieren
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
