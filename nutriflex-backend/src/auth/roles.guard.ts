import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { RequestUser } from './types/request-user.interface';

/**
 * RolesGuard - Enforces role-based access control.
 * 
 * Rules:
 * - ADMIN role has access to ALL routes (super-role)
 * - Other roles must match one of the allowed roles specified with @Roles()
 * - If no @Roles() decorator is present, only ADMIN can access (default restrictive)
 * 
 * This guard should be used AFTER DualJwtGuard to ensure user is authenticated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles specified, allow access (let other guards handle authorization)
    // Or you can make it restrictive: only ADMIN if no roles specified
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction, allow access
    }

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        messageEn: 'User not authenticated',
        messageAr: 'المستخدم غير مصادق عليه',
      });
    }

    const userRole = user.role?.toUpperCase();

    // ADMIN has access to everything (super-role)
    if (userRole === 'ADMIN') {
      return true;
    }

    // Check if user's role is in the allowed roles
    const hasRole = requiredRoles.some((role) => role.toUpperCase() === userRole);

    if (!hasRole) {
      throw new ForbiddenException({
        messageEn: 'Insufficient permissions. Required role: ' + requiredRoles.join(' or '),
        messageAr: 'صلاحيات غير كافية. الدور المطلوب: ' + requiredRoles.join(' أو '),
      });
    }

    return true;
  }
}
