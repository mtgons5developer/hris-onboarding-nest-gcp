# FND-001 — Create public GitHub repo and monorepo scaffold

Status: Done

**ID:** `FND-001` · **Priority:** P0 · **Epic:** Foundation · **Labels:** foundation,monorepo,api

## Summary
Created sibling repo `~/repos/hris-onboarding-nest-gcp` (outside Alerto24 monorepo). Ticket `FND-001` (P0, status Done) lives under the **Foundation** epic and is tagged `foundation, monorepo, api`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Create public GitHub repo and monorepo scaffold** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Published public GitHub remote.
- Copied design pack from `Documents/A24/HRIS-Onboarding-Nest-GCP/` into `docs/design/`.
- Established npm workspaces root with shared tooling.

## Files / areas touched
Primary touchpoints: `package.json`, `.gitignore`, `docs/design/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Public repo exists at `github.com/mtgons5developer/hris-onboarding-nest-gcp`
- [x] Repo is sibling of Alerto24, not nested inside it
- [x] Design docs available under `docs/design/`
- [x] `.gitignore` excludes secrets, uploads, tfstate

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
