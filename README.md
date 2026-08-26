# HRIS + Onboarding Portals (NestJS + GCP lab)

Portfolio / learning lab for **NestJS module architecture** and **PostgreSQL on Cloud SQL**, with **Firebase Auth** and two React portals. Inspired by HRIS + employee onboarding workflows — **not** an Emapta deliverable and **not** part of Alerto24 production.

**Public repo:** https://github.com/mtgons5developer/hris-onboarding-nest-gcp

| | |
|---|---|
| API | NestJS on Cloud Run (local `:3000`) |
| Database | PostgreSQL via Docker Compose / Cloud SQL |
| ORM | **Prisma** (chosen over TypeORM for typed migrations + seed speed) |
| Auth | Firebase Auth + custom claims; local `dev:` Bearer bypass |
| Apps | `apps/web-admin` (HR) · `apps/web-onboarding` (new hire) |
| Files | Local disk adapter · GCS signed URLs in prod |
| CI | GitHub Actions lint / unit / Playwright |

Design source (also copied under `docs/design/`):  
`/Users/ernestoh.almeda.jr/Documents/A24/HRIS-Onboarding-Nest-GCP/`

- [Architecture](docs/design/ARCHITECTURE.md)
- [Roadmap](docs/design/ROADMAP.md)
- [Stack ADRs](docs/design/STACK_DECISIONS.md)
- [As-built diffs](docs/AS_BUILT.md)
- [GCP setup](docs/GCP_SETUP.md)

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
```

Postgres: `localhost:5432` (user/pass/db `hris` / `hris` / `hris_lab`). Adminer: http://localhost:8080.

### Seeded logins (AUTH_DEV_BYPASS)

| Portal | Control | Token |
|--------|---------|-------|
| Admin | Harper Reyes (HR) | `Bearer dev:hr_admin` |
| Admin | Maya Santos (manager) | `Bearer dev:manager` |
| Onboarding | Luis Reyes (new hire) | `Bearer dev:employee` |

## What each phase shipped

| Phase | Outcome |
|-------|---------|
| **0** | Monorepo, Nest health, Compose Postgres, Prisma, two Vite shells |
| **1** | Schema, guards, seed, employees + onboarding cases/tasks, audit, sign-in UIs |
| **2** | Document register/upload, local/GCS storage, submit/approve state machine, Swagger, Jest |
| **3** | Dockerfile, CI, Cloud Run workflow + Terraform (apply needs a **new** GCP project) |
| **4** | Playwright happy path, notification port, `tenant_id` column, Identity Platform notes, as-built doc |

Deferred: payroll/ATS, real email, virus scan, production Keycloak, coupling to Alerto24, live GCP billing.

## Tests

```bash
npm test          # Nest unit (state machine, guards, submit rules)
npm run test:e2e  # Playwright: API happy path + portal smokes (Compose must be up)
```

## Layout

```
apps/api            NestJS + Prisma
apps/web-admin      HRIS admin portal
apps/web-onboarding Employee checklist
packages/shared     Shared enums / default tasks
e2e                 Playwright
infra/terraform     Cloud SQL, GCS, Secret Manager, Artifact Registry
docs/               Design pack + as-built + GCP
```
