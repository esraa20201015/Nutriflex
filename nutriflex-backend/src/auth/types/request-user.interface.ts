/**
 * User object attached to request by DualJwtGuard
 * This interface extends the Express Request to include the authenticated user
 */
export interface RequestUser {
  id: string;
  fullName?: string;
  email?: string;
  role?: string; // Role name: 'ADMIN', 'COACH', 'TRAINEE'
  status?: string;
  isEmailVerified?: boolean;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
