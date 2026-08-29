# AUTH-005 — Terraform Cognito user pool, client, and RBAC groups

Status: Done

**ID:** `AUTH-005` · **Priority:** P0 · **Epic:** Auth · **Labels:** auth,infra,aws,terraform

## Summary
`infra/aws-cognito/` provisions user pool, app client, hosted UI domain prefix, groups (`hr_admin`, `manager`, `employee`, `system_admin`). Ticket `AUTH-005` (P0, status Done) lives under the **Auth** epic and is tagged `auth, infra, aws, terraform`. This ticket is part of the Auth epic: OIDC identity (Cognito in prod, Keycloak/dev bypass locally), JWT guards, role claims, and portal login so HR, managers, and employees reach the correct surfaces.

## Scope / work done
Work completed for **Terraform Cognito user pool, client, and RBAC groups** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Applied under AWS account `mtgons5.ea@gmail.com`, region `ap-southeast-1`.

## Files / areas touched
Primary touchpoints: `infra/aws-cognito/main.tf`, `docs/AWS_AND_IAM.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `terraform apply` succeeds
- [x] Outputs: `user_pool_id`, `client_id`, `jwks_uri`
- [x] Hosted domain: `hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com`

## Demo / verify notes
Sign in as Harper (`hr@lab.local` / `LabPass123!`) via Cognito Hosted UI on Pages or Keycloak/dev bypass locally; confirm `GET /api/v1/me` returns role claims. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cognito: `infra/aws-cognito` outputs, Pages `VITE_OIDC_*` vars. Local: Keycloak on :8082, `AUTH_DEV_BYPASS=true` on API. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
