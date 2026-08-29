# AUTH-014 — Cognito logout URI and sign-out redirect to landing

Status: Done

**ID:** `AUTH-014` · **Priority:** P1 · **Epic:** Auth · **Labels:** auth,web,cognito

## Summary
Sign-out from admin/onboarding redirects to landing (`getlakbay.com` prod, `:5175` local). Ticket `AUTH-014` (P1, status Done) lives under the **Auth** epic and is tagged `auth, web, cognito`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Cognito logout URI and sign-out redirect to landing** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Cognito `logout_uri` allowlist includes apex and localhost.
- Fixed prod "Invalid request" after signout.

## Files / areas touched
Primary touchpoints: `apps/web-admin/src/App.tsx`, `apps/web-onboarding/src/App.tsx`, `apps/web-landing/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Sign out lands on landing page, not portal login
- [x] Cognito logout does not return 400
- [x] Local sign-out uses localhost landing, not live URLs

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
