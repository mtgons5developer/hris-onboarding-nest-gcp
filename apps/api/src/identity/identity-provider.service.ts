import { Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose';
import { audienceMatches, emailFromClaims, nameFromClaims, roleFromClaims, subFromClaims } from './claims';

export type VerifiedIdentity = {
  sub: string;
  email?: string;
  name?: string;
  role?: UserRole;
};

type IssuerJwks = {
  issuer?: string;
  jwks: ReturnType<typeof createRemoteJWKSet>;
};

export function splitOidcEnvList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildIssuerJwksConfigs(jwksUris: string[], issuers: string[]): IssuerJwks[] {
  return jwksUris.map((uri, i) => ({
    issuer: issuers[i] ?? (issuers.length === 1 ? issuers[0] : undefined),
    jwks: createRemoteJWKSet(new URL(uri)),
  }));
}

@Injectable()
export class IdentityProviderService implements OnModuleInit {
  private readonly logger = new Logger(IdentityProviderService.name);
  private issuerConfigs: IssuerJwks[] = [];
  private audience?: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const jwksUris = splitOidcEnvList(this.config.get<string>('OIDC_JWKS_URI'));
    const issuers = splitOidcEnvList(this.config.get<string>('OIDC_ISSUER'));
    this.audience = this.config.get<string>('OIDC_AUDIENCE') || undefined;
    if (jwksUris.length === 0) {
      this.logger.warn('OIDC_JWKS_URI unset — use AUTH_DEV_BYPASS or configure Keycloak/Cognito.');
      return;
    }
    this.issuerConfigs = buildIssuerJwksConfigs(jwksUris, issuers);
    this.logger.log(`OIDC JWKS ready (${jwksUris.join(' | ')})`);
  }

  async verifyAccessToken(token: string): Promise<VerifiedIdentity> {
    if (this.issuerConfigs.length === 0) {
      throw new UnauthorizedException('OIDC is not configured');
    }
    const preferredIss = this.readTokenIssuer(token);
    const ordered = preferredIss
      ? [
          ...this.issuerConfigs.filter((c) => c.issuer === preferredIss),
          ...this.issuerConfigs.filter((c) => c.issuer !== preferredIss),
        ]
      : this.issuerConfigs;

    let payload: Record<string, unknown> | undefined;
    for (const cfg of ordered) {
      try {
        const verified = await jwtVerify(token, cfg.jwks, cfg.issuer ? { issuer: cfg.issuer } : {});
        payload = verified.payload as Record<string, unknown>;
        break;
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
      }
    }
    if (!payload) {
      throw new UnauthorizedException('Invalid access token');
    }
    const sub = subFromClaims(payload);
    if (!sub) {
      throw new UnauthorizedException('Token missing sub');
    }
    if (this.audience && !audienceMatches(payload, this.audience)) {
      throw new UnauthorizedException('Invalid token audience');
    }
    return {
      sub,
      email: emailFromClaims(payload),
      name: nameFromClaims(payload),
      role: roleFromClaims(payload),
    };
  }

  private readTokenIssuer(token: string): string | undefined {
    try {
      const { iss } = decodeJwt(token);
      return typeof iss === 'string' ? iss : undefined;
    } catch {
      return undefined;
    }
  }

  async setRoleClaim(idpSub: string, role: string): Promise<void> {
    this.logger.log(`[stub] assign IdP role=${role} sub=${idpSub} (Keycloak Admin API or Cognito group)`);
  }
}
