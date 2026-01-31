import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
} from "lucide-react";

const bankAccountData = {
  id: "BNK-001",
  name: "Geschäftskonto CHF",
  type: "Kontokorrent",
  currency: "CHF",
  status: "active" as const,
  bank: {
    name: "Zürcher Kantonalbank",
    bic: "ZKBKCHZZ80A",
    clearingNr: "700",
  },
  iban: "CH93 0076 2011 6238 5295 7",
  accountNumber: "1162-3852.957",
  balance: 125680.45,
  availableBalance: 125680.45,
  lastSync: "2024-01-18T14:30:00",
  bookingAccount: "1020 Bank",
  transactions: [
    { id: "TRX-001", date: "2024-01-18", description: "Zahlung Kunde Meier AG", amount: 15420.00, type: "credit", reference: "RE-2024-0089" },
    { id: "TRX-002", date: "2024-01-17", description: "Lieferant Schmidt GmbH", amount: -8540.25, type: "debit", reference: "ER-2024-0156" },
    { id: "TRX-003", date: "2024-01-16", description: "Lohnzahlungen Januar", amount: -45680.00, type: "debit", reference: "LOHN-2024-01" },
    { id: "TRX-004", date: "2024-01-15", description: "Zahlung Kunde Weber", amount: 8920.50, type: "credit", reference: "RE-2024-0085" },
    { id: "TRX-005", date: "2024-01-15", description: "Miete Werkstatt", amount: -4500.00, type: "debit", reference: "MIETE-01" },
  ],
  monthlyStats: {
    income: 48560.50,
    expenses: 62720.25,
    transactionCount: 47,
  },
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Aktiv", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "inactive":
      return { label: "Inaktiv", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    case "blocked":
      return { label: "Gesperrt", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
};

export default function BankAccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusConfig = getStatusConfig(bankAccountData.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/bank-accounts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{bankAccountData.name}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {bankAccountData.bank.name} • {bankAccountData.iban}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchronisieren
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Kontoauszug
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Einstellungen
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kontostand</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(bankAccountData.balance)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Verfügbar: {formatCurrency(bankAccountData.availableBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eingänge (Monat)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{formatCurrency(bankAccountData.monthlyStats.income)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ausgänge (Monat)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{formatCurrency(bankAccountData.monthlyStats.expenses)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bankAccountData.monthlyStats.transactionCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Dieser Monat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transaktionen */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Letzte Transaktionen</CardTitle>
                  <CardDescription>Aktuelle Kontobewegungen</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/bank-import")}>
                  Alle anzeigen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead>Referenz</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccountData.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.date).toLocaleDateString("de-CH")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.type === "credit" ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                          {tx.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.reference}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "credit" ? "+" : ""}{formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kontodaten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bankverbindung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Bank</p>
                <p className="font-medium">{bankAccountData.bank.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">IBAN</p>
                <p className="font-medium font-mono">{bankAccountData.iban}</p>
              </div>
              <div>
                <p className="text-muted-foreground">BIC/SWIFT</p>
                <p className="font-medium font-mono">{bankAccountData.bank.bic}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Clearing-Nr.</p>
                <p className="font-medium">{bankAccountData.bank.clearingNr}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Buchungskonto</p>
                <p className="font-medium">{bankAccountData.bookingAccount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Synchronisation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Synchronisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Letzte Aktualisierung</p>
                <p className="font-medium">
                  {new Date(bankAccountData.lastSync).toLocaleString("de-CH")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Format</p>
                <p className="font-medium">camt.054 (ISO 20022)</p>
              </div>
            </CardContent>
          </Card>

          {/* Aktionen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Zahlung erfassen
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/bank-import")}>
                <FileText className="h-4 w-4 mr-2" />
                Bank-Import
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/sepa-payments")}>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                SEPA-Zahlungen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
