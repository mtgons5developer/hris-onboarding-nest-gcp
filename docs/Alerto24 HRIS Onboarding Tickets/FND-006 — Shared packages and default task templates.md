# FND-006 — Shared packages and default task templates

Status: Done

**ID:** `FND-006` · **Priority:** P2 · **Epic:** Foundation · **Labels:** foundation,monorepo

## Summary
`packages/shared` holds shared enums and default onboarding task definitions reused by API seed and clients. Ticket `FND-006` (P2, status Done) lives under the **Foundation** epic and is tagged `foundation, monorepo`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Shared packages and default task templates** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- `packages/shared` holds shared enums and default onboarding task definitions reused by API seed and clients.

## Files / areas touched
Primary touchpoints: `packages/shared/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Shared package importable from API workspace
- [x] Default tasks seeded on new cases

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
