# AUTH-012 — Flutter role routing (employee + HR admin)

Status: Done

**ID:** `AUTH-012` · **Priority:** P1 · **Epic:** Auth · **Labels:** auth,mobile,security

## Summary
Single Flutter app routes by `/api/v1/me` role: employee checklist vs HR case detail/admin console. Server-side RBAC enforced. Ticket `AUTH-012` (P1, status Done) lives under the **Auth** epic and is tagged `auth, mobile, security`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Flutter role routing (employee + HR admin)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- UI hides admin surfaces for employees.

## Files / areas touched
Primary touchpoints: `apps/mobile/lib/main.dart`, `apps/mobile/lib/screens/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Luis sees onboarding checklist
- [x] Harper sees admin case list/detail
- [x] Unauthorized roles cannot access admin screens via API

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
