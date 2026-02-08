import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { RequestUser } from './types/request-user.interface';
import { UsersService } from '../users/users.service';

/**
 * Guard that validates JWT when present and attaches user to request.
 * Routes marked with @Public() skip JWT validation and are always allowed.
 * Protected routes require a valid Bearer token.
 */
@Injectable()
export class DualJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; role?: string }>(token, {
        secret: process.env.JWT_SECRET ?? 'change-me-in-production',
      });
      const user = await this.usersService.findUserById(payload.sub);
      const requestUser: RequestUser = user
        ? {
            id: user.id,
            fullName: user.fullName?.trim() || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: user.role?.name ?? payload.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified,
          }
        : { id: payload.sub, role: payload.role };
      request.user = requestUser;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
