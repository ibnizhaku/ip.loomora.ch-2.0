import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Plane,
  Car,
  Hotel,
  Utensils,
  Receipt,
  Calendar,
  Plus,
  Trash2,
  Upload,
  File,
  Image,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: string;
  date: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

const categoryConfig = {
  transport: { label: "Fahrtkosten", icon: Car },
  accommodation: { label: "Unterkunft", icon: Hotel },
  meals: { label: "Verpflegung", icon: Utensils },
  other: { label: "Sonstiges", icon: Receipt },
};

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

const TravelExpenseCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    purpose: "",
    destination: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: "1", category: "transport", description: "", amount: "", date: "" }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      category: "transport", 
      description: "", 
      amount: "", 
      date: "" 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ExpenseItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

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
    toast.success(`${newFiles.length} Datei(en) hinzugefügt`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    return File;
  };

  const handleSubmit = () => {
    if (!formData.purpose || !formData.destination || !formData.startDate) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    toast.success("Reisekostenabrechnung erstellt", {
      description: `${formData.purpose} - CHF ${formatCHF(totalAmount)}`
    });
    navigate("/travel-expenses");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/travel-expenses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Neue Reisekostenabrechnung</h1>
          <p className="text-muted-foreground">Dienstreise erfassen (Schweizer Pauschalen)</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reisedetails */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              Reisedetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purpose">Reisezweck *</Label>
                <Input
                  id="purpose"
                  placeholder="z.B. Kundenbesuch, Messe, Schulung"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Reiseziel *</Label>
                <Input
                  id="destination"
                  placeholder="z.B. Zürich, Basel, Bern"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Reisebeginn *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Reiseende</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Bemerkungen</Label>
              <Textarea
                id="notes"
                placeholder="Zusätzliche Informationen zur Reise..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Zusammenfassung */}
        <Card>
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fahrtkosten</span>
                <span>CHF {formatCHF(items.filter(i => i.category === "transport").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unterkunft</span>
                <span>CHF {formatCHF(items.filter(i => i.category === "accommodation").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verpflegung</span>
                <span>CHF {formatCHF(items.filter(i => i.category === "meals").reduce((s, i) => s + (parseFloat(i.amount) || 0), 0))}</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Gesamt</span>
                <span>CHF {formatCHF(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kostenpositionen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kostenpositionen</CardTitle>
              <CardDescription>Erfassen Sie alle Auslagen der Dienstreise</CardDescription>
            </div>
            <Button onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Position hinzufügen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => {
            const CategoryIcon = categoryConfig[item.category as keyof typeof categoryConfig]?.icon || Receipt;
            return (
              <div key={item.id} className="flex gap-4 items-start p-4 rounded-lg border bg-muted/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="grid gap-4 flex-1 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Kategorie</Label>
                    <Select
                      value={item.category}
                      onValueChange={(value) => updateItem(item.id, "category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Input
                      placeholder="z.B. Bahnticket Zürich-Bern"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Datum</Label>
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateItem(item.id, "date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Betrag (CHF)</Label>
                    <Input
                      type="number"
                      step="0.05"
                      placeholder="0.00"
                      value={item.amount}
                      onChange={(e) => updateItem(item.id, "amount", e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Belege & Dokumente */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5 text-primary" />
                Belege & Dokumente
              </CardTitle>
              <CardDescription>Laden Sie Quittungen, Rechnungen und Tickets hoch</CardDescription>
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
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Dateien hochladen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length === 0 ? (
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Klicken oder Dateien hierher ziehen</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC (max. 10MB)</p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map(file => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Weitere Dateien hinzufügen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schweizer Pauschalen Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">Schweizer Pauschalen 2024 (Referenz)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Frühstück</p>
              <p className="font-medium">CHF 15.00</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mittagessen</p>
              <p className="font-medium">CHF 25.00</p>
            </div>
            <div>
              <p className="text-muted-foreground">Abendessen</p>
              <p className="font-medium">CHF 30.00</p>
            </div>
            <div>
              <p className="text-muted-foreground">Km-Pauschale PKW</p>
              <p className="font-medium">CHF 0.70/km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/travel-expenses")}>
          Abbrechen
        </Button>
        <Button variant="secondary" onClick={() => toast.info("Als Entwurf gespeichert")}>
          Als Entwurf speichern
        </Button>
        <Button onClick={handleSubmit}>
          Einreichen
        </Button>
      </div>
    </div>
  );
};

export default TravelExpenseCreate;
