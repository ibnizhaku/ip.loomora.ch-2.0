import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Plane,
  Car,
  Hotel,
  Utensils,
  Receipt,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface TravelExpense {
  id: string;
  number: string;
  employee: {
    name: string;
    avatar?: string;
    initials: string;
  };
  purpose: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  items: {
    category: "transport" | "accommodation" | "meals" | "other";
    amount: number;
  }[];
}

const expenses: TravelExpense[] = [
  {
    id: "1",
    number: "RK-2024-012",
    employee: { name: "Thomas Müller", initials: "TM" },
    purpose: "Kundenbesuch Frankfurt",
    destination: "Frankfurt am Main",
    startDate: "28.01.2024",
    endDate: "29.01.2024",
    totalAmount: 485.50,
    status: "submitted",
    items: [
      { category: "transport", amount: 185.00 },
      { category: "accommodation", amount: 189.00 },
      { category: "meals", amount: 111.50 },
    ],
  },
  {
    id: "2",
    number: "RK-2024-011",
    employee: { name: "Sarah Weber", initials: "SW" },
    purpose: "Messe CeBIT Hannover",
    destination: "Hannover",
    startDate: "22.01.2024",
    endDate: "25.01.2024",
    totalAmount: 1250.00,
    status: "approved",
    items: [
      { category: "transport", amount: 320.00 },
      { category: "accommodation", amount: 567.00 },
      { category: "meals", amount: 363.00 },
    ],
  },
  {
    id: "3",
    number: "RK-2024-010",
    employee: { name: "Michael Schmidt", initials: "MS" },
    purpose: "Lieferantenaudit München",
    destination: "München",
    startDate: "15.01.2024",
    endDate: "16.01.2024",
    totalAmount: 520.00,
    status: "paid",
    items: [
      { category: "transport", amount: 240.00 },
      { category: "accommodation", amount: 159.00 },
      { category: "meals", amount: 121.00 },
    ],
  },
  {
    id: "4",
    number: "RK-2024-009",
    employee: { name: "Julia Hoffmann", initials: "JH" },
    purpose: "Schulung Berlin",
    destination: "Berlin",
    startDate: "10.01.2024",
    endDate: "12.01.2024",
    totalAmount: 890.00,
    status: "rejected",
    items: [
      { category: "transport", amount: 280.00 },
      { category: "accommodation", amount: 398.00 },
      { category: "meals", amount: 212.00 },
    ],
  },
  {
    id: "5",
    number: "RK-2024-008",
    employee: { name: "Thomas Müller", initials: "TM" },
    purpose: "Projektabnahme Stuttgart",
    destination: "Stuttgart",
    startDate: "05.01.2024",
    endDate: "05.01.2024",
    totalAmount: 185.00,
    status: "paid",
    items: [
      { category: "transport", amount: 145.00 },
      { category: "meals", amount: 40.00 },
    ],
  },
];

const categoryIcons = {
  transport: Car,
  accommodation: Hotel,
  meals: Utensils,
  other: Receipt,
};

const categoryLabels = {
  transport: "Fahrtkosten",
  accommodation: "Unterkunft",
  meals: "Verpflegung",
  other: "Sonstiges",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/10 text-blue-600",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  paid: "bg-primary/10 text-primary",
};

const statusLabels = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  approved: "Genehmigt",
  rejected: "Abgelehnt",
  paid: "Erstattet",
};

const statusIcons = {
  draft: Clock,
  submitted: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  paid: CheckCircle,
};

export default function TravelExpenses() {
  const [searchQuery, setSearchQuery] = useState("");

  const totalExpenses = expenses.reduce((acc, e) => acc + e.totalAmount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "submitted");
  const approvedExpenses = expenses.filter((e) => e.status === "approved" || e.status === "paid");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Reisekostenabrechnung
          </h1>
          <p className="text-muted-foreground">
            Dienstreisen erfassen und abrechnen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Reise
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt (YTD)</p>
              <p className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zur Prüfung</p>
              <p className="text-2xl font-bold text-warning">{pendingExpenses.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genehmigt</p>
              <p className="text-2xl font-bold text-success">{approvedExpenses.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Calendar className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reisen gesamt</p>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Reisen suchen..."
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
              <TableHead>Nr.</TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Reisezweck</TableHead>
              <TableHead>Zeitraum</TableHead>
              <TableHead>Kostenaufschlüsselung</TableHead>
              <TableHead className="text-right">Gesamt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense, index) => {
              const StatusIcon = statusIcons[expense.status];
              
              return (
                <TableRow
                  key={expense.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <span className="font-mono font-medium">{expense.number}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={expense.employee.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {expense.employee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{expense.employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{expense.purpose}</p>
                      <p className="text-sm text-muted-foreground">{expense.destination}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{expense.startDate}</p>
                      {expense.startDate !== expense.endDate && (
                        <p className="text-muted-foreground">bis {expense.endDate}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {expense.items.map((item, i) => {
                        const Icon = categoryIcons[item.category];
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded"
                            title={`${categoryLabels[item.category]}: €${item.amount}`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>€{item.amount}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    €{expense.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusStyles[expense.status])}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabels[expense.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="h-4 w-4 mr-2" />
                          Belege hochladen
                        </DropdownMenuItem>
                        {expense.status === "submitted" && (
                          <>
                            <DropdownMenuItem className="text-success">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Genehmigen
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Ablehnen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Info-Box */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <h4 className="font-semibold mb-2">Pauschalen 2024</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Verpflegung (8-24h)</p>
            <p className="font-medium">€14,00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Verpflegung (24h)</p>
            <p className="font-medium">€28,00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Übernachtung</p>
            <p className="font-medium">€20,00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Km-Pauschale PKW</p>
            <p className="font-medium">€0,30/km</p>
          </div>
        </div>
      </div>
    </div>
  );
}
