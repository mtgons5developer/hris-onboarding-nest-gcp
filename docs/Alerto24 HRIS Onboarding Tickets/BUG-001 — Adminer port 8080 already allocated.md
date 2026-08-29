# BUG-001 — Adminer port 8080 already allocated

Status: Done

**ID:** `BUG-001` · **Priority:** P2 · **Epic:** Bugfixes · **Labels:** bugfix,infra

## Summary
Docker Compose failed binding Adminer to `:8080`. Ticket `BUG-001` (P2, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, infra`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Adminer port 8080 already allocated** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Changed host port to `:8081`.

## Files / areas touched
Primary touchpoints: `docker-compose.yml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `npm run db:up` completes without bind error
- [x] Adminer URL updated in README

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
