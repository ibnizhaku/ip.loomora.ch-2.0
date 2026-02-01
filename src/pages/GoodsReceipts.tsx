import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Package, CheckCircle, Clock, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const receipts = [
  { id: "WE-2024-001", date: "01.02.2024", supplier: "Material AG", poNumber: "BE-2024-015", items: 5, status: "completed" },
  { id: "WE-2024-002", date: "02.02.2024", supplier: "Stahlwerk GmbH", poNumber: "BE-2024-018", items: 3, status: "pending" },
  { id: "WE-2024-003", date: "03.02.2024", supplier: "Elektro Handel", poNumber: "BE-2024-020", items: 8, status: "completed" },
];

const statusStyles = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  partial: "bg-info/10 text-info",
};

const statusLabels = {
  completed: "Vollständig",
  pending: "Ausstehend",
  partial: "Teilweise",
};

export default function GoodsReceipts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Wareneingänge</h1>
          <p className="text-muted-foreground">Wareneingangsbelege verwalten</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/goods-receipts/new")}>
          <Plus className="h-4 w-4" />
          Neuer Wareneingang
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Suchen..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
              <TableHead>Beleg-Nr.</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Lieferant</TableHead>
              <TableHead>Bestellung</TableHead>
              <TableHead>Positionen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => (
              <TableRow key={receipt.id} className="cursor-pointer" onClick={() => navigate(`/goods-receipts/${receipt.id}`)}>
                <TableCell className="font-mono font-medium">{receipt.id}</TableCell>
                <TableCell>{receipt.date}</TableCell>
                <TableCell className="font-medium">{receipt.supplier}</TableCell>
                <TableCell className="font-mono text-sm">{receipt.poNumber}</TableCell>
                <TableCell>{receipt.items}</TableCell>
                <TableCell>
                  <Badge className={statusStyles[receipt.status as keyof typeof statusStyles]}>
                    {statusLabels[receipt.status as keyof typeof statusLabels]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
