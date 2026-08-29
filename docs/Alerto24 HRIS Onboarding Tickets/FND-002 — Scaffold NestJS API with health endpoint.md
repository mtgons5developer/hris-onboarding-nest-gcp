# FND-002 — Scaffold NestJS API with health endpoint

Status: Done

**ID:** `FND-002` · **Priority:** P0 · **Epic:** Foundation · **Labels:** foundation,api,nest

## Summary
Phase 0 Nest API at `apps/api` with modular structure, global validation pipe, CORS config, and `GET /health` returning DB status. Ticket `FND-002` (P0, status Done) lives under the **Foundation** epic and is tagged `foundation, api, nest`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Scaffold NestJS API with health endpoint** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Phase 0 Nest API at `apps/api` with modular structure, global validation pipe, CORS config, and `GET /health` returning DB status.

## Files / areas touched
Primary touchpoints: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `npm run dev:api` starts on `:3000`
- [x] `GET /health` returns 200 with `{ status, db, service }`
- [x] Swagger available at `/api/docs`

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
