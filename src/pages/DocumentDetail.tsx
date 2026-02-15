import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Edit, Trash2, Share2, Eye, Calendar, User, Folder, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useDMSDocument, useDeleteDocument } from "@/hooks/use-documents";

const typeColors: Record<string, string> = {
  "application/pdf": "bg-destructive/10 text-destructive",
  "application/msword": "bg-blue-500/10 text-blue-600",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "bg-blue-500/10 text-blue-600",
  "image/png": "bg-purple-500/10 text-purple-600",
  "image/jpeg": "bg-purple-500/10 text-purple-600",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useDMSDocument(id);
  const deleteMutation = useDeleteDocument();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Dokument nicht gefunden</p><Button variant="link" onClick={() => navigate(-1)}>Zurück</Button></div>;

  const doc = raw as any;
  const fileType = doc.mimeType?.split('/').pop()?.toUpperCase() || "DOC";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">{doc.name}</h1>
              <p className="text-muted-foreground">{doc.description || ""}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
          <Button variant="outline" className="gap-2" onClick={() => { if (doc.fileUrl) window.open(doc.fileUrl, '_blank'); }}>
            <Download className="h-4 w-4" />Download
          </Button>
          <Button variant="destructive" size="icon" onClick={() => { deleteMutation.mutate(id || ''); toast.success("Dokument gelöscht"); navigate(-1); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Vorschau</CardTitle></CardHeader>
            <CardContent>
              <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{doc.name}</p>
                  <p className="text-muted-foreground">{formatSize(doc.fileSize)}</p>
                  <Button className="mt-4 gap-2" onClick={() => navigate(`/documents/${id}/preview`)}>
                    <Eye className="h-4 w-4" />Dokument öffnen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {(doc.versions || []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Versionshistorie</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(doc.versions || []).map((version: any, index: number) => (
                    <div key={version.id || index} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        v{version.version}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{version.changeNotes || "Version"}</p>
                          {index === 0 && <Badge className="bg-success/10 text-success">Aktuell</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {version.createdBy ? `${version.createdBy.firstName} ${version.createdBy.lastName}` : ""} • {formatDate(version.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Typ</span>
                <Badge className={typeColors[doc.mimeType] || "bg-muted"}>{fileType}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Grösse</span>
                <span className="font-medium">{formatSize(doc.fileSize)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Erstellt</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(doc.createdAt)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Geändert</span>
                <span>{formatDate(doc.updatedAt)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Erstellt von</span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{doc.createdBy ? `${doc.createdBy.firstName} ${doc.createdBy.lastName}` : "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(doc.tags || []).length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(doc.tags || []).map((tag: string) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
