import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEmployee, useDepartments } from "@/hooks/use-employees";

const employeeSchema = z.object({
  firstName: z.string().min(2, "Vorname muss mindestens 2 Zeichen haben"),
  lastName: z.string().min(2, "Nachname muss mindestens 2 Zeichen haben"),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  position: z.string().optional(),
  departmentId: z.string().optional(),
  hireDate: z.string().optional(),
  workloadPercent: z.coerce.number().min(0).max(100).optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();
  const { data: departments } = useDepartments();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      workloadPercent: 100,
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      await createEmployee.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phone: data.phone || undefined,
        position: data.position || undefined,
        departmentId: data.departmentId || undefined,
        hireDate: data.hireDate || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        workloadPercent: data.workloadPercent,
      });
      toast.success(`${data.firstName} ${data.lastName} wurde erfolgreich angelegt`);
      navigate("/hr");
    } catch (error) {
      toast.error("Fehler beim Anlegen des Mitarbeiters");
      console.error("Create employee error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neuer Mitarbeiter</h1>
          <p className="text-muted-foreground">Mitarbeiterdaten erfassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persönliche Daten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <Input
                  id="firstName"
                  placeholder="Vorname"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname *</Label>
                <Input
                  id="lastName"
                  placeholder="Nachname"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@beispiel.ch"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="+41 XX XXX XX XX"
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anstellung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Stellenbezeichnung"
                {...register("position")}
              />
            </div>
            <div className="space-y-2">
              <Label>Abteilung</Label>
              <Select
                value={watch("departmentId") || ""}
                onValueChange={(value) => setValue("departmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung wählen" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                  {!departments?.length && (
                    <>
                      <SelectItem value="production">Produktion</SelectItem>
                      <SelectItem value="sales">Vertrieb</SelectItem>
                      <SelectItem value="admin">Verwaltung</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDate">Eintrittsdatum</Label>
              <Input
                id="hireDate"
                type="date"
                {...register("hireDate")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workloadPercent">Pensum (%)</Label>
              <Input
                id="workloadPercent"
                type="number"
                placeholder="100"
                {...register("workloadPercent")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Abbrechen
        </Button>
        <Button type="submit" className="gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Mitarbeiter anlegen
        </Button>
      </div>
    </form>
  );
}
