# CLT-006 — Rippling-style marketing landing page

Status: Done

**ID:** `CLT-006` · **Priority:** P1 · **Epic:** Clients · **Labels:** web,ux,rippling

## Summary
New `apps/web-landing` at `:5175` / `getlakbay.com`. Ticket `CLT-006` (P1, status Done) lives under the **Clients** epic and is tagged `web, ux, rippling`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Rippling-style marketing landing page** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Marketing-style hero and sections inspired by Rippling demo narrative.
- Separate CTA buttons for Admin and Onboarding portals.

## Files / areas touched
Primary touchpoints: `apps/web-landing/*`, `infra/cloudflare/wrangler.landing.toml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Apex domain serves landing Pages project `hris-landing`
- [x] Buttons link to admin and onboarding subdomains
- [x] Sign-out from portals redirects here

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
