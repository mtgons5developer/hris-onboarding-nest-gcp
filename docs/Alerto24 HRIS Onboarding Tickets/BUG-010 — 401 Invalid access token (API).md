# BUG-010 — 401 Invalid access token (API)

Status: Done

**ID:** `BUG-010` · **Priority:** P0 · **Epic:** Bugfixes · **Labels:** bugfix,auth,api

## Summary
Clients received 401 after login — issuer/audience mismatch between Cognito token and Nest JWKS config. Fixed comma-separated issuers and audience list. Ticket `BUG-010` (P0, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, auth, api`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **401 Invalid access token (API)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- ensured Pages use Cognito not Keycloak in prod.

## Files / areas touched
Primary touchpoints: `apps/api/.env.example`, `identity-provider.service.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Authenticated API calls return 200
- [x] Nest log shows both JWKS ready
- [x] Mobile and web tokens validated

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
