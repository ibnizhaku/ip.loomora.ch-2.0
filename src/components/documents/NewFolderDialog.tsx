import { useState } from "react";
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
import { toast } from "sonner";

interface NewFolderDialogProps {
  onFolderCreated: (folder: { name: string }) => void;
  trigger?: React.ReactNode;
}

export function NewFolderDialog({ onFolderCreated, trigger }: NewFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Bitte geben Sie einen Ordnernamen ein");
      return;
    }

    onFolderCreated({ name: name.trim() });
    toast.success(`Ordner "${name.trim()}" erstellt`);
    setOpen(false);
    setName("");
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              autoFocus
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
