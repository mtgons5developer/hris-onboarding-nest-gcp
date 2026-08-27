import { ConfigService } from '@nestjs/config';
import { GcsStorage } from './gcs.storage';
import { LocalDiskStorage } from './local-disk.storage';
import { S3Storage } from './s3.storage';
import { selectStorageDriver } from './storage.factory';

describe('selectStorageDriver', () => {
  const local = {} as LocalDiskStorage;
  const gcs = {} as GcsStorage;
  const s3 = {} as S3Storage;

  function config(driver?: string) {
    return {
      get: (key: string) => (key === 'STORAGE_DRIVER' ? driver : undefined),
    } as ConfigService;
  }

  it('defaults to local disk', () => {
    expect(selectStorageDriver(config(undefined), local, gcs, s3)).toBe(local);
    expect(selectStorageDriver(config('local'), local, gcs, s3)).toBe(local);
  });

  it('selects gcs when STORAGE_DRIVER=gcs', () => {
    expect(selectStorageDriver(config('gcs'), local, gcs, s3)).toBe(gcs);
  });

  it('selects s3 when STORAGE_DRIVER=s3', () => {
    expect(selectStorageDriver(config('s3'), local, gcs, s3)).toBe(s3);
  });
});
