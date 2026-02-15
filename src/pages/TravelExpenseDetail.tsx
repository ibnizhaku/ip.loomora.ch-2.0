import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, Car, Train, Hotel, Utensils, FileText, CheckCircle2, Clock, AlertCircle, Upload, X, File, Image, Download, XCircle, Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, downloadPdf } from "@/lib/api";

const kategorieIcons: Record<string, any> = {
  Fahrt: Car,
  transport: Car,
  Verpflegung: Utensils,
  meals: Utensils,
  Übernachtung: Hotel,
  accommodation: Hotel,
  Zug: Train,
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  entwurf: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  submitted: { label: "Eingereicht", color: "bg-info/10 text-info", icon: Clock },
  eingereicht: { label: "Eingereicht", color: "bg-info/10 text-info", icon: Clock },
  approved: { label: "Genehmigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  genehmigt: { label: "Genehmigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  paid: { label: "Ausbezahlt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  ausbezahlt: { label: "Ausbezahlt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  abgelehnt: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const gavSätze = {
  kmPauschale: 0.70,
  mittagessen: 32.00,
  übernachtungMax: 150.00,
};

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export default function TravelExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["/travel-expenses", id],
    queryFn: () => api.get<any>(`/travel-expenses/${id}`),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: (note?: string) => api.post(`/travel-expenses/${id}/approve`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/travel-expenses", id] });
      toast.success("Spesenabrechnung genehmigt");
    },
    onError: () => toast.error("Fehler beim Genehmigen"),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => api.post(`/travel-expenses/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/travel-expenses", id] });
      toast.error("Spesenabrechnung abgelehnt");
    },
    onError: () => toast.error("Fehler beim Ablehnen"),
  });

  const payMutation = useMutation({
    mutationFn: () => api.post(`/travel-expenses/${id}/pay`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/travel-expenses", id] });
      toast.success("Als ausbezahlt markiert");
    },
    onError: () => toast.error("Fehler"),
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalNote, setApprovalNote] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Spesenabrechnung nicht gefunden</p>
        <Link to="/travel-expenses" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  // Map API data
  const spesenData = {
    id: apiData.number || apiData.id || id,
    mitarbeiter: apiData.employee?.name || `${apiData.employee?.firstName || ""} ${apiData.employee?.lastName || ""}`.trim() || "–",
    personalNr: apiData.employee?.id || apiData.employeeId || "",
    abteilung: apiData.employee?.department || "",
    projekt: apiData.purpose || apiData.project || "",
    projektNr: apiData.projectId || "",
    status: apiData.status || "draft",
    zeitraum: apiData.startDate && apiData.endDate
      ? `${new Date(apiData.startDate).toLocaleDateString("de-CH")} - ${new Date(apiData.endDate).toLocaleDateString("de-CH")}`
      : "–",
    eingereichtAm: apiData.submittedAt ? new Date(apiData.submittedAt).toLocaleDateString("de-CH") : apiData.createdAt ? new Date(apiData.createdAt).toLocaleDateString("de-CH") : "–",
    gesamtbetrag: Number(apiData.totalAmount || 0),
  };

  const positionen = (apiData.items || []).map((item: any, idx: number) => ({
    id: idx + 1,
    datum: item.date ? new Date(item.date).toLocaleDateString("de-CH") : "–",
    kategorie: item.category || item.type || "Sonstiges",
    beschreibung: item.description || "",
    einheit: item.unit || "Stk",
    menge: Number(item.quantity || 1),
    satz: Number(item.unitPrice || item.rate || 0),
    betrag: Number(item.amount || item.total || 0),
    beleg: item.hasReceipt ?? true,
  }));

  const approvalHistory = (apiData.approvalHistory || []).map((entry: any) => ({
    action: entry.action || entry.status || "",
    date: entry.date || (entry.createdAt ? new Date(entry.createdAt).toLocaleDateString("de-CH") : ""),
    user: entry.user || entry.approvedBy || "",
    note: entry.note || entry.reason || undefined,
  }));

  const currentStatus = statusConfig[spesenData.status] || statusConfig.draft;
  const StatusIcon = currentStatus.icon;
  const totalBetrag = positionen.reduce((sum: number, p: any) => sum + p.betrag, 0) || spesenData.gesamtbetrag;

  const kategorienSummen = positionen.reduce((acc: Record<string, number>, p: any) => {
    acc[p.kategorie] = (acc[p.kategorie] || 0) + p.betrag;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} Datei(en) hochgeladen`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info("Datei entfernt");
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    return File;
  };

  const handleExportPDF = () => {
    downloadPdf('invoices' as any, id!, `${spesenData.id}_Spesenabrechnung.pdf`);
  };

  const handleApprove = () => {
    approveMutation.mutate(approvalNote || undefined);
    setShowApproveDialog(false);
    setApprovalNote("");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Bitte geben Sie einen Ablehnungsgrund an");
      return;
    }
    rejectMutation.mutate(rejectReason);
    setShowRejectDialog(false);
    setRejectReason("");
  };

  const handleMarkAsPaid = () => {
    payMutation.mutate();
  };

  const isSubmitted = spesenData.status === "submitted" || spesenData.status === "eingereicht";
  const isApproved = spesenData.status === "approved" || spesenData.status === "genehmigt";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/travel-expenses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{spesenData.id}</h1>
            <Badge className={currentStatus.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {currentStatus.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{spesenData.projekt}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF Export
          </Button>
          {isSubmitted && (
            <>
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowRejectDialog(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Ablehnen
              </Button>
              <Button onClick={() => setShowApproveDialog(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Genehmigen
              </Button>
            </>
          )}
          {isApproved && (
            <Button onClick={handleMarkAsPaid} disabled={payMutation.isPending}>
              <Banknote className="mr-2 h-4 w-4" />
              Als ausbezahlt markieren
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbetrag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalBetrag)}</p>
          </CardContent>
        </Card>
        {Object.entries(kategorienSummen).map(([kat, sum]) => {
          const Icon = kategorieIcons[kat] || Receipt;
          return (
            <Card key={kat}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {kat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{formatCurrency(sum as number)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mitarbeiter & Projekt */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mitarbeiter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{spesenData.mitarbeiter.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/hr/${spesenData.personalNr}`} className="font-medium text-primary hover:underline">
                  {spesenData.mitarbeiter}
                </Link>
                <p className="text-sm text-muted-foreground">{spesenData.personalNr} • {spesenData.abteilung}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reisedaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Zeitraum</p>
                <p className="font-medium">{spesenData.zeitraum}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Projekt</p>
                {spesenData.projektNr ? (
                  <Link to={`/projects/${spesenData.projektNr}`} className="text-primary hover:underline">{spesenData.projektNr}</Link>
                ) : <p className="font-medium">–</p>}
              </div>
              <div>
                <p className="text-muted-foreground">Eingereicht am</p>
                <p className="font-medium">{spesenData.eingereichtAm}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positionen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Spesenpositionen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {positionen.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Keine Positionen vorhanden</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="text-center">Menge</TableHead>
                  <TableHead className="text-right">Satz CHF</TableHead>
                  <TableHead className="text-right">Betrag CHF</TableHead>
                  <TableHead className="text-center">Beleg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionen.map((p: any) => {
                  const Icon = kategorieIcons[p.kategorie] || Receipt;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>{p.datum}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{p.kategorie}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.beschreibung}</TableCell>
                      <TableCell className="text-center">
                        {p.menge} {p.einheit !== "Pauschale" && p.einheit !== "Ticket" && p.einheit !== "Nacht" ? p.einheit : ""}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(p.satz)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(p.betrag)}</TableCell>
                      <TableCell className="text-center">
                        {p.beleg ? (
                          <Badge className="bg-success/10 text-success">
                            <CheckCircle2 className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="outline">Fehlt</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalBetrag)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dokumente & Belege */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Dokumente & Belege</CardTitle>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Datei hochladen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Noch keine Dokumente hochgeladen</p>
              <p className="text-sm">Klicken Sie auf "Datei hochladen" um Belege hinzuzufügen</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {uploadedFiles.map(file => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive" onClick={() => removeFile(file.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Genehmigungsverlauf */}
      {approvalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Genehmigungsverlauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvalHistory.map((entry: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                    entry.action === "Genehmigt" || entry.action === "approved" ? "bg-success/10 text-success" :
                    entry.action === "Abgelehnt" || entry.action === "rejected" ? "bg-destructive/10 text-destructive" :
                    entry.action === "Ausbezahlt" || entry.action === "paid" ? "bg-success/10 text-success" :
                    "bg-info/10 text-info"
                  }`}>
                    {(entry.action === "Genehmigt" || entry.action === "approved") && <CheckCircle2 className="h-4 w-4" />}
                    {(entry.action === "Abgelehnt" || entry.action === "rejected") && <XCircle className="h-4 w-4" />}
                    {(entry.action === "Ausbezahlt" || entry.action === "paid") && <Banknote className="h-4 w-4" />}
                    {(entry.action === "Eingereicht" || entry.action === "submitted") && <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.action}</span>
                      <span className="text-sm text-muted-foreground">• {entry.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{entry.user}</p>
                    {entry.note && (
                      <p className="text-sm mt-1 p-2 bg-muted rounded">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* GAV Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Spesenansätze (GAV Metallbau Schweiz)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kilometerentschädigung:</span>
              <Badge variant="outline">{formatCurrency(gavSätze.kmPauschale)}/km</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Mittagessen:</span>
              <Badge variant="outline">{formatCurrency(gavSätze.mittagessen)}/Tag</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Übernachtung max.:</span>
              <Badge variant="outline">{formatCurrency(gavSätze.übernachtungMax)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spesenabrechnung genehmigen</DialogTitle>
            <DialogDescription>
              Genehmigen Sie die Spesenabrechnung {spesenData.id} über {formatCurrency(totalBetrag)}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mitarbeiter</span>
                <span className="font-medium">{spesenData.mitarbeiter}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Zeitraum</span>
                <span className="font-medium">{spesenData.zeitraum}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Gesamtbetrag</span>
                <span className="font-bold text-primary">{formatCurrency(totalBetrag)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvalNote">Bemerkung (optional)</Label>
              <Textarea
                id="approvalNote"
                placeholder="Optionale Bemerkung zur Genehmigung..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Genehmigen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spesenabrechnung ablehnen</DialogTitle>
            <DialogDescription>
              Bitte geben Sie einen Grund für die Ablehnung an.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Ablehnungsgrund *</Label>
              <Textarea
                id="rejectReason"
                placeholder="Grund für die Ablehnung..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              <XCircle className="mr-2 h-4 w-4" />
              Ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
