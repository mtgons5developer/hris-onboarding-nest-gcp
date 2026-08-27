# HRIS + Onboarding Portals (NestJS + GCP Lab)

> **Superseded by the AWS lab.** Runtime today: Nest + Docker Postgres, **Amazon Cognito** + Keycloak, **S3**/local storage, **Cloudflare Pages + Tunnel** — see repo [README](../../README.md) and [AS_BUILT.md](../AS_BUILT.md). This design pack keeps the original GCP/Firebase kickoff goals and ADRs for history.

**Status:** Phase 0–4 scaffold in sibling repo [`hris-onboarding-nest-gcp`](https://github.com/mtgons5developer/hris-onboarding-nest-gcp).  
**Audience:** Ernesto (portfolio + NestJS/PostgreSQL learning aligned with Emapta-like HRIS/onboarding domains).

This is a **lab / portfolio** project inspired by HRIS and employee onboarding workflows. It is **not** an Emapta client deliverable and is **not** part of Alerto24 production. Alerto24 remains on Firebase Functions for the emergency product; the **original** design targeted NestJS + Cloud SQL on a separate GCP/Firebase project (no longer the as-built path).

## What this folder contains

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full system design (main document; historical GCP topology) |
| [ARCHITECTURE.pdf](./ARCHITECTURE.pdf) | Printable architecture pack |
| [ROADMAP.md](./ROADMAP.md) | Phased build plan for the next implementation thread |
| [STACK_DECISIONS.md](./STACK_DECISIONS.md) | ADRs: Nest+PG, original GCP vs AWS, later Cognito/Cloudflare supersessions |

## Stack at a glance (original design — superseded)

| Concern | Original choice | As-built lab |
|---------|-----------------|--------------|
| API | NestJS on **Cloud Run** | Nest local + **Cloudflare Tunnel** (`api.getlakbay.com`) |
| Database | PostgreSQL on **Cloud SQL** | Docker Compose Postgres |
| Auth | **Firebase Auth** / Identity Platform | **Cognito** Hosted UI + Keycloak local |
| Frontends | React (Vite) | Same + landing; **Cloudflare Pages** |
| Files | **Cloud Storage** | **local** / **S3** (`gcs` adapter optional) |
| Secrets | **Secret Manager** | `.env` / local |
| CI/CD | **GitHub Actions** | lint/test/Pages; Cloud Run workflow unused |

## Next step

Implementation lives at [`~/repos/hris-onboarding-nest-gcp`](https://github.com/mtgons5developer/hris-onboarding-nest-gcp). Follow that README to run Compose + Nest + Vite. For what actually ships, prefer [AS_BUILT.md](../AS_BUILT.md) over this folder’s original GCP topology.
