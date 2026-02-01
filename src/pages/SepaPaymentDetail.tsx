import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Send, CheckCircle, Clock, FileText, Building2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const paymentData = {
  id: "1",
  type: "credit-transfer" as const,
  reference: "SEPA-2024-0089",
  recipient: "Software AG",
  recipientAddress: "Musterstrasse 123, 8000 Zürich",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "COBADEFFXXX",
  amount: 2500.0,
  currency: "EUR",
  purpose: "Rechnung ER-2024-044",
  executionDate: "05.02.2024",
  createdAt: "01.02.2024",
  createdBy: "Anna Schmidt",
  status: "pending" as const,
  linkedDocument: "ER-2024-044",
  bankAccount: "UBS Geschäftskonto (CH93 0076 2011 6238 5295 7)",
  urgency: "normal",
  endToEndId: "E2E-2024-0089-001",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  executed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabels = {
  draft: "Entwurf",
  pending: "Ausstehend",
  executed: "Ausgeführt",
  failed: "Fehlgeschlagen",
  cancelled: "Storniert",
};

const typeLabels = {
  "credit-transfer": "SEPA-Überweisung",
  "direct-debit": "SEPA-Lastschrift",
};

export default function SepaPaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{paymentData.reference}</h1>
            <Badge className={statusStyles[paymentData.status]}>
              {statusLabels[paymentData.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">{typeLabels[paymentData.type]}</p>
        </div>
        <div className="flex gap-2">
          {paymentData.status === "pending" && (
            <Button variant="destructive" className="gap-2">
              Stornieren
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            SEPA-XML
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Empfänger
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{paymentData.recipient}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{paymentData.recipientAddress}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">IBAN</p>
                  <p className="font-mono font-medium">{paymentData.iban}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BIC</p>
                  <p className="font-mono font-medium">{paymentData.bic}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Zahlungsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Betrag</p>
                  <p className="text-3xl font-bold text-destructive">
                    -{paymentData.currency} {paymentData.amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ausführungsdatum</p>
                  <p className="font-medium">{paymentData.executionDate}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Verwendungszweck</p>
                <p className="font-medium">{paymentData.purpose}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">End-to-End-ID</p>
                  <p className="font-mono text-sm">{paymentData.endToEndId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dringlichkeit</p>
                  <p className="font-medium capitalize">{paymentData.urgency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Absender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-muted-foreground">Bankkonto</p>
                <p className="font-medium">{paymentData.bankAccount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {paymentData.status === "pending" ? (
                  <Clock className="h-8 w-8 text-warning" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-success" />
                )}
                <div>
                  <p className="font-medium">{statusLabels[paymentData.status]}</p>
                  <p className="text-sm text-muted-foreground">
                    Ausführung am {paymentData.executionDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verknüpfter Beleg</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentData.linkedDocument ? (
                <Button variant="outline" className="w-full gap-2" onClick={() => navigate(`/purchase-invoices/${paymentData.linkedDocument}`)}>
                  <FileText className="h-4 w-4" />
                  {paymentData.linkedDocument}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Kein Beleg verknüpft</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Protokoll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-warning mt-2" />
                <div>
                  <p className="text-sm font-medium">Zur Ausführung freigegeben</p>
                  <p className="text-xs text-muted-foreground">02.02.2024 14:30</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2" />
                <div>
                  <p className="text-sm font-medium">Erstellt von {paymentData.createdBy}</p>
                  <p className="text-xs text-muted-foreground">{paymentData.createdAt} 10:15</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
