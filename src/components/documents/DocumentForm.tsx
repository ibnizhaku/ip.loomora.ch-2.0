import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Building2,
  Package,
  Calendar,
  Save,
  Send,
  Eye,
  QrCode,
  CreditCard,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Position {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  vatRate: number;
}

interface DocumentFormProps {
  type: "quote" | "invoice";
  editMode?: boolean;
  initialData?: any;
}

const mockCustomers = [
  { id: "1", name: "TechStart GmbH", contact: "Maria Weber", email: "m.weber@techstart.ch", address: "Industriestrasse 15, 8005 Zürich", uid: "CHE-123.456.789" },
  { id: "2", name: "Müller & Partner AG", contact: "Stefan Müller", email: "s.mueller@mueller-partner.ch", address: "Bahnhofstrasse 42, 3011 Bern", uid: "CHE-987.654.321" },
  { id: "3", name: "Digital Solutions AG", contact: "Thomas Meier", email: "t.meier@digital.ch", address: "Seefeldstrasse 88, 8008 Zürich", uid: "CHE-456.789.012" },
  { id: "4", name: "Metallbau Schweizer AG", contact: "Hans Schweizer", email: "h.schweizer@metallbau.ch", address: "Werkstrasse 22, 4500 Solothurn", uid: "CHE-111.222.333" },
  { id: "5", name: "Precision Tech Sàrl", contact: "Pierre Dubois", email: "p.dubois@precision.ch", address: "Rue de l'Industrie 5, 1000 Lausanne", uid: "CHE-444.555.666" },
];

const mockProducts = [
  { id: "1", name: "Frontend-Entwicklung", unit: "Stunden", price: 150 },
  { id: "2", name: "Backend-Entwicklung", unit: "Stunden", price: 160 },
  { id: "3", name: "UI/UX Design", unit: "Stunden", price: 140 },
  { id: "4", name: "Projektmanagement", unit: "Stunden", price: 130 },
  { id: "5", name: "Testing & QA", unit: "Stunden", price: 120 },
  { id: "6", name: "Consulting-Leistungen", unit: "Stunden", price: 180 },
  { id: "7", name: "Software-Lizenz (Jahres)", unit: "Stück", price: 450 },
  { id: "8", name: "Schulung", unit: "Tage", price: 1500 },
  { id: "9", name: "Support-Pauschale", unit: "Pauschal", price: 600 },
  { id: "10", name: "Metallkonstruktion", unit: "Stunden", price: 95 },
  { id: "11", name: "Schweissarbeiten", unit: "Stunden", price: 110 },
  { id: "12", name: "Montage vor Ort", unit: "Stunden", price: 105 },
];

// Swiss VAT rates (MWST-Sätze)
const vatRates = [
  { value: "8.1", label: "8.1% (Normalsatz)", rate: 8.1 },
  { value: "2.6", label: "2.6% (Reduzierter Satz)", rate: 2.6 },
  { value: "3.8", label: "3.8% (Beherbergung)", rate: 3.8 },
  { value: "0", label: "0% (Steuerbefreit)", rate: 0 },
];

// Swiss bank account (example)
const companyBankAccount = {
  name: "Beispiel AG",
  iban: "CH93 0076 2011 6238 5295 7",
  qrIban: "CH44 3199 9123 0008 8901 2",
  bic: "POFICHBEXXX",
  bank: "PostFinance AG",
  address: "Musterstrasse 1, 8000 Zürich",
  uid: "CHE-123.456.789 MWST",
};

export function DocumentForm({ type, editMode = false, initialData }: DocumentFormProps) {
  const navigate = useNavigate();
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [paymentDays, setPaymentDays] = useState("30");
  const [defaultVatRate, setDefaultVatRate] = useState("8.1");
  const [useQrInvoice, setUseQrInvoice] = useState(true);
  const [qrReference, setQrReference] = useState("");
  const [esrParticipant, setEsrParticipant] = useState("");

  const isQuote = type === "quote";
  const title = isQuote ? "Neues Angebot" : "Neue Rechnung";
  const backPath = isQuote ? "/quotes" : "/invoices";

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.contact.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.uid.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addPosition = (product: typeof mockProducts[0]) => {
    const newPosition: Position = {
      id: Date.now(),
      description: product.name,
      quantity: 1,
      unit: product.unit,
      price: product.price,
      total: product.price,
      vatRate: parseFloat(defaultVatRate),
    };
    setPositions([...positions, newPosition]);
    setProductDialogOpen(false);
  };

  const updatePosition = (id: number, field: keyof Position, value: string | number) => {
    setPositions(
      positions.map((pos) => {
        if (pos.id === id) {
          const updated = { ...pos, [field]: value };
          if (field === "quantity" || field === "price") {
            updated.total = updated.quantity * updated.price;
          }
          return updated;
        }
        return pos;
      })
    );
  };

  const removePosition = (id: number) => {
    setPositions(positions.filter((pos) => pos.id !== id));
  };

  const addCustomPosition = () => {
    const newPosition: Position = {
      id: Date.now(),
      description: "",
      quantity: 1,
      unit: "Stück",
      price: 0,
      total: 0,
      vatRate: parseFloat(defaultVatRate),
    };
    setPositions([...positions, newPosition]);
  };

  // Calculate totals with different VAT rates
  const subtotal = positions.reduce((sum, pos) => sum + pos.total, 0);
  
  // Group VAT by rate
  const vatByRate = positions.reduce((acc, pos) => {
    const rate = pos.vatRate;
    if (!acc[rate]) acc[rate] = 0;
    acc[rate] += pos.total * (rate / 100);
    return acc;
  }, {} as Record<number, number>);
  
  const totalVat = Object.values(vatByRate).reduce((sum, vat) => sum + vat, 0);
  const total = subtotal + totalVat;

  // Generate QR Reference (simplified - in production would use modulo 10 recursive)
  const generateQrReference = () => {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `00 00000 00000 ${timestamp.slice(0,5)} ${timestamp.slice(5)} ${random}0`;
  };

  const handleSave = (asDraft: boolean) => {
    console.log("Saving document:", {
      type,
      customer: selectedCustomer,
      positions,
      notes,
      validDays,
      paymentDays,
      useQrInvoice,
      qrReference: qrReference || generateQrReference(),
      asDraft,
    });
    navigate(backPath);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{title}</h1>
              {!isQuote && useQrInvoice && (
                <Badge variant="outline" className="gap-1">
                  <QrCode className="h-3 w-3" />
                  QR-Rechnung
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isQuote ? "Erstellen Sie ein neues Angebot" : "Erstellen Sie eine neue Rechnung (Swiss QR-Invoice)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(true)}>
            <Save className="h-4 w-4 mr-2" />
            Als Entwurf speichern
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button onClick={() => handleSave(false)}>
            <Send className="h-4 w-4 mr-2" />
            {isQuote ? "Angebot senden" : "Rechnung senden"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Kunde</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCustomer.contact} • {selectedCustomer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCustomer.address}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        UID: {selectedCustomer.uid}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomerDialogOpen(true)}
                  >
                    Ändern
                  </Button>
                </div>
              ) : (
                <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Search className="h-4 w-4" />
                      Kunde auswählen...
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Kunde auswählen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Name, Kontakt oder UID suchen..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setCustomerDialogOpen(false);
                            }}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {customer.contact} • {customer.address}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                {customer.uid}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Positions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Positionen</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addCustomPosition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Freie Position
                </Button>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Produkt hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Produkt auswählen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Produkt suchen..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => addPosition(product)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.unit}</p>
                              </div>
                            </div>
                            <span className="font-medium">CHF {product.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Positionen hinzugefügt</p>
                  <p className="text-sm">
                    Fügen Sie Produkte oder freie Positionen hinzu
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[35%]">Beschreibung</TableHead>
                        <TableHead className="w-[60px]">Menge</TableHead>
                        <TableHead className="w-[80px]">Einheit</TableHead>
                        <TableHead className="w-[100px]">Einzelpreis</TableHead>
                        <TableHead className="w-[80px]">MwSt.</TableHead>
                        <TableHead className="text-right">Gesamt</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((pos) => (
                        <TableRow key={pos.id}>
                          <TableCell>
                            <Input
                              value={pos.description}
                              onChange={(e) =>
                                updatePosition(pos.id, "description", e.target.value)
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={pos.quantity}
                              onChange={(e) =>
                                updatePosition(pos.id, "quantity", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-14"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pos.unit}
                              onValueChange={(value) => updatePosition(pos.id, "unit", value)}
                            >
                              <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Stück">Stück</SelectItem>
                                <SelectItem value="Stunden">Std.</SelectItem>
                                <SelectItem value="Tage">Tage</SelectItem>
                                <SelectItem value="Pauschal">Pausch.</SelectItem>
                                <SelectItem value="Monat">Monat</SelectItem>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lfm">lfm</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={pos.price}
                                onChange={(e) =>
                                  updatePosition(pos.id, "price", parseFloat(e.target.value) || 0)
                                }
                                className="h-8 w-20"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pos.vatRate.toString()}
                              onValueChange={(value) => updatePosition(pos.id, "vatRate", parseFloat(value))}
                            >
                              <SelectTrigger className="h-8 w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {vatRates.map((vat) => (
                                  <SelectItem key={vat.value} value={vat.value}>
                                    {vat.rate}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            CHF {pos.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removePosition(pos.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zwischensumme (netto)</span>
                      <span>CHF {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* VAT breakdown by rate */}
                    {Object.entries(vatByRate).map(([rate, amount]) => (
                      amount > 0 && (
                        <div key={rate} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">MwSt. {rate}%</span>
                          <span>CHF {amount.toFixed(2)}</span>
                        </div>
                      )
                    ))}
                    
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Gesamtbetrag (brutto)</span>
                      <span className="text-primary">CHF {total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Bemerkungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={
                  isQuote
                    ? "z.B. Zahlungsbedingungen, besondere Hinweise..."
                    : "z.B. Zahlungshinweise, Referenznummer, Skonto..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Standard: Zahlbar innert {paymentDays} Tagen netto
              </p>
            </CardContent>
          </Card>

          {/* QR Invoice Preview (for invoices) */}
          {!isQuote && useQrInvoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR-Rechnung Vorschau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Empfangsschein */}
                    <div className="border-r pr-4">
                      <p className="text-xs font-bold mb-2">Empfangsschein</p>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold">Konto / Zahlbar an</p>
                        <p className="font-mono">{companyBankAccount.qrIban}</p>
                        <p>{companyBankAccount.name}</p>
                        <p>{companyBankAccount.address}</p>
                        
                        {qrReference && (
                          <>
                            <p className="font-semibold mt-2">Referenz</p>
                            <p className="font-mono text-[10px]">{qrReference}</p>
                          </>
                        )}
                        
                        <p className="font-semibold mt-2">Zahlbar durch</p>
                        {selectedCustomer ? (
                          <>
                            <p>{selectedCustomer.name}</p>
                            <p>{selectedCustomer.address}</p>
                          </>
                        ) : (
                          <p className="text-muted-foreground italic">Kunde auswählen</p>
                        )}
                        
                        <div className="mt-3 pt-2 border-t">
                          <p className="font-semibold">Währung / Betrag</p>
                          <div className="flex gap-4">
                            <span>CHF</span>
                            <span className="font-mono">{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Zahlteil */}
                    <div className="pl-4">
                      <p className="text-xs font-bold mb-2">Zahlteil</p>
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="space-y-1 text-xs flex-1">
                          <p className="font-semibold">Konto / Zahlbar an</p>
                          <p className="font-mono">{companyBankAccount.qrIban}</p>
                          <p>{companyBankAccount.name}</p>
                          <p>{companyBankAccount.address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1 text-xs">
                        {qrReference && (
                          <>
                            <p className="font-semibold">Referenz</p>
                            <p className="font-mono">{qrReference}</p>
                          </>
                        )}
                        
                        <p className="font-semibold mt-2">Zusätzliche Informationen</p>
                        <p>{isQuote ? "Angebot" : "Rechnung"} {selectedCustomer?.name || ""}</p>
                        
                        <p className="font-semibold mt-2">Zahlbar durch</p>
                        {selectedCustomer ? (
                          <>
                            <p>{selectedCustomer.name}</p>
                            <p>{selectedCustomer.address}</p>
                          </>
                        ) : (
                          <p className="text-muted-foreground italic">—</p>
                        )}
                        
                        <div className="mt-3 pt-2 border-t">
                          <p className="font-semibold">Währung / Betrag</p>
                          <div className="flex gap-4">
                            <span>CHF</span>
                            <span className="font-mono font-bold">{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Swiss QR-Invoice nach ISO 20022 Standard. Der QR-Code wird bei der Rechnungserstellung generiert.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dokumentdatum</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              {isQuote ? (
                <div className="space-y-2">
                  <Label>Gültigkeitsdauer</Label>
                  <Select value={validDays} onValueChange={setValidDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                      <SelectItem value="60">60 Tage</SelectItem>
                      <SelectItem value="90">90 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Zahlungsziel</Label>
                    <Select value={paymentDays} onValueChange={setPaymentDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Tage netto</SelectItem>
                        <SelectItem value="20">20 Tage netto</SelectItem>
                        <SelectItem value="30">30 Tage netto</SelectItem>
                        <SelectItem value="45">45 Tage netto</SelectItem>
                        <SelectItem value="60">60 Tage netto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>QR-Rechnung</Label>
                      <p className="text-xs text-muted-foreground">Swiss QR-Invoice aktivieren</p>
                    </div>
                    <Switch checked={useQrInvoice} onCheckedChange={setUseQrInvoice} />
                  </div>

                  {useQrInvoice && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        QR-Referenz
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-xs">
                              26-stellige QR-Referenz (QRR) oder 25-stellige Creditor Reference (SCOR).
                              Wird automatisch generiert wenn leer.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input 
                        value={qrReference}
                        onChange={(e) => setQrReference(e.target.value)}
                        placeholder="Automatisch generieren"
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label>Standard MwSt.-Satz</Label>
                <Select value={defaultVatRate} onValueChange={setDefaultVatRate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vatRates.map((vat) => (
                      <SelectItem key={vat.value} value={vat.value}>
                        {vat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Projekt (optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1">E-Commerce Plattform</SelectItem>
                    <SelectItem value="p2">Metallbau Projekt X</SelectItem>
                    <SelectItem value="p3">CRM Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Info */}
          {!isQuote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Bankverbindung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{companyBankAccount.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN</span>
                  <span className="font-mono text-xs">{companyBankAccount.iban}</span>
                </div>
                {useQrInvoice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">QR-IBAN</span>
                    <span className="font-mono text-xs">{companyBankAccount.qrIban}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BIC</span>
                  <span className="font-medium">{companyBankAccount.bic}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MWST-Nr.</span>
                  <span className="font-mono text-xs">{companyBankAccount.uid}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kunde</span>
                <span className="font-medium truncate max-w-[150px]">
                  {selectedCustomer?.name || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{positions.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Netto</span>
                <span className="font-medium">CHF {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">MwSt.</span>
                <span className="font-medium">CHF {totalVat.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Brutto</span>
                <span className="text-primary">CHF {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
