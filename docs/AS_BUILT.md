# As-built notes (Phase 4 + lab)

Design pack: [design/ARCHITECTURE.md](./design/ARCHITECTURE.md). This file records what the scaffold actually ships vs. the kickoff docs.

| Design item | As-built |
|-------------|----------|
| Repo location | `~/repos/hris-onboarding-nest-gcp` (sibling of Alerto24, not inside it) |
| ORM | **Prisma** (not TypeORM) — migrations in `apps/api/prisma/migrations` |
| Frontends | Vite: `web-admin` :5173, `web-onboarding` :5174, `web-landing` :5175 (apex) |
| Mobile | Flutter `apps/mobile` — employee checklist + HR/manager admin console; same Nest API |
| Auth local | `AUTH_DEV_BYPASS=true` + `Bearer dev:hr_admin` / `dev:manager` / `dev:employee` (localhost / LAN Host only) |
| Auth IdP | Cognito Hosted UI (PKCE) on Pages · Keycloak password-grant on localhost (`VITE_KEYCLOAK_*`) · Nest multi-issuer JWKS (`OIDC_ISSUER` / `OIDC_JWKS_URI` comma-separated) · **not** Firebase |
| Files | `STORAGE_DRIVER=local` (dev) → `data/uploads` + `GET .../download`; `s3` (lab) → presigned PUT/GET; `gcs` optional leftover adapter; upload / **view** / **delete** on web + Flutter |
| Quotas | 10 MB / file · 100 MB / employee (Nest); S3 30-day lifecycle on `uploads/*` (metadata rows remain) |
| Notifications | `NotificationPort` + console stub (SendGrid env reserved) |
| OpenAPI | Swagger at `/api/docs` |
| Multi-tenant | `tenant_id` column default `1`; no isolation middleware |
| Hosting | Cloudflare Pages **Active**: `getlakbay.com` (`hris-landing`), `admin` / `onboarding.getlakbay.com`; Nest via **Cloudflare Tunnel** at `api.getlakbay.com` |
| Email | Stub only |
| Virus scan | Still out of scope |

## Happy-path sequence (implemented)

1. HR creates employee + case (`POST /api/v1/employees`, `POST /api/v1/onboarding/cases`).
2. HR invites (`POST .../invite`) → user linked, console email stub, custom-claim stub.
3. Employee accepts (`POST .../accept`) → `invited` → `in_progress`.
4. Employee completes tasks / uploads ID → `PATCH .../tasks/:id`, `POST /api/v1/documents` (+ view / delete via `download-url` / `DELETE`).
5. Employee submits → `pending_hr`.
6. HR approves → `completed`; employee status `active`; `audit_log` append-only (`DOCUMENT_DELETED` on delete).

## Demo script (≈10 minutes)

1. `npm run db:up && npm run prisma:migrate && npm run prisma:seed`
2. `npm run dev:api` → http://localhost:3000/health and `/api/docs`
3. `npm run dev:landing` → http://localhost:5175 (sign-out target)
4. `npm run dev:admin` → Harper (seed) or Cognito / Keycloak → open Luis Reyes case → **View** ID doc
5. `npm run dev:onboarding` → complete tasks, upload fake ID, **View** / **Delete**, submit
6. Back in admin → **Approve**; show Audit tab
7. Optional: Flutter (`apps/mobile/README.md`) — Luis checklist then Harper case detail on the same app
8. Walk Nest modules (Identity / Employees / Onboarding / Documents / Audit) and the Cognito + S3 + Tunnel topology ([AWS_AND_IAM.md](./AWS_AND_IAM.md); design pack §9 is **historical GCP** — see note at top of [design/ARCHITECTURE.md](./design/ARCHITECTURE.md))

**Talk track:** *Same Nest API for three Vite portals and Flutter; Amazon Cognito PKCE in prod, Keycloak in Compose locally, multi-issuer JWKS; documents local (dev) or private S3 (lab) with Nest quotas; Cloudflare Pages + Tunnel — not Cloud Run / Firebase.*

## Lab public URLs

| Host | Status |
|------|--------|
| https://getlakbay.com | Pages **Active** (`hris-landing`) |
| https://admin.getlakbay.com | Pages **Active** (`hris-admin`) |
| https://onboarding.getlakbay.com | Pages **Active** (`hris-onboarding`) |
| https://api.getlakbay.com | Tunnel + Nest (lab) |

Vite bakes `VITE_API_BASE_URL` (not `VITE_API_URL`) at build time. After the tunnel is up: `curl https://api.getlakbay.com/health` then **Sign in with Cognito** on admin (`hr@lab.local` / `LabPass123!`). `AUTH_DEV_BYPASS` is ignored unless Nest `Host` is localhost/LAN. Pages builds should set `VITE_AUTH_DEV_BYPASS=false`.
