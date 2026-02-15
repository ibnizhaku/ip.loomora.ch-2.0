import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Required permission module (e.g. "invoices", "finance", "employees") */
  module: string;
  /** Required action, defaults to "read" */
  action?: 'read' | 'write' | 'delete' | 'admin';
  /** If true, redirects to dashboard instead of showing forbidden message */
  redirect?: boolean;
}

/**
 * Wrap routes with this component to enforce permission checks.
 * Example: <PermissionGuard module="invoices"><InvoicesPage /></PermissionGuard>
 */
export function PermissionGuard({ children, module, action = 'read', redirect = false }: PermissionGuardProps) {
  const { hasPermission, isOwner } = usePermissions();

  const allowed = isOwner || hasPermission(`${module}:${action}`);

  if (!allowed) {
    if (redirect) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Zugriff verweigert</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Sie haben keine Berechtigung für diesen Bereich. 
          Kontaktieren Sie Ihren Administrator, um die Berechtigung <strong>{module}:{action}</strong> zu erhalten.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
