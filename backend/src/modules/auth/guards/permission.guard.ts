import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator um benötigte Permissions zu definieren
 * @example @RequirePermissions('customers:write', 'customers:delete')
 */
export const RequirePermissions = (...permissions: string[]) => 
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor?.value || target);
    return descriptor || target;
  };

/**
 * Permission Guard - Prüft ob User die benötigten Permissions hat
 * Wird nach SubscriptionGuard ausgeführt
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Keine spezifischen Permissions erforderlich
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenException('Keine Berechtigungen vorhanden');
    }

    // Owner hat immer alle Rechte
    if (user.isOwner) {
      return true;
    }

    // Prüfen ob User mindestens eine der erforderlichen Permissions hat
    const hasPermission = requiredPermissions.some((perm) => 
      user.permissions.includes(perm) || 
      user.permissions.includes(perm.replace(':read', ':admin')) ||
      user.permissions.includes(perm.replace(':write', ':admin')) ||
      user.permissions.includes(perm.replace(':delete', ':admin'))
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Keine Berechtigung für diese Aktion. Erforderlich: ${requiredPermissions.join(' oder ')}`
      );
    }

    return true;
  }
}
