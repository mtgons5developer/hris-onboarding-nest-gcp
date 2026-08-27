const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function getToken(): string | null {
  return localStorage.getItem('hris_onboarding_token');
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem('hris_onboarding_token', token);
  else localStorage.removeItem('hris_onboarding_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.body && !(init.body instanceof ArrayBuffer) && !(init.body instanceof Blob)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function putBinary(url: string, file: File) {
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
  if (!res.ok) throw new Error(`Upload failed ${res.status}`);
}

/** Opens a document URL — fetches with auth when the URL is a same-origin API download. */
export async function openDocumentDownloadUrl(downloadUrl: string) {
  const target = new URL(downloadUrl, API);
  const apiOrigin = new URL(API).origin;
  const needsAuth = target.origin === apiOrigin && target.pathname.endsWith('/download');
  if (needsAuth) {
    const token = getToken();
    const res = await fetch(target.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), '_blank');
    return;
  }
  window.open(downloadUrl, '_blank');
}

export async function viewDocument(docId: string) {
  const { downloadUrl } = await api<{ downloadUrl: string }>(`/api/v1/documents/${docId}/download-url`);
  await openDocumentDownloadUrl(downloadUrl);
}

const KEYCLOAK_TOKEN_URL =
  import.meta.env.VITE_KEYCLOAK_TOKEN_URL ??
  'http://localhost:8082/realms/hris/protocol/openid-connect/token';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'hris-web';

/** Local Keycloak password grant only. Public Pages use Hosted UI PKCE (`oidc.ts`). */
export async function loginWithOidc(username: string, password: string): Promise<string> {
  const res = await fetch(KEYCLOAK_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: KEYCLOAK_CLIENT_ID,
      username,
      password,
      scope: 'openid email profile',
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try {
      const json = JSON.parse(body) as { error?: string; error_description?: string };
      detail = json.error_description ?? json.error ?? body;
    } catch {
      /* keep raw body */
    }
    throw new Error(`IdP login failed (${res.status}): ${detail}`);
  }
  const json = (await res.json()) as { access_token?: string; id_token?: string };
  const jwt = json.id_token || json.access_token;
  if (!jwt) throw new Error('IdP response missing JWT');
  return jwt;
}
