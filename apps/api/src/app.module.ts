import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { IdentityModule } from './identity/identity.module';
import { EmployeesModule } from './employees/employees.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { DocumentsModule } from './documents/documents.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    IdentityModule,
    EmployeesModule,
    OnboardingModule,
    DocumentsModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
