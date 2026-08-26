import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function ctx(user: { role: UserRole } | undefined) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as never;
}

describe('RolesGuard', () => {
  it('allows matching role', () => {
    const reflector = { getAllAndOverride: () => [UserRole.hr_admin] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx({ role: UserRole.hr_admin }))).toBe(true);
  });

  it('denies employee hitting hr-only route', () => {
    const reflector = { getAllAndOverride: () => [UserRole.hr_admin] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(ctx({ role: UserRole.employee }))).toThrow(ForbiddenException);
  });

  it('allows when no roles metadata', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx({ role: UserRole.employee }))).toBe(true);
  });
});
