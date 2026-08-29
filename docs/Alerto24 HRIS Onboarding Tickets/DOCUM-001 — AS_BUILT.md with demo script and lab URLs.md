# DOCUM-001 — AS_BUILT.md with demo script and lab URLs

Status: Done

**ID:** `DOCUM-001` · **Priority:** P1 · **Epic:** Documentation · **Labels:** docs

## Summary
As-built doc records Prisma vs TypeORM, OIDC vs Firebase, S3 vs GCS, Tunnel vs Cloud Run, public URLs, 10-minute demo script. Ticket `DOCUM-001` (P1, status Done) lives under the **Documentation** epic and is tagged `docs`. This ticket is part of the Documentation epic: README, setup guides, env tables, and demo scripts that match the as-built AWS + Cognito + S3 + Cloudflare stack (GCP/Firebase paths marked historical only).

## Scope / work done
Work completed for **AS_BUILT.md with demo script and lab URLs** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- As-built doc records Prisma vs TypeORM, OIDC vs Firebase, S3 vs GCS, Tunnel vs Cloud Run, public URLs, 10-minute demo script.

## Files / areas touched
Primary touchpoints: `docs/AS_BUILT.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Happy-path sequence documented
- [x] Lab URL table with Active status
- [x] Talk track for interviews

## Demo / verify notes
Open linked doc paths; confirm URLs, env tables, and demo script match current as-built stack. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Docs reflect AWS+Cognito+S3+Cloudflare as-built; GCP/Firebase paths marked historical only. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
