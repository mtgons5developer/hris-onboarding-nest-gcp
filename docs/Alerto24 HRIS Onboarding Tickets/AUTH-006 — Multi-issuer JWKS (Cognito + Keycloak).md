# AUTH-006 — Multi-issuer JWKS (Cognito + Keycloak)

Status: Done

**ID:** `AUTH-006` · **Priority:** P0 · **Epic:** Auth · **Labels:** auth,api

## Summary
Nest accepts comma-separated `OIDC_ISSUER` and `OIDC_JWKS_URI` pairs. Ticket `AUTH-006` (P0, status Done) lives under the **Auth** epic and is tagged `auth, api`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Multi-issuer JWKS (Cognito + Keycloak)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Validates tokens from Cognito (prod Pages) and Keycloak (local) simultaneously.
- `OIDC_AUDIENCE` lists both client IDs.

## Files / areas touched
Primary touchpoints: `apps/api/src/identity/identity-provider.service.ts`, `.env.example`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Cognito tokens accepted when API configured with both issuers
- [x] Keycloak tokens accepted on localhost
- [x] Log shows both JWKS URIs ready

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
