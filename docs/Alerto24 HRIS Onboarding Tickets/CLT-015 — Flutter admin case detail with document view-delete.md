# CLT-015 — Flutter admin case detail with document view-delete

Status: Done

**ID:** `CLT-015` · **Priority:** P1 · **Epic:** Clients · **Labels:** mobile

**Original title:** CLT-015 — Flutter admin case detail with document view/delete

## Summary
HR users on mobile open case detail, view uploaded documents, delete when authorized — parity with web admin. Ticket `CLT-015` (P1, status Done) lives under the **Clients** epic and is tagged `mobile`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Flutter admin case detail with document view/delete** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- HR users on mobile open case detail, view uploaded documents, delete when authorized — parity with web admin.

## Files / areas touched
Primary touchpoints: `apps/mobile/lib/screens/admin_case_detail_screen.dart`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Harper can open Luis case on mobile
- [x] View document opens download URL
- [x] Delete updates checklist state

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
