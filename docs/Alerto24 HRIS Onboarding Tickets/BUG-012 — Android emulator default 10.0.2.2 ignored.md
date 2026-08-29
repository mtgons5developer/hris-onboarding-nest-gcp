# BUG-012 — Android emulator default 10.0.2.2 ignored

Status: Done

**ID:** `BUG-012` · **Priority:** P2 · **Epic:** Bugfixes · **Labels:** bugfix,mobile

## Summary
Flutter still used `10.0.2.2:3000` despite `--dart-define=API_BASE_URL` for physical device. Ticket `BUG-012` (P2, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, mobile`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Android emulator default 10.0.2.2 ignored** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Fixed config precedence in client bootstrap.

## Files / areas touched
Primary touchpoints: `apps/mobile/lib/hris_client.dart`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] dart-define overrides default host
- [x] Emulator and device each documented

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
