import { UserRole } from '@prisma/client';

const ROLES = new Set<string>(Object.values(UserRole));

export function roleFromClaims(payload: Record<string, unknown>): UserRole | undefined {
  const direct = payload.role;
  if (typeof direct === 'string' && ROLES.has(direct)) {
    return direct as UserRole;
  }
  const groups = payload['cognito:groups'];
  if (Array.isArray(groups)) {
    const hit = groups.map(String).find((g) => ROLES.has(g));
    if (hit) return hit as UserRole;
  }
  const realm = payload.realm_access as { roles?: string[] } | undefined;
  const realmHit = realm?.roles?.find((r) => ROLES.has(r));
  if (realmHit) return realmHit as UserRole;
  return undefined;
}

/** Cognito access tokens use `client_id` instead of `aud`. ID tokens use `aud`. */
export function audienceMatches(payload: Record<string, unknown>, expected: string): boolean {
  const allowed = expected
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  const candidates: string[] = [];
  const aud = payload.aud;
  if (typeof aud === 'string') candidates.push(aud);
  if (Array.isArray(aud)) candidates.push(...aud.map(String));
  if (typeof payload.client_id === 'string') candidates.push(payload.client_id);
  return candidates.some((c) => allowed.includes(c));
}

export function emailFromClaims(payload: Record<string, unknown>): string | undefined {
  for (const value of [payload.email, payload.username, payload['cognito:username']]) {
    if (typeof value === 'string' && value.includes('@')) return value;
  }
  return undefined;
}

export function nameFromClaims(payload: Record<string, unknown>): string | undefined {
  if (typeof payload.name === 'string' && payload.name.trim()) return payload.name;
  const given = typeof payload.given_name === 'string' ? payload.given_name : '';
  const family = typeof payload.family_name === 'string' ? payload.family_name : '';
  const combo = `${given} ${family}`.trim();
  return combo || undefined;
}
