# AUTH-008 — Keycloak password-grant sign-in for localhost Vite

Status: Done

**ID:** `AUTH-008` · **Priority:** P1 · **Epic:** Auth · **Labels:** auth,web,keycloak

## Summary
Localhost portals offer "Sign in with Keycloak" using `VITE_KEYCLOAK_*` env vars. Ticket `AUTH-008` (P1, status Done) lives under the **Auth** epic and is tagged `auth, web, keycloak`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Keycloak password-grant sign-in for localhost Vite** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Documented: do not point Keycloak token URL at Cognito (unsupported grant type).

## Files / areas touched
Primary touchpoints: `apps/web-admin/.env.example`, `apps/web-onboarding/.env.example`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Keycloak login works on `:5173` / `:5174`
- [x] Clear error when grant type mismatched
- [x] `.env.example` documents both IdP paths

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
