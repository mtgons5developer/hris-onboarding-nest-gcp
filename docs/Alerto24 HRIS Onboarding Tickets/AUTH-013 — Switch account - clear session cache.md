# AUTH-013 — Switch account - clear session cache

Status: Done

**ID:** `AUTH-013` · **Priority:** P2 · **Epic:** Auth · **Labels:** auth,mobile,web

**Original title:** AUTH-013 — Switch account / clear session cache

## Summary
Added sign-out and "switch account" flow that clears OIDC tokens/session storage so users can log in as a different persona without stale state. Ticket `AUTH-013` (P2, status Done) lives under the **Auth** epic and is tagged `auth, mobile, web`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Switch account / clear session cache** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Added sign-out and "switch account" flow that clears OIDC tokens/session storage so users can log in as a different persona without stale state.

## Files / areas touched
Primary touchpoints: `apps/mobile/lib/session.dart`, `apps/web-*/src/api.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Sign out clears tokens on web and mobile
- [x] Re-login as different user works without manual cache clear
- [x] OIDC state regenerated on fresh login

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
