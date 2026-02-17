import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, ClipboardList, Edit, Trash2, Copy, MoreHorizontal, Loader2 } from "lucide-react";
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
import { useQualityChecklists, useDeleteQualityChecklist } from "@/hooks/use-quality-control";

const categoryColors: Record<string, string> = {
  "Schweissen": "bg-orange-500/10 text-orange-600",
  "Massgenauigkeit": "bg-blue-500/10 text-blue-600",
  "Oberfläche": "bg-green-500/10 text-green-600",
  "Verbindungen": "bg-purple-500/10 text-purple-600",
  "Wareneingang": "bg-amber-500/10 text-amber-600",
  "Eingang": "bg-amber-500/10 text-amber-600",
  "Masse": "bg-blue-500/10 text-blue-600",
  "Endkontrolle": "bg-green-500/10 text-green-600",
};

export default function QualityChecklists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: checklistsData, isLoading } = useQualityChecklists({ search: search || undefined, pageSize: 100 });
  const deleteMutation = useDeleteQualityChecklist();

  const templates = (checklistsData as any)?.data || [];

  const handleDelete = (e: React.MouseEvent, template: any) => {
    e.stopPropagation();
    deleteMutation.mutate(template.id, {
      onSuccess: () => toast.success(`Vorlage "${template.name}" gelöscht`),
      onError: () => toast.error("Fehler beim Löschen"),
    });
  };

  const categories = new Set(templates.map((t: any) => t.category).filter(Boolean));
  const totalPoints = templates.reduce((sum: number, t: any) => sum + (t.items?.length || 0), 0);
  const totalUsage = templates.reduce((sum: number, t: any) => sum + (t._count?.checks || 0), 0);

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Vorlagen gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{templates.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{categories.size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prüfpunkte total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPoints}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsage}</p>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vorlage</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="text-center">Prüfpunkte</TableHead>
                  <TableHead className="text-center">Verwendungen</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: any) => (
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
                          <p className="text-xs text-muted-foreground">{template.description || ""}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[template.category] || "bg-muted"}>
                        {template.category || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.type || "-"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{template.items?.length || 0}</TableCell>
                    <TableCell className="text-center">{template._count?.checks || 0}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/quality/checklists/${template.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => handleDelete(e, template)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Keine Vorlagen vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
