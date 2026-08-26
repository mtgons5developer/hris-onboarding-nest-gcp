import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { api, DEV_LOGINS, getToken, loginWithOidc, setToken } from './api';
import {
  beginHostedUiLogin,
  consumeAuthCodeIfPresent,
  hostedUiLogout,
  oidcConfigured,
  showDevBypass,
} from './oidc';

type Me = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  employeeId: string | null;
  idpSub?: string;
};
type EmployeeUser = { id: string; role: string; email: string; idpSub: string };
type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department: string | null;
  status: string;
  hiredAt?: string | null;
  managerEmployeeId?: string | null;
  manager?: { id: string; firstName: string; lastName: string } | null;
  user?: EmployeeUser | null;
};
type Task = { id: string; code: string; title: string; status: string; assigneeRole: string };
type Doc = { id: string; originalFilename: string; reviewStatus: string };
type Case = {
  id: string;
  status: string;
  employee: Employee;
  tasks: Task[];
  documents: Doc[];
  offer?: { title: string; startDate: string } | null;
};
type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { email: string; displayName: string } | null;
};

function badgeClass(status: string) {
  if (['completed', 'done', 'approved', 'active'].includes(status)) return 'badge';
  if (['pending_hr', 'invited', 'pending', 'candidate'].includes(status)) return 'badge pending';
  if (['cancelled', 'rejected', 'terminated'].includes(status)) return 'badge danger';
  return 'badge warn';
}

const TASK_ROLE_ORDER = ['employee', 'manager', 'hr'] as const;
const TASK_ROLE_LABEL: Record<string, string> = {
  employee: 'Employee (new hire)',
  manager: 'Manager',
  hr: 'HR',
};

function portalForRole(role?: string | null) {
  return role === 'hr_admin' || role === 'manager' || role === 'system_admin'
    ? 'Admin console'
    : 'Onboarding portal';
}

function day1Label(employeeStatus: string, caseStatus: string) {
  if (employeeStatus === 'active' && caseStatus === 'completed') return 'Active — day 1 complete';
  if (employeeStatus === 'active') return 'Active';
  if (caseStatus === 'pending_hr') return 'Day 1 — HR review';
  return 'Day 1 packet';
}

function formatDay(iso?: string | null) {
  if (!iso) return '—';
  const day = iso.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return day;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toISOString().slice(0, 10);
}

function idpLabel(sub?: string | null) {
  if (!sub) return 'Not linked';
  if (sub.startsWith('pending-')) return 'Invite pending';
  return sub;
}

function groupTasks(tasks: Task[]) {
  return TASK_ROLE_ORDER.map((role) => ({
    role,
    label: TASK_ROLE_LABEL[role],
    tasks: tasks.filter((t) => t.assigneeRole === role),
  })).filter((g) => g.tasks.length > 0);
}

function Login({ bootError, onAuthed }: { bootError: string; onAuthed: (me: Me) => void }) {
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('hr@lab.local');
  const [password, setPassword] = useState('LabPass123!');
  const localFallback = showDevBypass();

  async function pick(token: string) {
    setToken(token);
    try {
      const user = await api<Me>('/api/v1/me');
      onAuthed(user);
      nav('/');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function oidc(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const token = await loginWithOidc(email, password);
      await pick(token);
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

  return (
    <div className="login">
      <h1>HRIS Admin</h1>
      <p className="muted">Day-1 access · Cognito Hosted UI · groups hr_admin / manager / system_admin.</p>
      <button type="button" onClick={() => void hostedUi()} disabled={!oidcConfigured()} style={{ marginTop: 16 }}>
        Sign in with Cognito
      </button>
      {!oidcConfigured() && (
        <p className="error">Rebuild with VITE_OIDC_AUTHORIZE_URL / VITE_OIDC_CLIENT_ID (see .env.example).</p>
      )}
      {localFallback && (
        <>
          <p className="muted" style={{ marginTop: 24 }}>
            Local only: Keycloak password grant or seed tokens.
          </p>
          <form onSubmit={oidc} style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="submit">Sign in with Keycloak</button>
          </form>
          <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            {DEV_LOGINS.map((d) => (
              <button key={d.token} className="ghost" data-testid={`login-${d.token}`} onClick={() => pick(d.token)}>
                Continue as {d.label}
              </button>
            ))}
          </div>
        </>
      )}
      {(error || bootError) && <p className="error">{error || bootError}</p>}
    </div>
  );
}

function Shell({ me, onLogout }: { me: Me; onLogout: () => void }) {
  return (
    <div className="shell">
      <aside className="nav">
        <div className="brand">A24 HRIS Lab</div>
        <div className="brand-sub">Day-1 access</div>
        <NavLink to="/" end>
          {me.role === 'manager' ? 'My reports' : 'Cases'}
        </NavLink>
        <NavLink to="/employees">Employees</NavLink>
        {(me.role === 'hr_admin' || me.role === 'system_admin') && <NavLink to="/audit">Audit</NavLink>}
        <div className="who">
          <div>{me.displayName}</div>
          <div>{me.role}</div>
          <button className="ghost" style={{ marginTop: 12, color: '#f4efe6', borderColor: '#4a5568' }} onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Cases me={me} />} />
          <Route path="/cases/:id" element={<CaseDetail me={me} />} />
          <Route path="/employees" element={<Employees me={me} />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </main>
    </div>
  );
}

function Cases({ me }: { me: Me }) {
  const [rows, setRows] = useState<Case[]>([]);
  const [error, setError] = useState('');
  const isManager = me.role === 'manager';
  useEffect(() => {
    api<Case[]>('/api/v1/onboarding/cases')
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div>
      <h1>Onboarding cases</h1>
      <p className="muted">
        {isManager
          ? 'Your reports — complete MANAGER_INTRO on each packet. Harper sees every hire.'
          : 'Hire event → day-1 packet (employee + manager + HR) → activate.'}
      </p>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Manager</th>
              <th>Dept</th>
              <th>Packet</th>
              <th>Day 1</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.employee.firstName} {c.employee.lastName}
                </td>
                <td>
                  {c.employee.manager
                    ? `${c.employee.manager.firstName} ${c.employee.manager.lastName}`
                    : '—'}
                </td>
                <td>{c.employee.department ?? '—'}</td>
                <td>
                  <span className={badgeClass(c.status)}>{c.status}</span>
                </td>
                <td>
                  <span className={badgeClass(c.employee.status)}>{c.employee.status}</span>
                </td>
                <td>
                  <NavLink to={`/cases/${c.id}`}>Open</NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseDetail({ me }: { me: Me }) {
  const { id } = useParams();
  const [c, setC] = useState<Case | null>(null);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState('');
  const canAudit = me.role === 'hr_admin' || me.role === 'system_admin';
  const isHr = me.role === 'hr_admin';
  const isManager = me.role === 'manager';

  const loadAudit = () => {
    if (!id || !canAudit) return Promise.resolve();
    return api<AuditRow[]>(`/api/v1/audit?entityType=onboarding_case&entityId=${id}`)
      .then(setAuditRows)
      .catch(() => setAuditRows([]));
  };

  const reload = () =>
    Promise.all([
      api<Case>(`/api/v1/onboarding/cases/${id}`).then(setC),
      loadAudit(),
    ]).catch((e) => setError((e as Error).message));

  useEffect(() => {
    reload();
  }, [id]);

  async function act(path: string) {
    setError('');
    try {
      await api(`/api/v1/onboarding/cases/${id}/${path}`, { method: 'POST' });
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function completeTask(taskId: string) {
    setError('');
    try {
      await api(`/api/v1/onboarding/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done' }),
      });
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function reviewDoc(docId: string, reviewStatus: 'approved' | 'rejected') {
    await api(`/api/v1/documents/${docId}/review`, {
      method: 'POST',
      body: JSON.stringify({ reviewStatus }),
    });
    await reload();
  }

  if (!c) return <p>Loading…</p>;
  const done = c.tasks.filter((t) => t.status === 'done' || t.status === 'waived').length;
  const linkedRole = c.employee.user?.role ?? 'employee';
  const startDate = c.offer?.startDate ?? c.employee.hiredAt;
  return (
    <div>
      <NavLink to="/">← Cases</NavLink>
      <h1>
        {c.employee.firstName} {c.employee.lastName}
      </h1>
      <p className="muted">
        {c.employee.workEmail} · {c.offer?.title ?? c.employee.department ?? 'Hire'} ·{' '}
        <span className={badgeClass(c.status)}>{c.status}</span>{' '}
        <span className={badgeClass(c.employee.status)}>{day1Label(c.employee.status, c.status)}</span>
      </p>
      <div className="progress" style={{ margin: '12px 0 16px' }}>
        <span style={{ width: `${(done / Math.max(c.tasks.length, 1)) * 100}%` }} />
      </div>
      <div className="card access">
        <h3>Access ready</h3>
        <dl className="access-grid">
          <div>
            <dt>Role</dt>
            <dd>{linkedRole}</dd>
          </div>
          <div>
            <dt>IdP subject</dt>
            <dd className="mono">{idpLabel(c.employee.user?.idpSub)}</dd>
          </div>
          <div>
            <dt>Portal</dt>
            <dd>{portalForRole(linkedRole)}</dd>
          </div>
          <div>
            <dt>Manager</dt>
            <dd>
              {c.employee.manager
                ? `${c.employee.manager.firstName} ${c.employee.manager.lastName}`
                : '—'}
            </dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{formatDay(startDate)}</dd>
          </div>
        </dl>
        <p className="muted" style={{ margin: '0.6rem 0 0' }}>
          Cognito group maps to this role. No SCIM — Harper activates the hire from this case.
        </p>
      </div>
      {isHr && (
        <div className="row">
          <button onClick={() => act('invite')}>Send invite</button>
          <button className="accent" data-testid="approve-case" onClick={() => act('approve')}>
            Approve &amp; activate
          </button>
          <button className="ghost" onClick={() => act('return')}>
            Return to employee
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {groupTasks(c.tasks).map((g) => (
        <div className="card" key={g.role}>
          <h3>{g.label}</h3>
          <p className="section-label">Day-1 checklist · {g.role}</p>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {g.tasks.map((t) => {
                const canComplete =
                  isManager &&
                  t.assigneeRole === 'manager' &&
                  (t.status === 'pending' || t.status === 'rejected');
                return (
                  <tr key={t.id}>
                    <td>
                      {t.title}
                      <div className="muted">{t.code}</div>
                    </td>
                    <td>
                      <span className={badgeClass(t.status)}>{t.status}</span>
                    </td>
                    <td>
                      {canComplete && (
                        <button className="ghost" data-testid={`complete-${t.code}`} onClick={() => completeTask(t.id)}>
                          Mark done
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      <div className="card">
        <h3>Documents</h3>
        {c.documents.length === 0 && <p className="muted">No uploads yet.</p>}
        {c.documents.map((d) => (
          <div key={d.id} className="row" style={{ marginBottom: 8 }}>
            <span>{d.originalFilename}</span>
            <span className={badgeClass(d.reviewStatus)}>{d.reviewStatus}</span>
            {isHr && (
              <>
                <button className="ghost" onClick={() => reviewDoc(d.id, 'approved')}>
                  Approve file
                </button>
                <button className="ghost" onClick={() => reviewDoc(d.id, 'rejected')}>
                  Reject file
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      {canAudit && (
        <div className="card">
          <h3>Audit</h3>
          <p className="muted">Invite, approve, and return on this case.</p>
          {auditRows.length === 0 && <p className="muted">No events yet.</p>}
          {auditRows.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((r) => (
                  <tr key={String(r.id)}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>{r.action}</td>
                    <td>{r.actor?.displayName ?? 'system'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function Employees({ me }: { me: Me }) {
  const [rows, setRows] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    workEmail: '',
    department: 'Engineering',
    managerEmployeeId: '',
    hiredAt: '',
  });

  const load = () =>
    api<Employee[]>('/api/v1/employees')
      .then(setRows)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (form.managerEmployeeId) return;
    const maya = rows.find((r) => r.workEmail === 'maya.santos@lab.local');
    if (maya) setForm((f) => ({ ...f, managerEmployeeId: maya.id }));
  }, [rows, form.managerEmployeeId]);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload: Record<string, string> = {
        employeeNumber: form.employeeNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        workEmail: form.workEmail,
        department: form.department,
      };
      if (form.managerEmployeeId) payload.managerEmployeeId = form.managerEmployeeId;
      if (form.hiredAt) payload.hiredAt = form.hiredAt;
      const emp = await api<Employee>('/api/v1/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await api('/api/v1/onboarding/cases', {
        method: 'POST',
        body: JSON.stringify({ employeeId: emp.id, title: `${form.department} new hire` }),
      });
      setForm({ ...form, employeeNumber: '', firstName: '', lastName: '', workEmail: '' });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1>Employees</h1>
      <p className="muted">
        {me.role === 'manager'
          ? 'Your reports — one employee record per hire.'
          : 'One hire creates the employee record and the day-1 packet.'}
      </p>
      {me.role === 'hr_admin' && (
        <form className="card" onSubmit={create}>
          <h3>Hire</h3>
          <p className="muted">Creates the employee and default onboarding tasks in one action.</p>
          <div className="row">
            <input
              placeholder="EMP-300"
              value={form.employeeNumber}
              onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
              required
            />
            <input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="work@lab.local"
              value={form.workEmail}
              onChange={(e) => setForm({ ...form, workEmail: e.target.value })}
              required
            />
            <select
              aria-label="Manager"
              value={form.managerEmployeeId}
              onChange={(e) => setForm({ ...form, managerEmployeeId: e.target.value })}
            >
              <option value="">Manager (optional)</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.firstName} {r.lastName}
                </option>
              ))}
            </select>
            <input
              type="date"
              aria-label="Start date"
              value={form.hiredAt}
              onChange={(e) => setForm({ ...form, hiredAt: e.target.value })}
            />
            <button type="submit">Hire</button>
          </div>
        </form>
      )}
      {error && <p className="error">{error}</p>}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Manager</th>
              <th>Start</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td>{e.employeeNumber}</td>
                <td>
                  {e.firstName} {e.lastName}
                </td>
                <td>{e.workEmail}</td>
                <td>{e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : '—'}</td>
                <td>{formatDay(e.hiredAt)}</td>
                <td>
                  <span className={badgeClass(e.status)}>{e.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Audit() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  useEffect(() => {
    api<AuditRow[]>('/api/v1/audit').then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div>
      <h1>Audit log</h1>
      <p className="muted">Append-only. No update/delete API.</p>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.action}</td>
                <td>
                  {r.entityType} {r.entityId.slice(0, 8)}
                </td>
                <td>{r.actor?.displayName ?? 'system'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const jwt = await consumeAuthCodeIfPresent();
        if (jwt) setToken(jwt);
      } catch (e) {
        if (!cancelled) setBootError((e as Error).message);
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

  if (!ready) return null;
  if (!me) return <Login bootError={bootError} onAuthed={setMe} />;
  return (
    <Shell
      me={me}
      onLogout={() => {
        const oidc = Boolean(getToken() && !getToken()!.startsWith('dev:'));
        setToken(null);
        setMe(null);
        if (oidc) hostedUiLogout();
      }}
    />
  );
}

export function Guarded() {
  return <Navigate to="/" replace />;
}
