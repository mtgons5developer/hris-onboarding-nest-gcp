# AUTH-009 — Create Cognito lab users and group assignments

Status: Done

**ID:** `AUTH-009` · **Priority:** P1 · **Epic:** Auth · **Labels:** auth,aws,demo

## Summary
Created Cognito users matching seed personas: `hr@lab.local`, `maya.santos@lab.local`, `luis.reyes@lab.local`, `sysadmin@lab.local` with password `LabPass123!`. Ticket `AUTH-009` (P1, status Done) lives under the **Auth** epic and is tagged `auth, aws, demo`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Create Cognito lab users and group assignments** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Assigned to RBAC groups for JWT role claims.

## Files / areas touched
Primary touchpoints: `README.md`, `docs/AWS_AND_IAM.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Each persona can sign in via Hosted UI
- [x] JWT contains role/group for Nest RBAC
- [x] Documented in README seeded logins table

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
