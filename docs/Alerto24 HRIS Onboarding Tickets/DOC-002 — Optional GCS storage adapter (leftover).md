# DOC-002 — Optional GCS storage adapter (leftover)

Status: Done

**ID:** `DOC-002` · **Priority:** P3 · **Epic:** Documents · **Labels:** documents,api,gcs

## Summary
GCS signed-URL adapter retained from original GCP design. Not used in AWS lab path. Ticket `DOC-002` (P3, status Done) lives under the **Documents** epic and is tagged `documents, api, gcs`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **Optional GCS storage adapter (leftover)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- documented as optional.

## Files / areas touched
Primary touchpoints: `apps/api/src/documents/gcs.storage.ts`, `apps/api/src/documents/storage.factory.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Factory selects driver by `STORAGE_DRIVER`
- [x] GCS path documented but not lab default

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
