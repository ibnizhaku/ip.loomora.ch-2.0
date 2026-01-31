import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Building2,
  Clock,
  CheckCircle2,
  Send,
  Euro,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const reminders = [
  { id: "MA-2024-0028", invoice: "RE-2024-0156", customer: "Müller & Partner GmbH", dueDate: "19.01.2024", amount: 8262.55, level: 2, lastReminder: "27.01.2024", daysOverdue: 12 },
  { id: "MA-2024-0027", invoice: "RE-2024-0148", customer: "Innovation Labs", dueDate: "15.01.2024", amount: 4580.00, level: 3, lastReminder: "25.01.2024", daysOverdue: 16 },
  { id: "MA-2024-0026", invoice: "RE-2024-0142", customer: "Weber Elektronik", dueDate: "22.01.2024", amount: 2890.00, level: 1, lastReminder: "28.01.2024", daysOverdue: 9 },
  { id: "MA-2024-0025", invoice: "RE-2024-0135", customer: "StartUp Solutions", dueDate: "10.01.2024", amount: 12500.00, level: 3, lastReminder: "20.01.2024", daysOverdue: 21 },
  { id: "MA-2024-0024", invoice: "RE-2024-0128", customer: "Digital Consulting", dueDate: "18.01.2024", amount: 3450.00, level: 2, lastReminder: "26.01.2024", daysOverdue: 13 },
];

const overdueInvoices = [
  { id: "RE-2024-0160", customer: "Tech Industries", dueDate: "25.01.2024", amount: 5680.00, daysOverdue: 6, remindersSent: 0 },
  { id: "RE-2024-0158", customer: "Media Solutions", dueDate: "23.01.2024", amount: 1890.00, daysOverdue: 8, remindersSent: 0 },
];

const levelConfig: Record<number, { label: string; color: string }> = {
  1: { label: "1. Mahnung", color: "bg-warning/10 text-warning" },
  2: { label: "2. Mahnung", color: "bg-orange-500/10 text-orange-500" },
  3: { label: "3. Mahnung", color: "bg-destructive/10 text-destructive" },
};

const stats = [
  { title: "Offene Forderungen", value: "€31.682", color: "text-destructive" },
  { title: "Mahnungen aktiv", value: "5", color: "text-warning" },
  { title: "Ø Überfälligkeit", value: "14 Tage", color: "text-muted-foreground" },
  { title: "Inkasso-Fälle", value: "1", color: "text-destructive" },
];

const Reminders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mahnwesen</h1>
          <p className="text-muted-foreground">Verwalten Sie überfällige Rechnungen und Mahnungen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Sammel-Mahnung
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Mahnung erstellen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert */}
      {overdueInvoices.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-6 w-6 text-warning" />
            <div className="flex-1">
              <p className="font-semibold">Neue überfällige Rechnungen</p>
              <p className="text-sm text-muted-foreground">
                {overdueInvoices.length} Rechnungen sind überfällig und wurden noch nicht gemahnt.
              </p>
            </div>
            <Button size="sm">
              Mahnungen erstellen
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Aktive Mahnungen</TabsTrigger>
          <TabsTrigger value="overdue">Überfällig ohne Mahnung</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Mahnungen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahnung</TableHead>
                    <TableHead>Rechnung</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Fällig seit</TableHead>
                    <TableHead className="text-right">Offener Betrag</TableHead>
                    <TableHead>Mahnstufe</TableHead>
                    <TableHead>Letzte Mahnung</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reminders.map((reminder) => {
                    const level = levelConfig[reminder.level];
                    return (
                      <TableRow key={reminder.id}>
                        <TableCell className="font-medium">{reminder.id}</TableCell>
                        <TableCell>
                          <Link to={`/invoices/${reminder.invoice}`} className="hover:text-primary">
                            {reminder.invoice}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {reminder.customer}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-destructive">
                            <Clock className="h-4 w-4" />
                            {reminder.daysOverdue} Tage
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          €{reminder.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={level.color}>{level.label}</Badge>
                        </TableCell>
                        <TableCell>{reminder.lastReminder}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Nächste Mahnung senden
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Phone className="h-4 w-4 mr-2" />
                                Anrufen
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Zahlungsfrist verlängern
                              </DropdownMenuItem>
                              <DropdownMenuItem>Zahlung erfassen</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">An Inkasso übergeben</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnung</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Fälligkeitsdatum</TableHead>
                    <TableHead>Überfällig seit</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link to={`/invoices/${invoice.id}`} className="font-medium hover:text-primary">
                          {invoice.id}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge className="bg-destructive/10 text-destructive">
                          {invoice.daysOverdue} Tage
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Mahnen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Mahnverlauf wird hier angezeigt
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reminders;
