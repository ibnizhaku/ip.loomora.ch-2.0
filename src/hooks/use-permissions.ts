import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useCallback } from 'react';

/**
 * Permission module keys matching the backend format:
 * e.g. "invoices:read", "finance:write", "employees:delete"
 */
export type PermissionAction = 'read' | 'write' | 'delete' | 'admin';

export function usePermissions() {
  const { activeCompany, isAuthenticated } = useAuth();

  const permissions = useMemo(() => {
    return activeCompany?.permissions ?? [];
  }, [activeCompany?.permissions]);

  const isOwner = activeCompany?.isOwner ?? false;

  /**
   * Check if user has a specific permission (e.g. "invoices:read")
   * Owners always have full access.
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!isAuthenticated) return false;
      if (isOwner) return true;
      if (permissions.includes('*')) return true;
      return permissions.includes(permission);
    },
    [isAuthenticated, isOwner, permissions],
  );

  /**
   * Check if user can access a module (has at least :read)
   * e.g. canAccessModule("invoices") → checks "invoices:read"
   */
  const canAccessModule = useCallback(
    (module: string): boolean => {
      return hasPermission(`${module}:read`);
    },
    [hasPermission],
  );

  /**
   * Check if user can write to a module
   */
  const canWrite = useCallback(
    (module: string): boolean => {
      return hasPermission(`${module}:write`);
    },
    [hasPermission],
  );

  /**
   * Check if user can delete in a module
   */
  const canDelete = useCallback(
    (module: string): boolean => {
      return hasPermission(`${module}:delete`);
    },
    [hasPermission],
  );

  return {
    permissions,
    isOwner,
    hasPermission,
    canAccessModule,
    canWrite,
    canDelete,
  };
}
