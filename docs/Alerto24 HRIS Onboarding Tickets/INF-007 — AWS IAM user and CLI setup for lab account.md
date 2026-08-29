# INF-007 — AWS IAM user and CLI setup for lab account

Status: Done

**ID:** `INF-007` · **Priority:** P1 · **Epic:** Infra / Deploy · **Labels:** infra,aws

## Summary
Guided creation of IAM user `hris-lab-cli` with AmazonCognitoPowerUser (and later S3 permissions) under `mtgons5.ea@gmail.com`. Ticket `INF-007` (P1, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, aws`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **AWS IAM user and CLI setup for lab account** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Documented `aws configure` vs root login.

## Files / areas touched
Primary touchpoints: `docs/AWS_AND_IAM.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `aws sts get-caller-identity` succeeds
- [x] Least-privilege policy attached
- [x] No secrets committed to git

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
