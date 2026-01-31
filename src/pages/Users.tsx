import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Key,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user" | "viewer";
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  twoFactor: boolean;
  avatar?: string;
}

const users: User[] = [
  {
    id: "1",
    name: "Max Keller",
    email: "m.keller@loomora.de",
    role: "admin",
    status: "active",
    lastLogin: "vor 2 Std.",
    twoFactor: true,
  },
  {
    id: "2",
    name: "Anna Schmidt",
    email: "a.schmidt@loomora.de",
    role: "manager",
    status: "active",
    lastLogin: "vor 1 Tag",
    twoFactor: true,
  },
  {
    id: "3",
    name: "Thomas Müller",
    email: "t.mueller@loomora.de",
    role: "user",
    status: "active",
    lastLogin: "vor 3 Std.",
    twoFactor: false,
  },
  {
    id: "4",
    name: "Lisa Weber",
    email: "l.weber@loomora.de",
    role: "user",
    status: "active",
    lastLogin: "vor 5 Std.",
    twoFactor: true,
  },
  {
    id: "5",
    name: "Sarah Koch",
    email: "s.koch@loomora.de",
    role: "manager",
    status: "inactive",
    lastLogin: "vor 1 Woche",
    twoFactor: false,
  },
  {
    id: "6",
    name: "Michael Braun",
    email: "m.braun@loomora.de",
    role: "viewer",
    status: "pending",
    lastLogin: "Nie",
    twoFactor: false,
  },
];

const roleConfig = {
  admin: { label: "Administrator", color: "bg-destructive/10 text-destructive", icon: ShieldAlert },
  manager: { label: "Manager", color: "bg-warning/10 text-warning", icon: ShieldCheck },
  user: { label: "Benutzer", color: "bg-info/10 text-info", icon: Shield },
  viewer: { label: "Betrachter", color: "bg-muted text-muted-foreground", icon: Shield },
};

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  pending: { label: "Ausstehend", color: "bg-warning/10 text-warning" },
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Benutzerverwaltung
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Benutzer und Zugriffsrechte
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Benutzer einladen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Benutzer gesamt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Aktive Benutzer</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "admin").length}
              </p>
              <p className="text-sm text-muted-foreground">Administratoren</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Key className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.twoFactor).length}
              </p>
              <p className="text-sm text-muted-foreground">Mit 2FA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Benutzer suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Benutzer</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>Letzter Login</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => {
              const RoleIcon = roleConfig[user.role].icon;
              return (
                <TableRow
                  key={user.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", roleConfig[user.role].color)}>
                      <RoleIcon className="h-3 w-3" />
                      {roleConfig[user.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusConfig[user.status].color}>
                      {statusConfig[user.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.twoFactor}
                      className="pointer-events-none"
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Profil anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Rolle ändern</DropdownMenuItem>
                        <DropdownMenuItem>Passwort zurücksetzen</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Deaktivieren
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
