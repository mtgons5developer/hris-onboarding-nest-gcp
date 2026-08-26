import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async append(input: {
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    beforeJson?: Prisma.InputJsonValue | null;
    afterJson?: Prisma.InputJsonValue | null;
    ip?: string | null;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        beforeJson: input.beforeJson ?? undefined,
        afterJson: input.afterJson ?? undefined,
        ip: input.ip ?? null,
      },
    });
  }

  async list(params: { entityType?: string; entityId?: string; take?: number }) {
    const rows = await this.prisma.auditLog.findMany({
      where: {
        entityType: params.entityType,
        entityId: params.entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: params.take ?? 100,
      include: { actor: { select: { email: true, displayName: true, role: true } } },
    });
    return rows.map((row) => ({ ...row, id: row.id.toString() }));
  }
}
