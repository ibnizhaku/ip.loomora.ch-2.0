import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface NewFolderDialogProps {
  onFolderCreated: (folder: {
    id: string;
    name: string;
    description?: string;
  }) => void;
  trigger?: React.ReactNode;
}

export function NewFolderDialog({ onFolderCreated, trigger }: NewFolderDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Ordnernamen ein");
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim() || undefined,
    };

    onFolderCreated(newFolder);
    toast.success("Ordner erstellt");
    setOpen(false);
    setName("");
    setDescription("");
    
    // Navigate to the new folder detail page
    navigate(`/documents/${newFolder.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Neuer Ordner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Ordner erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Ordner zur Organisation Ihrer Dokumente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Ordnername *</Label>
            <Input
              id="folder-name"
              placeholder="z.B. Projektverträge 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folder-description">Beschreibung (optional)</Label>
            <Textarea
              id="folder-description"
              placeholder="Kurze Beschreibung des Ordnerinhalts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate}>Erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
