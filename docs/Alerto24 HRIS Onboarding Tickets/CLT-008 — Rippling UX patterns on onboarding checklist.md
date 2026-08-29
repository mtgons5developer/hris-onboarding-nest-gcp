# CLT-008 — Rippling UX patterns on onboarding checklist

Status: Done

**ID:** `CLT-008` · **Priority:** P2 · **Epic:** Clients · **Labels:** web,mobile,ux,rippling

## Summary
Applied Rippling-inspired onboarding UX: progress framing, task grouping, clearer status chips, admin case timeline cues. Ticket `CLT-008` (P2, status Done) lives under the **Clients** epic and is tagged `web, mobile, ux, rippling`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Rippling UX patterns on onboarding checklist** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- User initially saw no change until landing/login/beautify work landed.

## Files / areas touched
Primary touchpoints: `apps/web-onboarding/src/App.tsx`, `apps/web-admin/src/App.tsx`, Flutter screens. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Checklist shows progress and task states clearly
- [x] Admin case view suitable for interview demo
- [x] Mobile mirrors key onboarding flows

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
