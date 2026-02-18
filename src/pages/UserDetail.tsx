import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Shield, Key, Clock, CheckCircle2, XCircle, Mail, Smartphone, Settings, ShieldOff, Loader2, LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUser, useUsers } from "@/hooks/use-users";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { use2FAAdminReset } from "@/hooks/use-2fa";
import UserPermissionsWidget from "@/components/users/UserPermissionsWidget";
import TwoFactorSetupDialog from "@/components/auth/TwoFactorSetupDialog";

interface LoginHistoryEntry {
  id: string;
  datum: string;
  ip: string;
  geraet: string;
  ort?: string;
  status: 'erfolgreich' | 'fehlgeschlagen';
}

function useLoginHistory(userId: string) {
  return useQuery({
    queryKey: ['login-history', userId],
    queryFn: () => api.get<LoginHistoryEntry[]>(`/users/${userId}/login-history`),
    enabled: !!userId,
  });
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
};

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  pending: "Ausstehend",
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  user: "Benutzer",
  viewer: "Betrachter",
};

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: userData, isLoading } = useUser(id || "");
  const { data: loginHistory, isLoading: historyLoading } = useLoginHistory(id || "");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showEndSessionsDialog, setShowEndSessionsDialog] = useState(false);
  const adminResetMutation = use2FAAdminReset();

  const endSessionsMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post(`/users/${userId}/revoke-sessions`, {});
    },
    onSuccess: () => {
      toast.success("Alle Sitzungen beendet", {
        description: "Der Benutzer wurde aus allen aktiven Sitzungen abgemeldet."
      });
      setShowEndSessionsDialog(false);
    },
    onError: () => {
      toast.error("Fehler beim Beenden der Sitzungen");
    },
  });

  // Sync twoFactor state when userData loads
  useEffect(() => {
    if (userData) {
      setTwoFactorEnabled(userData.twoFactor ?? false);
    }
  }, [userData]);

  const userName = userData?.name || "–";
  const userEmail = userData?.email || "–";
  const userPhone = userData?.phone || "–";
  const userRole = userData?.role || "user";
  const userStatus = userData?.status || "active";
  const userLastLogin = userData?.lastLogin || "–";
  const userCreatedAt = userData?.createdAt || "–";
  const userEmployeeId = userData?.employeeId;
  const userEmployeeNumber = userData?.employeeNumber;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Benutzer nicht gefunden</p>
        <Button variant="outline" asChild>
          <Link to="/users">Zurück zur Übersicht</Link>
        </Button>
      </div>
    );
  }

  const handleResetPassword = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleToggle2FA = () => {
    setShow2FADialog(true);
  };

  const handleAdminReset2FA = async () => {
    if (!id) return;
    await adminResetMutation.mutateAsync(id);
    setTwoFactorEnabled(false);
  };

  const handleEndSessions = () => {
    setShowEndSessionsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{userName}</h1>
            <Badge className={statusColors[userStatus] || statusColors.active}>
              {statusLabels[userStatus] || userStatus}
            </Badge>
            <Badge variant="outline">{roleLabels[userRole] || userRole}</Badge>
          </div>
          <p className="text-muted-foreground">{userEmail}{userEmployeeNumber && ` • MA-Nr. ${userEmployeeNumber}`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetPassword}>
            <Key className="mr-2 h-4 w-4" />
            Passwort zurücksetzen
          </Button>
          <Button asChild>
            <Link to={`/users/${id}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Bearbeiten
            </Link>
          </Button>
        </div>
      </div>


      <div className="grid gap-6 md:grid-cols-2">
        {/* Benutzerdaten */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Benutzerprofil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {userName.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{userName}</p>
                <p className="text-muted-foreground">{roleLabels[userRole] || userRole}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{userEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>{userPhone}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              {userEmployeeId && (
                <div>
                  <p className="text-muted-foreground">Mitarbeiter-Nr.</p>
                  <Link to={`/hr/employees/${userEmployeeId}`} className="text-primary hover:underline">
                    {userEmployeeNumber || userEmployeeId}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p>{userCreatedAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sicherheit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Sicherheit</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Zwei-Faktor-Authentifizierung</p>
                  <p className="text-sm text-muted-foreground">Zusätzliche Sicherheit beim Login</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorEnabled ? (
                  <Badge className="bg-success/10 text-success">Aktiv</Badge>
                ) : (
                  <Badge variant="outline">Inaktiv</Badge>
                )}
                <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Letzter Login</p>
                  <p className="text-sm text-muted-foreground">{userLastLogin}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleResetPassword}>
                <Key className="mr-2 h-4 w-4" />
                Passwort ändern
              </Button>
              {twoFactorEnabled && (
                <Button variant="outline" className="flex-1 text-warning" onClick={handleAdminReset2FA} disabled={adminResetMutation.isPending}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  2FA zurücksetzen
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 text-destructive"
                onClick={handleEndSessions}
                disabled={endSessionsMutation.isPending}
              >
                {endSessionsMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Sitzungen beenden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <TwoFactorSetupDialog
        open={show2FADialog}
        onOpenChange={setShow2FADialog}
        isEnabled={twoFactorEnabled}
      />

      {/* Sitzungen beenden – Bestätigungsdialog */}
      <AlertDialog open={showEndSessionsDialog} onOpenChange={setShowEndSessionsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alle Sitzungen beenden?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Benutzer <strong>{userName}</strong> wird sofort aus allen aktiven Sitzungen abgemeldet und muss sich erneut anmelden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => id && endSessionsMutation.mutate(id)}
              disabled={endSessionsMutation.isPending}
            >
              {endSessionsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sitzungen beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Berechtigungen */}
      <UserPermissionsWidget userId={id || ""} userName={userName} />


      {/* Login-Historie */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Login-Historie</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zeitpunkt</TableHead>
                <TableHead>IP-Adresse</TableHead>
                <TableHead>Gerät / Browser</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : loginHistory && loginHistory.length > 0 ? (
                loginHistory.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.datum}</TableCell>
                    <TableCell className="font-mono text-sm">{l.ip}</TableCell>
                    <TableCell>{l.geraet}</TableCell>
                    <TableCell>{l.ort || "–"}</TableCell>
                    <TableCell>
                      {l.status === "erfolgreich" ? (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Erfolgreich
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Fehlgeschlagen
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                    Keine Login-Einträge vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
