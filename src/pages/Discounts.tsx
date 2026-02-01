import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Percent,
  Tag,
  Calendar,
  Users,
  ShoppingCart,
  Copy,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  revenue: number;
}

const initialDiscounts: Discount[] = [
  {
    id: "1",
    code: "WINTER2024",
    type: "percentage",
    value: 20,
    minOrder: 50,
    maxUses: 1000,
    usedCount: 456,
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    active: true,
    revenue: 12340,
  },
  {
    id: "2",
    code: "NEUKUNDE10",
    type: "percentage",
    value: 10,
    minOrder: 0,
    maxUses: null,
    usedCount: 234,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    active: true,
    revenue: 4560,
  },
  {
    id: "3",
    code: "VERSANDKOSTENFREI",
    type: "shipping",
    value: 0,
    minOrder: 75,
    maxUses: 500,
    usedCount: 189,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    active: true,
    revenue: 0,
  },
  {
    id: "4",
    code: "SALE50",
    type: "fixed",
    value: 50,
    minOrder: 200,
    maxUses: 100,
    usedCount: 100,
    startDate: "2023-12-01",
    endDate: "2023-12-31",
    active: false,
    revenue: 8900,
  },
  {
    id: "5",
    code: "VIP25",
    type: "percentage",
    value: 25,
    minOrder: 100,
    maxUses: 50,
    usedCount: 23,
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    active: true,
    revenue: 5670,
  },
];

const getTypeLabel = (type: string) => {
  switch (type) {
    case "percentage":
      return "Prozent";
    case "fixed":
      return "Festbetrag";
    case "shipping":
      return "Versand";
    default:
      return type;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "percentage":
      return <Percent className="h-4 w-4" />;
    case "fixed":
      return <Tag className="h-4 w-4" />;
    case "shipping":
      return <ShoppingCart className="h-4 w-4" />;
    default:
      return <Tag className="h-4 w-4" />;
  }
};

export default function Discounts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "percentage" | "fixed" | "shipping">("all");

  const totalRevenue = discounts.reduce((sum, d) => sum + d.revenue, 0);
  const totalUsed = discounts.reduce((sum, d) => sum + d.usedCount, 0);
  const activeCount = discounts.filter((d) => d.active).length;

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && discount.active) || 
      (statusFilter === "inactive" && !discount.active);
    const matchesType = typeFilter === "all" || discount.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiscounts(prev => prev.map(d => {
      if (d.id === id) {
        const newActive = !d.active;
        toast.success(newActive ? `${d.code} aktiviert` : `${d.code} deaktiviert`);
        return { ...d, active: newActive };
      }
      return d;
    }));
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" kopiert`);
  };

  const handleStatCardClick = (filter: "all" | "active" | "inactive") => {
    setStatusFilter(statusFilter === filter ? "all" : filter);
    setTypeFilter("all");
  };

  const handleTypeCardClick = (type: "percentage" | "fixed" | "shipping") => {
    setTypeFilter(typeFilter === type ? "all" : type);
    setStatusFilter("all");
  };

  const handleRowClick = (id: string) => {
    navigate(`/discounts/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rabatte & Gutscheine</h1>
          <p className="text-muted-foreground">
            Rabattcodes und Aktionen verwalten
          </p>
        </div>
        <Button onClick={() => navigate("/discounts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Rabattcode
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "active" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleStatCardClick("active")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Codes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              von {discounts.length} gesamt
            </p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => handleStatCardClick("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Einlösungen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed.toLocaleString("de-CH")}</div>
            <p className="text-xs text-muted-foreground">
              Diesen Monat
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz mit Rabatt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString("de-CH")} CHF
            </div>
            <p className="text-xs text-muted-foreground">
              Durch Rabattcodes
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Rabatt</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">
              Pro Bestellung
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rabattcode suchen..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        {(statusFilter !== "all" || typeFilter !== "all") && (
          <Button variant="ghost" onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}>
            Filter zurücksetzen
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Wert</TableHead>
              <TableHead>Mindestbestellwert</TableHead>
              <TableHead>Gültigkeit</TableHead>
              <TableHead className="text-right">Nutzungen</TableHead>
              <TableHead className="text-right">Umsatz</TableHead>
              <TableHead>Aktiv</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.map((discount) => (
              <TableRow 
                key={discount.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(discount.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {discount.code}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => handleCopyCode(discount.code, e)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(discount.type)}
                    <span>{getTypeLabel(discount.type)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {discount.type === "percentage" && `${discount.value}%`}
                  {discount.type === "fixed" && `${discount.value} CHF`}
                  {discount.type === "shipping" && "Kostenlos"}
                </TableCell>
                <TableCell>
                  {discount.minOrder > 0 ? `${discount.minOrder} CHF` : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(discount.startDate).toLocaleDateString("de-CH")} -{" "}
                    {new Date(discount.endDate).toLocaleDateString("de-CH")}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {discount.usedCount}
                  {discount.maxUses && (
                    <span className="text-muted-foreground"> / {discount.maxUses}</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {discount.revenue.toLocaleString("de-CH")} CHF
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={discount.active} 
                    onClick={(e) => handleToggleActive(discount.id, e)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Quick Create Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className={`border-dashed cursor-pointer hover:shadow-md transition-shadow ${typeFilter === "percentage" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleTypeCardClick("percentage")}
        >
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Percent className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Prozent-Rabatt</p>
            <p className="text-sm text-muted-foreground">z.B. 20% auf alles</p>
          </CardContent>
        </Card>
        <Card 
          className={`border-dashed cursor-pointer hover:shadow-md transition-shadow ${typeFilter === "fixed" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleTypeCardClick("fixed")}
        >
          <CardContent className="flex flex-col items-center justify-center py-6">
            <Tag className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Festbetrag</p>
            <p className="text-sm text-muted-foreground">z.B. 10 CHF Rabatt</p>
          </CardContent>
        </Card>
        <Card 
          className={`border-dashed cursor-pointer hover:shadow-md transition-shadow ${typeFilter === "shipping" ? "ring-2 ring-primary" : ""}`}
          onClick={() => handleTypeCardClick("shipping")}
        >
          <CardContent className="flex flex-col items-center justify-center py-6">
            <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="font-medium">Kostenloser Versand</p>
            <p className="text-sm text-muted-foreground">Ab Mindestbestellwert</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}