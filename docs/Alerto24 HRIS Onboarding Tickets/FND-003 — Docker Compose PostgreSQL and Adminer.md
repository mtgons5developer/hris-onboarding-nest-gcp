# FND-003 — Docker Compose PostgreSQL and Adminer

Status: Done

**ID:** `FND-003` · **Priority:** P0 · **Epic:** Foundation · **Labels:** foundation,database,infra

## Summary
Local Postgres 16 via Compose with persistent volume. Ticket `FND-003` (P0, status Done) lives under the **Foundation** epic and is tagged `foundation, database, infra`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Docker Compose PostgreSQL and Adminer** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Adminer for DB inspection.
- Fixed port conflict (Adminer moved from `:8080` to `:8081` when 8080 was already allocated).

## Files / areas touched
Primary touchpoints: `docker-compose.yml`, `README.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `npm run db:up` starts healthy Postgres on `:5432`
- [x] Adminer reachable without port conflict
- [x] Credentials documented in README (`hris` / `hris` / `hris_lab`)

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
