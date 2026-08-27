# Architecture — HRIS + Onboarding Portals (NestJS + GCP Lab)

> **Superseded by the AWS lab.** As-built: Cognito + S3 + Cloudflare Pages/Tunnel — see [AS_BUILT.md](../AS_BUILT.md) and repo README. Sections below (§9 GCP topology, Firebase Auth, Cloud Run) are historical kickoff design.

**Document type:** Design / kickoff  
**Last updated:** 2026-08-26  
**Related:** [README.md](./README.md) · [ROADMAP.md](./ROADMAP.md) · [STACK_DECISIONS.md](./STACK_DECISIONS.md)

> **Honesty:** This is a **lab / portfolio** project inspired by Emapta-like HRIS and employee onboarding domains. It is **not** an Emapta client deliverable. **Alerto24** remains the production emergency product on Firebase Functions and is out of scope here.

---

## 1. Goals and non-goals

### Goals

1. Learn **NestJS** module architecture (Controller → Service → Repository/ORM) in a domain close to HRIS/onboarding.
2. Practice **PostgreSQL** modeling, migrations, transactions, and audit logging on **Cloud SQL**.
3. Host on **GCP + Firebase** (not AWS), mapping common enterprise/AWS concerns to GCP equivalents.
4. Build demos of two portal surfaces: **HRIS admin** and **employee onboarding**.
5. Keep the lab **isolated** from Alerto24 production (separate GCP/Firebase project and repo).

### Non-goals (v1)

- Replacing or integrating with Alerto24
- Full payroll, benefits, ATS, or time-and-attendance
- Multi-region HA, SOC2-ready compliance packaging
- Keycloak/Entra appliance parity (stand-in via Firebase Auth — see §7)
- gRPC, event-driven choreography, or microservices mesh
- Production multi-tenant SaaS billing
- Email/SMS provider production wiring (stubs only)
- Terraform as a prerequisite (optional later)

---

## 2. Personas

| Persona | Needs | Primary surface |
|---------|-------|-----------------|
| **HR admin** | Create employees/offers, manage onboarding cases, approve completions, view audit | HRIS Admin portal |
| **Hiring manager** | View reports’ cases, acknowledge manager tasks, limited approve | HRIS Admin (scoped) |
| **New hire (employee)** | Accept invite, complete tasks, upload documents, track progress | Onboarding portal |
| **System admin** | Roles/claims, feature flags, tenant settings (minimal in lab) | HRIS Admin (sys area) |

---

## 3. Portal surfaces

### 3.1 HRIS Admin portal

- Employee directory (lab-scale)
- Create / view **onboarding cases** from offers
- Task templates and case task status
- Document review / approve / reject
- Audit log search (who changed what)
- Role-gated: `hr_admin`, `manager` (read/limited), `system_admin`

### 3.2 Onboarding employee portal

- Magic-link / invite accept → Firebase session
- Checklist of tasks (profile, tax stub, handbook ack, ID upload, etc.)
- Upload files to GCS via signed URLs or Nest-mediated upload
- Progress % and “submit for HR review”
- Role: `employee` (own case only)

**Frontend recommendation:** React + Vite + TypeScript — either **two apps** or **one app with role-based routes**. Prefer two apps when demos should feel product-separated; one app is fine for Phase 1 speed. Flutter optional later (mobile onboarding). See [STACK_DECISIONS.md](./STACK_DECISIONS.md) ADR-005.

---

## 4. Bounded contexts → Nest modules

| Bounded context | Nest module (suggested) | Owns |
|-----------------|-------------------------|------|
| **Identity** | `IdentityModule` | Firebase token verify, user ↔ employee link, roles/claims sync helpers |
| **Org / Employees** | `EmployeesModule` | Employees, departments (optional), manager relations |
| **Onboarding workflows** | `OnboardingModule` | Offers, onboarding cases, tasks, state machine |
| **Documents** | `DocumentsModule` | Document metadata, GCS object keys, review status |
| **Audit** | `AuditModule` | Append-only audit_log writes + query API |
| **Notifications** | `NotificationsModule` | Port + console stub (email/SMS later) |

Cross-cutting: `ConfigModule`, `DatabaseModule` (TypeORM or Prisma — pick in scaffold), global exception filter, validation pipe.

---

## 5. Data model sketch

**Multi-tenancy:** Recommend **single organization first** (no `tenant_id` required). If a column is added early for learning, keep it constant (`tenant_id = 1`) and do not build tenant isolation middleware until Phase 4.

### Suggested tables

```
users
  id (uuid PK)
  firebase_uid (unique)
  email
  display_name
  role  -- hr_admin | manager | employee | system_admin  (DB mirror of claims)
  employee_id (nullable FK → employees)
  created_at, updated_at

employees
  id (uuid PK)
  employee_number (unique, lab)
  first_name, last_name
  work_email
  manager_employee_id (nullable FK → employees)
  department (nullable text)
  status  -- candidate | active | terminated
  hired_at (nullable)
  created_at, updated_at

offers
  id (uuid PK)
  employee_id (FK)
  title
  start_date
  status  -- draft | sent | accepted | withdrawn
  created_by_user_id
  created_at, updated_at

onboarding_cases
  id (uuid PK)
  employee_id (FK)
  offer_id (nullable FK)
  status  -- invited | in_progress | pending_hr | completed | cancelled
  invited_at, completed_at
  created_at, updated_at

onboarding_tasks
  id (uuid PK)
  case_id (FK → onboarding_cases)
  code  -- e.g. PROFILE, HANDBOOK, ID_DOC
  title
  assignee_role  -- employee | manager | hr
  status  -- pending | done | waived | rejected
  due_at (nullable)
  completed_at (nullable)
  sort_order
  created_at, updated_at

documents_meta
  id (uuid PK)
  case_id (FK)
  task_id (nullable FK)
  gcs_bucket
  gcs_object_key
  content_type
  original_filename
  uploaded_by_user_id
  review_status  -- pending | approved | rejected
  created_at, updated_at

audit_log
  id (bigserial PK)
  actor_user_id (nullable)
  action  -- e.g. CASE_STATUS_CHANGED
  entity_type
  entity_id
  before_json (nullable jsonb)
  after_json (nullable jsonb)
  ip (nullable)
  created_at
```

Indexes: `users.firebase_uid`, `onboarding_cases.status`, `onboarding_tasks.case_id`, `audit_log.(entity_type, entity_id)`, `audit_log.created_at`.

---

## 6. API style

- **REST** only for v1: Nest `@Controller` + `@Injectable` services + DTO classes (`class-validator` / `class-transformer`).
- Resource examples:
  - `POST /api/v1/onboarding/cases` — HR creates case from offer
  - `POST /api/v1/onboarding/cases/:id/invite`
  - `GET /api/v1/onboarding/cases/:id` — employee (own) or HR
  - `PATCH /api/v1/onboarding/tasks/:id` — complete / waive
  - `POST /api/v1/documents` — register upload + signed URL
  - `POST /api/v1/onboarding/cases/:id/submit`
  - `POST /api/v1/onboarding/cases/:id/approve` — HR
  - `GET /api/v1/audit` — HR/system admin
- **gRPC:** out of scope for v1.
- Optional: Swagger (`@nestjs/swagger`) in Phase 2.

---

## 7. AuthN / AuthZ

### AuthN stand-in for Keycloak / Azure Entra

| Enterprise pattern | This lab |
|--------------------|----------|
| IdP | Firebase Auth (± Identity Platform) |
| Roles / groups | **Custom claims** + DB `users.role` mirror |
| API trust | Nest verifies Firebase **ID token** (Admin SDK) |
| SSO federation | Deferred; Identity Platform SAML/OIDC later |
| App attestation | Optional **Firebase App Check** on portals |

### Roles

| Role | Capabilities (sketch) |
|------|------------------------|
| `hr_admin` | Full cases, approve, audit, documents review |
| `manager` | Read reports’ cases; complete manager tasks |
| `employee` | Own case, own tasks, own uploads |
| `system_admin` | Claims tools, config stubs |

### Nest patterns

- `FirebaseAuthGuard` — Bearer token → `req.user`
- `RolesGuard` + `@Roles('hr_admin')`
- Ownership checks in service layer for employee-scoped reads/writes

---

## 8. Core sequence: invite → accept → tasks → HR approve

```
HR admin                Nest API              Firebase Auth         New hire              GCS
   |                       |                       |                   |                   |
   | create employee+offer |                       |                   |                   |
   | create onboarding case|                       |                   |                   |
   | POST .../invite       |                       |                   |                   |
   |---------------------->| create/link user      |                   |                   |
   |                       | set custom claims     |                   |                   |
   |                       | stub email invite ----|--(console log)--->|                   |
   |                       |                       |                   |                   |
   |                       |                       |  accept invite    |                   |
   |                       |                       |<------------------|                   |
   |                       | verify session        | sign-in           |                   |
   |                       | case → in_progress    |                   |                   |
   |                       |                       |                   |                   |
   |                       | complete tasks        |                   |                   |
   |                       |<------------------------------------------|                   |
   |                       | signed URL / upload   |                   |------------------>|
   |                       | documents_meta        |                   |                   |
   |                       | submit → pending_hr   |                   |                   |
   |                       |                       |                   |                   |
   | review + approve      |                       |                   |                   |
   |---------------------->| case → completed      |                   |                   |
   |                       | audit_log append      |                   |                   |
```

State machine (case): `invited → in_progress → pending_hr → completed` (also `cancelled` from most states).

---

## 9. GCP topology (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Separate GCP + Firebase project (NOT Alerto24 production)              │
│                                                                         │
│   Browser                                                               │
│     │                                                                   │
│     ├──── React: HRIS Admin ──────────────┐                             │
│     └──── React: Onboarding Portal ───────┤                             │
│              │                            │                             │
│              │ Firebase Auth (ID token)   │                             │
│              │ optional App Check         │                             │
│              ▼                            ▼                             │
│         ┌─────────────────────────────────────┐                         │
│         │  Cloud Run  — NestJS API            │                         │
│         │  REST Controllers / Guards / Modules│                         │
│         └───────┬───────────────┬─────────────┘                         │
│                 │               │                                       │
│                 ▼               ▼                                       │
│         ┌──────────────┐  ┌──────────────────┐                          │
│         │ Cloud SQL    │  │ Cloud Storage    │                          │
│         │ PostgreSQL   │  │ onboarding docs  │                          │
│         └──────────────┘  └──────────────────┘                          │
│                 ▲                                                       │
│                 │ connection via Secret Manager (DB URL, etc.)          │
│                                                                         │
│  Firebase Auth / Identity Platform  ←── custom claims (roles)           │
│  GitHub Actions ──► build image ──► deploy Cloud Run                    │
└─────────────────────────────────────────────────────────────────────────┘
```

**AWS → GCP map (interview cheat sheet)**

| Emapta-ish / AWS-ish | This lab |
|----------------------|----------|
| NestJS API | NestJS on Cloud Run |
| RDS / Aurora PG | Cloud SQL PostgreSQL |
| Keycloak / Entra | Firebase Auth / Identity Platform + claims |
| S3 | Cloud Storage |
| Secrets Manager | Secret Manager |
| Lambda/ECS | Cloud Run |
| GitLab CI | GitHub Actions |

---

## 10. Local development

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Vite React   │────▶│ NestJS API   │────▶│ Postgres        │
│ :5173 / :5174│     │ :3000        │     │ Docker :5432    │
└──────────────┘     └──────────────┘     └─────────────────┘
        │                    │
        └──── Firebase Auth emulator (optional) / project config
```

- **Docker Compose:** Postgres (+ optional Adminer/pgAdmin).
- Nest + Vite run on host (or containerize Nest later).
- `.env.local` for DB URL; never commit secrets.
- Seed script: one HR admin, one manager, one employee + sample case.
- GCS: local disk adapter or fake signed URLs in `NODE_ENV=development`.

---

## 11. Testing strategy

| Layer | Approach |
|-------|----------|
| Unit | Services with mocked repos; state machine transitions |
| Integration | Nest testing module + testcontainers or Compose Postgres |
| Auth | Guard tests with mocked verified tokens / claims |
| E2E (later) | Playwright: invite → complete → approve happy path |
| Contract | Optional OpenAPI snapshot once Swagger exists |

CI: lint + unit on PR; integration on main or nightly if Cloud SQL emulator cost is a concern (prefer ephemeral Compose Postgres in Actions).

---

## 12. Cost posture

Why this beats **all-Firestore** for an HRIS-shaped lab:

| Concern | Firestore-centric | This design |
|---------|-------------------|-------------|
| Relational integrity | Manual / denormalized | Native FKs + transactions |
| Complex queries / audit | Expensive patterns | SQL + indexes |
| Nest interview signal | Weak | Strong |
| Lab cost | Low | Still low: small Cloud Run + **db-f1-micro** / small Cloud SQL, stop when idle |
| Auth | Firebase | Same Firebase Auth |

Firestore tips: min instances `0` on Cloud Run; smallest Cloud SQL; lifecycle rules on GCS; separate billing account/project alerts; no `minInstances` bump without intent.

---

## 13. Security notes (lab-grade)

- Separate GCP project from Alerto24; least-privilege service account for Cloud Run.
- Secrets only in Secret Manager / local env — not in git.
- Signed URLs short-lived; virus scan out of scope for v1 (document gap).
- Audit log append-only from application code (no UPDATE/DELETE API).
- Treat as portfolio demo — not production PII store; use synthetic names.

---

## 14. Next conversation: scaffold checklist

When starting implementation (new chat), do **not** put this inside `alerto24_mobile`. Prefer a new repo e.g. `~/repos/hris-onboarding-nest-gcp`.

- [ ] Create empty git repo (sibling path under `~/repos/`)
- [ ] Create dedicated GCP + Firebase project (name TBD)
- [ ] Scaffold NestJS app (`apps/api` or root `api/`)
- [ ] Docker Compose Postgres + `.env.example`
- [ ] Choose ORM: **Prisma** or **TypeORM** (document choice in repo README)
- [ ] Migrations for tables in §5 (single-tenant)
- [ ] `IdentityModule` + Firebase Admin verify stub
- [ ] `OnboardingModule` skeleton + case state enum
- [ ] Vite React app(s) with Firebase Auth sign-in shell
- [ ] GitHub Actions: lint/test; deploy Cloud Run later (Phase 2+)
- [ ] README: how to run locally; link back to this Architecture pack

**Out of scope for first scaffold PR:** Terraform, real email, App Check enforcement, multi-tenant middleware, Flutter.

---

## Document history

| Date | Change |
|------|--------|
| 2026-08-26 | Initial design kickoff |
