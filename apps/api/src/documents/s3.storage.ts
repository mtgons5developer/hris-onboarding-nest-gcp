import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StoragePort, StoredObject } from './storage.port';

@Injectable()
export class S3Storage implements StoragePort {
  private readonly logger = new Logger(S3Storage.name);
  private readonly client: S3Client;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION') ?? 'ap-southeast-1';
    this.client = new S3Client({ region });
  }

  private bucketName(): string {
    const bucket = this.config.get<string>('S3_BUCKET');
    if (!bucket) {
      throw new Error('S3_BUCKET is required when STORAGE_DRIVER=s3');
    }
    return bucket;
  }

  private uploadTtlSeconds(): number {
    return Number(this.config.get('S3_SIGNED_URL_TTL_SECONDS') ?? 900);
  }

  async createUpload(input: {
    objectKey: string;
    contentType: string;
    documentId: string;
  }): Promise<StoredObject> {
    const bucket = this.bucketName();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: input.objectKey,
      ContentType: input.contentType,
    });
    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.uploadTtlSeconds(),
    });
    this.logger.log(`Presigned PUT for s3://${bucket}/${input.objectKey}`);
    return {
      bucket,
      objectKey: input.objectKey,
      uploadUrl,
      method: 'PUT',
    };
  }

  async createDownloadUrl(objectKey: string): Promise<string> {
    const bucket = this.bucketName();
    const command = new GetObjectCommand({ Bucket: bucket, Key: objectKey });
    const ttl = Number(this.config.get('S3_DOWNLOAD_URL_TTL_SECONDS') ?? 900);
    return getSignedUrl(this.client, command, { expiresIn: ttl });
  }

  async deleteObject(bucket: string, objectKey: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
  }
}
