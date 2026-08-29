# INF-013 — Lab runtime checklist (tunnel + API + optional Vite)

Status: Done

**ID:** `INF-013` · **Priority:** P2 · **Epic:** Infra / Deploy · **Labels:** infra,docs

## Summary
Documented which processes must run for prod demo vs local-only: tunnel + Nest for public API. Ticket `INF-013` (P2, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, docs`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Lab runtime checklist (tunnel + API + optional Vite)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Vite dev servers only for local UI.
- Pages serve static prod frontends.

## Files / areas touched
Primary touchpoints: `README.md`, `docs/AS_BUILT.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] README clarifies prod vs local process list
- [x] User knows Pages does not need local Vite for prod UI

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
