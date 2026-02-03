import { useState } from "react";
import { Camera, Upload, X, Image, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Photo {
  id: string;
  file: File;
  preview: string;
  description: string;
}

interface PhotoUploadDialogProps {
  prüfungId: string;
  prüfungName: string;
}

export function PhotoUploadDialog({ prüfungId, prüfungName }: PhotoUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    addPhotos(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
      addPhotos(imageFiles);
    }
    e.target.value = "";
  };

  const addPhotos = (files: File[]) => {
    const newPhotos: Photo[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      description: "",
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const updateDescription = (id: string, description: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, description } : p));
  };

  const handleSave = () => {
    if (photos.length === 0) {
      toast.error("Bitte wählen Sie mindestens ein Foto aus");
      return;
    }
    toast.success(`${photos.length} Foto(s) zur Prüfung ${prüfungId} hinzugefügt`);
    setPhotos([]);
    setOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Camera className="mr-2 h-4 w-4" />
          Fotos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Fotos hochladen - {prüfungId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{prüfungName}</p>

          {/* Upload Area */}
          <div
            className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium mb-1">Fotos hierher ziehen</p>
            <p className="text-sm text-muted-foreground mb-3">oder klicken zum Auswählen</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileSelect}
            />
            <p className="text-xs text-muted-foreground">
              Unterstützte Formate: JPG, PNG, WebP (max. 10 MB pro Bild)
            </p>
          </div>

          {/* Photo List */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Hochgeladene Fotos ({photos.length})
              </Label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <img
                        src={photo.preview}
                        alt="Vorschau"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{photo.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(photo.file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Beschreibung (optional)"
                        value={photo.description}
                        onChange={(e) => updateDescription(photo.id, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={photos.length === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {photos.length > 0 ? `${photos.length} Foto(s) speichern` : "Speichern"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
