import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { isLocalDevBypassRequest } from './dev-bypass';
import { IdentityProviderService } from './identity-provider.service';

const DEV_USERS: Record<string, { sub: string; email: string }> = {
  'dev:hr_admin': { sub: 'dev-hr-admin', email: 'hr@lab.local' },
  'dev:manager': { sub: 'dev-manager', email: 'maya.santos@lab.local' },
  'dev:employee': { sub: 'dev-employee', email: 'luis.reyes@lab.local' },
  'dev:system_admin': { sub: 'dev-system-admin', email: 'sysadmin@lab.local' },
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly idp: IdentityProviderService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = String(req.headers.authorization ?? '');
    if (!header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = header.slice(7).trim();
    const bypass = isLocalDevBypassRequest(this.config.get<string>('AUTH_DEV_BYPASS'), {
      host: req.headers.host,
      origin: req.headers.origin,
    });

    if (bypass && (token.startsWith('dev:') || DEV_USERS[token])) {
      const spec = DEV_USERS[token] ?? DEV_USERS[`dev:${token}`];
      if (!spec) {
        throw new UnauthorizedException('Unknown dev token');
      }
      const user =
        (await this.prisma.user.findUnique({ where: { idpSub: spec.sub } })) ??
        (await this.prisma.user.findUnique({ where: { email: spec.email } }));
      if (!user) {
        throw new UnauthorizedException('Dev user not seeded');
      }
      req.user = user;
      return true;
    }

    const identity = await this.idp.verifyAccessToken(token);
    let user = await this.prisma.user.findUnique({ where: { idpSub: identity.sub } });
    if (!user && identity.email) {
      user = await this.prisma.user.findUnique({ where: { email: identity.email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { idpSub: identity.sub },
        });
      }
    }
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          idpSub: identity.sub,
          email: identity.email ?? `${identity.sub}@unknown.local`,
          displayName: identity.name ?? identity.email ?? 'OIDC user',
          role: identity.role ?? UserRole.employee,
        },
      });
    }
    req.user = user;
    return true;
  }
}
