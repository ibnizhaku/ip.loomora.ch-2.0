import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Image,
  File,
  Folder,
  Download,
  Share,
  Trash,
  Grid3X3,
  List,
  FolderOpen,
  Eye,
  Edit,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function Documents() {
  const navigate = useNavigate();
  const { documents, getDocumentsByParent, addFolder, addDocument, updateDocument, deleteDocument } = useDocuments();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [sharedFilter, setSharedFilter] = useState<boolean | null>(null);
  const [activeStatFilter, setActiveStatFilter] = useState<"all" | "folders" | "shared" | null>(null);

  const hasActiveFilters = typeFilters.length > 0 || sharedFilter !== null || activeStatFilter !== null;

  // Get root level documents (parentId = null)
  const rootDocuments = getDocumentsByParent(null);

  const filteredDocuments = rootDocuments.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilters.length === 0 || typeFilters.includes(d.type);
    const matchesShared = sharedFilter === null || d.shared === sharedFilter;
    
    // Stat card filters
    if (activeStatFilter === "folders" && d.type !== "folder") return false;
    if (activeStatFilter === "shared" && !d.shared) return false;
    
    return matchesSearch && matchesType && matchesShared;
  });

  const folders = filteredDocuments.filter((d) => d.type === "folder");
  const files = filteredDocuments.filter((d) => d.type !== "folder");

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    deleteDocument(docId);
    toast.success("Element gelöscht");
  };

  const handleDownload = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    toast.success(`${name} wird heruntergeladen...`);
  };

  const handleShare = (e: React.MouseEvent, docId: string, currentShared: boolean) => {
    e.stopPropagation();
    updateDocument(docId, { shared: !currentShared });
    toast.success(currentShared ? "Freigabe aufgehoben" : "Dokument freigegeben");
  };

  const handleFolderCreated = (folder: { name: string }) => {
    addFolder(folder.name, null);
  };

  const handleFilesUploaded = (files: { name: string; type: "pdf" | "doc" | "image" | "spreadsheet"; size: string }[]) => {
    files.forEach(f => {
      addDocument({
        name: f.name,
        type: f.type,
        size: f.size,
        modifiedDate: "gerade eben",
        modifiedBy: "Max Keller",
        shared: false,
        parentId: null,
      });
    });
  };

  // Calculate stats
  const totalDocuments = documents.length;
  const totalFolders = documents.filter(d => d.type === "folder").length;
  const sharedDocuments = documents.filter(d => d.shared).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Dokumente
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Dateien und Ordner
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NewFolderDialog onFolderCreated={handleFolderCreated} />
          <DocumentUploadDialog onFilesUploaded={handleFilesUploaded} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <button
          onClick={() => setActiveStatFilter(activeStatFilter === "all" ? null : "all")}
          className={cn(
            "rounded-xl border bg-card p-5 text-left transition-all hover:border-primary/50 hover:shadow-soft",
            activeStatFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDocuments}</p>
              <p className="text-sm text-muted-foreground">Dokumente</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setActiveStatFilter(activeStatFilter === "folders" ? null : "folders")}
          className={cn(
            "rounded-xl border bg-card p-5 text-left transition-all hover:border-info/50 hover:shadow-soft",
            activeStatFilter === "folders" ? "border-info ring-2 ring-info/20" : "border-border"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Folder className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalFolders}</p>
              <p className="text-sm text-muted-foreground">Ordner</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => setActiveStatFilter(activeStatFilter === "shared" ? null : "shared")}
          className={cn(
            "rounded-xl border bg-card p-5 text-left transition-all hover:border-success/50 hover:shadow-soft",
            activeStatFilter === "shared" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Share className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sharedDocuments}</p>
              <p className="text-sm text-muted-foreground">Geteilt</p>
            </div>
          </div>
        </button>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">12.4 GB</p>
              <p className="text-sm text-muted-foreground">Speicher</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Dokumente suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground"
                      onClick={() => {
                        setTypeFilters([]);
                        setSharedFilter(null);
                        setActiveStatFilter(null);
                      }}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Zurücksetzen
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Dateityp</p>
                  {Object.entries(typeConfig).map(([key]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${key}`}
                        checked={typeFilters.includes(key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTypeFilters([...typeFilters, key]);
                          } else {
                            setTypeFilters(typeFilters.filter((t) => t !== key));
                          }
                        }}
                      />
                      <label
                        htmlFor={`type-${key}`}
                        className="text-sm cursor-pointer flex-1 capitalize"
                      >
                        {key === "pdf" ? "PDF" : key === "doc" ? "Dokument" : key === "image" ? "Bild" : key === "spreadsheet" ? "Tabelle" : "Ordner"}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Freigabe</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shared-yes"
                      checked={sharedFilter === true}
                      onCheckedChange={(checked) => {
                        setSharedFilter(checked ? true : null);
                      }}
                    />
                    <label htmlFor="shared-yes" className="text-sm cursor-pointer">
                      Nur geteilte
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shared-no"
                      checked={sharedFilter === false}
                      onCheckedChange={(checked) => {
                        setSharedFilter(checked ? false : null);
                      }}
                    />
                    <label htmlFor="shared-no" className="text-sm cursor-pointer">
                      Nur private
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Dokumente gefunden</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "Versuchen Sie andere Suchbegriffe." : "Laden Sie Dateien hoch oder erstellen Sie Ordner."}
          </p>
          <div className="flex gap-2">
            <NewFolderDialog onFolderCreated={handleFolderCreated} />
            <DocumentUploadDialog onFilesUploaded={handleFilesUploaded} />
          </div>
        </div>
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
            {folders.map((folder, index) => (
              <div
                key={folder.id}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/folders/${folder.id}`)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{folder.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {folder.items || 0} Elemente
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
                    <DropdownMenuItem onClick={() => navigate(`/folders/${folder.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Öffnen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Umbenennen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleShare(e, folder.id, folder.shared)}>
                      <Share className="h-4 w-4 mr-2" />
                      {folder.shared ? "Freigabe aufheben" : "Teilen"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, folder.id)}>
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
                  onClick={() => navigate(`/documents/${file.id}`)}
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
                      <div className="flex items-center gap-2">
                        {file.shared && (
                          <Badge variant="secondary" className="text-xs">
                            Geteilt
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {file.modifiedBy}
                        </span>
                      </div>
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
                      <DropdownMenuItem onClick={() => navigate(`/documents/${file.id}`)}>
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
