import { Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { RolesGuard } from './roles.guard';
import { MeController } from './me.controller';

@Module({
  controllers: [MeController],
  providers: [FirebaseAdminService, FirebaseAuthGuard, RolesGuard],
  exports: [FirebaseAdminService, FirebaseAuthGuard, RolesGuard],
})
export class IdentityModule {}
