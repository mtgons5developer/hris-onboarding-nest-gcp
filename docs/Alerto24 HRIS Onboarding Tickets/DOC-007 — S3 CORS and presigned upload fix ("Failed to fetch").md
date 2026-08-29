# DOC-007 — S3 CORS and presigned upload fix ("Failed to fetch")

Status: Done

**ID:** `DOC-007` · **Priority:** P1 · **Epic:** Documents · **Labels:** documents,bugfix,s3

## Summary
Fixed browser upload failures to S3 by correcting CORS rules and presigned URL headers. Ticket `DOC-007` (P1, status Done) lives under the **Documents** epic and is tagged `documents, bugfix, s3`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **S3 CORS and presigned upload fix ("Failed to fetch")** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Documented prod requires `STORAGE_DRIVER=s3` on tunnel-hosted Nest.

## Files / areas touched
Primary touchpoints: `infra/aws-s3/cors.json`, `infra/aws-s3/main.tf`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Browser PUT to presigned URL succeeds from Pages origin
- [x] No "Failed to fetch" on prod upload
- [x] CORS JSON in `infra/aws-s3/cors.json`

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
