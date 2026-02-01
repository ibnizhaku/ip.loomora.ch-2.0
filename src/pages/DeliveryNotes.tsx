import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Printer,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface DeliveryNote {
  id: string;
  number: string;
  client: string;
  orderNumber: string;
  status: "prepared" | "shipped" | "in-transit" | "delivered";
  items: number;
  createdDate: string;
  deliveryDate: string;
  address: string;
  carrier?: string;
  trackingNumber?: string;
}

const deliveryNotes: DeliveryNote[] = [
  {
    id: "1",
    number: "LS-2024-001",
    client: "Fashion Store GmbH",
    orderNumber: "AUF-2024-015",
    status: "delivered",
    items: 12,
    createdDate: "20.01.2024",
    deliveryDate: "22.01.2024",
    address: "München, Bayern",
    carrier: "DHL",
    trackingNumber: "JJD000123456789",
  },
  {
    id: "2",
    number: "LS-2024-002",
    client: "FinTech Solutions",
    orderNumber: "AUF-2024-018",
    status: "in-transit",
    items: 5,
    createdDate: "25.01.2024",
    deliveryDate: "28.01.2024",
    address: "Berlin, Berlin",
    carrier: "UPS",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "3",
    number: "LS-2024-003",
    client: "Sales Pro AG",
    orderNumber: "AUF-2024-021",
    status: "shipped",
    items: 8,
    createdDate: "28.01.2024",
    deliveryDate: "01.02.2024",
    address: "Hamburg, Hamburg",
    carrier: "DPD",
  },
  {
    id: "4",
    number: "LS-2024-004",
    client: "Tech Innovations",
    orderNumber: "AUF-2024-022",
    status: "prepared",
    items: 3,
    createdDate: "30.01.2024",
    deliveryDate: "02.02.2024",
    address: "Köln, NRW",
  },
  {
    id: "5",
    number: "LS-2024-005",
    client: "Data Analytics Inc.",
    orderNumber: "AUF-2024-024",
    status: "delivered",
    items: 15,
    createdDate: "15.01.2024",
    deliveryDate: "18.01.2024",
    address: "Frankfurt, Hessen",
    carrier: "DHL",
    trackingNumber: "JJD000987654321",
  },
];

const statusConfig = {
  prepared: { label: "Vorbereitet", color: "bg-muted text-muted-foreground", icon: Package },
  shipped: { label: "Versendet", color: "bg-info/10 text-info", icon: Truck },
  "in-transit": { label: "Unterwegs", color: "bg-warning/10 text-warning", icon: Truck },
  delivered: { label: "Zugestellt", color: "bg-success/10 text-success", icon: CheckCircle },
};

export default function DeliveryNotes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = deliveryNotes.filter(
    (n) =>
      n.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Lieferscheine
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Lieferungen und Sendungen
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Lieferschein
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deliveryNotes.length}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Truck className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {deliveryNotes.filter((n) => n.status === "in-transit").length}
              </p>
              <p className="text-sm text-muted-foreground">Unterwegs</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {deliveryNotes.filter((n) => n.status === "delivered").length}
              </p>
              <p className="text-sm text-muted-foreground">Zugestellt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {deliveryNotes.filter((n) => n.status === "prepared").length}
              </p>
              <p className="text-sm text-muted-foreground">Vorbereitet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Lieferscheine suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Lieferschein</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Lieferadresse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Lieferdatum</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNotes.map((note, index) => {
              const StatusIcon = statusConfig[note.status].icon;
              return (
                <TableRow
                  key={note.id}
                  className="cursor-pointer animate-fade-in hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/delivery-notes/${note.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">{note.number}</span>
                        <p className="text-xs text-muted-foreground">
                          {note.items} Artikel • {note.orderNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{note.client}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {note.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusConfig[note.status].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[note.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {note.trackingNumber ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {note.trackingNumber.slice(0, 10)}...
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {note.deliveryDate}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Printer className="h-4 w-4" />
                          Drucken
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Als PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>Sendung verfolgen</DropdownMenuItem>
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
