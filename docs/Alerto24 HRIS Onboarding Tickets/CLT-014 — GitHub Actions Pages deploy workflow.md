# CLT-014 — GitHub Actions Pages deploy workflow

Status: Done

**ID:** `CLT-014` · **Priority:** P1 · **Epic:** Clients · **Labels:** infra,ci,web

## Summary
Workflow deploys three Pages projects on push: hris-admin, hris-onboarding, hris-landing with monorepo root directories and OIDC env vars. Ticket `CLT-014` (P1, status Done) lives under the **Clients** epic and is tagged `infra, ci, web`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **GitHub Actions Pages deploy workflow** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Workflow deploys three Pages projects on push: hris-admin, hris-onboarding, hris-landing with monorepo root directories and OIDC env vars.

## Files / areas touched
Primary touchpoints: `.github/workflows/deploy-pages.yml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Push to main triggers deploy
- [x] Each app builds from correct workspace root
- [x] Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
