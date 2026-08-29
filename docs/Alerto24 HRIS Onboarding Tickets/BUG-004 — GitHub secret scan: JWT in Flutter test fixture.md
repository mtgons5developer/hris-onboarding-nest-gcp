# BUG-004 — GitHub secret scan: JWT in Flutter test fixture

Status: Done

**ID:** `BUG-004` · **Priority:** P1 · **Epic:** Bugfixes · **Labels:** bugfix,security,mobile

## Summary
Cloudflare/GitHub flagged example JWT in mobile test as leaked secret. Ticket `BUG-004` (P1, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, security, mobile`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **GitHub secret scan: JWT in Flutter test fixture** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Replaced with obviously fake/redacted token pattern in sanitize test.

## Files / areas touched
Primary touchpoints: `apps/mobile/test/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] No real-looking JWT in committed tests
- [x] Deploy pipeline passes secret scan
- [x] Test still validates redaction logic

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
