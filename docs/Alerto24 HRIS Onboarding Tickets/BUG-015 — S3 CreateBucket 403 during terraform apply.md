# BUG-015 — S3 CreateBucket 403 during terraform apply

Status: Done

**ID:** `BUG-015` · **Priority:** P1 · **Epic:** Bugfixes · **Labels:** bugfix,aws,terraform

## Summary
IAM user lacked s3:CreateBucket permission. Expanded lab IAM policy. Ticket `BUG-015` (P1, status Done) lives under the **Bugfixes** epic and is tagged `bugfix, aws, terraform`. This ticket is part of the Bugfixes epic: regressions found during lab bring-up (ports, auth edge cases, CORS, env baking, tunnel/Pages quirks). Each fix should remain reproducible from the steps below.

## Scope / work done
Work completed for **S3 CreateBucket 403 during terraform apply** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- re-ran apply successfully.

## Files / areas touched
Primary touchpoints: `infra/aws-s3/main.tf`, `docs/AWS_AND_IAM.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Bucket and IAM user created
- [x] Outputs wired to Nest env example

## Demo / verify notes
Reproduce original failure mode, apply fix steps in description, confirm regression no longer occurs. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
See ticket-specific env/dashboard notes. Distinguish Cloudflare edge 403 from API JWT 401. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
