import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, ClipboardList, Edit, Trash2, Copy, MoreHorizontal, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const checklistTemplates = [
  {
    id: "TPL-001",
    name: "Schweissnaht-Prüfung EN 1090",
    category: "Schweissen",
    norm: "SN EN 1090-2",
    execClass: "EXC2",
    points: 8,
    lastUsed: "29.01.2024",
    usageCount: 45,
  },
  {
    id: "TPL-002",
    name: "Massgenauigkeit Stahlbau",
    category: "Massgenauigkeit",
    norm: "SN EN 1090-2",
    execClass: "EXC2",
    points: 6,
    lastUsed: "28.01.2024",
    usageCount: 38,
  },
  {
    id: "TPL-003",
    name: "Oberflächenbehandlung C3",
    category: "Oberfläche",
    norm: "ISO 12944",
    execClass: "-",
    points: 5,
    lastUsed: "27.01.2024",
    usageCount: 32,
  },
  {
    id: "TPL-004",
    name: "Schraubverbindungen",
    category: "Verbindungen",
    norm: "SN EN 1090-2",
    execClass: "EXC2",
    points: 4,
    lastUsed: "25.01.2024",
    usageCount: 28,
  },
  {
    id: "TPL-005",
    name: "Eingangsprüfung Material",
    category: "Wareneingang",
    norm: "ISO 9001",
    execClass: "-",
    points: 7,
    lastUsed: "24.01.2024",
    usageCount: 52,
  },
];

const categoryColors: Record<string, string> = {
  "Schweissen": "bg-orange-500/10 text-orange-600",
  "Massgenauigkeit": "bg-blue-500/10 text-blue-600",
  "Oberfläche": "bg-green-500/10 text-green-600",
  "Verbindungen": "bg-purple-500/10 text-purple-600",
  "Wareneingang": "bg-amber-500/10 text-amber-600",
};

export default function QualityChecklists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredTemplates = checklistTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.norm.toLowerCase().includes(search.toLowerCase())
  );

  const handleDuplicate = (template: typeof checklistTemplates[0]) => {
    toast.success(`Vorlage "${template.name}" dupliziert`);
  };

  const handleDelete = (template: typeof checklistTemplates[0]) => {
    toast.success(`Vorlage "${template.name}" gelöscht`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Checklisten-Vorlagen</h1>
          <p className="text-muted-foreground">
            Prüfvorlagen für Qualitätskontrollen verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/quality">
              <ClipboardList className="mr-2 h-4 w-4" />
              Zur QS-Übersicht
            </Link>
          </Button>
          <Button onClick={() => navigate("/quality/checklists/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Vorlage
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vorlagen gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{checklistTemplates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kategorien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(checklistTemplates.map((t) => t.category)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prüfpunkte total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {checklistTemplates.reduce((sum, t) => sum + t.points, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verwendungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {checklistTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Vorlage suchen..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vorlage</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Norm</TableHead>
                <TableHead>Ausf.-Klasse</TableHead>
                <TableHead className="text-center">Prüfpunkte</TableHead>
                <TableHead className="text-center">Verwendungen</TableHead>
                <TableHead>Zuletzt verwendet</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow
                  key={template.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/quality/checklists/${template.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[template.category] || "bg-muted"}>
                      {template.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{template.norm}</TableCell>
                  <TableCell>
                    {template.execClass !== "-" ? (
                      <Badge variant="outline">{template.execClass}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{template.points}</TableCell>
                  <TableCell className="text-center">{template.usageCount}</TableCell>
                  <TableCell className="text-muted-foreground">{template.lastUsed}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/quality/checklists/${template.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(template)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
