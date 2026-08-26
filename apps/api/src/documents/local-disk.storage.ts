import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { StoragePort, StoredObject } from './storage.port';

@Injectable()
export class LocalDiskStorage implements StoragePort {
  constructor(private readonly config: ConfigService) {}

  private dir() {
    return this.config.get<string>('LOCAL_UPLOAD_DIR') ?? '../../data/uploads';
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

  async saveLocal(documentId: string, buffer: Buffer): Promise<void> {
    const dir = this.dir();
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, documentId), buffer);
  }
}
