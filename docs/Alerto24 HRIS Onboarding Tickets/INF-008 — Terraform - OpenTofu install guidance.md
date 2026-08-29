# INF-008 — Terraform - OpenTofu install guidance

Status: Done

**ID:** `INF-008` · **Priority:** P2 · **Epic:** Infra / Deploy · **Labels:** infra,terraform

**Original title:** INF-008 — Terraform / OpenTofu install guidance

## Summary
Documented Homebrew HashiCorp tap for Terraform after core formula removal. Ticket `INF-008` (P2, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, terraform`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Terraform / OpenTofu install guidance** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- noted OpenTofu as compatible alternative (`tofu` CLI).

## Files / areas touched
Primary touchpoints: See repo paths below.. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] User successfully ran `terraform init && plan` in aws-cognito
- [x] README or AWS doc mentions both CLIs

## Demo / verify notes
User installed OpenTofu then official Terraform tap. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
