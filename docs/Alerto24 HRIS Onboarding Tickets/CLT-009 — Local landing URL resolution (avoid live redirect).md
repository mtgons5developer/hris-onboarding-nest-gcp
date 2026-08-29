# CLT-009 — Local landing URL resolution (avoid live redirect)

Status: Done

**ID:** `CLT-009` · **Priority:** P1 · **Epic:** Clients · **Labels:** web,bugfix

## Summary
Fixed local dev redirecting sign-out and landing links to live `admin.getlakbay.com` instead of `localhost:5173/5175`. Ticket `CLT-009` (P1, status Done) lives under the **Clients** epic and is tagged `web, bugfix`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Local landing URL resolution (avoid live redirect)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Runtime detection uses localhost for landing URL when on LAN dev.

## Files / areas touched
Primary touchpoints: `apps/web-landing/src/App.tsx`, `apps/web-admin/src/api.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Local sign-out → `http://localhost:5175`
- [x] Local landing buttons → localhost portal ports
- [x] Prod still uses getlakbay.com hostnames

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
