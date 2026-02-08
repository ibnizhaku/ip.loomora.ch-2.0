import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Edit,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/ecommerce/discounts"],
    queryFn: () => api.get<any>("/ecommerce/discounts"),
  });
  const initialDiscounts = apiData?.data || [];
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDiscounts(prev => prev.filter(d => d.id !== id));
    toast.success("Rabattcode gelöscht");
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/discounts/${id}`);
  };

  const handleRowClick = (id: string) => {
    navigate(`/discounts/${id}`);
  };

  const activeFilters = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);

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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="active" 
                      checked={statusFilter === "active"}
                      onCheckedChange={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
                    />
                    <label htmlFor="active" className="text-sm cursor-pointer">Aktiv</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="inactive" 
                      checked={statusFilter === "inactive"}
                      onCheckedChange={() => setStatusFilter(statusFilter === "inactive" ? "all" : "inactive")}
                    />
                    <label htmlFor="inactive" className="text-sm cursor-pointer">Inaktiv</label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Typ</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="percentage" 
                      checked={typeFilter === "percentage"}
                      onCheckedChange={() => setTypeFilter(typeFilter === "percentage" ? "all" : "percentage")}
                    />
                    <label htmlFor="percentage" className="text-sm cursor-pointer">Prozent</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="fixed" 
                      checked={typeFilter === "fixed"}
                      onCheckedChange={() => setTypeFilter(typeFilter === "fixed" ? "all" : "fixed")}
                    />
                    <label htmlFor="fixed" className="text-sm cursor-pointer">Festbetrag</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="shipping" 
                      checked={typeFilter === "shipping"}
                      onCheckedChange={() => setTypeFilter(typeFilter === "shipping" ? "all" : "shipping")}
                    />
                    <label htmlFor="shipping" className="text-sm cursor-pointer">Versand</label>
                  </div>
                </div>
              </div>
              {activeFilters > 0 && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}>
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEdit(discount.id, e)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleEdit(discount.id, e)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleCopyCode(discount.code, e)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Code kopieren
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(discount.id, e)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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