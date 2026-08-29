# FND-005 — Seed demo users, employees, and onboarding cases

Status: Done

**ID:** `FND-005` · **Priority:** P1 · **Epic:** Foundation · **Labels:** foundation,database,demo

## Summary
Seed script creates Harper Reyes (hr_admin), Maya Santos (manager), Luis Reyes (employee), sample employees, in-progress and invited onboarding cases with default tasks. Ticket `FND-005` (P1, status Done) lives under the **Foundation** epic and is tagged `foundation, database, demo`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Seed demo users, employees, and onboarding cases** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Fixed `prisma:seed` ts-node JSON compiler-options quoting for zsh.

## Files / areas touched
Primary touchpoints: `apps/api/prisma/seed.ts`, `apps/api/package.json`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `npm run prisma:seed` completes without error
- [x] HR can list employees and cases after seed
- [x] Luis Reyes case available for onboarding demo

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
