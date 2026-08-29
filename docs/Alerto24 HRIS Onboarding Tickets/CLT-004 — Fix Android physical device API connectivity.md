# CLT-004 — Fix Android physical device API connectivity

Status: Done

**ID:** `CLT-004` · **Priority:** P1 · **Epic:** Clients · **Labels:** mobile,bugfix

## Summary
Physical Android could not reach `localhost:3000`. Ticket `CLT-004` (P1, status Done) lives under the **Clients** epic and is tagged `mobile, bugfix`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Fix Android physical device API connectivity** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Fixed by LAN IP (`192.168.0.4`) via `--dart-define=API_BASE_URL` and ensuring Nest listens on `0.0.0.0`.
- Resolved stale `10.0.2.2` default.

## Files / areas touched
Primary touchpoints: `apps/mobile/README.md`, `apps/mobile/lib/hris_client.dart`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Real device reaches API on LAN IP
- [x] README documents dart-define for API host
- [x] Emulator vs device hosts documented

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
