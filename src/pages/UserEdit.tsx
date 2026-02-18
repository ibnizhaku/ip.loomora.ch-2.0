import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Key, Eye, EyeOff, Users, ExternalLink, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { useChangeUserPassword } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import { useEmployees } from "@/hooks/use-employees";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id || "");
  const { data: rolesData } = useRoles({ pageSize: 100 });
  const updateUser = useUpdateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      form.reset({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        isActive: user.status === "active",
      });
    }
  }, [user, form]);

  const onSubmit = (values: FormValues) => {
    if (!id) return;
    updateUser.mutate(
      { id, data: values },
      { onSuccess: () => navigate(`/users/${id}`) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Benutzer nicht gefunden</p>
        <Button variant="outline" asChild>
          <Link to="/users">Zurück zur Übersicht</Link>
        </Button>
      </div>
    );
  }

  const roles = rolesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/users/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Benutzer bearbeiten</h1>
          <p className="text-muted-foreground">{user.name}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rolle & Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rolle wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Aktiv</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Benutzer kann sich anmelden
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Mitarbeiter-Verknüpfung */}
          <EmployeeLinkCard user={user} userId={id || ""} />

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link to={`/users/${id}`}>Abbrechen</Link>
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </div>
        </form>
      </Form>

      {/* Passwort ändern – separate Sektion */}
      <PasswordChangeCard userId={id || ""} />
    </div>
  );
}

interface UserData {
  employeeId?: string;
  employeeNumber?: string;
}

interface EmployeeLinkCardProps {
  user: UserData;
  userId: string;
}

function EmployeeLinkCard({ user, userId }: EmployeeLinkCardProps) {
  const { data: employeesData } = useEmployees({ pageSize: 200 });
  const updateUser = useUpdateUser();
  const employees = employeesData?.data || [];
  const hasLink = !!user.employeeId;

  const handleLinkEmployee = (employeeId: string) => {
    updateUser.mutate(
      { id: userId, data: { employeeId } as any },
      {
        onSuccess: () => {
          toast.success('Mitarbeiter verknüpft');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Mitarbeiter-Verknüpfung</CardTitle>
            <CardDescription>Verknüpfter HR-Mitarbeiterdatensatz</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasLink ? (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono">{user.employeeNumber || "–"}</Badge>
              <span className="text-sm text-muted-foreground">Mitarbeiter verknüpft</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/hr/${user.employeeId}`}>
                  <ExternalLink className="mr-1 h-3 w-3" />
                  HR-Profil öffnen
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
            <div className="flex items-center gap-3">
              <Unlink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Kein Mitarbeiter verknüpft</span>
            </div>
            <Select onValueChange={handleLinkEmployee} disabled={updateUser.isPending}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Mitarbeiter zuweisen..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordChangeCard({ userId }: { userId: string }) {
  const changePassword = useChangeUserPassword();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordSchema = z.object({
    newPassword: z.string().min(8, "Mindestens 8 Zeichen"),
    confirmPassword: z.string().min(1, "Passwort bestätigen"),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

  type PasswordValues = z.infer<typeof passwordSchema>;

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: PasswordValues) => {
    changePassword.mutate(
      { userId, newPassword: values.newPassword },
      { onSuccess: () => form.reset() }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Passwort ändern</CardTitle>
            <CardDescription>Neues Passwort für diesen Benutzer setzen</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neues Passwort</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showNew ? "text" : "password"} {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowNew(!showNew)}
                        >
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort bestätigen</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirm ? "text" : "password"} {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-10 w-10"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Key className="mr-2 h-4 w-4" />
                Passwort setzen
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
