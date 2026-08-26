# HRIS + Onboarding Portals (NestJS + GCP Lab)

**Status:** Phase 0–4 scaffold in sibling repo `~/repos/hris-onboarding-nest-gcp` (public GitHub).  
**Audience:** Ernesto (portfolio + NestJS/PostgreSQL learning aligned with Emapta-like HRIS/onboarding domains).

This is a **lab / portfolio** project inspired by HRIS and employee onboarding workflows. It is **not** an Emapta client deliverable and is **not** part of Alerto24 production. Alerto24 remains on Firebase Functions for the emergency product; this lab targets NestJS + Cloud SQL on a separate GCP/Firebase project.

## What this folder contains

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full system design (main document) |
| [ARCHITECTURE.pdf](./ARCHITECTURE.pdf) | Printable architecture pack |
| [ROADMAP.md](./ROADMAP.md) | Phased build plan for the next implementation thread |
| [STACK_DECISIONS.md](./STACK_DECISIONS.md) | ADRs: Nest+PG, GCP vs AWS, auth, why not Firestore as SoR |

## Stack at a glance

| Concern | Choice |
|---------|--------|
| API | NestJS (TypeScript) on **Cloud Run** |
| Database | PostgreSQL on **Cloud SQL** |
| Auth | **Firebase Auth** / Identity Platform + custom claims |
| Frontends | **React (Vite + TypeScript)** — HR admin + onboarding portals |
| Files | **Cloud Storage** |
| Secrets | **Secret Manager** |
| CI/CD | **GitHub Actions** |

## Next step

Implementation lives at `~/repos/hris-onboarding-nest-gcp`. Follow that README to run Compose + Nest + Vite. Design pack here remains the source of truth for goals/ADRs.
