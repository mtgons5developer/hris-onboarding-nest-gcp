# BUG-006 — Local sign-out redirecting to live admin URL

Status: Done

**ID:** `BUG-006` · **Priority:** P1 · **Epic:** Bugfixes · **Labels:** bugfix,web

## Summary
Local dev sign-out sent users to `https://admin.getlakbay.com` instead of localhost landing/portals. Ticket `BUG-006` (P1, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, web`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Local sign-out redirecting to live admin URL** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Local dev sign-out sent users to `https://admin.getlakbay.com` instead of localhost landing/portals.

## Files / areas touched
Primary touchpoints: `apps/web-admin/src/api.ts`, `apps/web-onboarding/src/api.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Localhost sign-out stays on localhost
- [x] VITE_LANDING_URL override respected in dev

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
