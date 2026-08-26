# Stack Decisions (ADRs)

Architecture Decision Records for the HRIS + Onboarding NestJS + GCP lab.  
**Context:** Portfolio / learning project inspired by Emapta-like HRIS/onboarding domains — not an Emapta deliverable; separate from Alerto24 production.

---

## ADR-001: NestJS + PostgreSQL for an HRIS-shaped domain

**Status:** Accepted  
**Date:** 2026-08-26

### Context

Emapta-style HRIS/onboarding work typically uses a structured API (NestJS or similar) over relational data (PostgreSQL): employees, org charts, offers, task checklists, document metadata, and audit trails. Ernesto wants Nest + PG practice in a domain that maps to that work, while hosting on GCP/Firebase instead of AWS.

### Decision

Use **NestJS (TypeScript)** with **PostgreSQL** as the system of record for this lab.

### Consequences

- Controllers / Services / DTOs / modules mirror common Nest hiring-bar patterns.
- Relational modeling (FKs, constraints, migrations) is explicit and interview-transferable.
- Learning cost is higher than Firestore-only CRUD, which is intentional.

### Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Express + raw SQL | Less structure; weaker Nest interview signal |
| Nest + MongoDB | Weaker fit for HRIS constraints and joins |
| Firebase Functions only | Too close to Alerto24; does not teach Nest module architecture |

---

## ADR-002: GCP + Firebase hosting, not AWS

**Status:** Superseded 2026-08-26 by [ADR-009](#adr-009-oidc-idp--keycloak-local-cognito-later)  
**Date:** 2026-08-26

### Context

Emapta-ish stacks often sit on AWS (Lambda/ECS, S3, Secrets Manager) with Keycloak or Azure Entra. Ernesto already operates Firebase/GCP for Alerto24 and wants portfolio depth on **GCP**, without touching Alerto24 production.

### Decision

Host the lab on a **separate GCP project** (+ Firebase project for Auth/App Check):

| Concern | Choice |
|---------|--------|
| API | Cloud Run |
| DB | Cloud SQL (PostgreSQL) |
| Files | Cloud Storage |
| Secrets | Secret Manager |
| Auth | Firebase Auth / Identity Platform |
| CI/CD | GitHub Actions |

### Consequences

- Skills transfer: “AWS X → GCP Y” mapping is explicit (see Architecture).
- No risk of coupling to Alerto24 Functions deploy paths.
- Some AWS interview stories still need verbal mapping (ECS↔Cloud Run, S3↔GCS).

### Alternatives considered

| Alternative | Why not |
|-------------|---------|
| AWS for fidelity | Conflicts with stated GCP learning goal |
| Same GCP project as Alerto24 | Blast radius / billing / IAM confusion |
| All-Firebase (Functions + Firestore) | See ADR-003 / ADR-005 |

---

## ADR-003: PostgreSQL (Cloud SQL) as SoR — not Firestore

**Status:** Accepted  
**Date:** 2026-08-26

### Context

Alerto24 uses Firestore heavily. HRIS domains need strong consistency for employment status, task completion gates, offer acceptance, and auditable history. Firestore is excellent for realtime ops docs; it is a poor default SoR for classic HRIS schemas.

### Decision

**Cloud SQL PostgreSQL** is the system of record. Firestore is **out of scope** for v1 (optional later for notifications fan-out or ephemeral UI state only — never as employee SoR).

### Consequences

- Migrations, transactions, and relational integrity become first-class learning outcomes.
- Cost for a lab remains modest (small Cloud SQL instance; can stop when idle).
- No dual-write complexity in Phase 0–3.

### Alternatives considered

| Alternative | Why not |
|-------------|---------|
| Firestore as SoR | Weak joins, awkward audit/compliance modeling for HRIS |
| Spanner | Overkill cost/complexity for a lab |
| AlloyDB | Unnecessary until scale/perf is a goal |

---

## ADR-004: Firebase Auth / Identity Platform instead of Keycloak or Entra

**Status:** Superseded 2026-08-26 by [ADR-009](#adr-009-oidc-idp--keycloak-local-cognito-later)  
**Date:** 2026-08-26

### Context

Enterprise HRIS often uses Keycloak or Azure Entra ID for SSO, realms, and role mapping. This lab should stand in for that without running a full IdP appliance.

### Decision

Use **Firebase Authentication** (and/or **Google Cloud Identity Platform** on the same Firebase project) with:

1. Email/password (and optionally Google) for lab users  
2. **Custom claims** for roles: `hr_admin`, `manager`, `employee`, `system_admin`  
3. Nest **AuthGuard** verifying Firebase ID tokens; role **Guards** reading claims  
4. Optional later: SAML/OIDC via Identity Platform to approximate Entra federation  

**How this stands in for Keycloak/Entra**

| Enterprise IdP concern | Lab stand-in |
|------------------------|--------------|
| Realms / tenants | Single-org lab; `tenant_id` reserved for later |
| Roles / groups | Custom claims + Nest guards |
| Client apps | Firebase JS SDK in React portals |
| Token validation | Firebase Admin SDK `verifyIdToken` in Nest |
| SSO federation | Document-only until Phase 4+ (Identity Platform SAML/OIDC) |
| User lifecycle | Admin SDK create/disable + invite email stub |

Optional: **Firebase App Check** for portal abuse resistance (document; enable when frontend exists).

### Consequences

- Fast local/auth story; aligns with Ernesto’s existing Firebase muscle memory.
- Custom claims updates require Admin SDK and token refresh awareness.
- Not a full IAM product — fine for portfolio; call out gaps in interviews.

### Alternatives considered

| Alternative | Why not (v1) |
|-------------|----------------|
| Keycloak on GCE/Cloud Run | Heavy ops for a lab |
| Auth0 / Clerk | Extra vendor; less GCP-native story |
| DIY JWT | Security footguns; weak portfolio signal |

---

## ADR-005: React (Vite + TypeScript) for portals — not Flutter first

**Status:** Accepted  
**Date:** 2026-08-26

### Context

HR admin and employee onboarding are primarily **desktop web** workflows. Flutter is strong for mobile (and Alerto24); Nest learning is the primary goal of this lab.

### Decision

Recommend **two Vite React + TS apps** (or one app with role-based route trees):

1. **HRIS Admin** — employees, cases, approvals, audit views  
2. **Onboarding Portal** — invite accept, task checklist, document upload  

**Justification:** Shared Nest API; web-first HR UX; Vite is fast for local Docker Compose; Flutter Web optional later if mobile onboarding is desired. Prefer **one monorepo with two apps** sharing a thin `packages/api-client` later — start with one app + role routes if scaffolding time is tight.

### Consequences

- Clear separation of “admin vs new-hire” UX without forcing mobile first.
- Portfolio demos work in a browser (recruiters click a URL).
- Flutter skills remain Alerto24’s primary surface.

---

## ADR-006: REST Controllers — gRPC out of scope for v1

**Status:** Accepted  
**Date:** 2026-08-26

### Decision

Expose **REST** via Nest Controllers, Services, DTOs (class-validator). OpenAPI/Swagger optional in Phase 2. **gRPC** deferred until a second internal service exists.

---

## ADR-007: Email/SMS and Terraform — stubs / later

**Status:** Accepted  
**Date:** 2026-08-26

### Decision

- **Email/SMS:** Interface + no-op/console stub in Nest (`NotificationPort`). Wire SendGrid / Twilio / Firebase Extensions only when needed.  
- **Terraform / OpenTofu:** Note as Phase 4+ optional; initial GCP resources may be Console + `gcloud` scripts for speed.

---

## ADR-008: Repository placement — outside Alerto24 monorepo

**Status:** Accepted  
**Date:** 2026-08-26

### Decision

Docs live under `Documents/A24/HRIS-Onboarding-Nest-GCP/`. Implementation repo should be a **sibling** under `~/repos/` (e.g. `hris-onboarding-nest-gcp`), **not** inside `alerto24_mobile` as a live backend.

---

## ADR-009: OIDC IdP — Keycloak local, Cognito later

**Status:** Accepted  
**Date:** 2026-08-26  
**Supersedes:** ADR-002 (hosting/auth), ADR-004 (Firebase Auth)

### Context

The original lab used Firebase Auth for speed on GCP. A target role description requires **Keycloak or Azure Entra**, Nest REST layering, PostgreSQL, and IAM/RBAC. Full AWS (RDS, App Runner) is **not** lastingly free; this machine had no AWS CLI.

### Decision

1. Nest **`JwtAuthGuard`** verifies OIDC JWTs with **JWKS** (`jose`). Same code path for Keycloak, Cognito, and Entra.
2. **Keycloak 26** in Docker Compose is the $0 local IdP (realm roles = `UserRole`).
3. **Amazon Cognito** (50k MAU always-free) is the optional AWS hosted IdP — Terraform in `infra/aws-cognito/` only; **no RDS**.
4. Keep **Docker Postgres** as the system of record until a billed RDS/Cloud SQL decision is explicit.
5. `AUTH_DEV_BYPASS` remains for tests and first-run (localhost Host only).
6. Public SPAs use **authorization code + PKCE** against Cognito Hosted UI.

### Consequences

- Interview story matches Controller/Service/DTO + Keycloak groups/roles + Postgres.
- Switching IdP is env vars (`OIDC_ISSUER`, `OIDC_JWKS_URI`), not a Nest rewrite.
- Password grant is lab-only (Keycloak Compose); production uses authorization code + PKCE.

See [docs/AWS_AND_IAM.md](../AWS_AND_IAM.md).

---

## ADR-010: Cloudflare for production web; Flutter mobile later

**Status:** Accepted  
**Date:** 2026-08-26

### Context

Ernesto has spare domains and a Cloudflare account. Nest cannot run on Cloudflare Pages. Android/iOS is needed later, not in the first production cut.

### Decision

1. **Cloudflare Pages** hosts `admin.getlakbay.com` and `onboarding.getlakbay.com`.
2. **Cloudflare DNS + proxy** fronts `api.getlakbay.com` to a Node origin (Tunnel, Fly, Cloud Run, or VPS). Postgres stays off Cloudflare.
3. Lab apex is **`getlakbay.com`**. Keep this off the Alerto24 emergency hostname.
4. **Flutter** in `apps/mobile/` later, same Nest API, OIDC client `hris-mobile` with PKCE.

See [docs/PRODUCTION_CLOUDFLARE.md](../PRODUCTION_CLOUDFLARE.md).
