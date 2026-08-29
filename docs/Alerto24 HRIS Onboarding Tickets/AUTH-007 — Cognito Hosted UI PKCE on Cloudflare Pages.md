# AUTH-007 — Cognito Hosted UI PKCE on Cloudflare Pages

Status: Done

**ID:** `AUTH-007` · **Priority:** P0 · **Epic:** Auth · **Labels:** auth,web,cognito

## Summary
Vite admin and onboarding use authorization code + PKCE against Cognito Hosted UI in production. Ticket `AUTH-007` (P0, status Done) lives under the **Auth** epic and is tagged `auth, web, cognito`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Cognito Hosted UI PKCE on Cloudflare Pages** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Env: `VITE_OIDC_AUTHORIZE_URL`, `VITE_OIDC_TOKEN_URL`, `VITE_OIDC_CLIENT_ID`, redirect URIs per subdomain.

## Files / areas touched
Primary touchpoints: `apps/web-admin/src/oidc.ts`, `apps/web-onboarding/src/oidc.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Sign in with Cognito works on admin/onboarding.getlakbay.com
- [x] Callback exchanges code for tokens
- [x] Cognito callback/logout URLs include all portal origins

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
