import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUploadDocument } from "@/hooks/use-documents";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
}

interface DocumentUploadDialogProps {
  onFilesUploaded?: (files: {
    id: string;
    name: string;
    type: "pdf" | "doc" | "image" | "spreadsheet";
    size: string;
  }[]) => void;
  projectId?: string;
  folderId?: string;
  trigger?: React.ReactNode;
}

const getFileType = (file: File): "pdf" | "doc" | "image" | "spreadsheet" => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "txt", "rtf"].includes(ext || "")) return "doc";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return "image";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "spreadsheet";
  return "doc";
};

const getFileIcon = (type: "pdf" | "doc" | "image" | "spreadsheet") => {
  switch (type) {
    case "pdf":
      return FileText;
    case "image":
      return Image;
    case "spreadsheet":
      return FileSpreadsheet;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function DocumentUploadDialog({ onFilesUploaded, projectId, folderId, trigger }: DocumentUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDocument = useUploadDocument();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    const uploadedResults: { id: string; name: string; type: "pdf" | "doc" | "image" | "spreadsheet"; size: string }[] = [];

    for (const uploadFile of files) {
      if (uploadFile.status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading", progress: 30 } : f
        )
      );

      try {
        const result = await uploadDocument.mutateAsync({
          file: uploadFile.file,
          ...(folderId ? { folderId } : {}),
          ...(projectId ? { projectId } : {}),
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "complete", progress: 100 } : f
          )
        );

        uploadedResults.push({
          id: (result as any)?.id || uploadFile.id,
          name: uploadFile.file.name,
          type: getFileType(uploadFile.file),
          size: formatFileSize(uploadFile.file.size),
        });
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "error", progress: 0 } : f
          )
        );
        toast.error(`Fehler beim Hochladen von "${uploadFile.file.name}": ${err.message || "Unbekannter Fehler"}`);
      }
    }

    if (uploadedResults.length > 0) {
      onFilesUploaded?.(uploadedResults);
      toast.success(`${uploadedResults.length} Datei(en) hochgeladen`);
    }

    // Close dialog if all uploads completed
    const hasErrors = files.some((f) => f.status === "error");
    if (!hasErrors) {
      setOpen(false);
      setFiles([]);
    }
  };

  const hasFiles = files.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Hochladen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dateien hochladen</DialogTitle>
          <DialogDescription>
            Ziehen Sie Dateien hierher oder klicken Sie zum Auswählen.
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium">
            Dateien hierher ziehen oder klicken
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, Word, Excel, Bilder (max. 20MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp"
          />
        </div>

        {hasFiles && (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {files.map((uploadFile) => {
              const fileType = getFileType(uploadFile.file);
              const FileIcon = getFileIcon(fileType);
              return (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      fileType === "pdf" && "bg-destructive/10 text-destructive",
                      fileType === "doc" && "bg-info/10 text-info",
                      fileType === "image" && "bg-success/10 text-success",
                      fileType === "spreadsheet" && "bg-warning/10 text-warning"
                    )}
                  >
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    {uploadFile.status === "uploading" && (
                      <Progress value={uploadFile.progress} className="h-1 mt-1" />
                    )}
                    {uploadFile.status === "error" && (
                      <p className="text-xs text-destructive mt-1">Fehler beim Hochladen</p>
                    )}
                  </div>
                  {uploadFile.status === "complete" ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(uploadFile.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!hasFiles || files.some((f) => f.status === "uploading")}
          >
            {files.some((f) => f.status === "uploading")
              ? "Hochladen..."
              : `${files.length} Datei(en) hochladen`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
