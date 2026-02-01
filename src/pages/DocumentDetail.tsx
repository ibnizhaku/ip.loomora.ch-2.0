import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Edit, Trash2, Share2, Eye, Calendar, User, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const documentData = {
  id: "1",
  name: "Vertrag_2024_001.pdf",
  type: "PDF",
  category: "Verträge",
  size: "2.4 MB",
  createdAt: "15.01.2024",
  modifiedAt: "20.01.2024",
  createdBy: "Max Mustermann",
  description: "Rahmenvertrag mit Software AG für IT-Dienstleistungen 2024",
  tags: ["Vertrag", "IT", "2024"],
  linkedEntity: { type: "Kunde", name: "Software AG", id: "cust-123" },
  versions: [
    { version: "1.2", date: "20.01.2024", user: "Anna Schmidt", comment: "Finale Version" },
    { version: "1.1", date: "18.01.2024", user: "Max Mustermann", comment: "Änderungen eingearbeitet" },
    { version: "1.0", date: "15.01.2024", user: "Max Mustermann", comment: "Erstversion" },
  ],
};

const typeColors: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive",
  DOC: "bg-blue-500/10 text-blue-600",
  XLS: "bg-success/10 text-success",
  IMG: "bg-purple-500/10 text-purple-600",
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">{documentData.name}</h1>
              <p className="text-muted-foreground">{documentData.description}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vorschau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{documentData.name}</p>
                  <p className="text-muted-foreground">{documentData.size}</p>
                  <Button className="mt-4 gap-2">
                    <Eye className="h-4 w-4" />
                    Dokument öffnen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Versionshistorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentData.versions.map((version, index) => (
                  <div key={version.version} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      v{version.version}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{version.comment}</p>
                        {index === 0 && <Badge className="bg-success/10 text-success">Aktuell</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.user} • {version.date}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Typ</span>
                <Badge className={typeColors[documentData.type] || "bg-muted"}>
                  {documentData.type}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Grösse</span>
                <span className="font-medium">{documentData.size}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kategorie</span>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{documentData.category}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Erstellt</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{documentData.createdAt}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Geändert</span>
                <span>{documentData.modifiedAt}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Erstellt von</span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{documentData.createdBy}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {documentData.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verknüpfung</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                {documentData.linkedEntity.type}: {documentData.linkedEntity.name}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
