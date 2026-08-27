import { ConfigService } from '@nestjs/config';
import { GcsStorage } from './gcs.storage';
import { LocalDiskStorage } from './local-disk.storage';
import { S3Storage } from './s3.storage';
import { StoragePort } from './storage.port';

export function selectStorageDriver(
  config: ConfigService,
  local: LocalDiskStorage,
  gcs: GcsStorage,
  s3: S3Storage,
): StoragePort {
  const driver = config.get<string>('STORAGE_DRIVER') ?? 'local';
  if (driver === 'gcs') return gcs;
  if (driver === 's3') return s3;
  return local;
}
