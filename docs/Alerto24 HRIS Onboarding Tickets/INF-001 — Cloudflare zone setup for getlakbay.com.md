# INF-001 — Cloudflare zone setup for getlakbay.com

Status: Done

**ID:** `INF-001` · **Priority:** P0 · **Epic:** Infra / Deploy · **Labels:** infra,cloudflare,dns

## Summary
Moved domain nameservers from Whois.com to Cloudflare. Ticket `INF-001` (P0, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, cloudflare, dns`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Cloudflare zone setup for getlakbay.com** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Removed placeholder `127.0.0.1` A records (apex, www, wildcard).
- Documented Account ID vs Zone ID and scoped API token creation.

## Files / areas touched
Primary touchpoints: `docs/PRODUCTION_CLOUDFLARE.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Zone Active on Cloudflare
- [x] No wildcard or loopback A records
- [x] PRODUCTION_CLOUDFLARE.md guides token scope

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
