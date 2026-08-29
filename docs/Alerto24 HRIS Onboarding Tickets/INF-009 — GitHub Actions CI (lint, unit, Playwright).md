# INF-009 — GitHub Actions CI (lint, unit, Playwright)

Status: Done

**ID:** `INF-009` · **Priority:** P2 · **Epic:** Infra / Deploy · **Labels:** infra,ci

## Summary
CI workflow on PR/main: API lint/test, optional E2E with Postgres service. Ticket `INF-009` (P2, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, ci`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **GitHub Actions CI (lint, unit, Playwright)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- CI workflow on PR/main: API lint/test, optional E2E with Postgres service.

## Files / areas touched
Primary touchpoints: `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Workflow file in `.github/workflows/`
- [x] Unit tests run in CI
- [x] Pages deploy separate workflow

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
