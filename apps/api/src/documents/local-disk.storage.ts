import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { StoragePort, StoredObject } from './storage.port';

@Injectable()
export class LocalDiskStorage implements StoragePort {
  constructor(private readonly config: ConfigService) {}

  private dir() {
    return this.config.get<string>('LOCAL_UPLOAD_DIR') ?? '../../data/uploads';
  }

  /** Local files are stored as `<documentId>` under LOCAL_UPLOAD_DIR. */
  private documentIdFromObjectKey(objectKey: string): string {
    const parts = objectKey.split('/');
    // uploads/onboarding/<caseId>/<documentId>/<filename>
    return parts.length >= 4 ? parts[3] : objectKey;
  }

  async createUpload(input: {
    objectKey: string;
    contentType: string;
    documentId: string;
  }): Promise<StoredObject> {
    const port = this.config.get<string>('PORT') ?? '3000';
    return {
      bucket: 'local-disk',
      objectKey: input.objectKey,
      uploadUrl: `http://localhost:${port}/api/v1/documents/${input.documentId}/upload`,
      method: 'PUT',
    };
  }

  async saveLocal(documentId: string, buffer: Buffer, _contentType?: string): Promise<void> {
    const dir = this.dir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, documentId), buffer);
  }

  async createDownloadUrl(objectKey: string): Promise<string> {
    const documentId = this.documentIdFromObjectKey(objectKey);
    const port = this.config.get<string>('PORT') ?? '3000';
    return `http://localhost:${port}/api/v1/documents/${documentId}/download`;
  }

  async readObject(_bucket: string, objectKey: string): Promise<Buffer> {
    const documentId = this.documentIdFromObjectKey(objectKey);
    return readFile(join(this.dir(), documentId));
  }

  async deleteObject(_bucket: string, objectKey: string): Promise<void> {
    const documentId = this.documentIdFromObjectKey(objectKey);
    await unlink(join(this.dir(), documentId)).catch(() => undefined);
  }
}
