# INF-011 — Cognito Hosted UI domain (managed prefix)

Status: Done

**ID:** `INF-011` · **Priority:** P1 · **Epic:** Infra / Deploy · **Labels:** infra,aws,cognito

## Summary
Used Cognito managed domain prefix `hris-lab-mtgons5` rather than custom `auth.getlakbay.com` for initial lab (deferred custom domain). Ticket `INF-011` (P1, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, aws, cognito`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Cognito Hosted UI domain (managed prefix)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Used Cognito managed domain prefix `hris-lab-mtgons5` rather than custom `auth.getlakbay.com` for initial lab (deferred custom domain).

## Files / areas touched
Primary touchpoints: `infra/aws-cognito/main.tf`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Hosted UI login URL works
- [x] OAuth endpoints documented in env examples
- [x] Custom domain noted as future enhancement

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
