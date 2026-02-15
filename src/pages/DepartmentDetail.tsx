import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Building2, Users, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function DepartmentDetail() {
  const { id } = useParams();

  const { data: department, isLoading, error } = useQuery({
    queryKey: ["/departments", id],
    queryFn: () => api.get<any>(`/departments/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Abteilung nicht gefunden</p>
        <Link to="/departments" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const employees = department.employees || [];
  const manager = department.manager || department.head;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/departments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{department.name}</h1>
            <Badge variant="outline">{employees.length} Mitarbeiter</Badge>
          </div>
          <p className="text-muted-foreground">{department.description || "Keine Beschreibung"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mitarbeiter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees.length > 0 ? (
                <div className="space-y-3">
                  {employees.map((emp: any) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {(emp.firstName || "?")[0]}{(emp.lastName || "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link to={`/hr/${emp.id}`} className="font-medium hover:text-primary">
                            {emp.firstName} {emp.lastName}
                          </Link>
                          <p className="text-sm text-muted-foreground">{emp.position || "Keine Position"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {emp.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{emp.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Keine Mitarbeiter in dieser Abteilung</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Abteilungsleiter</span>
                <span className="font-medium">
                  {manager ? `${manager.firstName} ${manager.lastName}` : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mitarbeiteranzahl</span>
                <span className="font-medium">{employees.length}</span>
              </div>
              {department.costCenter && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kostenstelle</span>
                  <span className="font-medium">{department.costCenter}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
