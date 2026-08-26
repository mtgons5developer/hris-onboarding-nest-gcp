import { useEffect, useState } from 'react';
import { api, getToken, putBinary, setToken } from './api';

type Me = { id: string; email: string; displayName: string; role: string };
type Task = { id: string; code: string; title: string; status: string; assigneeRole: string };
type Case = {
  id: string;
  status: string;
  employee: { firstName: string; lastName: string };
  tasks: Task[];
};

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    api<Me>('/api/v1/me')
      .then(setMe)
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  async function login() {
    setToken('dev:employee');
    const user = await api<Me>('/api/v1/me');
    setMe(user);
  }

  if (!ready) return null;
  if (!me) {
    return (
      <div className="login">
        <h1>Welcome aboard</h1>
        <p className="muted">Employee onboarding portal (lab). Seeded new hire: Luis Reyes.</p>
        <button data-testid="dev-login" onClick={login}>Continue as Luis Reyes</button>
      </div>
    );
  }

  return (
    <Checklist
      me={me}
      onLogout={() => {
        setToken(null);
        setMe(null);
      }}
      error={error}
      setError={setError}
    />
  );
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
  const done = mine.filter((t) => t.status === 'done' || t.status === 'waived').length;
  const pct = Math.round((done / Math.max(mine.length, 1)) * 100);

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <div className="muted">Onboarding portal</div>
          <h1>
            Hi {c.employee.firstName}, {pct}% complete
          </h1>
        </div>
        <div>
          <span className="badge">{c.status}</span>{' '}
          <button className="ghost" onClick={onLogout}>
            Sign out {me.displayName.split(' ')[0]}
          </button>
        </div>
      </div>
      <div className="progress">
        <span style={{ width: `${pct}%` }} />
      </div>
      {c.status === 'invited' && (
        <div className="card">
          <p>Your invite is ready. Accept to start the checklist.</p>
          <button onClick={accept}>Accept invite</button>
        </div>
      )}
      <div className="card">
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
      {error && <p className="error">{error}</p>}
      <button data-testid="submit-hr" onClick={submit} disabled={c.status !== 'in_progress'}>
        Submit for HR review
      </button>
    </div>
  );
}
