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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

interface Position {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface DocumentFormProps {
  type: "quote" | "invoice";
  editMode?: boolean;
  initialData?: any;
}

const mockCustomers = [
  { id: "1", name: "TechStart GmbH", contact: "Maria Weber", email: "m.weber@techstart.de" },
  { id: "2", name: "Müller & Partner GmbH", contact: "Stefan Müller", email: "s.mueller@mueller-partner.de" },
  { id: "3", name: "Digital Solutions AG", contact: "Thomas Müller", email: "t.mueller@digital.de" },
  { id: "4", name: "Fashion Store GmbH", contact: "Lisa Schmidt", email: "l.schmidt@fashion.de" },
  { id: "5", name: "FinTech Solutions", contact: "Max Bauer", email: "m.bauer@fintech.de" },
];

const mockProducts = [
  { id: "1", name: "Frontend-Entwicklung", unit: "Stunden", price: 120 },
  { id: "2", name: "Backend-Entwicklung", unit: "Stunden", price: 130 },
  { id: "3", name: "UI/UX Design", unit: "Stunden", price: 110 },
  { id: "4", name: "Projektmanagement", unit: "Stunden", price: 100 },
  { id: "5", name: "Testing & QA", unit: "Stunden", price: 95 },
  { id: "6", name: "Consulting-Leistungen", unit: "Stunden", price: 150 },
  { id: "7", name: "Software-Lizenz (Jahres)", unit: "Stück", price: 299 },
  { id: "8", name: "Schulung", unit: "Tage", price: 1200 },
  { id: "9", name: "Support-Pauschale", unit: "Pauschal", price: 500 },
];

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
  const [paymentDays, setPaymentDays] = useState("14");

  const isQuote = type === "quote";
  const title = isQuote ? "Neues Angebot" : "Neue Rechnung";
  const backPath = isQuote ? "/quotes" : "/invoices";

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.contact.toLowerCase().includes(customerSearch.toLowerCase())
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
    };
    setPositions([...positions, newPosition]);
  };

  const subtotal = positions.reduce((sum, pos) => sum + pos.total, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const handleSave = (asDraft: boolean) => {
    // In real app, this would save to backend
    console.log("Saving document:", {
      type,
      customer: selectedCustomer,
      positions,
      notes,
      validDays,
      paymentDays,
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
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">
              {isQuote ? "Erstellen Sie ein neues Angebot" : "Erstellen Sie eine neue Rechnung"}
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
                          placeholder="Kunde suchen..."
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
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {customer.contact} • {customer.email}
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
                            <span className="font-medium">€{product.price.toFixed(2)}</span>
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
                        <TableHead className="w-[40%]">Beschreibung</TableHead>
                        <TableHead className="w-[80px]">Menge</TableHead>
                        <TableHead className="w-[100px]">Einheit</TableHead>
                        <TableHead className="w-[120px]">Einzelpreis</TableHead>
                        <TableHead className="text-right">Gesamt</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
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
                              className="h-8 w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pos.unit}
                              onValueChange={(value) => updatePosition(pos.id, "unit", value)}
                            >
                              <SelectTrigger className="h-8 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Stück">Stück</SelectItem>
                                <SelectItem value="Stunden">Stunden</SelectItem>
                                <SelectItem value="Tage">Tage</SelectItem>
                                <SelectItem value="Pauschal">Pauschal</SelectItem>
                                <SelectItem value="Monat">Monat</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">€</span>
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
                          <TableCell className="text-right font-medium">
                            €{pos.total.toFixed(2)}
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
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MwSt. (19%)</span>
                      <span>€{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Gesamtbetrag (brutto)</span>
                      <span className="text-primary">€{total.toFixed(2)}</span>
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
                    : "z.B. Zahlungshinweise, Referenznummer..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
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
                  <Label>Gültigkeitsdauer (Tage)</Label>
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
                <div className="space-y-2">
                  <Label>Zahlungsziel (Tage)</Label>
                  <Select value={paymentDays} onValueChange={setPaymentDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Tage</SelectItem>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                      <SelectItem value="45">45 Tage</SelectItem>
                      <SelectItem value="60">60 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Projekt (optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p1">E-Commerce Plattform</SelectItem>
                    <SelectItem value="p2">Mobile App</SelectItem>
                    <SelectItem value="p3">CRM Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>MwSt.-Satz</Label>
                <Select defaultValue="19">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="19">19% (Standard)</SelectItem>
                    <SelectItem value="7">7% (Ermäßigt)</SelectItem>
                    <SelectItem value="0">0% (Steuerbefreit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kunde</span>
                <span className="font-medium">
                  {selectedCustomer?.name || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{positions.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Nettobetrag</span>
                <span className="font-semibold">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Bruttobetrag</span>
                <span className="text-primary">€{total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
