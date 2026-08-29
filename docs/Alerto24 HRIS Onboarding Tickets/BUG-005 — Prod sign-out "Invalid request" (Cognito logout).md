# BUG-005 — Prod sign-out "Invalid request" (Cognito logout)

Status: Done

**ID:** `BUG-005` · **Priority:** P1 · **Epic:** Bugfixes · **Labels:** bugfix,auth

## Summary
After prod sign-out, Cognito returned "Invalid request" — fixed logout redirect URI and client logout URL allowlist. Ticket `BUG-005` (P1, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, auth`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **Prod sign-out "Invalid request" (Cognito logout)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- After prod sign-out, Cognito returned "Invalid request" — fixed logout redirect URI and client logout URL allowlist.

## Files / areas touched
Primary touchpoints: OIDC logout config, Cognito app client settings. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Sign out completes without Cognito error
- [x] User lands on landing page

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
