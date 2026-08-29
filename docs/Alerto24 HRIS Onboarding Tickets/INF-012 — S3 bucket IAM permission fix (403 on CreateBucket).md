# INF-012 — S3 bucket IAM permission fix (403 on CreateBucket)

Status: Done

**ID:** `INF-012` · **Priority:** P1 · **Epic:** Infra / Deploy · **Labels:** infra,aws,bugfix

## Summary
Initial `terraform apply` for S3 failed with 403 — resolved by adding S3/IAM permissions to lab IAM user policy. Ticket `INF-012` (P1, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, aws, bugfix`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **S3 bucket IAM permission fix (403 on CreateBucket)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Initial `terraform apply` for S3 failed with 403 — resolved by adding S3/IAM permissions to lab IAM user policy.

## Files / areas touched
Primary touchpoints: `infra/aws-s3/main.tf`, `docs/AWS_AND_IAM.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Bucket creates successfully after policy update
- [x] Nest IAM user can PutObject/GetObject
- [x] Documented in AWS_AND_IAM

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
