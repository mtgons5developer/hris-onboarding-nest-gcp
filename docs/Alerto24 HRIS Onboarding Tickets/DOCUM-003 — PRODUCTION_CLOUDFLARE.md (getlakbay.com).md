# DOCUM-003 — PRODUCTION_CLOUDFLARE.md (getlakbay.com)

Status: Done

**ID:** `DOCUM-003` · **Priority:** P1 · **Epic:** Documentation · **Labels:** docs,cloudflare

## Summary
Full guide: nameserver move, Account ID, API token scope, Pages projects, tunnel, isolation from Alerto24 production domains. Ticket `DOCUM-003` (P1, status Done) lives under the **Documentation** epic and is tagged `docs, cloudflare`. This ticket is part of the Documentation epic: README, setup guides, env tables, and demo scripts that match the as-built AWS + Cognito + S3 + Cloudflare stack (GCP/Firebase paths marked historical only).

## Scope / work done
Work completed for **PRODUCTION_CLOUDFLARE.md (getlakbay.com)** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Full guide: nameserver move, Account ID, API token scope, Pages projects, tunnel, isolation from Alerto24 production domains.

## Files / areas touched
Primary touchpoints: `docs/PRODUCTION_CLOUDFLARE.md`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] Step-by-step CF setup
- [x] Warns against Global API token in GitHub
- [x] Apex explicitly getlakbay.com

## Demo / verify notes
Open linked doc paths; confirm URLs, env tables, and demo script match current as-built stack. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Docs reflect AWS+Cognito+S3+Cloudflare as-built; GCP/Firebase paths marked historical only. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
