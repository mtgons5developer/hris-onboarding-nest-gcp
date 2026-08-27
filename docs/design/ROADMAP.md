# Roadmap — HRIS + Onboarding NestJS + GCP Lab

> **Superseded by the AWS lab** for hosting/auth/files (Cognito, S3, Cloudflare Tunnel — not Cloud Run / Firebase). Phases below are historical build plan; see repo README “What each phase shipped” and [AS_BUILT.md](../AS_BUILT.md).

Phased build plan for the **next implementation conversation**.  
Design source of truth: [ARCHITECTURE.md](./ARCHITECTURE.md) · Decisions: [STACK_DECISIONS.md](./STACK_DECISIONS.md)

**Rule:** Documentation-first is done. Scaffold only when a new thread starts Phase 0. Keep the repo **outside** Alerto24 production monorepo.

---

## Phase 0 — Repo & local spine (½–1 day)

**Outcome:** Empty-but-runnable Nest + Postgres + Vite shell.

| Task | Notes |
|------|-------|
| Create `~/repos/hris-onboarding-nest-gcp` (or similar) | New git remote optional |
| NestJS scaffold | `apps/api` or `/api` |
| Docker Compose Postgres | Port 5432; volume for data |
| ORM choice | Prisma **or** TypeORM — pick one; migrations folder |
| `.env.example` | `DATABASE_URL`, Firebase placeholders |
| Vite React shell | One app with role routes **or** `apps/web-admin` + `apps/web-onboarding` |
| README runbook | `compose up`, `nest start:dev`, `vite` |
| Link docs | Point to `Documents/A24/HRIS-Onboarding-Nest-GCP/` |

**Exit criteria:** `GET /health` returns 200; Postgres accepts connections; React loads a placeholder page.

---

## Phase 1 — Identity + employees + cases (core domain)

**Outcome:** AuthZ-aware CRUD and invite → in_progress happy path (email stubbed).

| Task | Notes |
|------|-------|
| Schema migrations | users, employees, offers, onboarding_cases, onboarding_tasks, audit_log |
| Firebase Admin verify | Guard + custom claims roles |
| Seed script | hr_admin, manager, employee |
| EmployeesModule | Basic CRUD for HR |
| OnboardingModule | Create case, seed default tasks, invite, get case |
| Audit on state changes | Append-only |
| React: sign-in + employee checklist UI | Minimal styling OK |

**Exit criteria:** Seeded HR can create a case; seeded employee can list own tasks after “invite” (token/session mocked or real Firebase project).

---

## Phase 2 — Documents + HR approve + OpenAPI

**Outcome:** Upload path + HR review loop.

| Task | Notes |
|------|-------|
| documents_meta table | If not already in Phase 1 |
| GCS adapter | Dev: local disk; Prod: Cloud Storage signed URLs |
| Task complete / submit / approve | State machine enforced in service |
| Swagger | Optional `@nestjs/swagger` |
| Manager scoping | Read-only / manager tasks |
| Unit + integration tests | Case transitions; guard denials |

**Exit criteria:** Employee uploads a file; HR approves case → `completed`; audit trail visible.

---

## Phase 3 — Cloud Run deploy + CI

**Outcome:** Deployed API (and static portals) on separate GCP project.

| Task | Notes |
|------|-------|
| Dedicated GCP + Firebase project | Not Alerto24 |
| Cloud SQL instance | Smallest tier; private IP or Cloud SQL Auth Proxy |
| Cloud Run service | Nest container; Secret Manager for DB URL |
| Hosting | Firebase Hosting **or** Cloud Storage + CDN for React builds |
| GitHub Actions | lint/test on PR; deploy on main/tag |
| App Check | Optional enable on portals |
| Cost alerts | Billing budget on lab project |

**Exit criteria:** Public HTTPS demo of invite → approve against Cloud SQL (synthetic data only).

---

## Phase 4 — Hardening & portfolio polish

**Outcome:** Interview-ready narrative + optional extras.

| Task | Notes |
|------|-------|
| Playwright E2E | Happy path smoke |
| NotificationPort → real email | Optional SendGrid/etc. |
| Identity Platform SAML/OIDC | Document spike only unless needed |
| Soft multi-tenant | `tenant_id` + simple isolation (optional) |
| Terraform / OpenTofu | Optional IaC for Cloud SQL + Run + GCS |
| Architecture one-pager | Update ARCHITECTURE.md with “as-built” diffs |
| Portfolio README | Screenshots, sequence diagram, AWS↔GCP map |

**Exit criteria:** Can demo end-to-end and explain Nest modules, PG schema, and GCP topology in 10 minutes.

---

## Explicitly deferred (all phases unless pulled forward)

- Payroll / benefits / ATS
- gRPC
- Coupling to Alerto24
- Production Keycloak
- Virus scanning of uploads
- Real PII / real employee data

---

## Suggested next-thread prompt

> Implement Phase 0 of the HRIS + Onboarding Nest+GCP lab using the design pack at  
> `/Users/ernestoh.almeda.jr/Documents/A24/HRIS-Onboarding-Nest-GCP/`.  
> Scaffold a new sibling repo under `~/repos/` (not inside alerto24_mobile). Follow ARCHITECTURE.md and ROADMAP.md Phase 0 only.
