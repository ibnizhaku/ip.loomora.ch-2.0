import { useState } from "react";
import { ClipboardList, CheckCircle2, Circle, Plus, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  norm: string;
  items: ChecklistItem[];
}

const checklistTemplates: ChecklistTemplate[] = [
  {
    id: "1",
    name: "Schweissnaht-Prüfung",
    norm: "SN EN ISO 5817",
    items: [
      { id: "1-1", text: "Sichtprüfung auf Risse", checked: false, category: "Visuell" },
      { id: "1-2", text: "Nahtvorbereitung gemäss Zeichnung", checked: false, category: "Visuell" },
      { id: "1-3", text: "Nahtgeometrie (a-Mass) prüfen", checked: false, category: "Mass" },
      { id: "1-4", text: "Einbrand kontrollieren", checked: false, category: "Visuell" },
      { id: "1-5", text: "Porosität prüfen", checked: false, category: "Visuell" },
      { id: "1-6", text: "Spritzer entfernt", checked: false, category: "Oberfläche" },
    ],
  },
  {
    id: "2",
    name: "Massgenauigkeit",
    norm: "SN EN 1090-2",
    items: [
      { id: "2-1", text: "Längenmasse ±2mm", checked: false, category: "Mass" },
      { id: "2-2", text: "Winkelmasse ±1°", checked: false, category: "Mass" },
      { id: "2-3", text: "Bohrungsabstände prüfen", checked: false, category: "Mass" },
      { id: "2-4", text: "Geradheit kontrollieren", checked: false, category: "Mass" },
      { id: "2-5", text: "Ebenheit prüfen", checked: false, category: "Mass" },
    ],
  },
  {
    id: "3",
    name: "Oberflächenbehandlung",
    norm: "SN EN ISO 12944",
    items: [
      { id: "3-1", text: "Oberfläche gereinigt (SA 2.5)", checked: false, category: "Vorbereitung" },
      { id: "3-2", text: "Grundierung aufgetragen", checked: false, category: "Beschichtung" },
      { id: "3-3", text: "Schichtdicke Grundierung ≥40μm", checked: false, category: "Mass" },
      { id: "3-4", text: "Decklack aufgetragen", checked: false, category: "Beschichtung" },
      { id: "3-5", text: "Gesamtschichtdicke ≥80μm", checked: false, category: "Mass" },
      { id: "3-6", text: "Keine Läufer/Nasen", checked: false, category: "Visuell" },
      { id: "3-7", text: "Farbton gemäss RAL", checked: false, category: "Visuell" },
    ],
  },
];

interface ChecklistDialogProps {
  prüfungId: string;
  prüfungName: string;
}

export function ChecklistDialog({ prüfungId, prüfungName }: ChecklistDialogProps) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(checklistTemplates);

  const handleToggleItem = (templateId: string, itemId: string) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? {
              ...template,
              items: template.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : template
      )
    );
  };

  const getProgress = (template: ChecklistTemplate) => {
    const checked = template.items.filter(i => i.checked).length;
    return { checked, total: template.items.length, percent: (checked / template.items.length) * 100 };
  };

  const handlePrint = () => {
    toast.success("Checkliste wird gedruckt...");
  };

  const handleExport = () => {
    toast.success("Checkliste wird als PDF exportiert...");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardList className="mr-2 h-4 w-4" />
          Checkliste
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Prüfchecklisten</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {prüfungId} – {prüfungName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Drucken
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue={templates[0].id} className="mt-4">
          <TabsList className="w-full justify-start">
            {templates.map(template => {
              const progress = getProgress(template);
              return (
                <TabsTrigger key={template.id} value={template.id} className="gap-2">
                  {template.name}
                  <Badge 
                    variant="outline" 
                    className={progress.percent === 100 ? "bg-success/10 text-success" : ""}
                  >
                    {progress.checked}/{progress.total}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {templates.map(template => {
            const progress = getProgress(template);
            const categories = [...new Set(template.items.map(i => i.category))];

            return (
              <TabsContent key={template.id} value={template.id} className="mt-4">
                <div className="space-y-4">
                  {/* Progress */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${progress.percent === 100 ? "bg-success/10" : "bg-primary/10"}`}>
                        {progress.percent === 100 ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <ClipboardList className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">Norm: {template.norm}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(progress.percent)}%</p>
                      <p className="text-sm text-muted-foreground">abgeschlossen</p>
                    </div>
                  </div>

                  {/* Checklist Items by Category */}
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {categories.map(category => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">{category}</h4>
                          <div className="space-y-2">
                            {template.items
                              .filter(item => item.category === category)
                              .map(item => (
                                <div
                                  key={item.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                    item.checked
                                      ? "bg-success/5 border-success/30"
                                      : "bg-card border-border hover:border-primary/30"
                                  }`}
                                  onClick={() => handleToggleItem(template.id, item.id)}
                                >
                                  <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => handleToggleItem(template.id, item.id)}
                                  />
                                  <span className={item.checked ? "text-muted-foreground line-through" : ""}>
                                    {item.text}
                                  </span>
                                  {item.checked && (
                                    <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
