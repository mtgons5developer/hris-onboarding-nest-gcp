import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { StoragePort, StoredObject } from './storage.port';

@Injectable()
export class GcsStorage implements StoragePort {
  private readonly logger = new Logger(GcsStorage.name);
  private readonly storage = new Storage();

  constructor(private readonly config: ConfigService) {}

  async createUpload(input: {
    objectKey: string;
    contentType: string;
    documentId: string;
  }): Promise<StoredObject> {
    const bucketName = this.config.get<string>('GCS_BUCKET');
    if (!bucketName) {
      throw new Error('GCS_BUCKET is required when STORAGE_DRIVER=gcs');
    }
    const ttl = Number(this.config.get('GCS_SIGNED_URL_TTL_SECONDS') ?? 900);
    const [url] = await this.storage
      .bucket(bucketName)
      .file(input.objectKey)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + ttl * 1000,
        contentType: input.contentType,
      });
    this.logger.log(`Signed PUT URL for ${input.objectKey}`);
    return {
      bucket: bucketName,
      objectKey: input.objectKey,
      uploadUrl: url,
      method: 'PUT',
    };
  }
}
