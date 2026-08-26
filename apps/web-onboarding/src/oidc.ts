const VERIFIER_KEY = 'hris_pkce_verifier';
const STATE_KEY = 'hris_pkce_state';

function clientId(): string {
  return import.meta.env.VITE_OIDC_CLIENT_ID ?? '';
}

export function oidcConfigured(): boolean {
  return Boolean(import.meta.env.VITE_OIDC_AUTHORIZE_URL && import.meta.env.VITE_OIDC_TOKEN_URL && clientId());
}

export function isLocalViteHost(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export function showDevBypass(): boolean {
  if (!isLocalViteHost()) return false;
  return import.meta.env.VITE_AUTH_DEV_BYPASS !== 'false';
}

function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomUrlSafe(byteLen: number): string {
  return b64url(crypto.getRandomValues(new Uint8Array(byteLen)));
}

async function challengeS256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return b64url(new Uint8Array(digest));
}

export function redirectUri(): string {
  return window.location.origin;
}

export async function beginHostedUiLogin(): Promise<void> {
  const authorize = import.meta.env.VITE_OIDC_AUTHORIZE_URL;
  const id = clientId();
  if (!authorize || !id) {
    throw new Error('Cognito Hosted UI is not configured (VITE_OIDC_AUTHORIZE_URL / VITE_OIDC_CLIENT_ID)');
  }
  const verifier = randomUrlSafe(32);
  const state = randomUrlSafe(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: id,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: redirectUri(),
    state,
    code_challenge: await challengeS256(verifier),
    code_challenge_method: 'S256',
  });
  window.location.assign(`${authorize}?${params.toString()}`);
}

let consumeOnce: Promise<string | null> | undefined;

export function consumeAuthCodeIfPresent(): Promise<string | null> {
  if (!consumeOnce) consumeOnce = consumeAuthCode();
  return consumeOnce;
}

async function consumeAuthCode(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  if (err) {
    const desc = params.get('error_description') ?? err;
    stripAuthParams();
    throw new Error(`Sign-in failed: ${desc}`);
  }
  const code = params.get('code');
  if (!code) return null;
  const state = params.get('state');
  const expected = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  if (!state || state !== expected || !verifier) {
    stripAuthParams();
    throw new Error('Sign-in session expired. Try again.');
  }
  const tokenUrl = import.meta.env.VITE_OIDC_TOKEN_URL;
  const id = clientId();
  if (!tokenUrl || !id) throw new Error('VITE_OIDC_TOKEN_URL / VITE_OIDC_CLIENT_ID missing');
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: id,
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  });
  stripAuthParams();
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string; id_token?: string };
  // Email-alias pool: access-token `username` is a UUID. ID token has email + groups.
  const jwt = json.id_token || json.access_token;
  if (!jwt) throw new Error('Token response missing JWT');
  return jwt;
}

function stripAuthParams() {
  const url = new URL(window.location.href);
  for (const key of ['code', 'state', 'error', 'error_description']) {
    url.searchParams.delete(key);
  }
  const search = url.searchParams.toString();
  window.history.replaceState({}, document.title, url.pathname + (search ? `?${search}` : '') + url.hash);
}

export function hostedUiLogout(): void {
  const logout = import.meta.env.VITE_OIDC_LOGOUT_URL;
  const id = clientId();
  if (!logout || !id) return;
  window.location.assign(
    `${logout}?${new URLSearchParams({ client_id: id, logout_uri: redirectUri() }).toString()}`,
  );
}
