# AUTH-003 — Keycloak local IdP in Docker Compose

Status: Done

**ID:** `AUTH-003` · **Priority:** P0 · **Epic:** Auth · **Labels:** auth,infra,keycloak

## Summary
Keycloak on `:8082` with imported `hris` realm. Ticket `AUTH-003` (P0, status Done) lives under the **Auth** epic and is tagged `auth, infra, keycloak`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Keycloak local IdP in Docker Compose** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Users mirror seed emails.
- Password grant for localhost Vite apps.
- Realm includes `hris-web` and `hris-mobile` clients.

## Files / areas touched
Primary touchpoints: `docker-compose.yml`, `infra/keycloak/hris-realm.json`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Keycloak admin UI at `http://localhost:8082`
- [x] Password grant works for `hr@lab.local` / `LabPass123!`
- [x] Realm import in `infra/keycloak/hris-realm.json`

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
