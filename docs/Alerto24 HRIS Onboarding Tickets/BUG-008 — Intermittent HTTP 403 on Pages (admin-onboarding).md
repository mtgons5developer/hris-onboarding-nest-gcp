# BUG-008 — Intermittent HTTP 403 on Pages (admin-onboarding)

Status: Done

**ID:** `BUG-008` · **Priority:** P1 · **Epic:** Bugfixes · **Labels:** bugfix,infra,cloudflare

**Original title:** BUG-008 — Intermittent HTTP 403 on Pages (admin/onboarding)

## Summary
Random "Access denied" HTTP 403 on static Pages — investigated as Cloudflare Access/WAF/bot rules rather than Nest JWT. Ticket `BUG-008` (P1, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, infra, cloudflare`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Intermittent HTTP 403 on Pages (admin/onboarding)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Documented in README troubleshoot table.

## Files / areas touched
Primary touchpoints: `README.md`, `docs/PRODUCTION_CLOUDFLARE.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Root cause documented (edge vs API)
- [x] Mitigation: review CF Access, pause rules, verify DNS proxy
- [x] Not conflated with API 401

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
