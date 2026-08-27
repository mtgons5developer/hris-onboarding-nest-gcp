import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { LocalDiskStorage } from './local-disk.storage';
import { GcsStorage } from './gcs.storage';
import { S3Storage } from './s3.storage';
import { STORAGE_PORT } from './storage.port';
import { selectStorageDriver } from './storage.factory';
import { AuditModule } from '../audit/audit.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [AuditModule, OnboardingModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    LocalDiskStorage,
    GcsStorage,
    S3Storage,
    {
      provide: STORAGE_PORT,
      inject: [ConfigService, LocalDiskStorage, GcsStorage, S3Storage],
      useFactory: selectStorageDriver,
    },
  ],
})
export class DocumentsModule {}
