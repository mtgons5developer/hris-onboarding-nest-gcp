# Production: Cloudflare + domains + mobile later

**Lab apex (`$APEX`): `getlakbay.com`.** This is the dedicated HRIS / onboarding lab domain. It is **not** Alerto24 production (`alerto24.uk` or any emergency hostname). Do not share DNS, Pages projects, or API tokens with the Alerto24 stack.

**Lab AWS login:** `mtgons5.ea@gmail.com` — Cognito user pool only (`infra/aws-cognito/`), not RDS unless you later accept billing. See [AWS_AND_IAM.md](AWS_AND_IAM.md). Pool **hris-lab** is applied (`ap-southeast-1_Z0Q7ukIMG`). Hosted UI prefix `hris-lab-mtgons5` is Active.

Cloudflare owns **DNS + TLS + the three Vite surfaces** (landing, admin, onboarding). NestJS does **not** run on Pages — the API is an origin behind a **Cloudflare Tunnel** from the machine that already runs Nest + Compose Postgres (Fly/VPS later). Flutter Android/iOS in `apps/mobile/` calls the same REST API (not hosted on Pages).

**Pages custom domains are Active:** `https://getlakbay.com` (`hris-landing`), `https://admin.getlakbay.com` (`hris-admin`), and `https://onboarding.getlakbay.com` (`hris-onboarding`). Remaining work is keeping the Tunnel to Nest healthy and rebuilding Pages when `VITE_*` changes. Nameserver cutover is done; keep [Move getlakbay.com to Cloudflare](#move-getlakbaycom-to-cloudflare) as the record of how the zone was added.

## Hostnames

| Host | Product | Cloudflare |
|------|---------|------------|
| `getlakbay.com` | Marketing landing (Vite) | **Pages** project `hris-landing` |
| `www.getlakbay.com` | Optional alias / redirect | **Pages** project `hris-landing` |
| `admin.getlakbay.com` | HRIS Admin (Vite) | **Pages** project `hris-admin` |
| `onboarding.getlakbay.com` | New-hire portal (Vite) | **Pages** project `hris-onboarding` |
| `api.getlakbay.com` | NestJS REST | Tunnel CNAME → `<tunnel-id>.cfargotunnel.com`, proxied |
| `auth.getlakbay.com` | Cognito (or Keycloak) **custom domain — later** | Proxied; lock down `/admin` |

**First Cognito cut:** use the Cognito Hosted UI (`https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com`) for login/token. Do not wait on `auth.getlakbay.com`. Nest still verifies JWTs from `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG` (issuer + JWKS), not from the Pages hosts.

| Host | Role vs Cognito |
|------|-----------------|
| `admin.getlakbay.com` / `onboarding.getlakbay.com` | SPA Hosted UI (`VITE_OIDC_AUTHORIZE_URL` + PKCE → `VITE_OIDC_TOKEN_URL`); `VITE_OIDC_CLIENT_ID` = `hris-web` |
| `api.getlakbay.com` | Nest `OIDC_ISSUER` / `OIDC_JWKS_URI` / `OIDC_AUDIENCE` from Cognito pool + clients (not the Pages hosts) |
| `auth.getlakbay.com` | Optional later CNAME to Cognito custom domain; until then, hosted UI prefix is enough |

Mobile apps use `https://api.getlakbay.com` (no CORS). Optional Universal Links / App Links on `https://onboarding.getlakbay.com/.well-known/`.

```
Browser / Flutter
        │
        ├─ getlakbay.com ──────────────── Cloudflare Pages (landing SPA)
        ├─ admin.getlakbay.com ──────── Cloudflare Pages (SPA)
        ├─ onboarding.getlakbay.com ── Cloudflare Pages (SPA)
        │
        └─ Bearer JWT ──► api.getlakbay.com ──► CF proxy/Tunnel ──► Nest
                                              │
                              Postgres (Compose / RDS / Cloud SQL)
                              IdP JWKS (Keycloak or Cognito)
```

## What Cloudflare should and should not host

| Layer | Use Cloudflare | Notes |
|-------|----------------|-------|
| Static React | **Yes — Pages** | Free tier is enough for a lab |
| DNS + Universal SSL | **Yes** | Apex + subdomains |
| Nest + Prisma | **No** | Needs Node long-running process + DB |
| Postgres | **No** | Docker on a VPS, RDS, or Cloud SQL |
| Keycloak | Optional origin | Heavy JVM; Cognito avoids self-hosting IdP |
| Files | R2 later | Swap `STORAGE_DRIVER` to S3-compatible |

**Cheap API origin options:** **Cloudflare Tunnel** (`cloudflared`) from the machine that already runs Nest + Compose Postgres is the lab path (do not open 3000 on the public internet). Fly.io / a small VPS later — not this pass.

## Move getlakbay.com to Cloudflare

**Done** for this lab (zone Active; Pages custom domains attached). Steps below are the cutover record if you ever onboard another apex.

This cannot be finished from git. You change **nameservers at the current registrar**; Cloudflare then becomes the DNS authority. Typical registrar UIs call this “Nameservers”, “DNS servers”, or “Use custom nameservers” (not “DNS records” / “A records”).

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) with the account that will own this lab (not a throwaway, not Alerto24-only if you want the lab isolated — a dedicated account is fine).
2. **Add a site** (or **Onboard a domain**): enter `getlakbay.com`. Choose the **Free** plan.
3. Review the scanned DNS records. Keep anything you still need (mail, existing www). You can add the Pages/API records later.
4. Cloudflare shows **two nameservers**, for example `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`. Copy both. They are unique to this zone — do not reuse nameservers from another domain.
5. At the **current registrar** for `getlakbay.com`, replace the registrar’s default nameservers with those two Cloudflare nameservers. Save. Do not point only one of them.
6. Wait until Cloudflare marks the zone **Active** (often minutes; can take up to 24–48 hours). Dashboard email and the domain Overview both show this. Until then, `dig NS getlakbay.com` will still show the old registrar NS.
7. After Active: add the [DNS records](#dns-once-getlakbaycom-is-in-cloudflare) below and attach custom domains on the Pages projects.

Leave the domain registered where it is. You are only changing **who answers DNS**, not transferring the registration.

## DNS (once getlakbay.com is in Cloudflare)

```
@            CNAME  hris-landing.pages.dev           Proxied  (apex; CF flattens)
www          CNAME  hris-landing.pages.dev           Proxied  (optional)
admin        CNAME  hris-admin.pages.dev           Proxied
onboarding   CNAME  hris-onboarding.pages.dev      Proxied
api          CNAME  <tunnel-id>.cfargotunnel.com   Proxied
auth         CNAME  <cognito custom domain — later>  Proxied  (skip until then; use Cognito hosted UI prefix)
```

Attach custom domains in each Pages project (`getlakbay.com`, `admin.getlakbay.com`, `onboarding.getlakbay.com`). Enable **Always Use HTTPS**.

Pages custom-domain CNAMEs are often created automatically when you click **Set up a custom domain** on the project. Prefer that over hand-typing the `pages.dev` target if the UI offers it.

## Where to get `CLOUDFLARE_ACCOUNT_ID`

The **User API Tokens** page does **not** show Account ID. Tokens and Account ID are different values.

Copy Account ID from any of these (it is a 32-character hex string, not a secret in the same way as a token, but still treat it as repo-secret-only):

1. **Any domain Overview** — open a zone already in this Cloudflare account → right sidebar (or the **API** block) → **Account ID** with a copy button. After `getlakbay.com` is Active, use that Overview.
2. **Workers & Pages** — dashboard → **Workers & Pages** → **Account Details** → **Account ID**.
3. **Dashboard URL** — after you pick an account, the path is `https://dash.cloudflare.com/<account_id>/...`. The first path segment after the host is the Account ID.
4. **Quick search** — from any dashboard page, `Cmd/Ctrl + K` → type `Copy account ID`.

Do **not** confuse it with **Zone ID** (per-domain, also on Overview). GitHub Actions needs the **account** ID.

Paste it into GitHub → repo **Settings** → **Secrets and variables** → **Actions** → `CLOUDFLARE_ACCOUNT_ID`. Never commit it to git (optional in local notes only).

## `CLOUDFLARE_API_TOKEN` — do not reuse the Agent Token

There is an existing user token named **Cloudflare Agent Token - 2026-04-27**. It has a huge scope (`Account.Access: SAML Certificate`, `Account.Data Localization Suite`, and 163+ other permissions), **All accounts**, **All zones**, last used 2 Jun 2026, no expiry.

That token **would technically work** for Pages deploy — Wrangler only needs Pages write, and this token includes far more than that. **Do not put it in GitHub Actions.** A leaked GitHub secret with that scope can change SAML, localization, every zone, and every account the user can reach. It is an agent / automation token, not a CI token.

**Create a least-privilege token instead:**

1. Cloudflare dashboard → profile (top right) → **My Profile** → **API Tokens** (or [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)).
2. Click **+ Create Token** — not “Use Global API Key”, not “Roll” on the Agent Token.
3. Prefer one of:
   - **Custom token:** permissions **Account → Cloudflare Pages → Edit** and **Account → Account Settings → Read**. Resource: **this account only** (not “All accounts”). Zones: none required for `wrangler pages deploy` of an existing project.
   - Official template **Edit Cloudflare Workers** if the summary includes Pages (Workers and Pages share account APIs). Still restrict it to **this account**.
4. Continue to summary → **Create Token**. Copy the value **once** into GitHub secret `CLOUDFLARE_API_TOKEN`. Cloudflare will not show it again.
5. Optional: set an expiry (e.g. 1 year) so it does not live forever like the Agent Token.

**Do not** use the **Global API Key** (or Global Key + email). Wrangler Action v3 does not accept it, and it is equivalent to full account control. Never paste any token or Global Key into this repo, `.env` committed files, or chat.

GitHub secrets required by `.github/workflows/deploy-pages.yml`:

| Secret | What it is |
|--------|------------|
| `CLOUDFLARE_ACCOUNT_ID` | 32-char account id from Overview / Workers & Pages / dash URL |
| `CLOUDFLARE_API_TOKEN` | New least-privilege token from **+ Create Token** |

Also set `VITE_API_BASE_URL` (not `VITE_API_URL`) plus the Cognito Hosted UI vars (`VITE_OIDC_CLIENT_ID`, `VITE_OIDC_AUTHORIZE_URL`, `VITE_OIDC_TOKEN_URL`, `VITE_OIDC_LOGOUT_URL`). See [Pages environment variables](#pages-environment-variables-both-projects).

## Pages build

From repo root (see `.github/workflows/deploy-pages.yml`):

```bash
npm ci
npm run build -w @hris/web-admin         # apps/web-admin/dist
npm run build -w @hris/web-onboarding    # apps/web-onboarding/dist
```

Vite inlines `import.meta.env.VITE_*` at **`npm run build`**. Changing dashboard env without a new build leaves the SPA on `http://localhost:3000` (CORS failure in production). The GitHub Actions workflow defaults `VITE_API_BASE_URL` to `https://api.getlakbay.com`; re-run **Deploy Pages** after this lands.

SPA fallback: `public/_redirects` → `/* /index.html 200`.

## Pages environment variables (both projects)

Set these on **each** Pages project: **Workers & Pages** → `hris-admin` **and** `hris-onboarding` → **Settings** → **Environment variables** → **Production**. Then **Redeploy** (a new build). Direct-upload of an old `dist` does not pick them up — use **workflow_dispatch** on `deploy-pages.yml` or a new `web-v*` tag.

Do **not** typo the API URL name: the code reads **`VITE_API_BASE_URL`**, not `VITE_API_URL`.

| Variable | Production value | Required now? |
|----------|------------------|---------------|
| `VITE_API_BASE_URL` | `https://api.getlakbay.com` | **Yes** — both projects |
| `VITE_AUTH_DEV_BYPASS` | `false` | Harper buttons never render off localhost anyway |
| `VITE_OIDC_CLIENT_ID` | `604evnknhtitgpltjdo90ghm7l` | **Yes** — Hosted UI |
| `VITE_OIDC_ISSUER` | `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG` | Optional (docs / debugging) |
| `VITE_OIDC_AUTHORIZE_URL` | `https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize` | **Yes** — Hosted UI |
| `VITE_OIDC_TOKEN_URL` | `https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token` | **Yes** — PKCE code exchange |
| `VITE_OIDC_LOGOUT_URL` | `https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/logout` | **Yes** — Hosted UI sign-out |
| `VITE_LANDING_URL` | `https://getlakbay.com` | **Yes** — Cognito `logout_uri` / post-sign-out |

Same names if you set GitHub Actions secrets instead of (or in addition to) Pages env. `deploy-pages.yml` already bakes these Cognito URLs (and `VITE_API_BASE_URL`) at build time. Re-run **Deploy Pages**.

## Cloudflare Tunnel (lab Nest origin)

Do not deploy Nest to Pages or Workers. Create the tunnel in **your** Cloudflare account (no token in this repo). Full CLI copy-paste: [infra/cloudflare/README.md](../infra/cloudflare/README.md).

1. Install `cloudflared`, `cloudflared tunnel login`, `cloudflared tunnel create hris-api`.
2. Copy `infra/cloudflare/tunnel.yml.example` → `infra/cloudflare/tunnel.yml` (gitignored); point ingress at `http://localhost:3000`.
3. DNS: CNAME `api` → `<tunnel-id>.cfargotunnel.com`, **Proxied**.
4. With Compose Postgres + `npm run dev:api` already running: `cloudflared tunnel --config infra/cloudflare/tunnel.yml run`.

**`AUTH_DEV_BYPASS` is localhost-only.** Keep it `true` on the Nest process for local Vite / Playwright. `JwtAuthGuard` ignores `dev:` tokens unless `Host` is localhost (and Origin is missing or localhost). Public Pages must use Cognito Hosted UI. You do **not** have to flip the flag to `false` to lock the tunnel — restart Nest after pulling this guard. Optional: set `AUTH_DEV_BYPASS=false` anyway.

## Nest origin env

```
# Nest always allows localhost Vite, custom domains, and the two Pages.dev hosts
# (plus this project's *.hris-admin.pages.dev / *.hris-onboarding.pages.dev previews).
# CORS_ORIGINS only adds extras.
AUTH_DEV_BYPASS=true
# Cognito-only is enough on the tunnel host. For local Keycloak + Cognito together,
# comma-separate issuer/JWKS pairs (see root `.env.example`).
OIDC_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG
OIDC_JWKS_URI=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG/.well-known/jwks.json
OIDC_AUDIENCE=604evnknhtitgpltjdo90ghm7l,4ij7jqehds0m6s1ubss1aj7710
OIDC_CLIENT_ID=604evnknhtitgpltjdo90ghm7l
OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
```

Public login is **authorization code + PKCE** (Cognito Hosted UI), not password grant. Bypass stays on for localhost; the guard ignores it on `api.getlakbay.com`. Restart Nest after changing OIDC env.

Callback / logout URLs on the Cognito `hris-web` client (already set): `http://localhost:5173`, `http://localhost:5174`, `https://admin.getlakbay.com`, `https://onboarding.getlakbay.com`, `https://hris-admin.pages.dev`, `https://hris-onboarding.pages.dev`.

## Mobile (Android + iOS)

Do not start a second backend. Flutter app: `apps/mobile/` (same Nest modules, same OIDC roles). Web portals stay React on Pages.

| Item | Plan |
|------|------|
| Clients | `hris-mobile` `4ij7jqehds0m6s1ubss1aj7710` public OIDC, PKCE; callbacks `hris://auth` + `com.mtgons5.hris.onboarding://callback` |
| Redirect | `hris://auth` and `com.mtgons5.hris.onboarding://callback` |
| API | `https://api.getlakbay.com` (or localhost / `10.0.2.2` in simulators) |
| Demo auth | `Bearer dev:employee` while `AUTH_DEV_BYPASS=true` |
| Stores | Play + App Store **after** web happy path is on getlakbay.com |

Runbook: [apps/mobile/README.md](../apps/mobile/README.md).

## What you still do in the Cloudflare UI

Nothing in this repo can create the tunnel, DNS CNAME, or Pages env. Do not paste tokens into chat.

1. **Tunnel:** Zero Trust → Networks → Tunnels (or `cloudflared tunnel create hris-api` as in [infra/cloudflare/README.md](../infra/cloudflare/README.md)).
2. **DNS:** CNAME `api` → `<tunnel-id>.cfargotunnel.com`, proxied. `auth.getlakbay.com` is later.
3. **Pages env (both `hris-admin` and `hris-onboarding`, Production):** `VITE_API_BASE_URL` + `VITE_OIDC_*` as in the table — then **Redeploy** / re-run **Deploy Pages**. Vite will not see the vars until a new build. The GitHub workflow already bakes the Cognito URLs.
4. On the lab machine: Compose Postgres + `npm run dev:api` + `cloudflared tunnel run`. Confirm Nest `OIDC_JWKS_URI` points at this pool. Bypass is ignored on the public Host.

Verify: `curl https://api.getlakbay.com/health` and `/api/docs`, then **Sign in with Cognito** on https://admin.getlakbay.com (`hr@lab.local` / `LabPass123!`).
