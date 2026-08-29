# AUTH-001 — Replace Firebase Auth with OIDC JWT - JWKS verification

Status: Done

**ID:** `AUTH-001` · **Priority:** P0 · **Epic:** Auth · **Labels:** auth,api,security

**Original title:** AUTH-001 — Replace Firebase Auth with OIDC JWT / JWKS verification

## Summary
Removed Firebase Admin runtime dependency. Ticket `AUTH-001` (P0, status Done) lives under the **Auth** epic and is tagged `auth, api, security`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Replace Firebase Auth with OIDC JWT / JWKS verification** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Nest verifies OIDC access tokens via JWKS (`JwtAuthGuard`, `IdentityProviderService`).
- Aligns with JD Keycloak/Cognito/Entra pattern and AWS free-tier Cognito.

## Files / areas touched
Primary touchpoints: `apps/api/src/identity/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] No Firebase token verify in production path
- [x] Bearer JWT validated against configured JWKS URIs
- [x] User upserted from token claims

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
