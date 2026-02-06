import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  FolderOpen,
  FileText,
  Image,
  File,
  MoreHorizontal,
  Download,
  Share,
  Trash,
  Edit,
  Grid3X3,
  List,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NewFolderDialog } from "@/components/documents/NewFolderDialog";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { useDocuments } from "@/contexts/DocumentsContext";

const typeConfig = {
  pdf: { color: "text-destructive bg-destructive/10", icon: FileText },
  doc: { color: "text-info bg-info/10", icon: FileText },
  image: { color: "text-success bg-success/10", icon: Image },
  spreadsheet: { color: "text-warning bg-warning/10", icon: File },
  folder: { color: "text-primary bg-primary/10", icon: Folder },
};

export default function FolderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFolder, getDocumentsByParent, getFolderPath, addFolder, addDocument, updateDocument, deleteDocument } = useDocuments();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Get folder data
  const folder = getFolder(id || "");
  const folderPath = getFolderPath(id || "");
  const items = getDocumentsByParent(id || null);

  // If folder not found, show error
  if (!folder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/documents")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Ordner nicht gefunden</h1>
            <p className="text-muted-foreground">Der angeforderte Ordner existiert nicht.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/documents")}>
          Zurück zu Dokumente
        </Button>
      </div>
    );
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredItems.filter((d) => d.type === "folder");
  const files = filteredItems.filter((d) => d.type !== "folder");

  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    deleteDocument(itemId);
    toast.success("Element gelöscht");
  };

  const handleDownload = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.success(`${name} wird heruntergeladen...`);
  };

  const handleShare = (e: React.MouseEvent, itemId: string, currentShared: boolean) => {
    e.stopPropagation();
    updateDocument(itemId, { shared: !currentShared });
    toast.success(currentShared ? "Freigabe aufgehoben" : "Element freigegeben");
  };

  const handleItemClick = (item: typeof items[0]) => {
    if (item.type === "folder") {
      navigate(`/folders/${item.id}`);
    } else {
      navigate(`/documents/${item.id}`);
    }
  };

  const handleFolderCreated = (newFolder: { name: string }) => {
    addFolder(newFolder.name, id || null);
  };

  const handleFilesUploaded = (uploadedFiles: { name: string; type: "pdf" | "doc" | "image" | "spreadsheet"; size: string }[]) => {
    uploadedFiles.forEach(f => {
      addDocument({
        name: f.name,
        type: f.type,
        size: f.size,
        modifiedDate: "gerade eben",
        modifiedBy: "Max Keller",
        shared: false,
        parentId: id || null,
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => {
          // Navigate to parent folder or documents root
          if (folder.parentId) {
            navigate(`/folders/${folder.parentId}`);
          } else {
            navigate("/documents");
          }
        }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/documents">Dokumente</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {folderPath.slice(0, -1).map((pathFolder) => (
                <span key={pathFolder.id} className="contents">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/folders/${pathFolder.id}`}>{pathFolder.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </span>
              ))}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{folder.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3 mt-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            <h1 className="font-display text-2xl font-bold">{folder.name}</h1>
            <Badge variant="outline">{items.length} Elemente</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <NewFolderDialog onFolderCreated={handleFolderCreated} />
          <DocumentUploadDialog onFilesUploaded={handleFilesUploaded} />
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="In diesem Ordner suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex rounded-lg border border-border p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Ordner ist leer</h3>
            <p className="text-muted-foreground text-center mb-6">
              Laden Sie Dateien hoch oder erstellen Sie Unterordner.
            </p>
            <div className="flex gap-2">
              <NewFolderDialog onFolderCreated={handleFolderCreated} />
              <DocumentUploadDialog onFilesUploaded={handleFilesUploaded} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-3">
            Ordner
          </h3>
          <div
            className={cn(
              "grid gap-4",
              view === "grid" ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
            )}
          >
            {folders.map((subfolder, index) => (
              <div
                key={subfolder.id}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleItemClick(subfolder)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{subfolder.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {subfolder.items || 0} Elemente
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleItemClick(subfolder)}>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Öffnen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Umbenennen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleShare(e, subfolder.id, subfolder.shared)}>
                      <Share className="h-4 w-4 mr-2" />
                      {subfolder.shared ? "Freigabe aufheben" : "Teilen"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, subfolder.id)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-3">
            Dateien
          </h3>
          <div
            className={cn(
              "grid gap-4",
              view === "grid" ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
            )}
          >
            {files.map((file, index) => {
              const TypeIcon = typeConfig[file.type].icon;
              return (
                <div
                  key={file.id}
                  className={cn(
                    "group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in",
                    view === "list" && "flex items-center gap-4"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleItemClick(file)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-xl",
                      typeConfig[file.type].color,
                      view === "grid" ? "h-16 w-16 mb-3" : "h-10 w-10"
                    )}
                  >
                    <TypeIcon className={view === "grid" ? "h-8 w-8" : "h-5 w-5"} />
                  </div>
                  <div className={cn("flex-1 min-w-0", view === "list" && "flex items-center justify-between")}>
                    <div>
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • {file.modifiedDate}
                      </p>
                    </div>
                    {view === "list" && (
                      <span className="text-sm text-muted-foreground">
                        {file.modifiedBy}
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleItemClick(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Vorschau
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDownload(e, file.name)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleShare(e, file.id, file.shared)}>
                        <Share className="h-4 w-4 mr-2" />
                        {file.shared ? "Freigabe aufheben" : "Teilen"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, file.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
