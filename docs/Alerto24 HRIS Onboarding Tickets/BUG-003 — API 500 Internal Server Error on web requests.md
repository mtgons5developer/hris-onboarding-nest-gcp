# BUG-003 — API 500 Internal Server Error on web requests

Status: Done

**ID:** `BUG-003` · **Priority:** P0 · **Epic:** Bugfixes · **Labels:** bugfix,api

## Summary
Production web surfaces returned 500 — traced to pending DB migration / document schema mismatch after feature additions. Ticket `BUG-003` (P0, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, api`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **API 500 Internal Server Error on web requests** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Applied migration and restarted Nest.

## Files / areas touched
Primary touchpoints: `apps/api/prisma/migrations/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Web API calls return 2xx for happy path
- [x] Migration deployed on lab DB
- [x] Error no longer reproduces on case/document routes

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
