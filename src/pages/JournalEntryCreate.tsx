import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useCreateJournalEntry } from "@/hooks/use-journal-entries";

interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export default function JournalEntryCreate() {
  const navigate = useNavigate();
  const createEntry = useCreateJournalEntry();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
  });
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", debit: 0, credit: 0 },
    { accountId: "", debit: 0, credit: 0 },
  ]);

  const { data: accountsData } = useQuery({
    queryKey: ["/finance/accounts"],
    queryFn: () => api.get<any>("/finance/accounts?pageSize=500"),
  });
  const accounts: { id: string; number: string; name: string }[] = accountsData?.data || [];

  const addLine = () => setLines([...lines, { accountId: "", debit: 0, credit: 0 }]);
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));
  const updateLine = (idx: number, field: keyof JournalLine, value: string | number) => {
    const next = [...lines];
    (next[idx] as any)[field] = field === "debit" || field === "credit" ? Number(value) || 0 : value;
    setLines(next);
  };

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error("Beschreibung ist erforderlich");
      return;
    }
    const validLines = lines.filter((l) => l.accountId && (l.debit > 0 || l.credit > 0));
    if (validLines.length < 2) {
      toast.error("Mindestens zwei Buchungszeilen mit Konto und Betrag erforderlich");
      return;
    }
    if (!isBalanced) {
      toast.error(`Buchung nicht ausgeglichen: Soll ${totalDebit.toFixed(2)} ≠ Haben ${totalCredit.toFixed(2)}`);
      return;
    }

    try {
      await createEntry.mutateAsync({
        date: formData.date,
        description: formData.description.trim(),
        reference: formData.reference.trim() || undefined,
        lines: validLines.map((l) => ({
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
          description: l.description || undefined,
        })),
      });
      toast.success("Buchung erstellt");
      navigate("/journal-entries");
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Erstellen");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/journal-entries")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neue Buchung</h1>
          <p className="text-muted-foreground">Manuellen Buchungssatz erfassen</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stammdaten</CardTitle>
                <CardDescription>Datum und Beschreibung der Buchung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Buchungsdatum *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference">Beleg / Referenz</Label>
                    <Input
                      id="reference"
                      placeholder="z.B. RE-2024-001"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung *</Label>
                  <Input
                    id="description"
                    placeholder="Buchungstext"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Buchungszeilen</CardTitle>
                    <CardDescription>Soll und Haben müssen ausgeglichen sein</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="h-4 w-4 mr-1" />
                    Zeile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Konto</TableHead>
                      <TableHead className="text-right">Soll</TableHead>
                      <TableHead className="text-right">Haben</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Select
                            value={line.accountId}
                            onValueChange={(v) => updateLine(idx, "accountId", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Konto wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.number} – {a.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="text-right"
                            value={line.debit || ""}
                            onChange={(e) => updateLine(idx, "debit", e.target.value)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="text-right"
                            value={line.credit || ""}
                            onChange={(e) => updateLine(idx, "credit", e.target.value)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          {lines.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLine(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end gap-4 text-sm font-medium">
                  <span>Soll gesamt: CHF {totalDebit.toFixed(2)}</span>
                  <span>Haben gesamt: CHF {totalCredit.toFixed(2)}</span>
                  <span className={isBalanced ? "text-success" : "text-destructive"}>
                    {isBalanced ? "Ausgeglichen ✓" : "Nicht ausgeglichen"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Speichern</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={createEntry.isPending || !isBalanced}>
                  <Save className="h-4 w-4 mr-2" />
                  Buchung speichern (Entwurf)
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/journal-entries")}>
                  Abbrechen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
