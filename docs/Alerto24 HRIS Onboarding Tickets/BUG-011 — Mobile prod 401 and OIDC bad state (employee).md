# BUG-011 — Mobile prod 401 and OIDC bad state (employee)

Status: Done

**ID:** `BUG-011` · **Priority:** P0 · **Epic:** Bugfixes · **Labels:** bugfix,mobile,auth

## Summary
Employee Cognito login on mobile failed with 401 and "OIDC state mismatch". Ticket `BUG-011` (P0, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, mobile, auth`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Mobile prod 401 and OIDC bad state (employee)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Fixed redirect URI, state persistence, and API base URL for prod.

## Files / areas touched
Primary touchpoints: `apps/mobile/lib/oidc.dart`, Cognito app client callback URLs. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Luis can sign in on physical device against prod API
- [x] OIDC state survives browser callback
- [x] Token accepted by Nest

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
