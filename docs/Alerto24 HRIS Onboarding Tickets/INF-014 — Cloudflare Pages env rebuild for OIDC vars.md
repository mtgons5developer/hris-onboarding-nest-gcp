# INF-014 — Cloudflare Pages env rebuild for OIDC vars

Status: Done

**ID:** `INF-014` · **Priority:** P1 · **Epic:** Infra / Deploy · **Labels:** infra,cloudflare,auth

## Summary
Pages showed "Rebuild with VITE_OIDC_AUTHORIZE_URL / VITE_OIDC_CLIENT_ID" until env vars set and redeploy triggered (Vite bakes at build time). Ticket `INF-014` (P1, status Done) lives under the **Infra / Deploy** epic and is tagged `infra, cloudflare, auth`. This ticket is part of the Infra / Deploy epic: Cloudflare Pages + Tunnel, AWS Cognito/S3, DNS/SSL, and the public demo path that exposes the local Nest API at api.getlakbay.com without a long-lived VPS.

## Scope / work done
Work completed for **Cloudflare Pages env rebuild for OIDC vars** includes the concrete changes below. Treat this as the as-built record for reviewers importing into Alerto24/Klaro who only see Title + Description on the card.

- Pages showed "Rebuild with VITE_OIDC_AUTHORIZE_URL / VITE_OIDC_CLIENT_ID" until env vars set and redeploy triggered (Vite bakes at build time).

## Files / areas touched
Primary touchpoints: Pages dashboard config, `.env.example`. When validating locally or in CI, start from these paths, then confirm related workspace scripts and env examples still align with the acceptance checklist.

## Acceptance criteria
The card is Done when all of the following hold (also duplicated in the Acceptance Criteria column for checklist-style boards):

- [x] OIDC env vars set in Pages project settings
- [x] Redeploy after env change
- [x] Login form renders instead of rebuild message

## Demo / verify notes
Verify `curl https://api.getlakbay.com/health`, Pages SSL Active, and tunnel + Nest running for public demo. Prefer the seeded personas (Harper / Maya / Luis) where auth or portal flows apply, and capture any failure mode before claiming the ticket Done.

## Dependencies / notes
Cloudflare account, scoped API token, AWS CLI user `hris-lab-cli`. Tunnel credentials gitignored. Do not commit secrets, tunnel credentials, or cloud keys; keep `.env` / credential files gitignored and document only placeholder names.
