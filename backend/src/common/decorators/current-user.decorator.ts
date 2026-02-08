import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  userId: string;
  email: string;
  companyId: string;     // active_company_id aus Token
  role: string;          // Role Name
  roleId: string;        // Role ID
  permissions: string[]; // Permission Array ["customers:read", "invoices:write", ...]
  isOwner: boolean;      // Ist Owner der aktiven Company
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }
    return user;
  },
);
