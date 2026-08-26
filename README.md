# HRIS + Onboarding Portals (NestJS + PostgreSQL lab)

Portfolio / learning lab for **NestJS module architecture** and **PostgreSQL**, with **OIDC IAM/RBAC** (Keycloak locally; Amazon Cognito when you have an AWS account), two **React (Vite)** portals on Cloudflare Pages, and a **Flutter** iOS/Android app in `apps/mobile` (same Nest API — no longer deferred). Inspired by HRIS + employee onboarding workflows — **not** an Emapta deliverable and **not** part of Alerto24 production.

**Public repo:** https://github.com/mtgons5developer/hris-onboarding-nest-gcp

| | |
|---|---|
| API | NestJS (local `:3000`; lab public `https://api.getlakbay.com` via Cloudflare Tunnel) |
| Database | PostgreSQL via Docker Compose |
| ORM | **Prisma** |
| Auth | OIDC JWKS (`JwtAuthGuard`) · Cognito Hosted UI on Pages · Keycloak Compose / seed tokens on localhost |
| Apps | `apps/web-admin` (HR, React) · `apps/web-onboarding` (new hire, React) · `apps/mobile` (Flutter) |
| Files | Local disk adapter · GCS/S3 later |
| CI | GitHub Actions lint / unit / Playwright |

Design source (also copied under `docs/design/`):  
`/Users/ernestoh.almeda.jr/Documents/A24/HRIS-Onboarding-Nest-GCP/`

- [Architecture](docs/design/ARCHITECTURE.md)
- [Roadmap](docs/design/ROADMAP.md)
- [Stack ADRs](docs/design/STACK_DECISIONS.md)
- [As-built diffs](docs/AS_BUILT.md)
- [Auth / AWS free tier](docs/AWS_AND_IAM.md)
- [Production: Cloudflare + mobile](docs/PRODUCTION_CLOUDFLARE.md) (`getlakbay.com` — Pages Active; Tunnel for `api`)
- [GCP setup (legacy notes)](docs/GCP_SETUP.md)

## Run locally (Phase 0+)

Requires **Node 20+** and **Docker**.

```bash
cp .env.example .env
cp .env.example apps/api/.env
cp apps/web-admin/.env.example apps/web-admin/.env
cp apps/web-onboarding/.env.example apps/web-onboarding/.env

npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

npm run dev:api          # http://localhost:3000/health  ·  Swagger /api/docs
npm run dev:admin        # http://localhost:5173
npm run dev:onboarding   # http://localhost:5174
# Flutter (not an npm workspace): cd apps/mobile && flutter run
# See apps/mobile/README.md — iOS sim vs Android emulator API hosts.
```

Postgres: `localhost:5432` (user/pass/db `hris` / `hris` / `hris_lab`). Adminer: http://localhost:8081. Keycloak: http://localhost:8082 (`admin` / `admin`).

### Seeded logins

**Public Cognito Hosted UI** (password `LabPass123!`): `hr@lab.local` (admin), `maya.santos@lab.local` (manager), `sysadmin@lab.local` (system_admin), `luis.reyes@lab.local` (onboarding).

Keycloak Compose uses the same emails / password. Dev bypass (`AUTH_DEV_BYPASS=true`) is **localhost only** (Harper buttons never render on getlakbay.com):

| Portal | Control | Token |
|--------|---------|-------|
| Admin | Harper Reyes (HR) | `Bearer dev:hr_admin` |
| Admin | Maya Santos (manager) | `Bearer dev:manager` |
| Onboarding (web + Flutter) | Luis Reyes (new hire) | `Bearer dev:employee` |

## What each phase shipped

| Phase | Outcome |
|-------|---------|
| **0** | Monorepo, Nest health, Compose Postgres, Prisma, two Vite shells |
| **1** | Schema, guards, seed, employees + onboarding cases/tasks, audit, sign-in UIs |
| **2** | Document register/upload, local/GCS storage, submit/approve state machine, Swagger, Jest |
| **3** | Dockerfile, CI, Cloud Run workflow + Terraform (apply needs a **new** GCP project) |
| **4** | Playwright happy path, notification port, `tenant_id` column, Identity Platform notes, as-built doc |

Deferred: payroll/ATS, real email, virus scan, coupling to Alerto24, billed RDS/App Runner.

## Tests

```bash
npm test          # Nest unit (state machine, guards, submit rules)
npm run test:e2e  # Playwright: API happy path + portal smokes (Compose must be up)
```

## Layout

```
apps/api            NestJS + Prisma
apps/web-admin      HRIS admin portal (React / Vite)
apps/web-onboarding Employee checklist (React / Vite)
apps/mobile         Flutter Android/iOS (same Nest API; not an npm workspace)
packages/shared     Shared enums / default tasks
e2e                 Playwright
infra/cloudflare    Pages wrangler + Tunnel example (`tunnel.yml.example`)
infra/keycloak      Realm import
infra/aws-cognito   Cognito-only Terraform
infra/terraform     Optional GCP Cloud SQL + Run
docs/               Design pack + as-built + production
```
