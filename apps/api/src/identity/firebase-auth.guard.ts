import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { FirebaseAdminService } from './firebase-admin.service';

const DEV_UID: Record<string, string> = {
  'dev:hr_admin': 'dev-hr-admin',
  'dev:manager': 'dev-manager',
  'dev:employee': 'dev-employee',
  'dev:system_admin': 'dev-system-admin',
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseAdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = String(req.headers.authorization ?? '');
    if (!header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = header.slice(7).trim();
    const bypass = this.config.get<string>('AUTH_DEV_BYPASS') === 'true';

    if (bypass && (token.startsWith('dev:') || DEV_UID[token])) {
      const uid = DEV_UID[token] ?? DEV_UID[`dev:${token}`];
      if (!uid) {
        throw new UnauthorizedException('Unknown dev token');
      }
      const user = await this.prisma.user.findUnique({ where: { firebaseUid: uid } });
      if (!user) {
        throw new UnauthorizedException('Dev user not seeded');
      }
      req.user = user;
      return true;
    }

    const decoded = await this.firebase.verifyIdToken(token);
    let user = await this.prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    if (!user) {
      const claimRole = (decoded.role as UserRole | undefined) ?? UserRole.employee;
      user = await this.prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email ?? `${decoded.uid}@unknown.local`,
          displayName: decoded.name ?? decoded.email ?? 'Firebase user',
          role: claimRole,
        },
      });
    }
    req.user = user;
    return true;
  }
}
