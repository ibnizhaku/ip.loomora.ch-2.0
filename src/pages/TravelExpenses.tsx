import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
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

const initialExpenses: TravelExpense[] = [
  {
    id: "1",
    number: "RK-2024-012",
    employee: { name: "Thomas Müller", initials: "TM" },
    purpose: "Kundenbesuch Zürich",
    destination: "Zürich",
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
    purpose: "Messe Swissbau Basel",
    destination: "Basel",
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
    purpose: "Lieferantenaudit Bern",
    destination: "Bern",
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
    purpose: "Schulung Luzern",
    destination: "Luzern",
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
    purpose: "Projektabnahme Winterthur",
    destination: "Winterthur",
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
  submitted: "bg-warning/10 text-warning",
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

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

export default function TravelExpenses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<TravelExpense[]>(initialExpenses);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.totalAmount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "submitted");
  const approvedExpenses = expenses.filter((e) => e.status === "approved" || e.status === "paid");

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: "approved" as const } : exp
    ));
    const expense = expenses.find(exp => exp.id === id);
    toast.success(`Reisekostenabrechnung ${expense?.number} genehmigt`);
  };

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpenses(prev => prev.map(exp => 
      exp.id === id ? { ...exp, status: "rejected" as const } : exp
    ));
    const expense = expenses.find(exp => exp.id === id);
    toast.error(`Reisekostenabrechnung ${expense?.number} abgelehnt`);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === "submitted" && exp.status === "submitted") ||
      (statusFilter === "approved" && (exp.status === "approved" || exp.status === "paid"));
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Reisekostenabrechnung CHF
          </h1>
          <p className="text-muted-foreground">
            Dienstreisen erfassen und abrechnen (Schweizer Pauschalen)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              toast.success("Export wird erstellt...");
              setTimeout(() => toast.success("Reisekosten-Report als CSV exportiert"), 1000);
            }}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/travel-expenses/new")}>
            <Plus className="h-4 w-4" />
            Neue Reise
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            !statusFilter && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick(null)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt (YTD)</p>
              <p className="text-2xl font-bold">CHF {formatCHF(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "submitted" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("submitted")}
        >
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
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "approved" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("approved")}
        >
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
            {filteredExpenses.map((expense, index) => {
              const StatusIcon = statusIcons[expense.status];
              
              return (
                <TableRow
                  key={expense.id}
                  className="cursor-pointer hover:bg-muted/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/travel-expenses/${expense.id}`)}
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
                            title={`${categoryLabels[item.category]}: CHF ${formatCHF(item.amount)}`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>CHF {formatCHF(item.amount)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    CHF {formatCHF(expense.totalAmount)}
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/travel-expenses/${expense.id}`); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.info("Bearbeitungsmodus geöffnet"); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("Belege-Upload Dialog geöffnet"); }}>
                          <Upload className="h-4 w-4 mr-2" />
                          Belege hochladen
                        </DropdownMenuItem>
                        {expense.status === "submitted" && (
                          <>
                            <DropdownMenuItem 
                              className="text-success"
                              onClick={(e) => handleApprove(expense.id, e)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Genehmigen
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => handleReject(expense.id, e)}
                            >
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

      {/* Schweizer Pauschalen */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <h4 className="font-semibold mb-2">Schweizer Pauschalen 2024</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Frühstück</p>
            <p className="font-medium">CHF 15.00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mittagessen</p>
            <p className="font-medium">CHF 25.00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Abendessen</p>
            <p className="font-medium">CHF 30.00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Km-Pauschale PKW</p>
            <p className="font-medium">CHF 0.70/km</p>
          </div>
        </div>
      </div>
    </div>
  );
}
