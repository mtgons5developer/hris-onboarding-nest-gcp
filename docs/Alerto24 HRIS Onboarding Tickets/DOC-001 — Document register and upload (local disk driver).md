# DOC-001 — Document register and upload (local disk driver)

Status: Done

**ID:** `DOC-001` · **Priority:** P0 · **Epic:** Documents · **Labels:** documents,api

## Summary
Phase 2 documents module: register metadata, upload bytes to `data/uploads/` in dev. Ticket `DOC-001` (P0, status Done) lives under the **Documents** epic and is tagged `documents, api`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **Document register and upload (local disk driver)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- `STORAGE_DRIVER=local`.
- Linked to onboarding tasks (e.g.
- ID_DOC).

## Files / areas touched
Primary touchpoints: `apps/api/src/documents/*`, `apps/api/src/documents/local-disk.storage.ts`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] `POST /api/v1/documents` creates metadata row
- [x] Upload stores file on local disk
- [x] Employee can upload government ID for task

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
