# As-built notes (Phase 4)

Design pack: [design/ARCHITECTURE.md](./design/ARCHITECTURE.md). This file records what the scaffold actually ships vs. the kickoff docs.

| Design item | As-built |
|-------------|----------|
| Repo location | `~/repos/hris-onboarding-nest-gcp` (sibling of Alerto24, not inside it) |
| ORM | **Prisma** (not TypeORM) — migrations in `apps/api/prisma/migrations` |
| Frontends | Two Vite apps: `web-admin` :5173 and `web-onboarding` :5174 |
| Auth local | `AUTH_DEV_BYPASS=true` + `Bearer dev:hr_admin` / `dev:manager` / `dev:employee` |
| Auth prod | Firebase Admin `verifyIdToken` when `FIREBASE_PROJECT_ID` / ADC is set |
| Files | `STORAGE_DRIVER=local` writes `data/uploads`; `gcs` uses signed PUT URLs |
| Notifications | `NotificationPort` + console stub (SendGrid env reserved) |
| OpenAPI | Swagger at `/api/docs` |
| Multi-tenant | `tenant_id` column default `1`; no isolation middleware |
| GCP | Terraform under `infra/terraform`; **no live lab project provisioned in this thread** |
| Email | Stub only |
| Virus scan | Still out of scope |

## Happy-path sequence (implemented)

1. HR creates employee + case (`POST /api/v1/employees`, `POST /api/v1/onboarding/cases`).
2. HR invites (`POST .../invite`) → user linked, console email stub, custom-claim stub.
3. Employee accepts (`POST .../accept`) → `invited` → `in_progress`.
4. Employee completes tasks / uploads ID → `PATCH .../tasks/:id`, `POST /api/v1/documents`.
5. Employee submits → `pending_hr`.
6. HR approves → `completed`; employee status `active`; `audit_log` append-only.

## Demo script (≈10 minutes)

1. `npm run db:up && npm run prisma:migrate && npm run prisma:seed`
2. `npm run dev:api` → http://localhost:3000/health and `/api/docs`
3. `npm run dev:admin` → sign in as Harper Reyes, open Luis Reyes case
4. `npm run dev:onboarding` → complete remaining tasks, upload a fake ID, submit
5. Back in admin → **Approve**; show Audit tab
6. Walk the Nest modules (Identity / Employees / Onboarding / Documents / Audit) and the AWS→GCP map in Architecture §9
