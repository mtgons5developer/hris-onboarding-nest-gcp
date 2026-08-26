import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { api, DEV_LOGINS, getToken, setToken } from './api';

type Me = { id: string; email: string; displayName: string; role: string; employeeId: string | null };
type Employee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department: string | null;
  status: string;
};
type Task = { id: string; code: string; title: string; status: string; assigneeRole: string };
type Doc = { id: string; originalFilename: string; reviewStatus: string };
type Case = {
  id: string;
  status: string;
  employee: Employee;
  tasks: Task[];
  documents: Doc[];
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

function Login() {
  const nav = useNavigate();
  const [error, setError] = useState('');

  async function pick(token: string) {
    setToken(token);
    try {
      await api<Me>('/api/v1/me');
      nav('/');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="login">
      <h1>HRIS Admin</h1>
      <p className="muted">Lab sign-in. Dev tokens map to seeded Prisma users when AUTH_DEV_BYPASS=true.</p>
      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        {DEV_LOGINS.map((d) => (
          <button key={d.token} data-testid={`login-${d.token}`} onClick={() => pick(d.token)}>
            Continue as {d.label}
          </button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function Shell({ me, onLogout }: { me: Me; onLogout: () => void }) {
  return (
    <div className="shell">
      <aside className="nav">
        <div className="brand">A24 HRIS Lab</div>
        <NavLink to="/" end>
          Cases
        </NavLink>
        <NavLink to="/employees">Employees</NavLink>
        <NavLink to="/audit">Audit</NavLink>
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
          <Route path="/" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/audit" element={<Audit />} />
        </Routes>
      </main>
    </div>
  );
}

function Cases() {
  const [rows, setRows] = useState<Case[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api<Case[]>('/api/v1/onboarding/cases')
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div>
      <h1>Onboarding cases</h1>
      <p className="muted">Invite → in progress → HR review → completed.</p>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dept</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.employee.firstName} {c.employee.lastName}
                </td>
                <td>{c.employee.department ?? '—'}</td>
                <td>
                  <span className={badgeClass(c.status)}>{c.status}</span>
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

function CaseDetail() {
  const { id } = useParams();
  const [c, setC] = useState<Case | null>(null);
  const [error, setError] = useState('');
  const reload = () =>
    api<Case>(`/api/v1/onboarding/cases/${id}`)
      .then(setC)
      .catch((e) => setError(e.message));
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

  async function reviewDoc(docId: string, reviewStatus: 'approved' | 'rejected') {
    await api(`/api/v1/documents/${docId}/review`, {
      method: 'POST',
      body: JSON.stringify({ reviewStatus }),
    });
    await reload();
  }

  if (!c) return <p>Loading…</p>;
  const done = c.tasks.filter((t) => t.status === 'done' || t.status === 'waived').length;
  return (
    <div>
      <NavLink to="/">← Cases</NavLink>
      <h1>
        {c.employee.firstName} {c.employee.lastName}
      </h1>
      <p className="muted">
        {c.employee.workEmail} · <span className={badgeClass(c.status)}>{c.status}</span>
      </p>
      <div className="progress" style={{ margin: '12px 0 16px' }}>
        <span style={{ width: `${(done / Math.max(c.tasks.length, 1)) * 100}%` }} />
      </div>
      <div className="row">
        <button onClick={() => act('invite')}>Send invite</button>
        <button className="accent" data-testid="approve-case" onClick={() => act('approve')}>
          Approve
        </button>
        <button className="ghost" onClick={() => act('return')}>
          Return to employee
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <h3>Tasks</h3>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {c.tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.assigneeRole}</td>
                <td>
                  <span className={badgeClass(t.status)}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Documents</h3>
        {c.documents.length === 0 && <p className="muted">No uploads yet.</p>}
        {c.documents.map((d) => (
          <div key={d.id} className="row" style={{ marginBottom: 8 }}>
            <span>{d.originalFilename}</span>
            <span className={badgeClass(d.reviewStatus)}>{d.reviewStatus}</span>
            <button className="ghost" onClick={() => reviewDoc(d.id, 'approved')}>
              Approve file
            </button>
            <button className="ghost" onClick={() => reviewDoc(d.id, 'rejected')}>
              Reject file
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Employees() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    workEmail: '',
    department: 'Engineering',
  });

  const load = () =>
    api<Employee[]>('/api/v1/employees')
      .then(setRows)
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const emp = await api<Employee>('/api/v1/employees', {
        method: 'POST',
        body: JSON.stringify(form),
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
      <form className="card" onSubmit={create}>
        <h3>Create employee + onboarding case</h3>
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
          <button type="submit">Create</button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
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

  if (!ready) return null;
  if (!me) return <Login />;
  return (
    <Shell
      me={me}
      onLogout={() => {
        setToken(null);
        setMe(null);
      }}
    />
  );
}

export function Guarded() {
  return <Navigate to="/" replace />;
}
