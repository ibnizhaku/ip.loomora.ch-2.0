import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJournalEntries, useDeleteJournalEntry } from "@/hooks/use-journal-entries";
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
  X,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  POSTED: "bg-success/10 text-success",
  REVERSED: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  POSTED: "Gebucht",
  REVERSED: "Storniert",
};

const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

export default function JournalEntries() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: apiData, isLoading } = useJournalEntries({
    page,
    pageSize: 50,
    status: statusFilter.length === 1 ? statusFilter[0] : undefined,
    search: searchQuery || undefined,
  });

  const entries = apiData?.data || [];
  const total = apiData?.total || 0;
  const deleteEntry = useDeleteJournalEntry();

  const totalDebit = entries.filter((e: any) => e.status === "POSTED").reduce((acc: number, e: any) => acc + (e.totalDebit || 0), 0);
  const totalCredit = entries.filter((e: any) => e.status === "POSTED").reduce((acc: number, e: any) => acc + (e.totalCredit || 0), 0);
  const draftCount = entries.filter((e: any) => e.status === "DRAFT").length;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteEntry.mutate(id, {
      onSuccess: () => toast.success("Buchung gelöscht"),
      onError: (err: any) => toast.error(err.message || "Fehler beim Löschen"),
    });
  };

  const handleDatevExport = () => {
    const header = "Umsatz;Soll/Haben-Kennzeichen;WKZ Umsatz;Kurs;Basisumsatz;WKZ Basisumsatz;Konto;Gegenkonto;BU-Schlüssel;Belegdatum;Belegfeld 1;Buchungstext";
    const rows = entries.filter((e: any) => e.status === "POSTED").map((entry: any) => {
      const line = entry.lines?.[0];
      return `${(entry.totalDebit || 0).toFixed(2).replace(".", ",")};S;CHF;;;;;;${line?.accountCode || ""};${entry.lines?.[1]?.accountCode || ""};;${entry.entryDate?.split("T")[0] || ""};${entry.number};${entry.description}`;
    });
    
    const csvContent = header + "\n" + rows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DATEV-Export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("DATEV Export erstellt");
  };

  const resetFilters = () => {
    setStatusFilter([]);
  };

  const activeFilters = statusFilter.length;

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
          <Button variant="outline" className="gap-2" onClick={handleDatevExport}>
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
              <p className="text-2xl font-bold">{total}</p>
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
              <p className="text-2xl font-bold text-success">{formatCHF(totalDebit)}</p>
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
              <p className="text-2xl font-bold text-info">{formatCHF(totalCredit)}</p>
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
              <p className="text-2xl font-bold">{draftCount}</p>
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
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilters > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{activeFilters}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter</h4>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="space-y-2">
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${key}`}
                        checked={statusFilter.includes(key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusFilter([...statusFilter, key]);
                          } else {
                            setStatusFilter(statusFilter.filter(s => s !== key));
                          }
                        }}
                      />
                      <label htmlFor={`status-${key}`} className="text-sm">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buchungsnr.</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead className="text-right">Soll</TableHead>
              <TableHead className="text-right">Haben</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Laden...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Keine Buchungen vorhanden
                </TableCell>
              </TableRow>
            ) : entries.map((entry: any, index: number) => (
              <TableRow
                key={entry.id}
                className="animate-fade-in cursor-pointer hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/journal-entries/${entry.id}`)}
              >
                <TableCell>
                  <span className="font-mono font-medium">{entry.number}</span>
                </TableCell>
                <TableCell>{entry.entryDate ? new Date(entry.entryDate).toLocaleDateString("de-CH") : "-"}</TableCell>
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
                <TableCell className="text-right font-mono font-medium">
                  {formatCHF(entry.totalDebit || 0)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {formatCHF(entry.totalCredit || 0)}
                </TableCell>
                <TableCell>
                  <Badge className={statusStyles[entry.status] || "bg-muted text-muted-foreground"}>
                    {statusLabels[entry.status] || entry.status}
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
                      {entry.status === "DRAFT" && (
                        <DropdownMenuItem onClick={() => navigate(`/journal-entries/${entry.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                      )}
                      {entry.status === "DRAFT" && (
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, entry.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      )}
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
