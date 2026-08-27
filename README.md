# HRIS + Onboarding Portals (NestJS + PostgreSQL lab)

Portfolio / learning lab for **NestJS module architecture** and **PostgreSQL**, with **OIDC IAM/RBAC** (Keycloak locally; **Amazon Cognito** Hosted UI on public Pages), three **React (Vite)** surfaces on Cloudflare Pages, and a **Flutter** iOS/Android app in `apps/mobile` (same Nest API). Documents: **local** disk in dev, **S3** in the lab. Inspired by HRIS + employee onboarding workflows — **not** an Emapta deliverable and **not** part of Alerto24 production. (Repo folder name still ends in `-gcp` for history; primary cloud is **AWS**.)

**Public repo:** https://github.com/mtgons5developer/hris-onboarding-nest-gcp

| | |
|---|---|
| API | NestJS (local `:3000`; lab public `https://api.getlakbay.com` via Cloudflare Tunnel) |
| Database | PostgreSQL via Docker Compose |
| ORM | **Prisma** |
| Auth | Multi-issuer OIDC JWKS (`JwtAuthGuard`) · Cognito Hosted UI + PKCE on Pages · Keycloak password-grant on localhost · seed tokens localhost-only |
| Apps | `web-admin` (HR) · `web-onboarding` (new hire) · `web-landing` (getlakbay.com) · `mobile` (Flutter) |
| Files | `STORAGE_DRIVER=local` (default) · `s3` (lab) · `gcs` (optional leftover) — upload / view / delete |
| CI | GitHub Actions lint / unit / Playwright · Pages deploy (`hris-admin`, `hris-onboarding`, `hris-landing`) |

Design source (also copied under `docs/design/`):  
`/Users/ernestoh.almeda.jr/Documents/A24/HRIS-Onboarding-Nest-GCP/`

- [Architecture](docs/design/ARCHITECTURE.md)
- [Roadmap](docs/design/ROADMAP.md)
- [Stack ADRs](docs/design/STACK_DECISIONS.md)
- [As-built diffs](docs/AS_BUILT.md)
- [Auth / AWS free tier](docs/AWS_AND_IAM.md) (Cognito + S3 — primary cloud path)
- [Production: Cloudflare + mobile](docs/PRODUCTION_CLOUDFLARE.md) (`getlakbay.com` — Pages Active; Tunnel for `api`)
- [GCP setup (unused / optional)](docs/GCP_SETUP.md) — Cloud Run + GCS Terraform; **not** the lab deploy path

**Interview one-liner:** *React admin + onboarding + landing on Cloudflare Pages, Flutter on the same Nest API, Amazon Cognito Hosted UI in prod and Keycloak in Compose locally, JWKS multi-issuer verify, documents on local disk (dev) or private S3 (lab) with Nest-enforced quotas — not Cloud Run / Firebase.*

## Run locally (Phase 0+)

Requires **Node 20+** and **Docker**. Flutter SDK only if you run `apps/mobile`.

```bash
cp .env.example .env
cp .env.example apps/api/.env
cp apps/web-admin/.env.example apps/web-admin/.env
cp apps/web-onboarding/.env.example apps/web-onboarding/.env
# landing: optional overrides only — see apps/web-landing/.env.example

npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

npm run dev:api          # http://localhost:3000/health  ·  Swagger /api/docs
npm run dev:landing      # http://localhost:5175 — sign-out from admin/onboarding redirects here
npm run dev:admin        # http://localhost:5173
npm run dev:onboarding   # http://localhost:5174
# Flutter (not an npm workspace): cd apps/mobile && flutter run
# See apps/mobile/README.md — iOS sim vs Android emulator vs physical LAN API hosts.
```

Postgres: `localhost:5432` (user/pass/db `hris` / `hris` / `hris_lab`). Adminer: http://localhost:8081. Keycloak: http://localhost:8082 (`admin` / `admin`). Restart Nest after changing `apps/api/.env`.

### Seeded logins

**Public Cognito Hosted UI** (password `LabPass123!`): `hr@lab.local` (admin), `maya.santos@lab.local` (manager), `sysadmin@lab.local` (system_admin), `luis.reyes@lab.local` (onboarding).

Keycloak Compose uses the same emails / password. Dev bypass (`AUTH_DEV_BYPASS=true`) is **localhost / LAN only** (Harper buttons never render on getlakbay.com):

| Portal | Control | Token |
|--------|---------|-------|
| Admin | Harper Reyes (HR) | `Bearer dev:hr_admin` |
| Admin | Maya Santos (manager) | `Bearer dev:manager` |
| Onboarding (web + Flutter) | Luis Reyes (new hire) | `Bearer dev:employee` |

### Auth: which button / which IdP

| Surface | How to sign in |
|---------|----------------|
| **Pages** (`admin` / `onboarding.getlakbay.com`) | **Sign in with Cognito** — authorization code + PKCE (`VITE_OIDC_*`). Set `VITE_AUTH_DEV_BYPASS=false` on Pages builds. |
| **Localhost Vite** | Cognito Hosted UI **or** **Sign in with Keycloak** (password grant via `VITE_KEYCLOAK_*`, defaults to Compose `:8082`) **or** Harper/Maya/Luis seed buttons when `VITE_AUTH_DEV_BYPASS` is not `false`. |
| **Nest JWKS** | `OIDC_ISSUER` / `OIDC_JWKS_URI` are **comma-separated** pairs (Cognito + Keycloak in `.env.example`). `OIDC_AUDIENCE` lists both IdPs’ public clients (`hris-web`, `hris-mobile`, `account`, …). |
| **Do not** | Point `VITE_KEYCLOAK_TOKEN_URL` at Cognito — Cognito rejects `grant_type=password`. Cognito pool/client IDs: [docs/AWS_AND_IAM.md](docs/AWS_AND_IAM.md) and `infra/aws-cognito/`. |

Sign-out from admin/onboarding goes to the **landing** site (`VITE_LANDING_URL=https://getlakbay.com` in prod; localhost always uses `:5175`).

### Documents

Register → upload → **View** / **Delete** on web admin, web onboarding, and Flutter (employee checklist + admin case detail).

| API | Role |
|-----|------|
| `POST /api/v1/documents` + `PUT .../upload` | Register + bytes (or presigned PUT for s3/gcs) |
| `GET /api/v1/documents/:id/download-url` | Authz’d download URL (presigned S3/GCS, or Nest proxy for local) |
| `GET /api/v1/documents/:id/download` | Local-driver byte stream (inline); not used for S3 |
| `DELETE /api/v1/documents/:id` | Uploader or `hr_admin`; cleans storage + audit |

`STORAGE_DRIVER=local` (default dev) · `s3` (prod lab — see `infra/aws-s3/`) · `gcs` (optional leftover adapter — not used in this lab). Nest enforces **10 MB / file** and **100 MB / employee**; S3 lifecycle is **30 days** on `uploads/*` (Postgres metadata rows remain). Details: [docs/AWS_AND_IAM.md](docs/AWS_AND_IAM.md#amazon-s3-document-uploads-lab).

### Lab clients & URLs

| Host / app | Role |
|------------|------|
| https://getlakbay.com | Landing (`hris-landing` Pages) |
| https://admin.getlakbay.com | HR admin (`hris-admin`) |
| https://onboarding.getlakbay.com | New hire (`hris-onboarding`) |
| https://api.getlakbay.com | Nest via **cloudflared** Tunnel ([infra/cloudflare/README.md](infra/cloudflare/README.md)) |
| `apps/mobile` | Flutter — role routing from `/api/v1/me`; admin case detail + document view/delete |

### Troubleshoot (lab)

| Symptom | Likely cause |
|---------|----------------|
| Intermittent **403** on Pages HTML/assets | Cloudflare Access / WAF / bot rules — not Nest JWT |
| Cognito “unsupported_grant_type” | Used Keycloak password-grant against Cognito token URL |
| Old OIDC / CORS / bypass behavior after `.env` edit | Restart `npm run dev:api` |
| Sign-out lands on wrong host | Cognito `logout_uri` must allow `https://getlakbay.com` (and localhost `:5175`); see [docs/AWS_AND_IAM.md](docs/AWS_AND_IAM.md) |

## What each phase shipped

| Phase | Outcome |
|-------|---------|
| **0** | Monorepo, Nest health, Compose Postgres, Prisma, two Vite shells |
| **1** | Schema, guards, seed, employees + onboarding cases/tasks, audit, sign-in UIs |
| **2** | Document register/upload, local storage (+ optional GCS adapter), submit/approve state machine, Swagger, Jest |
| **3** | Dockerfile, CI; optional Cloud Run workflow + GCP Terraform (**unused** in this lab — deploy is Tunnel) |
| **4** | Playwright happy path, notification port, `tenant_id` column, Identity Platform notes, as-built doc |
| **Lab+** | Cognito Hosted UI, landing Pages, **S3** + quotas, dual-issuer JWKS, document view/delete (web + Flutter), Tunnel `api.getlakbay.com` |

Deferred: payroll/ATS, real email, virus scan, coupling to Alerto24, billed RDS/App Runner.

## Tests

```bash
npm test          # Nest unit (state machine, guards, submit rules, documents, multi-issuer)
npm run test:e2e  # Playwright: API happy path + portal smokes (Compose must be up)
# Flutter: cd apps/mobile && flutter test
```

## Layout

```
apps/api            NestJS + Prisma
apps/web-admin      HRIS admin portal (React / Vite) :5173
apps/web-onboarding Employee checklist (React / Vite) :5174
apps/web-landing    Marketing apex getlakbay.com :5175
apps/mobile         Flutter Android/iOS (same Nest API; not an npm workspace)
packages/shared     Shared enums / default tasks
e2e                 Playwright
infra/cloudflare    Pages wrangler + Tunnel example (`tunnel.yml.example`)
infra/keycloak      Realm import
infra/aws-cognito   Cognito user pool / Hosted UI Terraform (**lab auth**)
infra/aws-s3        Private uploads bucket (SSE, CORS, 30-day lifecycle) (**lab files**)
infra/terraform     Unused optional GCP Cloud SQL + Run (see docs/GCP_SETUP.md)
docs/               Design pack (historical GCP kickoff) + as-built + AWS notes
```
