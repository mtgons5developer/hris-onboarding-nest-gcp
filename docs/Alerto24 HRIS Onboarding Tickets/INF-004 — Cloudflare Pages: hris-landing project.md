# INF-004 — Cloudflare Pages: hris-landing project

Status: Done

**ID:** `INF-004` · **Priority:** P1 · **Epic:** Infra / Deploy · **Labels:** infra,cloudflare,web

## Summary
Third Pages project for apex `getlakbay.com`, root `apps/web-landing`. Ticket `INF-004` (P1, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, cloudflare, web`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Cloudflare Pages: hris-landing project** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Added after Rippling-style landing request.

## Files / areas touched
Primary touchpoints: `infra/cloudflare/wrangler.landing.toml`, `.github/workflows/deploy-pages.yml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] getlakbay.com serves marketing landing
- [x] CF build uses `apps/web-landing` root
- [x] Deploy workflow includes landing

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
