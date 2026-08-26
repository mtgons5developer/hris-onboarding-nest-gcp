import { useEffect, useState, type FormEvent } from 'react';
import { api, getToken, loginWithOidc, putBinary, setToken } from './api';
import {
  beginHostedUiLogin,
  consumeAuthCodeIfPresent,
  hostedUiLogout,
  oidcConfigured,
  showDevBypass,
} from './oidc';

type Me = { id: string; email: string; displayName: string; role: string; idpSub?: string };
type Task = { id: string; code: string; title: string; status: string; assigneeRole: string };
type Case = {
  id: string;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    status?: string;
    hiredAt?: string | null;
    manager?: { firstName: string; lastName: string } | null;
    user?: { role: string; idpSub: string } | null;
  };
  offer?: { title: string; startDate: string } | null;
  tasks: Task[];
};

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('luis.reyes@lab.local');
  const [password, setPassword] = useState('LabPass123!');
  const localFallback = showDevBypass();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const jwt = await consumeAuthCodeIfPresent();
        if (jwt) setToken(jwt);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
      if (!getToken()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const user = await api<Me>('/api/v1/me');
        if (!cancelled) setMe(user);
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login() {
    setToken('dev:employee');
    const user = await api<Me>('/api/v1/me');
    setMe(user);
  }

  async function oidc(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const token = await loginWithOidc(email, password);
      setToken(token);
      setMe(await api<Me>('/api/v1/me'));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function hostedUi() {
    setError('');
    try {
      await beginHostedUiLogin();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function logout() {
    const oidcSession = Boolean(getToken() && !getToken()!.startsWith('dev:'));
    setToken(null);
    setMe(null);
    if (oidcSession) hostedUiLogout();
  }

  if (!ready) return null;
  if (!me) {
    return (
      <div className="login">
        <h1>Welcome aboard</h1>
        <p className="muted">Day-1 access · Sign in as Luis Reyes (employee) via Amazon Cognito.</p>
        <button type="button" onClick={() => void hostedUi()} disabled={!oidcConfigured()} style={{ margin: '16px 0' }}>
          Sign in with Cognito
        </button>
        {!oidcConfigured() && (
          <p className="error">Rebuild with VITE_OIDC_AUTHORIZE_URL / VITE_OIDC_CLIENT_ID (see .env.example).</p>
        )}
        {localFallback && (
          <>
            <p className="muted">Local only: Keycloak user luis.reyes@lab.local · LabPass123!</p>
            <form onSubmit={oidc} style={{ display: 'grid', gap: 8, margin: '16px 0' }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button type="submit">Sign in with Keycloak</button>
            </form>
            <button className="ghost" data-testid="dev-login" onClick={login}>
              Continue as Luis Reyes (dev token)
            </button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return <Checklist me={me} onLogout={logout} error={error} setError={setError} />;
}

function Checklist({
  me,
  onLogout,
  error,
  setError,
}: {
  me: Me;
  onLogout: () => void;
  error: string;
  setError: (s: string) => void;
}) {
  const [c, setC] = useState<Case | null>(null);

  async function load() {
    const cases = await api<Case[]>('/api/v1/onboarding/cases');
    setC(cases[0] ?? null);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function accept() {
    if (!c) return;
    await api(`/api/v1/onboarding/cases/${c.id}/accept`, { method: 'POST' });
    await load();
  }

  async function complete(taskId: string) {
    setError('');
    try {
      await api(`/api/v1/onboarding/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done' }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function upload(task: Task, file: File) {
    if (!c) return;
    setError('');
    try {
      const slot = await api<{ document: { id: string }; uploadUrl: string }>(`/api/v1/documents`, {
        method: 'POST',
        body: JSON.stringify({
          caseId: c.id,
          taskId: task.id,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
        }),
      });
      await putBinary(slot.uploadUrl, file);
      await complete(task.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function submit() {
    if (!c) return;
    setError('');
    try {
      await api(`/api/v1/onboarding/cases/${c.id}/submit`, { method: 'POST' });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!c) {
    return (
      <div className="wrap">
        <p>No onboarding case assigned yet.</p>
        <button className="ghost" onClick={onLogout}>
          Sign out
        </button>
      </div>
    );
  }

  const mine = c.tasks.filter((t) => t.assigneeRole === 'employee');
  const others = c.tasks.filter((t) => t.assigneeRole !== 'employee');
  const done = mine.filter((t) => t.status === 'done' || t.status === 'waived').length;
  const pct = Math.round((done / Math.max(mine.length, 1)) * 100);
  const role = c.employee.user?.role ?? me.role;
  const idp = c.employee.user?.idpSub ?? me.idpSub;
  const managerName = c.employee.manager
    ? `${c.employee.manager.firstName} ${c.employee.manager.lastName}`
    : null;
  const day1 =
    c.employee.status === 'active' && c.status === 'completed'
      ? 'Active — day 1 complete'
      : c.employee.status === 'active'
        ? 'Active'
        : 'Day 1 packet';

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <div className="muted">Onboarding portal · Day-1 access</div>
          <h1>
            Hi {c.employee.firstName}, {pct}% complete
          </h1>
        </div>
        <div>
          <span className="badge">{c.status}</span>{' '}
          <span className="badge">{day1}</span>{' '}
          <button className="ghost" onClick={onLogout}>
            Sign out {me.displayName.split(' ')[0]}
          </button>
        </div>
      </div>
      <div className="progress">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="card access">
        <h3>Access ready</h3>
        <dl className="access-grid">
          <div>
            <dt>Role</dt>
            <dd>{role}</dd>
          </div>
          <div>
            <dt>IdP subject</dt>
            <dd className="mono">{idp && !idp.startsWith('pending-') ? idp : 'Not linked'}</dd>
          </div>
          <div>
            <dt>Portal</dt>
            <dd>Onboarding portal</dd>
          </div>
          {managerName && (
            <div>
              <dt>Manager</dt>
              <dd>{managerName}</dd>
            </div>
          )}
        </dl>
      </div>
      {c.status === 'invited' && (
        <div className="card">
          <p>Your invite is ready. Accept to start the checklist.</p>
          <button onClick={accept}>Accept invite</button>
        </div>
      )}
      <div className="card">
        <p className="section-label">Your checklist · employee</p>
        {mine.map((t) => (
          <div className="task" key={t.id}>
            <div>
              <strong>{t.title}</strong>
              <div className="muted">{t.code}</div>
            </div>
            <div>
              {t.status === 'pending' || t.status === 'rejected' ? (
                t.code === 'ID_DOC' ? (
                  <input
                    aria-label="Upload ID"
                    data-testid="upload-id"
                    type="file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void upload(t, f);
                    }}
                  />
                ) : (
                  <button data-testid={`complete-${t.code}`} onClick={() => complete(t.id)}>
                    Mark done
                  </button>
                )
              ) : (
                <span className="badge">{t.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {others.length > 0 && (
        <div className="card">
          <p className="section-label">Waiting on others</p>
          {others.map((t) => (
            <div className="task" key={t.id}>
              <div>
                <strong>{t.title}</strong>
                <div className="muted">
                  {t.assigneeRole}
                  {t.assigneeRole === 'manager' && managerName ? ` · ${managerName}` : ''}
                </div>
              </div>
              <span className="badge">{t.status}</span>
            </div>
          ))}
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <button data-testid="submit-hr" onClick={submit} disabled={c.status !== 'in_progress'}>
        Submit for HR review
      </button>
    </div>
  );
}
