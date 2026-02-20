import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  FileText,
  Clock,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Globe,
  PauseCircle,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  useJobPosting,
  useUpdateJobPosting,
  useDeleteJobPosting,
  usePublishJobPosting,
} from "@/hooks/use-recruiting";
import { useDepartments } from "@/hooks/use-departments";

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Entwurf", color: "bg-muted text-muted-foreground" },
  PUBLISHED: { label: "Aktiv", color: "bg-success/10 text-success" },
  PAUSED: { label: "Pausiert", color: "bg-warning/10 text-warning" },
  CLOSED: { label: "Geschlossen", color: "bg-muted text-muted-foreground" },
  FILLED: { label: "Besetzt", color: "bg-primary/10 text-primary" },
};

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  TEMPORARY: "Temporär",
  CONTRACT: "Vertrag",
  INTERNSHIP: "Praktikum",
  APPRENTICESHIP: "Lehrstelle",
};

const employmentTypes = [
  { value: "fulltime", label: "Vollzeit" },
  { value: "parttime", label: "Teilzeit" },
  { value: "temporary", label: "Temporär" },
  { value: "apprentice", label: "Lehrstelle" },
];

export default function JobPostingDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobPosting(jobId);
  const updateMutation = useUpdateJobPosting();
  const deleteMutation = useDeleteJobPosting();
  const publishMutation = usePublishJobPosting();
  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const departments = (departmentsData as any)?.data || departmentsData || [];

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const startEditing = () => {
    if (!job) return;
    setEditData({
      title: (job as any).title || "",
      department: (job as any).department || "",
      location: (job as any).location || "",
      employmentType: (job as any).employmentType || "FULL_TIME",
      workloadPercent: (job as any).workloadPercent || 100,
      applicationDeadline: (job as any).applicationDeadline
        ? new Date((job as any).applicationDeadline).toISOString().split("T")[0]
        : "",
      description: (job as any).description || "",
      requirements: (job as any).requirements || "",
      benefits: (job as any).benefits || "",
      salaryMin: (job as any).salaryMin || "",
      salaryMax: (job as any).salaryMax || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!jobId || !editData) return;
    updateMutation.mutate(
      {
        id: jobId,
        data: {
          ...editData,
          workloadPercent: editData.workloadPercent ? Number(editData.workloadPercent) : undefined,
          salaryMin: editData.salaryMin ? Number(editData.salaryMin) : undefined,
          salaryMax: editData.salaryMax ? Number(editData.salaryMax) : undefined,
          applicationDeadline: editData.applicationDeadline || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success("Stellenausschreibung aktualisiert");
          setIsEditing(false);
        },
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  const handlePublish = () => {
    if (!jobId) return;
    publishMutation.mutate(jobId, {
      onSuccess: () => toast.success("Stelle veröffentlicht"),
      onError: () => toast.error("Fehler beim Veröffentlichen"),
    });
  };

  const handleClose = () => {
    if (!jobId) return;
    updateMutation.mutate(
      { id: jobId, data: { status: "CLOSED" } as any },
      {
        onSuccess: () => toast.success("Stelle geschlossen"),
        onError: () => toast.error("Fehler beim Schliessen"),
      }
    );
  };

  const handlePause = () => {
    if (!jobId) return;
    updateMutation.mutate(
      { id: jobId, data: { status: "PAUSED" } as any },
      {
        onSuccess: () => toast.success("Stelle pausiert"),
        onError: () => toast.error("Fehler beim Pausieren"),
      }
    );
  };

  const handleDelete = () => {
    if (!jobId) return;
    deleteMutation.mutate(jobId, {
      onSuccess: () => {
        toast.success("Stelle gelöscht");
        navigate("/recruiting");
      },
      onError: () => toast.error("Fehler beim Löschen"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Stellenausschreibung nicht gefunden</p>
        <Link to="/recruiting" className="text-primary hover:underline mt-2">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const j = job as any;
  const statusInfo = statusConfig[j.status] || statusConfig.DRAFT;
  const candidates = j.candidates || [];
  const isPending = updateMutation.isPending || deleteMutation.isPending || publishMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/recruiting">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-2xl font-bold h-auto py-0 border-primary"
                />
              ) : (
                j.title
              )}
            </h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <p className="text-muted-foreground">
            {j.department} &bull; {j.location}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Speichern
              </Button>
            </>
          ) : (
            <>
              {j.status === "DRAFT" && (
                <Button onClick={handlePublish} disabled={isPending}>
                  <Globe className="h-4 w-4 mr-2" />
                  Veröffentlichen
                </Button>
              )}
              {j.status === "PUBLISHED" && (
                <Button variant="outline" onClick={handlePause} disabled={isPending}>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Pausieren
                </Button>
              )}
              {(j.status === "PAUSED" || j.status === "DRAFT") && (
                <Button onClick={handlePublish} disabled={isPending}>
                  <Globe className="h-4 w-4 mr-2" />
                  Veröffentlichen
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={startEditing}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  {j.status === "PUBLISHED" && (
                    <DropdownMenuItem onClick={handleClose}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Stelle schliessen
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stellendetails */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Stellendetails</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Abteilung</Label>
                    <Select
                      value={editData.department}
                      onValueChange={(v) => setEditData({ ...editData, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(departments) &&
                          departments.map((dept: any) => (
                            <SelectItem key={dept.id || dept} value={dept.name || dept}>
                              {dept.name || dept}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Standort</Label>
                    <Input
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Anstellungsart</Label>
                    <Select
                      value={editData.employmentType}
                      onValueChange={(v) => setEditData({ ...editData, employmentType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pensum (%)</Label>
                    <Input
                      type="number"
                      value={editData.workloadPercent}
                      onChange={(e) =>
                        setEditData({ ...editData, workloadPercent: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lohn von (CHF)</Label>
                    <Input
                      type="number"
                      value={editData.salaryMin}
                      onChange={(e) => setEditData({ ...editData, salaryMin: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lohn bis (CHF)</Label>
                    <Input
                      type="number"
                      value={editData.salaryMax}
                      onChange={(e) => setEditData({ ...editData, salaryMax: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bewerbungsfrist</Label>
                  <Input
                    type="date"
                    value={editData.applicationDeadline}
                    onChange={(e) =>
                      setEditData({ ...editData, applicationDeadline: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Abteilung</p>
                  <p className="font-medium">{j.department || "–"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standort</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{j.location || "–"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Anstellungsart</p>
                  <p className="font-medium">
                    {employmentTypeLabels[j.employmentType] || j.employmentType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pensum</p>
                  <p className="font-medium">{j.workloadPercent ? `${j.workloadPercent}%` : "–"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lohnrahmen</p>
                  <p className="font-medium">
                    {j.salaryMin || j.salaryMax
                      ? `CHF ${Number(j.salaryMin || 0).toLocaleString("de-CH")} – ${Number(j.salaryMax || 0).toLocaleString("de-CH")}`
                      : "–"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bewerbungsfrist</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {j.applicationDeadline
                        ? new Date(j.applicationDeadline).toLocaleDateString("de-CH")
                        : "–"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiken */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Statistiken</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bewerber</p>
                <p className="text-2xl font-bold">{j._count?.candidates ?? candidates.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Erstellt am</p>
                <p className="font-medium">
                  {j.createdAt ? new Date(j.createdAt).toLocaleDateString("de-CH") : "–"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Veröffentlicht</p>
                <p className="font-medium">
                  {j.publishedAt ? new Date(j.publishedAt).toLocaleDateString("de-CH") : "–"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beschreibung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Stellenbeschreibung</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>Aufgabenbeschreibung</Label>
                <Textarea
                  rows={4}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Anforderungen</Label>
                <Textarea
                  rows={4}
                  value={editData.requirements}
                  onChange={(e) => setEditData({ ...editData, requirements: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Wir bieten</Label>
                <Textarea
                  rows={4}
                  value={editData.benefits}
                  onChange={(e) => setEditData({ ...editData, benefits: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              {j.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Aufgabenbeschreibung
                  </p>
                  <p className="whitespace-pre-wrap">{j.description}</p>
                </div>
              )}
              {j.requirements && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Anforderungen</p>
                    <p className="whitespace-pre-wrap">{j.requirements}</p>
                  </div>
                </>
              )}
              {j.benefits && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Wir bieten</p>
                    <p className="whitespace-pre-wrap">{j.benefits}</p>
                  </div>
                </>
              )}
              {!j.description && !j.requirements && !j.benefits && (
                <p className="text-muted-foreground text-center py-4">
                  Keine Beschreibung vorhanden
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Bewerber */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Bewerber</CardTitle>
          </div>
          <Badge variant="outline">{candidates.length} Bewerber</Badge>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Noch keine Bewerber</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Beworben am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c: any) => (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/recruiting/${c.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {(c.firstName?.[0] || "") + (c.lastName?.[0] || "")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {c.firstName} {c.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("de-CH") : "–"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stelle löschen?</DialogTitle>
            <DialogDescription>
              Die Stellenausschreibung &quot;{j.title}&quot; und alle zugehörigen Bewerbungen werden
              unwiderruflich gelöscht.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Endgültig löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
