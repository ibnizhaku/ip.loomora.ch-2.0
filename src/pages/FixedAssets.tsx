import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Download,
  Building2,
  Car,
  Monitor,
  Wrench,
  TrendingDown,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FixedAsset {
  id: string;
  inventoryNumber: string;
  name: string;
  category: "buildings" | "machinery" | "vehicles" | "equipment" | "software";
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLife: number; // Jahre
  depreciationMethod: "linear" | "degressive";
  accumulatedDepreciation: number;
  bookValue: number;
  location: string;
  status: "active" | "disposed" | "fully-depreciated";
}

const categoryIcons = {
  buildings: Building2,
  machinery: Wrench,
  vehicles: Car,
  equipment: Monitor,
  software: Monitor,
};

const categoryLabels = {
  buildings: "Gebäude",
  machinery: "Maschinen",
  vehicles: "Fahrzeuge",
  equipment: "BGA",
  software: "Software",
};

const categoryColors = {
  buildings: "bg-blue-500/10 text-blue-600",
  machinery: "bg-orange-500/10 text-orange-600",
  vehicles: "bg-purple-500/10 text-purple-600",
  equipment: "bg-success/10 text-success",
  software: "bg-info/10 text-info",
};

const statusStyles = {
  active: "bg-success/10 text-success",
  disposed: "bg-destructive/10 text-destructive",
  "fully-depreciated": "bg-muted text-muted-foreground",
};

const statusLabels = {
  active: "Aktiv",
  disposed: "Abgegangen",
  "fully-depreciated": "Voll abgeschrieben",
};

export default function FixedAssets() {
  const { data: apiData } = useQuery({ queryKey: ["/fixed-assets"], queryFn: () => api.get<any>("/fixed-assets") });
  const assets = apiData?.data || [];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [assetList, setAssetList] = useState<FixedAsset[]>([]);
  
  useEffect(() => {
    if (assets.length > 0) {
      setAssetList(assets);
    }
  }, [assets]);

  const totalAcquisitionCost = assetList.reduce((acc, a) => acc + a.acquisitionCost, 0);
  const totalBookValue = assetList.reduce((acc, a) => acc + a.bookValue, 0);
  const totalDepreciation = assetList.reduce((acc, a) => acc + a.accumulatedDepreciation, 0);
  const activeAssets = assetList.filter((a) => a.status === "active");

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAssetList(assetList.map(a => 
      a.id === id ? { ...a, status: "disposed" as const } : a
    ));
    toast.success("Abgang gebucht");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Anlagenbuchhaltung
          </h1>
          <p className="text-muted-foreground">
            Anlagevermögen und Abschreibungen verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("AfA-Plan wird exportiert...")}>
            <Download className="h-4 w-4" />
            AfA-Plan Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/fixed-assets/new")}>
            <Plus className="h-4 w-4" />
            Anlage erfassen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anschaffungskosten</p>
              <p className="text-2xl font-bold">CHF {totalAcquisitionCost.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingDown className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Buchwert</p>
              <p className="text-2xl font-bold text-success">CHF {totalBookValue.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Calendar className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kum. Abschreibung</p>
              <p className="text-2xl font-bold text-destructive">CHF {totalDepreciation.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Monitor className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Anlagen</p>
              <p className="text-2xl font-bold">{activeAssets.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Anlagen suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inventarnr.</TableHead>
              <TableHead>Bezeichnung</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Anschaffung</TableHead>
              <TableHead className="text-right">AK</TableHead>
              <TableHead>AfA-Fortschritt</TableHead>
              <TableHead className="text-right">Buchwert</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetList.map((asset, index) => {
              const CategoryIcon = categoryIcons[asset.category] || Monitor;
              const depreciationProgress = asset.acquisitionCost > 0 ? (asset.accumulatedDepreciation / asset.acquisitionCost) * 100 : 0;

              return (
                <TableRow
                  key={asset.id}
                  className="animate-fade-in cursor-pointer hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/fixed-assets/${asset.id}`)}
                >
                  <TableCell>
                    <span className="font-mono font-medium">{asset.inventoryNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground">{asset.location}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", categoryColors[asset.category] || "bg-muted text-muted-foreground")}>
                      <CategoryIcon className="h-3 w-3" />
                      {categoryLabels[asset.category] || asset.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{asset.acquisitionDate}</TableCell>
                  <TableCell className="text-right font-mono">
                    CHF {asset.acquisitionCost.toLocaleString("de-CH")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={depreciationProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {depreciationProgress.toFixed(0)}% • {asset.usefulLife} Jahre ND
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    CHF {asset.bookValue.toLocaleString("de-CH")}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[asset.status] || "bg-muted text-muted-foreground"}>
                      {statusLabels[asset.status] || asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/fixed-assets/${asset.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/fixed-assets/${asset.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Sonder-AfA gebucht")}>
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Sonder-AfA
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, asset.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Abgang buchen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
