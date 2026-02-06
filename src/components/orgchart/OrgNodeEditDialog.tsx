import { useState, useEffect } from "react";
import { User, Building2, Mail, Phone, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface OrgNode {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  reports?: OrgNode[];
}

interface OrgNodeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: OrgNode | null;
  mode: "add" | "edit";
  parentNode?: OrgNode | null;
  allNodes: OrgNode[];
  onSave: (node: OrgNode, parentId?: string) => void;
}

const DEPARTMENTS = [
  "Geschäftsführung",
  "Entwicklung",
  "Projektmanagement",
  "Design",
  "Marketing",
  "Vertrieb",
  "Produktion",
  "Qualitätssicherung",
  "Personal",
  "Finanzen",
  "IT",
  "Einkauf",
  "Logistik",
];

export default function OrgNodeEditDialog({
  open,
  onOpenChange,
  node,
  mode,
  parentNode,
  allNodes,
  onSave,
}: OrgNodeEditDialogProps) {
  const [formData, setFormData] = useState<OrgNode>({
    id: "",
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
  });
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && node) {
      setFormData({ ...node });
    } else if (mode === "add") {
      setFormData({
        id: `node-${Date.now()}`,
        name: "",
        position: "",
        department: parentNode?.department || "",
        email: "",
        phone: "",
      });
      setSelectedParentId(parentNode?.id || "");
    }
    setErrors({});
  }, [node, mode, parentNode, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }
    if (!formData.position.trim()) {
      newErrors.position = "Position ist erforderlich";
    }
    if (!formData.department) {
      newErrors.department = "Abteilung ist erforderlich";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    
    onSave(formData, mode === "add" ? selectedParentId : undefined);
    onOpenChange(false);
  };

  // Flatten all nodes for parent selection
  const flattenNodes = (node: OrgNode, result: { id: string; name: string; position: string }[] = []): { id: string; name: string; position: string }[] => {
    result.push({ id: node.id, name: node.name, position: node.position });
    node.reports?.forEach(child => flattenNodes(child, result));
    return result;
  };

  const availableParents = allNodes.length > 0 ? flattenNodes(allNodes[0]) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "add" ? (
              <>
                <UserPlus className="h-5 w-5" />
                Position hinzufügen
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                Position bearbeiten
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Fügen Sie eine neue Position zum Organigramm hinzu."
              : `Bearbeiten Sie die Details für ${node?.name}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mode === "add" && availableParents.length > 0 && (
            <div className="space-y-2">
              <Label>Vorgesetzter *</Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Vorgesetzten auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableParents.map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name} ({parent.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Max Mustermann"
                  className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="z.B. Projektleiter"
                className={errors.position ? "border-destructive" : ""}
              />
              {errors.position && <p className="text-xs text-destructive">{errors.position}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Abteilung *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className={`pl-10 ${errors.department ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Abteilung auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="max@firma.ch"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+41 79 123 45 67"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            {mode === "add" ? "Hinzufügen" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
