import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Crown,
  Edit,
  Plus,
  Trash2,
  Move,
  Settings,
  Save,
  X,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import OrgNodeEditDialog, { OrgNode } from "@/components/orgchart/OrgNodeEditDialog";
import OrgNodeMoveDialog from "@/components/orgchart/OrgNodeMoveDialog";

const STORAGE_KEY = "loomora_orgchart_data";

const defaultOrgData: OrgNode = {
  id: "1",
  name: "Max Keller",
  position: "CEO",
  department: "Geschäftsführung",
  email: "m.keller@loomora.ch",
  phone: "+41 79 123 45 67",
  reports: [
    {
      id: "2",
      name: "Anna Schmidt",
      position: "CTO",
      department: "Entwicklung",
      email: "a.schmidt@loomora.ch",
      phone: "+41 79 234 56 78",
      reports: [
        {
          id: "6",
          name: "Michael Braun",
          position: "Backend Developer",
          department: "Entwicklung",
          email: "m.braun@loomora.ch",
          phone: "+41 79 567 89 01",
        },
        {
          id: "7",
          name: "Julia Meier",
          position: "Frontend Developer",
          department: "Entwicklung",
          email: "j.meier@loomora.ch",
          phone: "+41 79 678 90 12",
        },
      ],
    },
    {
      id: "3",
      name: "Thomas Müller",
      position: "Werkstattleiter",
      department: "Produktion",
      email: "t.mueller@loomora.ch",
      phone: "+41 79 345 67 89",
      reports: [
        {
          id: "8",
          name: "Peter Wagner",
          position: "Metallbauer EFZ",
          department: "Produktion",
          email: "p.wagner@loomora.ch",
          phone: "+41 79 789 01 23",
        },
      ],
    },
    {
      id: "4",
      name: "Lisa Weber",
      position: "HR-Leiterin",
      department: "Personal",
      email: "l.weber@loomora.ch",
      phone: "+41 79 456 78 90",
      reports: [
        {
          id: "9",
          name: "Sandra Klein",
          position: "HR-Sachbearbeiterin",
          department: "Personal",
          email: "s.klein@loomora.ch",
          phone: "+41 79 890 12 34",
        },
      ],
    },
    {
      id: "5",
      name: "Sarah Koch",
      position: "Buchhaltungsleiterin",
      department: "Finanzen",
      email: "s.koch@loomora.ch",
      phone: "+41 79 567 89 01",
    },
  ],
};

// Load org data from localStorage
const loadOrgData = (): OrgNode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading org data:", error);
  }
  return defaultOrgData;
};

// Save org data to localStorage
const saveOrgData = (data: OrgNode): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving org data:", error);
  }
};

interface OrgNodeCardProps {
  node: OrgNode;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  level: number;
  editMode: boolean;
  onEdit: (node: OrgNode) => void;
  onAdd: (parentNode: OrgNode) => void;
  onMove: (node: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
  isRoot: boolean;
}

function OrgNodeCard({ 
  node, 
  isExpanded, 
  onToggle, 
  hasChildren, 
  level,
  editMode,
  onEdit,
  onAdd,
  onMove,
  onDelete,
  isRoot
}: OrgNodeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative p-4 rounded-xl border-2 bg-card transition-all duration-200 min-w-[220px]",
          level === 0 ? "border-primary bg-primary/5" : "border-border",
          !editMode && "cursor-pointer hover:border-primary/50",
          showDetails && "ring-2 ring-primary/20",
          editMode && "ring-1 ring-warning/30"
        )}
        onClick={() => !editMode && setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          <Avatar className={cn("h-12 w-12", level === 0 && "ring-2 ring-primary")}>
            <AvatarFallback className={cn(
              "text-sm font-medium",
              level === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {node.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {editMode ? (
              <p className="font-semibold truncate">{node.name}</p>
            ) : (
              <Link 
                to={`/hr/${node.id}`} 
                className="font-semibold hover:text-primary truncate block"
                onClick={(e) => e.stopPropagation()}
              >
                {node.name}
              </Link>
            )}
            <p className="text-sm text-muted-foreground truncate">{node.position}</p>
          </div>

          {/* Edit Mode Actions */}
          {editMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(node)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAdd(node)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Mitarbeiter hinzufügen
                </DropdownMenuItem>
                {!isRoot && (
                  <DropdownMenuItem onClick={() => onMove(node)}>
                    <Move className="h-4 w-4 mr-2" />
                    Verschieben
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(node)}
                  disabled={hasChildren}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                  {hasChildren && <span className="text-xs ml-2">(hat Reports)</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {showDetails && !editMode && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <Badge variant="outline" className="text-xs">{node.department}</Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{node.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{node.phone}</span>
            </div>
          </div>
        )}

        {hasChildren && (
          <button
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface OrgTreeProps {
  node: OrgNode;
  level?: number;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  editMode: boolean;
  onEdit: (node: OrgNode) => void;
  onAdd: (parentNode: OrgNode) => void;
  onMove: (node: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
}

function OrgTree({ 
  node, 
  level = 0, 
  expandedNodes, 
  toggleNode,
  editMode,
  onEdit,
  onAdd,
  onMove,
  onDelete
}: OrgTreeProps) {
  const hasChildren = node.reports && node.reports.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  return (
    <div className="flex flex-col items-center">
      <OrgNodeCard
        node={node}
        isExpanded={isExpanded}
        onToggle={() => toggleNode(node.id)}
        hasChildren={hasChildren || false}
        level={level}
        editMode={editMode}
        onEdit={onEdit}
        onAdd={onAdd}
        onMove={onMove}
        onDelete={onDelete}
        isRoot={level === 0}
      />

      {hasChildren && isExpanded && (
        <>
          <div className="w-px h-8 bg-border" />
          
          {node.reports!.length > 1 && (
            <div 
              className="h-px bg-border" 
              style={{ 
                width: `calc(${(node.reports!.length - 1) * 260}px)` 
              }} 
            />
          )}

          <div className="flex gap-8 pt-8 relative">
            {node.reports!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-8 bg-border absolute top-0" />
                <OrgTree
                  node={child}
                  level={level + 1}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  editMode={editMode}
                  onEdit={onEdit}
                  onAdd={onAdd}
                  onMove={onMove}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const Orgchart = () => {
  const [orgData, setOrgData] = useState<OrgNode>(loadOrgData);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1"]));
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(100);
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
  const [editDialogMode, setEditDialogMode] = useState<"add" | "edit">("edit");
  const [parentNodeForAdd, setParentNodeForAdd] = useState<OrgNode | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (node: OrgNode) => {
      allIds.add(node.id);
      node.reports?.forEach(collectIds);
    };
    collectIds(orgData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(["1"]));
  };

  // Count helpers
  const countEmployees = (node: OrgNode): number => {
    let count = 1;
    node.reports?.forEach(child => { count += countEmployees(child); });
    return count;
  };

  const getDepartments = (node: OrgNode, departments: Set<string> = new Set()): Set<string> => {
    departments.add(node.department);
    node.reports?.forEach(child => getDepartments(child, departments));
    return departments;
  };

  const countLeaders = (node: OrgNode): number => {
    let count = node.reports && node.reports.length > 0 ? 1 : 0;
    node.reports?.forEach(child => { count += countLeaders(child); });
    return count;
  };

  const getMaxLevel = (node: OrgNode, level = 1): number => {
    if (!node.reports || node.reports.length === 0) return level;
    return Math.max(...node.reports.map(child => getMaxLevel(child, level + 1)));
  };

  const totalEmployees = countEmployees(orgData);
  const totalDepartments = getDepartments(orgData).size;
  const totalLeaders = countLeaders(orgData);
  const maxLevels = getMaxLevel(orgData);

  // Edit handlers
  const handleEdit = (node: OrgNode) => {
    setSelectedNode(node);
    setEditDialogMode("edit");
    setParentNodeForAdd(null);
    setEditDialogOpen(true);
  };

  const handleAdd = (parentNode: OrgNode) => {
    setSelectedNode(null);
    setEditDialogMode("add");
    setParentNodeForAdd(parentNode);
    setEditDialogOpen(true);
  };

  const handleMove = (node: OrgNode) => {
    setSelectedNode(node);
    setMoveDialogOpen(true);
  };

  const handleDeleteClick = (node: OrgNode) => {
    setSelectedNode(node);
    setDeleteDialogOpen(true);
  };

  // Update node in tree
  const updateNodeInTree = (root: OrgNode, updatedNode: OrgNode): OrgNode => {
    if (root.id === updatedNode.id) {
      return { ...updatedNode, reports: root.reports };
    }
    return {
      ...root,
      reports: root.reports?.map(child => updateNodeInTree(child, updatedNode)),
    };
  };

  // Add node to tree
  const addNodeToTree = (root: OrgNode, newNode: OrgNode, parentId: string): OrgNode => {
    if (root.id === parentId) {
      return {
        ...root,
        reports: [...(root.reports || []), newNode],
      };
    }
    return {
      ...root,
      reports: root.reports?.map(child => addNodeToTree(child, newNode, parentId)),
    };
  };

  // Remove node from tree
  const removeNodeFromTree = (root: OrgNode, nodeId: string): OrgNode => {
    return {
      ...root,
      reports: root.reports
        ?.filter(child => child.id !== nodeId)
        .map(child => removeNodeFromTree(child, nodeId)),
    };
  };

  // Move node in tree
  const moveNodeInTree = (root: OrgNode, nodeId: string, newParentId: string): OrgNode => {
    // Find the node to move
    let nodeToMove: OrgNode | null = null;
    const findNode = (node: OrgNode): OrgNode | null => {
      if (node.id === nodeId) return node;
      for (const child of node.reports || []) {
        const found = findNode(child);
        if (found) return found;
      }
      return null;
    };
    nodeToMove = findNode(root);
    if (!nodeToMove) return root;

    // Remove from current position
    let newTree = removeNodeFromTree(root, nodeId);
    
    // Add to new parent
    newTree = addNodeToTree(newTree, nodeToMove, newParentId);
    
    return newTree;
  };

  const handleSaveNode = (node: OrgNode, parentId?: string) => {
    if (editDialogMode === "edit") {
      setOrgData(prev => updateNodeInTree(prev, node));
      toast.success(`${node.name} wurde aktualisiert`);
    } else if (parentId) {
      setOrgData(prev => addNodeToTree(prev, node, parentId));
      toast.success(`${node.name} wurde hinzugefügt`);
      // Auto-expand parent to show new node
      setExpandedNodes(prev => new Set([...prev, parentId]));
    }
    setHasUnsavedChanges(true);
  };

  const handleMoveNode = (nodeId: string, newParentId: string) => {
    setOrgData(prev => moveNodeInTree(prev, nodeId, newParentId));
    toast.success("Position wurde verschoben");
    setHasUnsavedChanges(true);
    // Expand new parent
    setExpandedNodes(prev => new Set([...prev, newParentId]));
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setOrgData(prev => removeNodeFromTree(prev, selectedNode.id));
      toast.success(`${selectedNode.name} wurde entfernt`);
      setHasUnsavedChanges(true);
    }
    setDeleteDialogOpen(false);
  };

  const handleSaveAll = () => {
    saveOrgData(orgData);
    setHasUnsavedChanges(false);
    toast.success("Organigramm wurde gespeichert");
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      setOrgData(loadOrgData());
      setHasUnsavedChanges(false);
    }
    setEditMode(false);
  };

  const handleStatClick = (filter: string | null) => {
    setHighlightFilter(highlightFilter === filter ? null : filter);
    if (filter) {
      expandAll();
      toast.info(`Filter: ${filter}`, { description: "Alle Knoten wurden geöffnet" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Organigramm</h1>
            <p className="text-muted-foreground">Visualisierung der Unternehmensstruktur</p>
          </div>
          {!editMode && (
            <Button onClick={() => setEditMode(true)} className="gap-2 shrink-0">
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Button>
          )}
        </div>
        
        {/* Action buttons row */}
        <div className="flex flex-wrap gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                <X className="h-4 w-4" />
                Abbrechen
              </Button>
              <Button onClick={handleSaveAll} className="gap-2" disabled={!hasUnsavedChanges}>
                <Save className="h-4 w-4" />
                Speichern
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={expandAll}>
                Alle öffnen
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Alle schließen
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editMode && (
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="flex items-center gap-3 py-3">
            <Edit className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="font-medium text-warning">Bearbeitungsmodus aktiv</p>
              <p className="text-sm text-muted-foreground">
                Klicken Sie auf ⋮ bei einer Position, um sie zu bearbeiten, verschieben oder zu löschen.
              </p>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-warning border-warning">
                Ungespeicherte Änderungen
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
            highlightFilter === null && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick(null)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Mitarbeiter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-info/50 hover:shadow-md",
            highlightFilter === "abteilungen" && "border-info ring-2 ring-info/20"
          )}
          onClick={() => handleStatClick("abteilungen")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Building2 className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDepartments}</p>
                <p className="text-sm text-muted-foreground">Abteilungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-success/50 hover:shadow-md",
            highlightFilter === "fuehrung" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("fuehrung")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Crown className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLeaders}</p>
                <p className="text-sm text-muted-foreground">Führungskräfte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-warning/50 hover:shadow-md",
            highlightFilter === "ebenen" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("ebenen")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Layers className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{maxLevels}</p>
                <p className="text-sm text-muted-foreground">Hierarchie-Ebenen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Zoom Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(150, zoom + 10))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(100)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Org Chart */}
      <Card>
        <CardContent className="p-8 overflow-auto">
          <div 
            className="flex justify-center min-w-max"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <OrgTree
              node={orgData}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              editMode={editMode}
              onEdit={handleEdit}
              onAdd={handleAdd}
              onMove={handleMove}
              onDelete={handleDeleteClick}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend - only show when not in edit mode */}
      {!editMode && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Legende & Interaktion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kartentypen</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-center">
                    <Crown className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">CEO / Geschäftsführung</p>
                    <p className="text-xs text-muted-foreground">Oberste Führungsebene</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg border-2 border-border bg-card flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Mitarbeiter</p>
                    <p className="text-xs text-muted-foreground">Alle Positionen im Unternehmen</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interaktion</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Klick auf Karte</Badge>
                    <span className="text-muted-foreground">→ Details anzeigen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Bearbeiten-Button</Badge>
                    <span className="text-muted-foreground">→ Admin-Modus aktivieren</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <OrgNodeEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        node={selectedNode}
        mode={editDialogMode}
        parentNode={parentNodeForAdd}
        allNodes={[orgData]}
        onSave={handleSaveNode}
      />

      <OrgNodeMoveDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        node={selectedNode}
        allNodes={[orgData]}
        onMove={handleMoveNode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Position entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie <strong>{selectedNode?.name}</strong> ({selectedNode?.position}) wirklich aus dem Organigramm entfernen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNode} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orgchart;
