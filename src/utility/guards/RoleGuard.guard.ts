import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      // no roles required
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = user?.role.some((role: string) =>
      requiredRoles.includes(role),
    );
    
    if (!hasRole) {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
