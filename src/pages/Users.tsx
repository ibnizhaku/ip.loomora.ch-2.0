import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, useDeleteUser, type User } from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";
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
  Send,
  X,
  Edit,
  Trash2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";



const roleConfig: Record<string, { label: string; color: string; icon: any }> = {
  owner: { label: "Owner", color: "bg-primary/10 text-primary", icon: ShieldAlert },
  admin: { label: "Administrator", color: "bg-destructive/10 text-destructive", icon: ShieldAlert },
  manager: { label: "Manager", color: "bg-warning/10 text-warning", icon: ShieldCheck },
  member: { label: "Mitarbeiter", color: "bg-info/10 text-info", icon: Shield },
  user: { label: "Benutzer", color: "bg-info/10 text-info", icon: Shield },
  viewer: { label: "Betrachter", color: "bg-muted text-muted-foreground", icon: Shield },
};

/** Map backend roleName (e.g. "Owner", "Admin", "Member") to roleConfig key */
const getRoleKey = (user: User): string => {
  const name = (user.roleName || user.role || '').toLowerCase();
  if (name === 'owner' || user.isOwner) return 'owner';
  if (name === 'admin' || name === 'administrator') return 'admin';
  if (name === 'manager') return 'manager';
  if (name === 'member') return 'member';
  return 'user';
};

const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success" },
  inactive: { label: "Inaktiv", color: "bg-muted text-muted-foreground" },
  pending: { label: "Ausstehend", color: "bg-warning/10 text-warning" },
};

export default function Users() {
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const { data: apiData } = useUsers();
  const deleteMutation = useDeleteUser();
  const users: User[] = apiData?.data || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [twoFactorFilter, setTwoFactorFilter] = useState<boolean | null>(null);
  const [filterUserStatus, setFilterUserStatus] = useState<string[]>([]);
  const [filterUserRole, setFilterUserRole] = useState<string[]>([]);

  const activeFilters = filterUserStatus.length + filterUserRole.length;

  const handleStatClick = (filter: string, type: "status" | "role" | "2fa") => {
    if (type === "status") {
      setStatusFilter(statusFilter === filter ? null : filter);
      setRoleFilter(null);
      setTwoFactorFilter(null);
    } else if (type === "role") {
      setRoleFilter(roleFilter === filter ? null : filter);
      setStatusFilter(null);
      setTwoFactorFilter(null);
    } else if (type === "2fa") {
      setTwoFactorFilter(twoFactorFilter === true ? null : true);
      setStatusFilter(null);
      setRoleFilter(null);
    }
  };

  const resetFilters = () => {
    setFilterUserStatus([]);
    setFilterUserRole([]);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? u.status === statusFilter : true;
    const matchesRole = roleFilter ? getRoleKey(u) === roleFilter : true;
    const matches2FA = twoFactorFilter !== null ? u.twoFactor === twoFactorFilter : true;
    const matchesFilterStatus = filterUserStatus.length === 0 || filterUserStatus.includes(u.status);
    const matchesFilterRole = filterUserRole.length === 0 || filterUserRole.includes(getRoleKey(u));
    return matchesSearch && matchesStatus && matchesRole && matches2FA && matchesFilterStatus && matchesFilterRole;
  });


  const handleRowClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

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
        {canWrite('users') && (
          <Button className="gap-2" onClick={() => navigate("/users/new")}>
            <Plus className="h-4 w-4" />
            Benutzer erstellen
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            statusFilter === null && roleFilter === null && twoFactorFilter === null && "ring-2 ring-primary"
          )}
          onClick={() => {
            setStatusFilter(null);
            setRoleFilter(null);
            setTwoFactorFilter(null);
          }}
        >
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
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            statusFilter === "active" && "ring-2 ring-success"
          )}
          onClick={() => handleStatClick("active", "status")}
        >
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
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            roleFilter === "admin" && "ring-2 ring-destructive"
          )}
          onClick={() => handleStatClick("admin", "role")}
        >
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
        <div 
          className={cn(
            "rounded-xl border border-border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            twoFactorFilter === true && "ring-2 ring-info"
          )}
          onClick={() => handleStatClick("2fa", "2fa")}
        >
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(activeFilters > 0 && "border-primary")}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeFilters > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filter</h4>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                {(["active", "inactive", "pending"] as const).map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filterUserStatus.includes(status)}
                      onCheckedChange={(checked) => {
                        setFilterUserStatus(checked 
                          ? [...filterUserStatus, status]
                          : filterUserStatus.filter(s => s !== status)
                        );
                      }}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                      {statusConfig[status].label}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Rolle</Label>
                {(["admin", "manager", "user", "viewer"] as const).map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={filterUserRole.includes(role)}
                      onCheckedChange={(checked) => {
                        setFilterUserRole(checked 
                          ? [...filterUserRole, role]
                          : filterUserRole.filter(r => r !== role)
                        );
                      }}
                    />
                    <Label htmlFor={`role-${role}`} className="text-sm font-normal cursor-pointer">
                      {roleConfig[role].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
              const roleKey = getRoleKey(user);
              const roleCfg = roleConfig[roleKey] || roleConfig.user;
              const RoleIcon = roleCfg.icon;
              return (
                <TableRow
                  key={user.id}
                  className="animate-fade-in cursor-pointer hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleRowClick(user.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {(user.name || "?")
                            .split(" ")
                            .map((n: string) => n[0])
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
                    <Badge className={cn("gap-1", roleCfg.color)}>
                      <RoleIcon className="h-3 w-3" />
                      {roleCfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={(statusConfig[user.status] || statusConfig.active).color}>
                      {(statusConfig[user.status] || statusConfig.active).label}
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                          Profil anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}/edit`); }}>
                          Rolle ändern
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}/edit`); }}>
                          Passwort zurücksetzen
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}/edit`); }}
                        >
                          Deaktivieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Möchten Sie "${user.name}" wirklich löschen?`)) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
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
