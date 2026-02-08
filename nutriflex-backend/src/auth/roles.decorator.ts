import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator to specify which roles can access a route.
 * Admin role always has access to all routes.
 * 
 * @example
 * @Roles('ADMIN') // Only Admin
 * @Roles('ADMIN', 'COACH') // Admin or Coach
 * @Roles('ADMIN', 'TRAINEE') // Admin or Trainee
 * @Roles('COACH') // Only Coach (Admin can still access)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
