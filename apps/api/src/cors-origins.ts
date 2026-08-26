/** Lab Vite + Pages hosts. Always allowed; `CORS_ORIGINS` only adds extras. */
export const DEFAULT_WEB_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://admin.getlakbay.com',
  'https://onboarding.getlakbay.com',
  'https://hris-admin.pages.dev',
  'https://hris-onboarding.pages.dev',
] as const;

export function corsAllowlist(corsOriginsEnv?: string): string[] {
  const extra = (corsOriginsEnv ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set<string>([...DEFAULT_WEB_ORIGINS, ...extra])];
}

/** Preview deploys: `https://<hash>.hris-admin.pages.dev` (not arbitrary `*.pages.dev`). */
export function isHrisPagesPreviewOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname;
    return host.endsWith('.hris-admin.pages.dev') || host.endsWith('.hris-onboarding.pages.dev');
  } catch {
    return false;
  }
}

export function isAllowedCorsOrigin(origin: string | undefined, allowlist: string[]): boolean {
  if (!origin) return true;
  return allowlist.includes(origin) || isHrisPagesPreviewOrigin(origin);
}
