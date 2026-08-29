# CLT-005 — Mobile debug logging (add then remove UI)

Status: Done

**ID:** `CLT-005` · **Priority:** P2 · **Epic:** Clients · **Labels:** mobile,dev

## Summary
Added copy-paste friendly debug logs for OIDC/API tracing during prod auth debugging. Ticket `CLT-005` (P2, status Done) lives under the **Clients** epic and is tagged `mobile, dev`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Mobile debug logging (add then remove UI)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Removed debug icon/button from production UI after issues resolved.

## Files / areas touched
Primary touchpoints: `apps/mobile/lib/*`, `apps/mobile/test/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Logs trace OIDC state and API errors
- [x] No debug button in shipped mobile UI
- [x] JWT redaction in test fixtures

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
