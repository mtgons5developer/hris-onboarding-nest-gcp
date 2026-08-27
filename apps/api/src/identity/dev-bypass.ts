/** `AUTH_DEV_BYPASS` only applies on the local Nest process, not the public tunnel. */
export function isLocalDevBypassRequest(
  authDevBypass: string | undefined,
  headers: { host?: string; origin?: string },
): boolean {
  if (authDevBypass !== 'true') return false;

  const host = String(headers.host ?? '')
    .split(':')[0]
    .toLowerCase();
  if (!isDevBypassHost(host)) return false;

  const origin = String(headers.origin ?? '');
  if (!origin) return true;
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return isDevBypassHost(hostname);
  } catch {
    return false;
  }
}

/** localhost, loopback, or RFC1918 LAN — not public hostnames like api.getlakbay.com. */
function isDevBypassHost(host: string): boolean {
  if (host === 'localhost' || host === '127.0.0.1') return true;
  return isPrivateLanIpv4(host);
}

function isPrivateLanIpv4(host: string): boolean {
  const parts = host.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}
