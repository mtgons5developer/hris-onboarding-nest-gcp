# AUTH-004 — Dev auth bypass (localhost - LAN only)

Status: Done

**ID:** `AUTH-004` · **Priority:** P1 · **Epic:** Auth · **Labels:** auth,api,dev

**Original title:** AUTH-004 — Dev auth bypass (localhost / LAN only)

## Summary
`AUTH_DEV_BYPASS=true` accepts `Bearer dev:hr_admin`, `dev:manager`, `dev:employee` when request Host is localhost or LAN. Ticket `AUTH-004` (P1, status Done) lives under the **Auth** epic and is tagged `auth, api, dev`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Dev auth bypass (localhost / LAN only)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Disabled on public getlakbay.com hosts.
- Harper/Maya/Luis quick-login buttons in Vite.

## Files / areas touched
Primary touchpoints: `apps/api/src/identity/jwt-auth.guard.ts`, `apps/web-*/src/App.tsx`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Dev tokens work on localhost API
- [x] Bypass ignored when Host is public domain
- [x] Pages builds set `VITE_AUTH_DEV_BYPASS=false`

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
