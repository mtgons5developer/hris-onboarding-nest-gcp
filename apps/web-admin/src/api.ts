const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function getToken(): string | null {
  return localStorage.getItem('hris_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('hris_token', token);
  else localStorage.removeItem('hris_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const DEV_LOGINS = [
  { label: 'Harper Reyes — HR admin', token: 'dev:hr_admin' },
  { label: 'Maya Santos — Manager', token: 'dev:manager' },
  { label: 'System admin', token: 'dev:system_admin' },
];
