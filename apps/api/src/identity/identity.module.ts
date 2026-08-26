import { Global, Module } from '@nestjs/common';
import { IdentityProviderService } from './identity-provider.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { MeController } from './me.controller';

@Global()
@Module({
  controllers: [MeController],
  providers: [IdentityProviderService, JwtAuthGuard, RolesGuard],
  exports: [IdentityProviderService, JwtAuthGuard, RolesGuard],
})
export class IdentityModule {}
