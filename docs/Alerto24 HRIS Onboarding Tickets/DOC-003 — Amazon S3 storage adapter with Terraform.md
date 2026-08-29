# DOC-003 — Amazon S3 storage adapter with Terraform

Status: Done

**ID:** `DOC-003` · **Priority:** P0 · **Epic:** Documents · **Labels:** documents,aws,terraform,s3

## Summary
`infra/aws-s3/` creates private bucket with SSE, CORS for presigned PUT, 30-day lifecycle on `uploads/*`, IAM user for Nest uploads. Ticket `DOC-003` (P0, status Done) lives under the **Documents** epic and is tagged `documents, aws, terraform, s3`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **Amazon S3 storage adapter with Terraform** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- `STORAGE_DRIVER=s3` in lab.

## Files / areas touched
Primary touchpoints: `infra/aws-s3/main.tf`, `apps/api/src/documents/s3.storage.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Bucket created (after IAM permission fix for 403)
- [x] Nest generates presigned PUT/GET URLs
- [x] Env documented: `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
