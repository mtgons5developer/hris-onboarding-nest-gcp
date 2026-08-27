import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TaskStatus, UserRole } from '@prisma/client';
import { DocumentsService } from './documents.service';

const uploader = {
  id: 'user-emp',
  role: UserRole.employee,
  employeeId: 'emp-1',
  tenantId: 1,
} as never;

const otherEmployee = {
  id: 'user-other',
  role: UserRole.employee,
  employeeId: 'emp-2',
  tenantId: 1,
} as never;

const hr = {
  id: 'user-hr',
  role: UserRole.hr_admin,
  employeeId: null,
  tenantId: 1,
} as never;

const meta = {
  id: 'doc-1',
  caseId: 'case-1',
  taskId: 'task-1',
  gcsBucket: 'local-disk',
  gcsObjectKey: 'uploads/onboarding/case-1/doc-1/id.png',
  originalFilename: 'id.png',
  contentType: 'image/png',
  sizeBytes: 1024,
  uploadedByUserId: 'user-emp',
  reviewStatus: 'pending',
};

function makeService(opts?: { createDownloadUrl?: boolean; readObject?: boolean }) {
  const prisma: any = {
    documentMeta: {
      findUnique: jest.fn().mockResolvedValue(meta),
      delete: jest.fn().mockResolvedValue(meta),
      count: jest.fn().mockResolvedValue(0),
    },
    onboardingTask: {
      update: jest.fn().mockResolvedValue({ id: 'task-1', status: TaskStatus.pending }),
    },
  };
  const audit = { append: jest.fn() };
  const onboarding = { getCase: jest.fn().mockResolvedValue({ id: 'case-1' }) };
  const storage: any = { deleteObject: jest.fn().mockResolvedValue(undefined) };
  if (opts?.createDownloadUrl !== false) {
    storage.createDownloadUrl = jest
      .fn()
      .mockResolvedValue('http://localhost:3000/api/v1/documents/doc-1/download');
  }
  if (opts?.readObject !== false) {
    storage.readObject = jest.fn().mockResolvedValue(Buffer.from('file-bytes'));
  }
  return {
    service: new DocumentsService(prisma, audit as never, onboarding as never, storage as never),
    prisma,
    audit,
    onboarding,
    storage,
  };
}

describe('DocumentsService.remove', () => {
  it('deletes storage object, meta row, and resets task when no docs remain', async () => {
    const { service, prisma, audit, storage, onboarding } = makeService();

    const result = await service.remove('doc-1', uploader);

    expect(result).toEqual({ ok: true, id: 'doc-1' });
    expect(onboarding.getCase).toHaveBeenCalledWith('case-1', uploader);
    expect(storage.deleteObject).toHaveBeenCalledWith(
      'local-disk',
      'uploads/onboarding/case-1/doc-1/id.png',
    );
    expect(prisma.documentMeta.delete).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
    expect(prisma.documentMeta.count).toHaveBeenCalledWith({ where: { taskId: 'task-1' } });
    expect(prisma.onboardingTask.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { status: TaskStatus.pending, completedAt: null },
    });
    expect(audit.append).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DOCUMENT_DELETED', entityId: 'doc-1' }),
    );
  });

  it('allows hr_admin to delete', async () => {
    const { service, storage } = makeService();
    await service.remove('doc-1', hr);
    expect(storage.deleteObject).toHaveBeenCalled();
  });

  it('forbids non-uploader non-HR', async () => {
    const { service, storage } = makeService();
    await expect(service.remove('doc-1', otherEmployee)).rejects.toBeInstanceOf(ForbiddenException);
    expect(storage.deleteObject).not.toHaveBeenCalled();
  });

  it('throws when document missing', async () => {
    const { service, prisma } = makeService();
    prisma.documentMeta.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing', uploader)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not reset task when other docs remain for the task', async () => {
    const { service, prisma } = makeService();
    prisma.documentMeta.count.mockResolvedValue(1);
    await service.remove('doc-1', uploader);
    expect(prisma.onboardingTask.update).not.toHaveBeenCalled();
  });
});

describe('DocumentsService.getDownloadUrl', () => {
  it('returns a download URL after case access check', async () => {
    const { service, onboarding, storage } = makeService();
    const result = await service.getDownloadUrl('doc-1', uploader);
    expect(onboarding.getCase).toHaveBeenCalledWith('case-1', uploader);
    expect(storage.createDownloadUrl).toHaveBeenCalledWith(meta.gcsObjectKey);
    expect(result.downloadUrl).toContain('/download');
    expect(result.expiresInSeconds).toBeGreaterThan(0);
  });

  it('throws when document missing', async () => {
    const { service, prisma } = makeService();
    prisma.documentMeta.findUnique.mockResolvedValue(null);
    await expect(service.getDownloadUrl('missing', hr)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when storage driver lacks download URLs', async () => {
    const { service } = makeService({ createDownloadUrl: false });
    await expect(service.getDownloadUrl('doc-1', hr)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('DocumentsService.serveDownload', () => {
  it('returns file bytes after case access check', async () => {
    const { service, onboarding, storage } = makeService();
    const result = await service.serveDownload('doc-1', hr);
    expect(onboarding.getCase).toHaveBeenCalledWith('case-1', hr);
    expect(storage.readObject).toHaveBeenCalledWith(
      'local-disk',
      'uploads/onboarding/case-1/doc-1/id.png',
    );
    expect(result.data.toString()).toBe('file-bytes');
    expect(result.contentType).toBeDefined();
    expect(result.filename).toBe('id.png');
  });

  it('throws when direct download is unavailable', async () => {
    const { service } = makeService({ readObject: false });
    await expect(service.serveDownload('doc-1', hr)).rejects.toBeInstanceOf(BadRequestException);
  });
});
