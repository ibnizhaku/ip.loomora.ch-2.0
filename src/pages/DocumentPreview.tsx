import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Download, FileText, Image, File, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDMSDocument } from "@/hooks/use-documents";

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getTypeIcon(mimeType: string) {
  if (mimeType?.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileText;
  return File;
}

function getTypeBadge(mimeType: string) {
  if (mimeType === "application/pdf") return { label: "PDF", className: "bg-destructive/10 text-destructive" };
  if (mimeType?.startsWith("image/")) return { label: "Bild", className: "bg-purple-500/10 text-purple-600" };
  if (mimeType?.includes("word") || mimeType?.includes("document")) return { label: "DOC", className: "bg-blue-500/10 text-blue-600" };
  if (mimeType?.includes("sheet") || mimeType?.includes("excel")) return { label: "XLS", className: "bg-success/10 text-success" };
  return { label: mimeType?.split("/")[1]?.toUpperCase() || "Datei", className: "bg-muted text-muted-foreground" };
}

export default function DocumentPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: document, isLoading, error } = useDMSDocument(id);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blobLoading, setBlobLoading] = useState(false);

  // Fetch file with auth token and create blob URL
  useEffect(() => {
    if (!document?.id) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setBlobLoading(true);
    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    fetch(`${API_BASE}/documents/${document.id}/download`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download fehlgeschlagen');
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => setBlobUrl(null))
      .finally(() => setBlobLoading(false));

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id]);

  const handleDownload = () => {
    if (!blobUrl || !document) return;
    const a = window.document.createElement('a');
    a.href = blobUrl;
    a.download = document.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Dokument wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">Dokument nicht gefunden</p>
          <p className="text-muted-foreground mb-4">Das angeforderte Dokument konnte nicht geladen werden.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  const isImage = document.mimeType?.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";
  const canPreview = isImage || isPdf;
  const TypeIcon = getTypeIcon(document.mimeType);
  const typeBadge = getTypeBadge(document.mimeType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <TypeIcon className="h-8 w-8 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold truncate">{document.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                <span>{formatFileSize(document.fileSize)}</span>
                {document.createdAt && (
                  <span>{new Date(document.createdAt).toLocaleDateString("de-CH")}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {blobUrl && (
            <Button className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <Card>
        <CardContent className="p-0">
          {blobLoading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : canPreview && blobUrl ? (
            <div className="w-full min-h-[70vh] bg-muted/30 rounded-lg overflow-hidden">
              {isPdf ? (
                <iframe
                  src={blobUrl}
                  className="w-full h-[75vh] border-0"
                  title={`Vorschau: ${document.name}`}
                />
              ) : (
                <div className="flex items-center justify-center p-8">
                  <img
                    src={blobUrl}
                    alt={document.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[50vh] bg-muted/30 rounded-lg">
              <div className="text-center">
                <File className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">{document.name}</p>
                <p className="text-muted-foreground mb-6">
                  {blobUrl ? "Dieser Dateityp kann nicht in der Vorschau angezeigt werden." : "Datei konnte nicht geladen werden."}
                </p>
                {blobUrl && (
                  <Button className="gap-2" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Datei herunterladen
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
