import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
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
  Upload,
  FolderOpen,
  Eye,
  Edit,
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "spreadsheet" | "folder";
  size?: string;
  modifiedDate: string;
  modifiedBy: string;
  shared: boolean;
  items?: number;
}

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "Projektverträge",
    type: "folder",
    modifiedDate: "vor 2 Std.",
    modifiedBy: "Max Keller",
    shared: true,
    items: 12,
  },
  {
    id: "2",
    name: "Angebot_Fashion_Store_2024.pdf",
    type: "pdf",
    size: "2.4 MB",
    modifiedDate: "vor 1 Tag",
    modifiedBy: "Anna Schmidt",
    shared: true,
  },
  {
    id: "3",
    name: "Rechnung_INV-2024-001.pdf",
    type: "pdf",
    size: "156 KB",
    modifiedDate: "vor 3 Tagen",
    modifiedBy: "Thomas Müller",
    shared: false,
  },
  {
    id: "4",
    name: "Marketingmaterial",
    type: "folder",
    modifiedDate: "vor 1 Woche",
    modifiedBy: "Sarah Koch",
    shared: true,
    items: 24,
  },
  {
    id: "5",
    name: "Finanzbericht_Q4_2023.xlsx",
    type: "spreadsheet",
    size: "4.1 MB",
    modifiedDate: "vor 2 Wochen",
    modifiedBy: "Max Keller",
    shared: false,
  },
  {
    id: "6",
    name: "Produktfotos",
    type: "folder",
    modifiedDate: "vor 3 Wochen",
    modifiedBy: "Lisa Weber",
    shared: true,
    items: 156,
  },
  {
    id: "7",
    name: "Logo_Loomora_Final.png",
    type: "image",
    size: "890 KB",
    modifiedDate: "vor 1 Monat",
    modifiedBy: "Lisa Weber",
    shared: true,
  },
  {
    id: "8",
    name: "Vertrag_FinTech_2024.docx",
    type: "doc",
    size: "245 KB",
    modifiedDate: "vor 1 Monat",
    modifiedBy: "Max Keller",
    shared: false,
  },
];

const typeConfig = {
  pdf: { color: "text-destructive bg-destructive/10", icon: FileText },
  doc: { color: "text-info bg-info/10", icon: FileText },
  image: { color: "text-success bg-success/10", icon: Image },
  spreadsheet: { color: "text-warning bg-warning/10", icon: File },
  folder: { color: "text-primary bg-primary/10", icon: Folder },
};

export default function Documents() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [documentList, setDocumentList] = useState<Document[]>(initialDocuments);

  const filteredDocuments = documentList.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredDocuments.filter((d) => d.type === "folder");
  const files = filteredDocuments.filter((d) => d.type !== "folder");

  const handleDelete = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setDocumentList(documentList.filter(d => d.id !== docId));
    toast.success("Dokument gelöscht");
  };

  const handleDownload = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    toast.success(`${doc.name} wird heruntergeladen...`);
  };

  const handleShare = (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    setDocumentList(documentList.map(d => 
      d.id === doc.id ? { ...d, shared: !d.shared } : d
    ));
    toast.success(doc.shared ? "Freigabe aufgehoben" : "Dokument freigegeben");
  };

  const handleUpload = () => {
    toast.success("Upload-Dialog würde sich öffnen...");
  };

  const handleNewFolder = () => {
    const newFolder: Document = {
      id: Date.now().toString(),
      name: "Neuer Ordner",
      type: "folder",
      modifiedDate: "gerade eben",
      modifiedBy: "Max Keller",
      shared: false,
      items: 0,
    };
    setDocumentList([newFolder, ...documentList]);
    toast.success("Ordner erstellt");
  };

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
          <Button variant="outline" className="gap-2" onClick={handleNewFolder}>
            <FolderOpen className="h-4 w-4" />
            Neuer Ordner
          </Button>
          <Button className="gap-2" onClick={handleUpload}>
            <Upload className="h-4 w-4" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documentList.length}</p>
              <p className="text-sm text-muted-foreground">Dokumente</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Folder className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documentList.filter((d) => d.type === "folder").length}
              </p>
              <p className="text-sm text-muted-foreground">Ordner</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Share className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documentList.filter((d) => d.shared).length}
              </p>
              <p className="text-sm text-muted-foreground">Geteilt</p>
            </div>
          </div>
        </div>
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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
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
                onClick={() => navigate(`/documents/${folder.id}`)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{folder.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {folder.items} Elemente
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
                    <DropdownMenuItem onClick={() => navigate(`/documents/${folder.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Öffnen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Umbenennen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleShare(e, folder)}>
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
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {file.shared && (
                          <Badge variant="outline" className="text-xs">
                            Geteilt
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleDownload(e, file)}>
                              <Download className="h-4 w-4 mr-2" />
                              Herunterladen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleShare(e, file)}>
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
                    )}
                  </div>
                  {view === "grid" && (
                    <div className="flex items-center justify-between mt-2" onClick={(e) => e.stopPropagation()}>
                      {file.shared && (
                        <Badge variant="outline" className="text-xs">
                          Geteilt
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleDownload(e, file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Herunterladen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleShare(e, file)}>
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="py-12 text-center text-muted-foreground rounded-xl border border-border bg-card">
          <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Keine Dokumente gefunden</p>
          <p className="text-sm">Laden Sie Dateien hoch oder erstellen Sie einen neuen Ordner</p>
        </div>
      )}
    </div>
  );
}
