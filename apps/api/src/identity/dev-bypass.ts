/** `AUTH_DEV_BYPASS` only applies to the local Nest process, not the public tunnel. */
export function isLocalDevBypassRequest(
  authDevBypass: string | undefined,
  headers: { host?: string; origin?: string },
): boolean {
  if (authDevBypass !== 'true') return false;
  const host = String(headers.host ?? '')
    .split(':')[0]
    .toLowerCase();
  const localHost = host === 'localhost' || host === '127.0.0.1';
  if (!localHost) return false;
  const origin = String(headers.origin ?? '');
  if (!origin) return true;
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}
