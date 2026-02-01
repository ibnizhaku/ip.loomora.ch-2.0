import { HelpCircle, Book, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const helpTopics = [
  { title: "Erste Schritte", description: "Einführung in das System", icon: Book },
  { title: "Rechnungswesen", description: "Buchhaltung und Finanzen", icon: HelpCircle },
  { title: "HR & Personal", description: "Mitarbeiterverwaltung", icon: HelpCircle },
  { title: "Produktion", description: "Stücklisten und Fertigung", icon: HelpCircle },
];

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Hilfe & Support</h1>
        <p className="text-muted-foreground">Dokumentation und Kontaktmöglichkeiten</p>
      </div>

      <div className="relative max-w-xl">
        <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Suchen Sie nach Hilfe..." className="pl-10 h-12" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {helpTopics.map((topic) => (
          <Card key={topic.title} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <topic.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{topic.title}</CardTitle>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Mail className="h-4 w-4" />
              support@example.com
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <ExternalLink className="h-4 w-4" />
              Dokumentation öffnen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Wie erstelle ich eine Rechnung?</p>
              <p className="text-sm text-muted-foreground">Gehen Sie zu Verkauf → Rechnungen → Neue Rechnung</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium">Wie buche ich eine Zahlung?</p>
              <p className="text-sm text-muted-foreground">Öffnen Sie die Rechnung und klicken Sie auf "Zahlung erfassen"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
