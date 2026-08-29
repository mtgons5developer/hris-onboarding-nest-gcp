# FND-011 — Dockerfile and optional GCP Terraform (unused path)

Status: Done

**ID:** `FND-011` · **Priority:** P3 · **Epic:** Foundation · **Labels:** foundation,infra,gcp

## Summary
Phase 3 Dockerfile for Nest container. Optional GCP Cloud SQL + Cloud Run Terraform under `infra/terraform/` — documented as unused. Ticket `FND-011` (P3, status Done) lives under the **Foundation** epic and is tagged `foundation, infra, gcp`. This ticket is part of the Foundation epic: local monorepo scaffolding, Nest API, Prisma/Postgres, seed data, shared packages, and baseline tests that every later auth, documents, client, and deploy ticket builds on.

## Scope / work done
Work completed for **Dockerfile and optional GCP Terraform (unused path)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- lab deploy uses Cloudflare Tunnel instead.

## Files / areas touched
Primary touchpoints: `Dockerfile`, `infra/terraform/*`, `docs/GCP_SETUP.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Dockerfile builds API image
- [x] GCP Terraform documented in `docs/GCP_SETUP.md` as optional
- [x] Not required for getlakbay.com lab

## Demo / verify notes
Run `npm run db:up && npm run prisma:migrate && npm run prisma:seed && npm run dev:api`; hit `GET /health` and Swagger at `/api/docs`. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Requires Docker, Node 20+, npm workspaces. No cloud credentials for local-only path. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
