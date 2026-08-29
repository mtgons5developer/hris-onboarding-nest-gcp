# FND-009 — Phase 4 Playwright E2E smoke tests

Status: Done

**ID:** `FND-009` · **Priority:** P2 · **Epic:** Foundation · **Labels:** foundation,testing

## Summary
Playwright suite covers API happy path and portal smoke tests. Ticket `FND-009` (P2, status Done) lives under the **Foundation** epic and is tagged `foundation, testing`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Phase 4 Playwright E2E smoke tests** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Runs via `npm run test:e2e` with Compose up.

## Files / areas touched
Primary touchpoints: `e2e/*`, `.github/workflows/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] E2E config in `e2e/`
- [x] CI can run Playwright job
- [x] Happy path documented in README

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
