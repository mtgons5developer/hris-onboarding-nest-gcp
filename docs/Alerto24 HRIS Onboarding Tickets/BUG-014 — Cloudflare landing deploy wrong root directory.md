# BUG-014 — Cloudflare landing deploy wrong root directory

Status: Done

**ID:** `BUG-014` · **Priority:** P2 · **Epic:** Bugfixes · **Labels:** bugfix,infra

## Summary
Initial landing deploy cloned repo but built wrong workspace until `apps/web-landing` set as Pages root (v2 root directory strategy). Ticket `BUG-014` (P2, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, infra`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Cloudflare landing deploy wrong root directory** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Initial landing deploy cloned repo but built wrong workspace until `apps/web-landing` set as Pages root (v2 root directory strategy).

## Files / areas touched
Primary touchpoints: Cloudflare Pages settings, `.github/workflows/deploy-pages.yml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Landing build uses web-landing package
- [x] Deploy log shows success
- [x] getlakbay.com shows marketing page

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
