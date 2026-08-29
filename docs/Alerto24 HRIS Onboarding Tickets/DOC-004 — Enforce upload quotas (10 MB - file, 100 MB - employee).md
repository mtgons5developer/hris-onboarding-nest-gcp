# DOC-004 — Enforce upload quotas (10 MB - file, 100 MB - employee)

Status: Done

**ID:** `DOC-004` · **Priority:** P1 · **Epic:** Documents · **Labels:** documents,api

**Original title:** DOC-004 — Enforce upload quotas (10 MB / file, 100 MB / employee)

## Summary
Nest enforces per-file and per-employee storage totals before accepting uploads. Ticket `DOC-004` (P1, status Done) lives under the **Documents** epic and is tagged `documents, api`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **Enforce upload quotas (10 MB / file, 100 MB / employee)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Migration added `size_bytes` to documents_meta.

## Files / areas touched
Primary touchpoints: `apps/api/src/documents/document-quota.ts`, `apps/api/prisma/migrations/20260827100000_document_size_bytes/`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Upload > 10 MB rejected
- [x] Employee total > 100 MB rejected
- [x] Unit tests cover quota logic

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
