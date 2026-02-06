import { useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { OrgNode } from "./OrgNodeEditDialog";

interface OrgNodeMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: OrgNode | null;
  allNodes: OrgNode[];
  onMove: (nodeId: string, newParentId: string) => void;
}

export default function OrgNodeMoveDialog({
  open,
  onOpenChange,
  node,
  allNodes,
  onMove,
}: OrgNodeMoveDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  // Flatten all nodes except the one being moved and its descendants
  const flattenNodes = (
    rootNode: OrgNode, 
    excludeId: string,
    result: { id: string; name: string; position: string; department: string }[] = []
  ): { id: string; name: string; position: string; department: string }[] => {
    // Don't include the node being moved or any of its descendants
    if (rootNode.id === excludeId) return result;
    
    result.push({ 
      id: rootNode.id, 
      name: rootNode.name, 
      position: rootNode.position,
      department: rootNode.department 
    });
    
    rootNode.reports?.forEach(child => {
      // Check if child is descendant of node being moved
      if (!isDescendant(child, excludeId)) {
        flattenNodes(child, excludeId, result);
      }
    });
    
    return result;
  };

  // Check if a node is a descendant of another node
  const isDescendant = (parentNode: OrgNode, targetId: string): boolean => {
    if (parentNode.id === targetId) return true;
    return parentNode.reports?.some(child => isDescendant(child, targetId)) || false;
  };

  const availableParents = node && allNodes.length > 0 
    ? flattenNodes(allNodes[0], node.id) 
    : [];

  // Find current parent
  const findParent = (root: OrgNode, nodeId: string, parent: OrgNode | null = null): OrgNode | null => {
    if (root.id === nodeId) return parent;
    for (const child of root.reports || []) {
      const found = findParent(child, nodeId, root);
      if (found) return found;
    }
    return null;
  };

  const currentParent = node && allNodes.length > 0 ? findParent(allNodes[0], node.id) : null;

  const handleMove = () => {
    if (node && selectedParentId) {
      onMove(node.id, selectedParentId);
      onOpenChange(false);
      setSelectedParentId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Position verschieben
          </DialogTitle>
          <DialogDescription>
            Ändern Sie die Berichtsstruktur für {node?.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current position info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">{node?.name}</p>
            <p className="text-xs text-muted-foreground">{node?.position}</p>
            <Badge variant="outline">{node?.department}</Badge>
          </div>

          {/* Current parent */}
          {currentParent && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Aktueller Vorgesetzter:</span>
              <Badge variant="secondary">{currentParent.name}</Badge>
            </div>
          )}

          {/* Arrow indicator */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* New parent selection */}
          <div className="space-y-2">
            <Label>Neuer Vorgesetzter</Label>
            <Select value={selectedParentId} onValueChange={setSelectedParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Neuen Vorgesetzten auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {availableParents
                  .filter(p => p.id !== currentParent?.id)
                  .map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      <div className="flex items-center gap-2">
                        <span>{parent.name}</span>
                        <span className="text-muted-foreground">({parent.position})</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleMove} disabled={!selectedParentId}>
            Verschieben
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
