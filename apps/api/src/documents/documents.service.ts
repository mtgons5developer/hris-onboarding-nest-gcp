import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewStatus, TaskStatus, User, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { OnboardingService } from '../onboarding/onboarding.service';
import { STORAGE_PORT, StoragePort } from './storage.port';
import { RegisterDocumentDto } from './dto/register-document.dto';
import { assertEmployeeQuota, assertFileSize } from './document-quota';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly onboarding: OnboardingService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  private uploadObjectKey(caseId: string, documentId: string, filename: string): string {
    return `uploads/onboarding/${caseId}/${documentId}/${filename}`;
  }

  private async employeeUsedBytes(employeeId: string): Promise<number> {
    const agg = await this.prisma.documentMeta.aggregate({
      _sum: { sizeBytes: true },
      where: { case: { employeeId } },
    });
    return agg._sum.sizeBytes ?? 0;
  }

  async register(dto: RegisterDocumentDto, actor: User) {
    const onboardingCase = await this.onboarding.getCase(dto.caseId, actor);
    assertFileSize(dto.sizeBytes);
    const used = await this.employeeUsedBytes(onboardingCase.employeeId);
    assertEmployeeQuota(used, dto.sizeBytes);

    const id = randomUUID();
    const objectKey = this.uploadObjectKey(dto.caseId, id, dto.filename);
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
        sizeBytes: dto.sizeBytes,
        uploadedByUserId: actor.id,
      },
    });
    await this.audit.append({
      actorUserId: actor.id,
      action: 'DOCUMENT_REGISTERED',
      entityType: 'document',
      entityId: meta.id,
      afterJson: { filename: dto.filename, caseId: dto.caseId, sizeBytes: dto.sizeBytes },
    });
    return { document: meta, uploadUrl: slot.uploadUrl, method: slot.method };
  }

  async saveUpload(id: string, buffer: Buffer, contentType: string) {
    const meta = await this.prisma.documentMeta.findUnique({
      where: { id },
      include: { case: { select: { employeeId: true } } },
    });
    if (!meta) throw new NotFoundException('Document not found');
    if (!this.storage.saveLocal) {
      throw new NotFoundException('Local upload is disabled (use cloud signed URL)');
    }
    assertFileSize(buffer.length);
    const usedExcluding = (await this.employeeUsedBytes(meta.case.employeeId)) - meta.sizeBytes;
    assertEmployeeQuota(usedExcluding, buffer.length);

    await this.storage.saveLocal(id, buffer, contentType);
    await this.prisma.documentMeta.update({
      where: { id },
      data: { sizeBytes: buffer.length },
    });
    return { ok: true, id };
  }

  async getDownloadUrl(id: string, actor: User) {
    const meta = await this.prisma.documentMeta.findUnique({ where: { id } });
    if (!meta) throw new NotFoundException('Document not found');
    await this.onboarding.getCase(meta.caseId, actor);
    if (!this.storage.createDownloadUrl) {
      throw new BadRequestException('Download URLs are not available for this storage driver');
    }
    const downloadUrl = await this.storage.createDownloadUrl(meta.gcsObjectKey);
    const ttl = Number(
      process.env.S3_DOWNLOAD_URL_TTL_SECONDS ??
        process.env.GCS_SIGNED_URL_TTL_SECONDS ??
        900,
    );
    return { downloadUrl, expiresInSeconds: ttl };
  }

  async serveDownload(id: string, actor: User) {
    const meta = await this.prisma.documentMeta.findUnique({ where: { id } });
    if (!meta) throw new NotFoundException('Document not found');
    await this.onboarding.getCase(meta.caseId, actor);
    if (!this.storage.readObject) {
      throw new BadRequestException('Direct download is not available for this storage driver');
    }
    const data = await this.storage.readObject(meta.gcsBucket, meta.gcsObjectKey);
    return {
      data,
      contentType: meta.contentType,
      filename: meta.originalFilename,
    };
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

  async remove(id: string, actor: User) {
    const meta = await this.prisma.documentMeta.findUnique({ where: { id } });
    if (!meta) throw new NotFoundException('Document not found');

    const isUploader = meta.uploadedByUserId === actor.id;
    const isHr = actor.role === UserRole.hr_admin;
    if (!isUploader && !isHr) {
      throw new ForbiddenException('Only the uploader or HR admin can delete this document');
    }
    // Ensures case visibility (employee of case / manager / HR).
    await this.onboarding.getCase(meta.caseId, actor);

    await this.storage.deleteObject(meta.gcsBucket, meta.gcsObjectKey);
    await this.prisma.documentMeta.delete({ where: { id } });

    if (meta.taskId) {
      const remaining = await this.prisma.documentMeta.count({
        where: { taskId: meta.taskId },
      });
      if (remaining === 0) {
        await this.prisma.onboardingTask.update({
          where: { id: meta.taskId },
          data: { status: TaskStatus.pending, completedAt: null },
        });
      }
    }

    await this.audit.append({
      actorUserId: actor.id,
      action: 'DOCUMENT_DELETED',
      entityType: 'document',
      entityId: id,
      beforeJson: {
        filename: meta.originalFilename,
        caseId: meta.caseId,
        taskId: meta.taskId,
        sizeBytes: meta.sizeBytes,
      },
    });
    return { ok: true, id };
  }
}
