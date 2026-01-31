import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Download,
  Edit,
  FileText,
  Send,
  Calculator,
  AlertTriangle,
} from "lucide-react";

// Schweizer MwSt-Abrechnung gemäss ESTV
const vatReturnData = {
  id: "MWST-2024-Q1",
  period: "Q1 2024",
  periodStart: "2024-01-01",
  periodEnd: "2024-03-31",
  dueDate: "2024-05-31",
  status: "draft" as const,
  submittedAt: null as string | null,
  method: "vereinbart", // vereinbart oder vereinnahmt
  currency: "CHF",
  company: {
    name: "Müller Metallbau AG",
    uid: "CHE-123.456.789 MWST",
    address: "Industriestrasse 45, 8005 Zürich",
  },
  // Ziffer 200: Umsätze
  revenue: {
    total: 485000.00, // Ziffer 200
    exports: 45000.00, // Ziffer 220
    exemptServices: 12000.00, // Ziffer 230
    taxableBase: 428000.00, // Ziffer 299
  },
  // Ziffer 300: Steuerberechnung
  taxCalculation: {
    normal: { rate: 8.1, base: 385000.00, tax: 31185.00 }, // Ziffer 302
    reduced: { rate: 2.6, base: 28000.00, tax: 728.00 }, // Ziffer 312
    accommodation: { rate: 3.8, base: 15000.00, tax: 570.00 }, // Ziffer 342
    totalTax: 32483.00, // Ziffer 399
  },
  // Ziffer 400: Vorsteuer
  inputTax: {
    materialServices: 18540.00, // Ziffer 400
    investments: 4200.00, // Ziffer 405
    corrections: 0, // Ziffer 410
    totalInputTax: 22740.00, // Ziffer 479
  },
  // Ergebnis
  result: {
    payable: 9743.00, // Ziffer 500 (Steuerschuld - Vorsteuer)
    refund: 0,
  },
  previousPeriods: [
    { period: "Q4 2023", payable: 8920.00, status: "paid" },
    { period: "Q3 2023", payable: 11250.00, status: "paid" },
    { period: "Q2 2023", payable: 9680.00, status: "paid" },
  ],
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "submitted":
      return { label: "Eingereicht", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
    case "paid":
      return { label: "Bezahlt", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "draft":
      return { label: "Entwurf", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    case "overdue":
      return { label: "Überfällig", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
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

export default function VatReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusConfig = getStatusConfig(vatReturnData.status);
  const daysUntilDue = Math.ceil((new Date(vatReturnData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/vat-returns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">MwSt-Abrechnung {vatReturnData.period}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {vatReturnData.company.uid}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            PDF Export
          </Button>
          {vatReturnData.status === "draft" && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              An ESTV senden
            </Button>
          )}
        </div>
      </div>

      {/* Fälligkeit */}
      {vatReturnData.status === "draft" && (
        <Card className={daysUntilDue < 14 ? "border-yellow-500" : ""}>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              {daysUntilDue < 14 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  Fälligkeit: {new Date(vatReturnData.dueDate).toLocaleDateString("de-CH")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Noch {daysUntilDue} Tage bis zur Einreichungsfrist
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zusammenfassung */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Umsatz (Ziff. 200)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(vatReturnData.revenue.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Geschuldete MwSt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(vatReturnData.taxCalculation.totalTax)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vorsteuer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">-{formatCurrency(vatReturnData.inputTax.totalInputTax)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {vatReturnData.result.payable > 0 ? "Zu zahlen" : "Guthaben"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${vatReturnData.result.payable > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(vatReturnData.result.payable || vatReturnData.result.refund)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptformular */}
        <div className="lg:col-span-2 space-y-6">
          {/* Umsätze */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                I. Umsätze
              </CardTitle>
              <CardDescription>Ziffer 200-299</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>200</TableCell>
                    <TableCell>Total Umsätze (inkl. Eigenverbrauch)</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(vatReturnData.revenue.total)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>220</TableCell>
                    <TableCell>Steuerbefreite Leistungen (Exporte)</TableCell>
                    <TableCell className="text-right">-{formatCurrency(vatReturnData.revenue.exports)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>230</TableCell>
                    <TableCell>Von der Steuer ausgenommene Leistungen</TableCell>
                    <TableCell className="text-right">-{formatCurrency(vatReturnData.revenue.exemptServices)}</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/50">
                    <TableCell>299</TableCell>
                    <TableCell>Steuerbarer Gesamtumsatz</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.revenue.taxableBase)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Steuerberechnung */}
          <Card>
            <CardHeader>
              <CardTitle>II. Steuerberechnung</CardTitle>
              <CardDescription>Ziffer 300-399</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ziff.</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Umsatz</TableHead>
                    <TableHead className="text-right">Satz</TableHead>
                    <TableHead className="text-right">Steuer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>302</TableCell>
                    <TableCell>Normalsatz</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.normal.base)}</TableCell>
                    <TableCell className="text-right">{vatReturnData.taxCalculation.normal.rate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.normal.tax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>312</TableCell>
                    <TableCell>Reduzierter Satz</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.reduced.base)}</TableCell>
                    <TableCell className="text-right">{vatReturnData.taxCalculation.reduced.rate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.reduced.tax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>342</TableCell>
                    <TableCell>Beherbergung</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.accommodation.base)}</TableCell>
                    <TableCell className="text-right">{vatReturnData.taxCalculation.accommodation.rate}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.accommodation.tax)}</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/50">
                    <TableCell>399</TableCell>
                    <TableCell colSpan={3}>Total geschuldete Steuer</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.totalTax)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Vorsteuer */}
          <Card>
            <CardHeader>
              <CardTitle>III. Vorsteuer</CardTitle>
              <CardDescription>Ziffer 400-479</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>400</TableCell>
                    <TableCell>Vorsteuer auf Material- und Dienstleistungen</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.inputTax.materialServices)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>405</TableCell>
                    <TableCell>Vorsteuer auf Investitionen</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.inputTax.investments)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>410</TableCell>
                    <TableCell>Einlageentsteuerung / Korrekturen</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.inputTax.corrections)}</TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-muted/50">
                    <TableCell>479</TableCell>
                    <TableCell>Total Vorsteuer</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.inputTax.totalInputTax)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Abrechnung */}
          <Card>
            <CardHeader>
              <CardTitle>IV. Steuerforderung / Guthaben</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>399</TableCell>
                    <TableCell>Geschuldete Steuer</TableCell>
                    <TableCell className="text-right">{formatCurrency(vatReturnData.taxCalculation.totalTax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>479</TableCell>
                    <TableCell>Vorsteuer</TableCell>
                    <TableCell className="text-right text-green-600">-{formatCurrency(vatReturnData.inputTax.totalInputTax)}</TableCell>
                  </TableRow>
                  <Separator />
                  <TableRow className="text-lg font-bold">
                    <TableCell>500</TableCell>
                    <TableCell>
                      {vatReturnData.result.payable > 0 ? "Zu bezahlender Betrag" : "Guthaben"}
                    </TableCell>
                    <TableCell className={`text-right ${vatReturnData.result.payable > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(vatReturnData.result.payable || vatReturnData.result.refund)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Periode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Abrechnungsperiode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Von</span>
                <span>{new Date(vatReturnData.periodStart).toLocaleDateString("de-CH")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bis</span>
                <span>{new Date(vatReturnData.periodEnd).toLocaleDateString("de-CH")}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Methode</span>
                <span className="capitalize">{vatReturnData.method}</span>
              </div>
            </CardContent>
          </Card>

          {/* Steuersätze Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schweizer MwSt-Sätze 2024</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Normalsatz</span>
                <Badge variant="outline">8.1%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Reduzierter Satz</span>
                <Badge variant="outline">2.6%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Sondersatz Beherbergung</span>
                <Badge variant="outline">3.8%</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Vorperioden */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vorperioden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vatReturnData.previousPeriods.map((period) => (
                <div key={period.period} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{period.period}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(period.payable)}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    {period.status === "paid" ? "Bezahlt" : period.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Aktionen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verknüpfungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/journal-entries")}>
                <FileText className="h-4 w-4 mr-2" />
                Buchungsjournal
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/invoices")}>
                <FileText className="h-4 w-4 mr-2" />
                Ausgangsrechnungen
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/purchase-invoices")}>
                <FileText className="h-4 w-4 mr-2" />
                Eingangsrechnungen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
