import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { LocalDiskStorage } from './local-disk.storage';
import { GcsStorage } from './gcs.storage';
import { STORAGE_PORT } from './storage.port';
import { AuditModule } from '../audit/audit.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
  imports: [AuditModule, OnboardingModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    LocalDiskStorage,
    GcsStorage,
    {
      provide: STORAGE_PORT,
      inject: [ConfigService, LocalDiskStorage, GcsStorage],
      useFactory: (config: ConfigService, local: LocalDiskStorage, gcs: GcsStorage) => {
        return config.get('STORAGE_DRIVER') === 'gcs' ? gcs : local;
      },
    },
  ],
})
export class DocumentsModule {}
