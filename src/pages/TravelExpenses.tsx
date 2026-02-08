import { useState, useEffect } from "react";
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
  X,
  Trash2,
  Copy,
  AlertTriangle,
  Users,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { loadExpenseRules, validateExpenseReport, ExpenseRules } from "@/components/settings/ExpenseRulesSettings";
import { loadWorkflowConfig, getRequiredStages } from "@/components/settings/ExpenseWorkflowSettings";
import ExpenseApprovalStatus, { ApprovalProgress } from "@/components/expenses/ExpenseApprovalStatus";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
  // Workflow fields
  currentStageIndex: number;
  approvalHistory: ApprovalProgress[];
}

const mockTravelExpenses: TravelExpense[] = [
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
    currentStageIndex: 0,
    approvalHistory: [],
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
    currentStageIndex: 2,
    approvalHistory: [
      { stageId: "1", stageName: "Teamleiter", status: "approved", approvedBy: "Peter Keller", approvedAt: "23.01.2024" },
      { stageId: "2", stageName: "HR / Personal", status: "approved", approvedBy: "Anna Meier", approvedAt: "24.01.2024" },
      { stageId: "3", stageName: "Buchhaltung", status: "approved", approvedBy: "Lisa Brunner", approvedAt: "25.01.2024" },
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
    currentStageIndex: 2,
    approvalHistory: [
      { stageId: "1", stageName: "Teamleiter", status: "approved", approvedBy: "Peter Keller", approvedAt: "16.01.2024" },
      { stageId: "2", stageName: "HR / Personal", status: "approved", approvedBy: "Anna Meier", approvedAt: "17.01.2024" },
      { stageId: "3", stageName: "Buchhaltung", status: "approved", approvedBy: "Lisa Brunner", approvedAt: "18.01.2024" },
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
    currentStageIndex: 1,
    approvalHistory: [
      { stageId: "1", stageName: "Teamleiter", status: "approved", approvedBy: "Peter Keller", approvedAt: "12.01.2024" },
      { stageId: "2", stageName: "HR / Personal", status: "rejected", rejectedReason: "Hotelrechnung fehlt" },
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
    currentStageIndex: 0,
    approvalHistory: [
      { stageId: "1", stageName: "Teamleiter", status: "approved", approvedBy: "Peter Keller", approvedAt: "06.01.2024" },
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

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/travel-expenses"],
    queryFn: () => api.get<any>("/travel-expenses"),
  });
  const initialExpenses = apiData?.data || mockTravelExpenses;
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<TravelExpense[]>(initialExpenses);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterDestination, setFilterDestination] = useState<string[]>([]);
  const [expenseRules, setExpenseRules] = useState<ExpenseRules | null>(null);

  // Load expense rules on mount
  useEffect(() => {
    const rules = loadExpenseRules();
    setExpenseRules(rules);
  }, []);

  // Validate expenses against GAV rules
  const getExpenseValidation = (expense: TravelExpense) => {
    if (!expenseRules) return { isCompliant: true, warnings: [], totalExcess: 0 };
    return validateExpenseReport(expense.items, expenseRules);
  };

  // Count non-compliant expenses
  const nonCompliantExpenses = expenses.filter(e => {
    const validation = getExpenseValidation(e);
    return !validation.isCompliant;
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.totalAmount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "submitted");
  const approvedExpenses = expenses.filter((e) => e.status === "approved" || e.status === "paid");
  const uniqueDestinations = [...new Set(expenses.map(e => e.destination))];
  const activeFilters = filterStatus.length + filterDestination.length;

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const resetFilters = () => {
    setFilterStatus([]);
    setFilterDestination([]);
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const expense = expenses.find(exp => exp.id === id);
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast.success(`Reisekostenabrechnung ${expense?.number} gelöscht`);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      const newExpense: TravelExpense = {
        ...expense,
        id: String(Date.now()),
        number: `RK-2024-${String(expenses.length + 1).padStart(3, "0")}`,
        status: "draft",
      };
      setExpenses(prev => [newExpense, ...prev]);
      toast.success(`Reisekostenabrechnung dupliziert`);
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === "submitted" && exp.status === "submitted") ||
      (statusFilter === "approved" && (exp.status === "approved" || exp.status === "paid"));

    const matchesFilterStatus = filterStatus.length === 0 || filterStatus.includes(exp.status);
    const matchesFilterDestination = filterDestination.length === 0 || filterDestination.includes(exp.destination);
    
    return matchesSearch && matchesStatus && matchesFilterStatus && matchesFilterDestination;
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

      {/* GAV Compliance Warning */}
      {nonCompliantExpenses.length > 0 && expenseRules?.validation.warnOnExceed && (
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-warning">GAV-Überschreitungen festgestellt</p>
              <p className="text-sm text-muted-foreground">
                {nonCompliantExpenses.length} Abrechnung(en) überschreiten die GAV Metallbau Limiten. 
                Bitte prüfen Sie diese vor der Genehmigung.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/settings")}
              className="border-warning/30 text-warning hover:bg-warning/10"
            >
              Limiten anpassen
            </Button>
          </CardContent>
        </Card>
      )}

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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("gap-2", activeFilters > 0 && "border-primary")}>
              <Filter className="h-4 w-4" />
              Filter
              {activeFilters > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filter</h4>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                {(["draft", "submitted", "approved", "rejected", "paid"] as const).map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filterStatus.includes(status)}
                      onCheckedChange={(checked) => {
                        setFilterStatus(checked 
                          ? [...filterStatus, status]
                          : filterStatus.filter(s => s !== status)
                        );
                      }}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                      {statusLabels[status]}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Reiseziel</Label>
                {uniqueDestinations.map((destination) => (
                  <div key={destination} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dest-${destination}`}
                      checked={filterDestination.includes(destination)}
                      onCheckedChange={(checked) => {
                        setFilterDestination(checked 
                          ? [...filterDestination, destination]
                          : filterDestination.filter(d => d !== destination)
                        );
                      }}
                    />
                    <Label htmlFor={`dest-${destination}`} className="text-sm font-normal cursor-pointer">
                      {destination}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
              const validation = getExpenseValidation(expense);
              const hasWarning = !validation.isCompliant && expenseRules?.validation.warnOnExceed;
              
              return (
                <TableRow
                  key={expense.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 animate-fade-in",
                    hasWarning && "bg-warning/5"
                  )}
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
                    <div className="flex items-center gap-2">
                      <Badge className={cn("gap-1", statusStyles[expense.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {statusLabels[expense.status]}
                      </Badge>
                      {expense.status === "submitted" && (
                        <ExpenseApprovalStatus
                          amount={expense.totalAmount}
                          currentStageIndex={expense.currentStageIndex}
                          approvalHistory={expense.approvalHistory}
                          status={expense.status}
                          compact
                        />
                      )}
                      {hasWarning && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
                                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-medium">GAV-Überschreitung</p>
                              <p className="text-xs text-muted-foreground">
                                {validation.warnings.length} Position(en) über Limite
                                {validation.totalExcess > 0 && (
                                  <span> (CHF {formatCHF(validation.totalExcess)} zu viel)</span>
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/travel-expenses/${expense.id}/edit`); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("Belege-Upload Dialog geöffnet"); }}>
                          <Upload className="h-4 w-4 mr-2" />
                          Belege hochladen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDuplicate(expense.id, e)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                        {(expense.status === "draft" || expense.status === "rejected") && (
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => handleDelete(expense.id, e)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
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
