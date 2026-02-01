import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, FileText, Image, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      if (!name) setName(files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      if (!name) setName(files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return <Image className="h-8 w-8 text-info" />;
    if (type.includes("spreadsheet") || type.includes("excel")) return <FileSpreadsheet className="h-8 w-8 text-success" />;
    if (type.includes("pdf")) return <FileText className="h-8 w-8 text-destructive" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSave = () => {
    if (!selectedFile) {
      toast.error("Bitte wählen Sie eine Datei aus");
      return;
    }
    if (!name) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }
    toast.success("Dokument hochgeladen");
    navigate("/documents");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Dokument hochladen</h1>
          <p className="text-muted-foreground">Neue Datei in die Ablage hochladen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Datei auswählen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                    Andere Datei wählen
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-1">Datei hierher ziehen</p>
                  <p className="text-sm text-muted-foreground mb-4">oder klicken zum Auswählen</p>
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleFileSelect}
                  />
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Unterstützte Formate: PDF, Word, Excel, Bilder (max. 50 MB)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dokumentdetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dokumentname *</Label>
              <Input 
                placeholder="Name des Dokuments"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordner</Label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordner wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoices">Rechnungen</SelectItem>
                  <SelectItem value="contracts">Verträge</SelectItem>
                  <SelectItem value="offers">Angebote</SelectItem>
                  <SelectItem value="correspondence">Korrespondenz</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Intern</SelectItem>
                  <SelectItem value="customer">Kundendokument</SelectItem>
                  <SelectItem value="supplier">Lieferantendokument</SelectItem>
                  <SelectItem value="legal">Rechtliches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input 
                placeholder="z.B. wichtig, 2024, Projekt-X"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea 
                placeholder="Optionale Beschreibung..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Hochladen
        </Button>
      </div>
    </div>
  );
}
