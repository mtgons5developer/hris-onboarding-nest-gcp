import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { STORAGE_PORT, StoragePort } from './storage.port';
import { RegisterDocumentDto } from './dto/register-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly onboarding: OnboardingService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  async register(dto: RegisterDocumentDto, actor: User) {
    await this.onboarding.getCase(dto.caseId, actor);
    const id = randomUUID();
    const objectKey = `onboarding/${dto.caseId}/${id}/${dto.filename}`;
    const slot = await this.storage.createUpload({
      objectKey,
      contentType: dto.contentType,
      documentId: id,
    });
    const meta = await this.prisma.documentMeta.create({
      data: {
        id,
        caseId: dto.caseId,
        taskId: dto.taskId,
        gcsBucket: slot.bucket,
        gcsObjectKey: slot.objectKey,
        contentType: dto.contentType,
        originalFilename: dto.filename,
        uploadedByUserId: actor.id,
      },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'DOCUMENT_REGISTERED',
      entityType: 'document',
      entityId: meta.id,
      afterJson: { filename: dto.filename, caseId: dto.caseId },
    });
    return { document: meta, uploadUrl: slot.uploadUrl, method: slot.method };
  }

  async saveUpload(id: string, buffer: Buffer, contentType: string) {
    const meta = await this.prisma.documentMeta.findUnique({ where: { id } });
    if (!meta) throw new NotFoundException('Document not found');
    if (!this.storage.saveLocal) {
      throw new NotFoundException('Local upload is disabled (use GCS signed URL)');
    }
    await this.storage.saveLocal(id, buffer, contentType);
    return { ok: true, id };
  }

  async review(id: string, reviewStatus: ReviewStatus, actor: User) {
    const meta = await this.prisma.documentMeta.findUnique({ where: { id } });
    if (!meta) throw new NotFoundException('Document not found');
    const updated = await this.prisma.documentMeta.update({
      where: { id },
      data: { reviewStatus },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'DOCUMENT_REVIEWED',
      entityType: 'document',
      entityId: id,
      beforeJson: { reviewStatus: meta.reviewStatus },
      afterJson: { reviewStatus },
    });
    return updated;
  }
}
