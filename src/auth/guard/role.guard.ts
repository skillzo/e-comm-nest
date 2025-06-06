// roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/utility/decorators/public.decorator';
import { ROLES_KEY } from 'src/utility/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required → allow any authenticated user
    }

    if (
      !user.roles ||
      !requiredRoles.some((role) => user.roles.includes(role))
    ) {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
