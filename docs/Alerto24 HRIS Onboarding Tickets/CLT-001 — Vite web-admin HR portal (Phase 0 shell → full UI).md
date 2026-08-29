# CLT-001 — Vite web-admin HR portal (Phase 0 shell → full UI)

Status: Done

**ID:** `CLT-001` · **Priority:** P0 · **Epic:** Clients · **Labels:** web,clients

## Summary
HR admin portal at `:5173` / `admin.getlakbay.com`. Ticket `CLT-001` (P0, status Done) lives under the **Clients** epic and is tagged `web, clients`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Vite web-admin HR portal (Phase 0 shell → full UI)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Employee list, create employee, case detail, task view, approve, audit tab, document view/delete.

## Files / areas touched
Primary touchpoints: `apps/web-admin/*`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] HR signs in and lists employees/cases
- [x] Can approve pending_hr case
- [x] Audit tab shows history

## Demo / verify notes
Open each portal (admin :5173, onboarding :5174, landing :5175 locally; getlakbay.com subdomains in prod) and walk the happy path. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
