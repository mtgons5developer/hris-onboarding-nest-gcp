# DOCUM-006 — STACK_DECISIONS and architecture design pack copy

Status: Done

**ID:** `DOCUM-006` · **Priority:** P2 · **Epic:** Documentation · **Labels:** docs

## Summary
Copied ADR design pack into repo documenting isolation from Alerto24, Postgres over Firestore, Nest over Firebase Functions, Rippling-inspired scope boundaries. Ticket `DOCUM-006` (P2, status Done) lives under the **Documentation** epic and is tagged `docs`. This ticket is part of the Documentation epic: README, setup guides, env tables, and demo scripts that match the as-built AWS + Cognito + S3 + Cloudflare stack (GCP/Firebase paths marked historical only).

## Scope / work done
Work completed for **STACK_DECISIONS and architecture design pack copy** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Copied ADR design pack into repo documenting isolation from Alerto24, Postgres over Firestore, Nest over Firebase Functions, Rippling-inspired scope boundaries.

## Files / areas touched
Primary touchpoints: `docs/design/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] docs/design/ contains ARCHITECTURE, ROADMAP, STACK_DECISIONS
- [x] Explicitly not Alerto24 production
- [x] Source path referenced

## Demo / verify notes
Open linked doc paths; confirm URLs, env tables, and demo script match current as-built stack. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Docs reflect AWS+Cognito+S3+Cloudflare as-built; GCP/Firebase paths marked historical only. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
