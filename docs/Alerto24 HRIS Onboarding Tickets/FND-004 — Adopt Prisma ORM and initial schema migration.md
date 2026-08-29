# FND-004 — Adopt Prisma ORM and initial schema migration

Status: Done

**ID:** `FND-004` · **Priority:** P0 · **Epic:** Foundation · **Labels:** foundation,database,prisma

## Summary
Chose Prisma over TypeORM. Ticket `FND-004` (P0, status Done) lives under the **Foundation** epic and is tagged `foundation, database, prisma`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Adopt Prisma ORM and initial schema migration** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Initial migration defines users, employees, offers, onboarding_cases, onboarding_tasks, documents_meta, audit_log with enums for roles, case status, task status.

## Files / areas touched
Primary touchpoints: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/20260826100000_init/`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `apps/api/prisma/schema.prisma` defines domain model
- [x] `npm run prisma:migrate` applies migrations
- [x] `npm run prisma:generate` produces client

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
