# INF-003 — Cloudflare Pages: hris-onboarding project

Status: Done

**ID:** `INF-003` · **Priority:** P0 · **Epic:** Infra / Deploy · **Labels:** infra,cloudflare,web

## Summary
Second Pages project, root `apps/web-onboarding`, domain `onboarding.getlakbay.com`. Ticket `INF-003` (P0, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, cloudflare, web`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Cloudflare Pages: hris-onboarding project** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Fixed initial misconfiguration where admin domain pointed at onboarding project.

## Files / areas touched
Primary touchpoints: `infra/cloudflare/wrangler.onboarding.toml`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] onboarding.getlakbay.com serves employee app
- [x] admin domain only on hris-admin project
- [x] SSL Active

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
