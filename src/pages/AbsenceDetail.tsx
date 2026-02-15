import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAbsence, useDeleteAbsence } from "@/hooks/use-absences";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Backend → Frontend mapping
const typeMap: Record<string, string> = {
  VACATION: "Ferien", SICK: "Krankheit", ACCIDENT: "Unfall",
  MATERNITY: "Mutterschaft", PATERNITY: "Vaterschaft", MILITARY: "Militär",
  TRAINING: "Weiterbildung", SPECIAL: "Sonderurlaub", UNPAID: "Unbezahlt",
};
const statusMap: Record<string, string> = {
  PENDING: "Ausstehend", APPROVED: "Genehmigt", REJECTED: "Abgelehnt",
  CANCELLED: "Storniert", CONFIRMED: "Bestätigt",
};
const mapType = (raw: string) => typeMap[raw] || raw;
const mapStatus = (raw: string) => statusMap[raw] || raw;

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === "–") return "–";
  try { return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return dateStr; }
};

const abwesenheitsTypen = [
  { typ: "Ferien", icon: "🏖️", farbe: "bg-success/10 text-success" },
  { typ: "Krankheit", icon: "🤒", farbe: "bg-destructive/10 text-destructive" },
  { typ: "Unfall", icon: "🚑", farbe: "bg-destructive/10 text-destructive" },
  { typ: "Militär", icon: "🎖️", farbe: "bg-warning/10 text-warning" },
  { typ: "Weiterbildung", icon: "📚", farbe: "bg-info/10 text-info" },
  { typ: "Unbezahlt", icon: "📋", farbe: "bg-muted text-muted-foreground" },
  { typ: "Mutterschaft", icon: "👶", farbe: "bg-primary/10 text-primary" },
  { typ: "Vaterschaft", icon: "👶", farbe: "bg-primary/10 text-primary" },
  { typ: "Sonderurlaub", icon: "📅", farbe: "bg-muted text-muted-foreground" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  "Ausstehend": { label: "Ausstehend", color: "bg-warning/10 text-warning", icon: Clock },
  "Genehmigt": { label: "Genehmigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Bestätigt": { label: "Bestätigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Abgelehnt": { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: XCircle },
  "Storniert": { label: "Storniert", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export default function AbsenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: apiData, isLoading, error } = useAbsence(id || "");
  const deleteMutation = useDeleteAbsence();

  // Approve/Reject via dedicated endpoints
  const approveMutation = useMutation({
    mutationFn: () => api.post(`/absences/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      queryClient.invalidateQueries({ queryKey: ["absences", id] });
      toast.success("Abwesenheit genehmigt");
    },
    onError: () => toast.error("Fehler beim Genehmigen"),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason?: string) => api.post(`/absences/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      queryClient.invalidateQueries({ queryKey: ["absences", id] });
      toast.success("Abwesenheit abgelehnt");
    },
    onError: () => toast.error("Fehler beim Ablehnen"),
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/absences/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["absences"] });
      queryClient.invalidateQueries({ queryKey: ["absences", id] });
      toast.success("Abwesenheit storniert");
    },
    onError: () => toast.error("Fehler beim Stornieren"),
  });

  const abwesenheitData = useMemo(() => {
    if (!apiData) return null;
    return {
      id: apiData.id || id,
      mitarbeiter: apiData.employee ? `${apiData.employee.firstName} ${apiData.employee.lastName}` : "–",
      personalNr: apiData.employeeId || "",
      abteilung: (apiData as any).department || (apiData as any).employee?.department?.name || "–",
      typ: mapType(apiData.type || ""),
      status: mapStatus(apiData.status || ""),
      von: formatDate(apiData.startDate || ""),
      bis: formatDate(apiData.endDate || ""),
      tage: Number(apiData.days) || 0,
      stunden: (apiData as any).hours || 0,
      bemerkung: apiData.reason || (apiData as any).notes || "",
      beantragtAm: formatDate((apiData as any).createdAt || ""),
      genehmigtVon: apiData.approvedBy || "–",
      genehmigtAm: formatDate(apiData.approvedAt || ""),
      vertretung: (apiData as any).substitute || "–",
    };
  }, [apiData, id]);

  // Map kontingent from backend response
  const kontingent = useMemo(() => {
    const k = (apiData as any)?.kontingent || (apiData as any)?.quota || (apiData as any)?.contingent;
    return {
      ferienTotal: k?.vacationDays || k?.total || 25,
      ferienGenommen: k?.usedVacation || k?.taken || 0,
      ferienGeplant: k?.planned || 0,
      ferienRest: k?.remainingVacation || k?.remaining || 0,
      überstundenSaldo: k?.overtimeBalance || 0,
    };
  }, [apiData]);

  // Map verlauf from backend
  const verlauf = useMemo(() => {
    const raw = (apiData as any)?.verlauf || (apiData as any)?.history || (apiData as any)?.approvalHistory || [];
    return raw.map((v: any) => ({
      datum: formatDate(v.startDate || v.date || v.datum || v.createdAt || ""),
      aktion: mapType(v.type || v.action || v.aktion || ""),
      status: mapStatus(v.status || ""),
      user: v.user || v.approvedBy || "",
      notiz: v.reason || v.note || v.notiz || "",
    }));
  }, [apiData]);

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Abwesenheit gelöscht");
        navigate("/absences");
      },
      onError: () => toast.error("Fehler beim Löschen"),
    });
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !abwesenheitData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Abwesenheit nicht gefunden</p>
        <Link to="/absences" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const currentTyp = abwesenheitsTypen.find(t => t.typ === abwesenheitData.typ);
  const statusInfo = statusConfig[abwesenheitData.status] || statusConfig["Ausstehend"];
  const StatusIcon = statusInfo.icon;
  const ferienVerbraucht = kontingent.ferienTotal > 0 ? ((kontingent.ferienGenommen + kontingent.ferienGeplant) / kontingent.ferienTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/absences">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{abwesenheitData.typ}</h1>
            <Badge className={statusInfo.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusInfo.label}
            </Badge>
            {currentTyp && (
              <Badge className={currentTyp.farbe}>
                {currentTyp.icon} {abwesenheitData.typ}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{abwesenheitData.mitarbeiter} • {abwesenheitData.abteilung}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {abwesenheitData.status === "Ausstehend" && (
            <>
              <Button variant="outline" className="text-destructive" onClick={() => rejectMutation.mutate("")} disabled={isPending}>
                <XCircle className="mr-2 h-4 w-4" />
                Ablehnen
              </Button>
              <Button onClick={() => approveMutation.mutate()} disabled={isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Genehmigen
              </Button>
            </>
          )}
          {abwesenheitData.status === "Genehmigt" && (
            <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={isPending}>
              Stornieren
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Abwesenheit löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Zeitraum Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Von</p>
                <p className="text-2xl font-bold">{abwesenheitData.von}</p>
              </div>
              <div className="text-3xl text-muted-foreground">→</div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Bis</p>
                <p className="text-2xl font-bold">{abwesenheitData.bis}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-primary">{abwesenheitData.tage}</p>
              <p className="text-sm text-muted-foreground">Arbeitstage{abwesenheitData.stunden ? ` (${abwesenheitData.stunden} Std.)` : ""}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mitarbeiter */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Mitarbeiter</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {abwesenheitData.mitarbeiter.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/hr/${abwesenheitData.personalNr}`} className="font-medium text-primary hover:underline">
                  {abwesenheitData.mitarbeiter}
                </Link>
                <p className="text-sm text-muted-foreground">{abwesenheitData.personalNr} • {abwesenheitData.abteilung}</p>
              </div>
            </div>

            {abwesenheitData.vertretung && abwesenheitData.vertretung !== "–" && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vertretung</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{abwesenheitData.vertretung.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{abwesenheitData.vertretung}</span>
                  </div>
                </div>
              </>
            )}

            {abwesenheitData.bemerkung && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bemerkung</p>
                  <p>{abwesenheitData.bemerkung}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ferienkontingent */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Ferienkontingent {new Date().getFullYear()}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Verbraucht / Geplant</span>
                <span>{kontingent.ferienGenommen + kontingent.ferienGeplant} / {kontingent.ferienTotal} Tage</span>
              </div>
              <Progress value={ferienVerbraucht} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{kontingent.ferienGenommen}</p>
                <p className="text-xs text-muted-foreground">Genommen</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">{kontingent.ferienGeplant}</p>
                <p className="text-xs text-muted-foreground">Geplant</p>
              </div>
              <div className="p-3 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">{kontingent.ferienRest}</p>
                <p className="text-xs text-muted-foreground">Verfügbar</p>
              </div>
              <div className="p-3 bg-info/10 rounded-lg">
                <p className="text-2xl font-bold text-info">+{kontingent.überstundenSaldo}</p>
                <p className="text-xs text-muted-foreground">Überstunden (Std.)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Genehmigung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Genehmigungsprozess</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Beantragt am</p>
              <p className="font-medium">{abwesenheitData.beantragtAm}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genehmigt von</p>
              {abwesenheitData.genehmigtVon && abwesenheitData.genehmigtVon !== "–" ? (
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{abwesenheitData.genehmigtVon.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{abwesenheitData.genehmigtVon}</span>
                </div>
              ) : (
                <p className="font-medium text-muted-foreground">–</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genehmigt am</p>
              <p className="font-medium">{abwesenheitData.genehmigtAm}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verlauf */}
      {verlauf.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verlauf.map((v: any, i: number) => (
                <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="text-sm text-muted-foreground w-36">{v.datum}</div>
                  <div className="flex-1">
                    <Badge variant="outline">{v.aktion}</Badge>
                    {v.status && <Badge className="ml-2" variant="secondary">{v.status}</Badge>}
                    {v.user && <span className="ml-2 text-sm">durch {v.user}</span>}
                    {v.notiz && <p className="text-sm text-muted-foreground mt-1">{v.notiz}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
