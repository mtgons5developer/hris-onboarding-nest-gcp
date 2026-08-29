# CLT-003 — Scaffold Flutter mobile app (iOS + Android)

Status: Done

**ID:** `CLT-003` · **Priority:** P1 · **Epic:** Clients · **Labels:** mobile,clients,flutter

## Summary
`apps/mobile` Flutter project consuming same Nest API. Ticket `CLT-003` (P1, status Done) lives under the **Clients** epic and is tagged `mobile, clients, flutter`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Scaffold Flutter mobile app (iOS + Android)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Employee onboarding checklist and HR admin case views.
- Documented run commands for sim, emulator, physical device.

## Files / areas touched
Primary touchpoints: `apps/mobile/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `flutter run` works on iOS/Android
- [x] README in `apps/mobile/README.md`
- [x] Not part of npm workspace (separate SDK)

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
