import { useState } from "react";
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
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrgNode {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  reports?: OrgNode[];
}

const orgData: OrgNode = {
  id: "1",
  name: "Max Keller",
  position: "CEO",
  department: "Geschäftsführung",
  email: "m.keller@loomora.de",
  phone: "+49 170 1234567",
  reports: [
    {
      id: "2",
      name: "Anna Schmidt",
      position: "CTO",
      department: "Entwicklung",
      email: "a.schmidt@loomora.de",
      phone: "+49 171 2345678",
      reports: [
        {
          id: "6",
          name: "Michael Braun",
          position: "Backend Developer",
          department: "Entwicklung",
          email: "m.braun@loomora.de",
          phone: "+49 175 6789012",
        },
        {
          id: "7",
          name: "Julia Meier",
          position: "Frontend Developer",
          department: "Entwicklung",
          email: "j.meier@loomora.de",
          phone: "+49 176 7890123",
        },
      ],
    },
    {
      id: "3",
      name: "Thomas Müller",
      position: "Head of Projects",
      department: "Projektmanagement",
      email: "t.mueller@loomora.de",
      phone: "+49 172 3456789",
      reports: [
        {
          id: "8",
          name: "Peter Wagner",
          position: "Project Manager",
          department: "Projektmanagement",
          email: "p.wagner@loomora.de",
          phone: "+49 177 8901234",
        },
      ],
    },
    {
      id: "4",
      name: "Lisa Weber",
      position: "Head of Design",
      department: "Design",
      email: "l.weber@loomora.de",
      phone: "+49 173 4567890",
      reports: [
        {
          id: "9",
          name: "Sandra Klein",
          position: "UX Designer",
          department: "Design",
          email: "s.klein@loomora.de",
          phone: "+49 178 9012345",
        },
      ],
    },
    {
      id: "5",
      name: "Sarah Koch",
      position: "Head of Marketing",
      department: "Marketing",
      email: "s.koch@loomora.de",
      phone: "+49 174 5678901",
    },
  ],
};

interface OrgNodeCardProps {
  node: OrgNode;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  level: number;
}

function OrgNodeCard({ node, isExpanded, onToggle, hasChildren, level }: OrgNodeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative p-4 rounded-xl border-2 bg-card transition-all duration-200 cursor-pointer min-w-[200px]",
          level === 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          showDetails && "ring-2 ring-primary/20"
        )}
        onClick={() => setShowDetails(!showDetails)}
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
          <div>
            <Link 
              to={`/hr/${node.id}`} 
              className="font-semibold hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {node.name}
            </Link>
            <p className="text-sm text-muted-foreground">{node.position}</p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <Badge variant="outline" className="text-xs">{node.department}</Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{node.email}</span>
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
}

function OrgTree({ node, level = 0, expandedNodes, toggleNode }: OrgTreeProps) {
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
      />

      {hasChildren && isExpanded && (
        <>
          {/* Vertical connector */}
          <div className="w-px h-8 bg-border" />
          
          {/* Horizontal connector for multiple children */}
          {node.reports!.length > 1 && (
            <div 
              className="h-px bg-border" 
              style={{ 
                width: `calc(${(node.reports!.length - 1) * 250}px)` 
              }} 
            />
          )}

          {/* Children */}
          <div className="flex gap-8 pt-8 relative">
            {node.reports!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="w-px h-8 bg-border absolute top-0" />
                <OrgTree
                  node={child}
                  level={level + 1}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1"]));
  const [searchTerm, setSearchTerm] = useState("");
  const [zoom, setZoom] = useState(100);
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);

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

  // Count employees
  const countEmployees = (node: OrgNode): number => {
    let count = 1;
    node.reports?.forEach(child => {
      count += countEmployees(child);
    });
    return count;
  };

  // Count departments
  const getDepartments = (node: OrgNode, departments: Set<string> = new Set()): Set<string> => {
    departments.add(node.department);
    node.reports?.forEach(child => getDepartments(child, departments));
    return departments;
  };

  // Count leaders (nodes with reports)
  const countLeaders = (node: OrgNode): number => {
    let count = node.reports && node.reports.length > 0 ? 1 : 0;
    node.reports?.forEach(child => {
      count += countLeaders(child);
    });
    return count;
  };

  // Count levels
  const getMaxLevel = (node: OrgNode, level = 1): number => {
    if (!node.reports || node.reports.length === 0) return level;
    return Math.max(...node.reports.map(child => getMaxLevel(child, level + 1)));
  };

  const totalEmployees = countEmployees(orgData);
  const totalDepartments = getDepartments(orgData).size;
  const totalLeaders = countLeaders(orgData);
  const maxLevels = getMaxLevel(orgData);

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Organigramm</h1>
          <p className="text-muted-foreground">Visualisierung der Unternehmensstruktur</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Alle öffnen
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Alle schließen
          </Button>
        </div>
      </div>

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
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
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
                  <p className="font-medium text-sm">Abteilungsleiter</p>
                  <p className="text-xs text-muted-foreground">Führungskräfte mit direkten Reports</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg border-2 border-border bg-muted/50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Mitarbeiter</p>
                  <p className="text-xs text-muted-foreground">Teammitglieder ohne direkte Reports</p>
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
                  <Badge variant="outline" className="text-xs">Name anklicken</Badge>
                  <span className="text-muted-foreground">→ Mitarbeiterprofil öffnen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">+/- Button</Badge>
                  <span className="text-muted-foreground">→ Team ein-/ausblenden</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Statistik-Karten</Badge>
                  <span className="text-muted-foreground">→ Struktur filtern</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orgchart;
