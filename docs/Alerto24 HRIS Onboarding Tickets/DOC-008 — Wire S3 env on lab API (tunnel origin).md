# DOC-008 — Wire S3 env on lab API (tunnel origin)

Status: Done

**ID:** `DOC-008` · **Priority:** P1 · **Epic:** Documents · **Labels:** documents,infra

## Summary
Configured Nest `.env` on machine running cloudflared tunnel with S3 credentials so prod uploads go to AWS, not local disk. Ticket `DOC-008` (P1, status Done) lives under the **Documents** epic and is tagged `documents, infra`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **Wire S3 env on lab API (tunnel origin)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Configured Nest `.env` on machine running cloudflared tunnel with S3 credentials so prod uploads go to AWS, not local disk.

## Files / areas touched
Primary touchpoints: `apps/api/.env.example`, `README.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Prod upload stores object in S3 bucket
- [x] Local dev defaults to local driver
- [x] README documents both modes

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
