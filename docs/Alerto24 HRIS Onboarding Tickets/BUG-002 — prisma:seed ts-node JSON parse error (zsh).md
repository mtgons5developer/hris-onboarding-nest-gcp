# BUG-002 — prisma:seed ts-node JSON parse error (zsh)

Status: Done

**ID:** `BUG-002` · **Priority:** P2 · **Epic:** Bugfixes · **Labels:** bugfix,database

## Summary
`npm run prisma:seed` failed parsing `{module:CommonJS}` due to shell quoting. Ticket `BUG-002` (P2, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, database`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **prisma:seed ts-node JSON parse error (zsh)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Fixed package.json script quoting for zsh.

## Files / areas touched
Primary touchpoints: `apps/api/package.json`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Seed runs on macOS zsh without SyntaxError
- [x] Seed idempotent or documented

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
