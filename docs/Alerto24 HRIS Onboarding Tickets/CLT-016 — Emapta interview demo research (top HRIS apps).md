# CLT-016 — Emapta interview demo research (top HRIS apps)

Status: Done

**ID:** `CLT-016` · **Priority:** P3 · **Epic:** Clients · **Labels:** ux,docs

## Summary
Researched top HRIS/onboarding apps (Rippling, BambooHR, Gusto) for Emapta interview demo patterns. Ticket `CLT-016` (P3, status Done) lives under the **Clients** epic and is tagged `ux, docs`. This ticket is part of the Clients epic: Vite admin/onboarding/landing portals and Flutter mobile clients that consume the Nest API and OIDC, including routing, role-gated UX, and production subdomain wiring on getlakbay.com.

## Scope / work done
Work completed for **Emapta interview demo research (top HRIS apps)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Chose Rippling dual HR+onboarding UX as reference.

## Files / areas touched
Primary touchpoints: See repo paths below.. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Top 3 apps documented in conversation
- [x] Rippling selected as UX reference
- [x] Lab narrative ties to Nest modular architecture

## Demo / verify notes
Interview talk track in README and AS_BUILT demo script. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Vite env baked at build time (`VITE_API_BASE_URL`, OIDC vars). Flutter uses `--dart-define=API_BASE_URL` for device LAN IP. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
