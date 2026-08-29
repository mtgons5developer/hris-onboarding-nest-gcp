# DOC-005 — Document view (presigned download URL)

Status: Done

**ID:** `DOC-005` · **Priority:** P1 · **Epic:** Documents · **Labels:** documents,api,web,mobile

## Summary
`GET /api/v1/documents/:id/download-url` returns authz-checked URL. Ticket `DOC-005` (P1, status Done) lives under the **Documents** epic and is tagged `documents, api, web, mobile`. This ticket is part of the Documents epic: metadata registration, local/S3 storage drivers, upload/download/delete flows, and linking files to onboarding checklist tasks for the employee and HR review path.

## Scope / work done
Work completed for **Document view (presigned download URL)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Local driver uses Nest proxy endpoint.
- HR can view Luis's uploaded ID in admin case detail.

## Files / areas touched
Primary touchpoints: `apps/api/src/documents/documents.controller.ts`, web + mobile clients. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Employee can view own uploads
- [x] HR admin can view employee documents on case
- [x] View works on web admin, web onboarding, Flutter

## Demo / verify notes
As Luis, upload government ID on onboarding checklist; as Harper, view/delete document on admin case detail (web or Flutter). Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
`STORAGE_DRIVER=local` (dev) or `s3` (prod). S3 needs `infra/aws-s3` apply + IAM keys in API `.env`. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
