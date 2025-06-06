import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'userRole';
export const AuthRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
