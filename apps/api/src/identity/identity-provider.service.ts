import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { audienceMatches, emailFromClaims, nameFromClaims, roleFromClaims } from './claims';

export type VerifiedIdentity = {
  sub: string;
  email?: string;
  name?: string;
  role?: UserRole;
};

@Injectable()
export class IdentityProviderService implements OnModuleInit {
  private readonly logger = new Logger(IdentityProviderService.name);
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private issuer?: string;
  private audience?: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const jwksUri = this.config.get<string>('OIDC_JWKS_URI');
    this.issuer = this.config.get<string>('OIDC_ISSUER') || undefined;
    this.audience = this.config.get<string>('OIDC_AUDIENCE') || undefined;
    if (!jwksUri) {
      this.logger.warn('OIDC_JWKS_URI unset — use AUTH_DEV_BYPASS or configure Keycloak/Cognito.');
      return;
    }
    this.jwks = createRemoteJWKSet(new URL(jwksUri));
    this.logger.log(`OIDC JWKS ready (${jwksUri})`);
  }

  async verifyAccessToken(token: string): Promise<VerifiedIdentity> {
    if (!this.jwks) {
      throw new UnauthorizedException('OIDC is not configured');
    }
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        // Omit `audience`: Cognito access tokens put the client id in `client_id`, not `aud`.
      });
      if (!payload.sub) {
        throw new UnauthorizedException('Token missing sub');
      }
      const claims = payload as Record<string, unknown>;
      if (this.audience && !audienceMatches(claims, this.audience)) {
        throw new UnauthorizedException('Invalid token audience');
      }
      return {
        sub: payload.sub,
        email: emailFromClaims(claims),
        name: nameFromClaims(claims),
        role: roleFromClaims(claims),
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async setRoleClaim(idpSub: string, role: string): Promise<void> {
    this.logger.log(`[stub] assign IdP role=${role} sub=${idpSub} (Keycloak Admin API or Cognito group)`);
  }
}
