# Auth, IAM/RBAC, and “AWS for free”

This lab is **not** billed on Firebase Auth anymore. Nest verifies **OIDC access tokens** via JWKS. That is the same pattern used with **Keycloak**, **Amazon Cognito**, and **Azure Entra**.

## Lab AWS account

**Intended login:** `mtgons5.ea@gmail.com` — Cognito-only lab account (user pool + client + groups). Do **not** apply RDS, App Runner, or other billed stacks unless you later accept that billing.

This repo does not store AWS keys. Do not paste access keys into git, `.env`, or chat. Historical keys in other repos (if any) are out of scope here — do not rotate them from this lab. Cognito user pool `hris-lab` is already applied.

## Can we run AWS for $0 right now?

**Not the full platform.** Cognito is applied; other AWS services still cost money:

| Service | Free-tier reality |
|---------|-------------------|
| **Cognito user pools** | Always free for **50,000 MAU** — this is the Firebase Auth replacement |
| **RDS PostgreSQL** | 12-month trial on `db.t3.micro` for *new* accounts only — then you pay. Local Docker Postgres is $0 |
| **S3** | 12-month 5 GB — then pay. Local disk adapter is $0 |
| **App Runner / ECS / ALB** | Not lastingly free |
| **Secrets Manager** | ~$0.40/secret/month after trial |

**Do not apply** `infra/terraform` Cloud SQL/GCP or an RDS stack unless you accept billing. Cognito (`infra/aws-cognito`) is already applied — do **not** apply a second hosted domain (prefix `hris-lab-mtgons5` already exists).

## What we run for $0 today (JD-aligned)

The job description asks for **Keycloak or Azure Entra** and Nest **Controller/Service/DTO** + PostgreSQL + RBAC.

| JD concern | Lab stand-in (free now) | AWS hosted later |
|------------|-------------------------|------------------|
| Keycloak / Entra | **Keycloak 26** in Compose (`:8082`) | Cognito user pool + groups, or Entra OIDC |
| Nest JWT verify | `JwtAuthGuard` + `jose` JWKS | Same guard; point `OIDC_JWKS_URI` at Cognito |
| Roles | Realm roles `hr_admin` / `manager` / `employee` / `system_admin` | Cognito groups with the same names |
| Postgres | Docker `hris_lab` | RDS when you accept cost |
| CI/CD | GitHub Actions | Same + OIDC to AWS (WIF) |

Keycloak console: http://localhost:8082 — `admin` / `admin`  
Realm: `hris` · client: `hris-web` (public, password grant for the lab)  
Users: `hr@lab.local`, `maya.santos@lab.local`, `luis.reyes@lab.local`, `sysadmin@lab.local`  
Password: `LabPass123!`

Keep `AUTH_DEV_BYPASS=true` for local Docker / Playwright. Nest **ignores** bypass unless the request `Host` is localhost (so `api.getlakbay.com` requires Cognito JWTs even if the flag is still true). Public Pages use Cognito Hosted UI, not “Continue as Harper”.

## Amazon Cognito (lab account `mtgons5.ea@gmail.com`)

Terraform lives in `infra/aws-cognito/` (user pool `hris-lab`, public SPA client `hris-web`, groups `hr_admin` / `manager` / `employee` / `system_admin`). Region: **`ap-southeast-1`**. No RDS in that stack.

**Applied.** Public SPA client id (not a secret): `604evnknhtitgpltjdo90ghm7l`. Flutter public client `hris-mobile`: `4ij7jqehds0m6s1ubss1aj7710`. Do not commit `terraform.tfstate` or AWS access keys.

### Applied outputs (2026-08)

| Output | Value |
|--------|--------|
| `user_pool_id` | `ap-southeast-1_Z0Q7ukIMG` |
| `client_id` (`hris-web`) | `604evnknhtitgpltjdo90ghm7l` |
| `mobile_client_id` (`hris-mobile`) | `4ij7jqehds0m6s1ubss1aj7710` |
| `region` | `ap-southeast-1` |
| `issuer` | `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG` |
| `jwks_uri` | `https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG/.well-known/jwks.json` |

Cognito **access tokens** use the app **client id** (`client_id`); ID tokens use `aud`. Set `OIDC_AUDIENCE` to a comma-separated list of public clients (`hris-web` + `hris-mobile`), not the pool id.

### Hosted UI (authorization code + PKCE)

Prefix `hris-lab-mtgons5` is **ACTIVE**. Do not recreate it. Public client `hris-web` has OAuth **code** + PKCE, scopes `openid email profile`, and callbacks for localhost + getlakbay.com + pages.dev.

```
https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize
https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/logout
```

This pool uses **email aliases**, so the access-token `username` is a UUID. The SPA stores the token response and sends the **ID token** as `Authorization: Bearer` so Nest can read `email` + `aud` + `cognito:groups` and attach seeded Harper/Luis rows. Access tokens still verify (`client_id` as audience).

Custom domain `auth.getlakbay.com` is later (needs the zone on Cloudflare). See [PRODUCTION_CLOUDFLARE.md](PRODUCTION_CLOUDFLARE.md).

Flutter callbacks on `hris-mobile` (do not add these to `hris-web`): `hris://auth`, `com.mtgons5.hris.onboarding://callback`. Runbook: [apps/mobile/README.md](../apps/mobile/README.md).

### Map Terraform outputs → Nest / Vite env

| Output | Env var |
|--------|---------|
| `issuer` | `OIDC_ISSUER` |
| `jwks_uri` | `OIDC_JWKS_URI` |
| `client_id` | `OIDC_AUDIENCE` (comma-separate with `mobile_client_id`), `OIDC_CLIENT_ID`, `VITE_OIDC_CLIENT_ID` |
| `mobile_client_id` | Flutter `--dart-define=OIDC_CLIENT_ID`, also in Nest `OIDC_AUDIENCE` |
| `authorize_url` | `VITE_OIDC_AUTHORIZE_URL` |
| `token_url` | `OIDC_TOKEN_URL`, `VITE_OIDC_TOKEN_URL` |
| `logout_url` | `VITE_OIDC_LOGOUT_URL` |

Local Docker (Keycloak still in Compose; bypass is localhost-only):

```
AUTH_DEV_BYPASS=true
OIDC_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG
OIDC_JWKS_URI=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG/.well-known/jwks.json
OIDC_AUDIENCE=604evnknhtitgpltjdo90ghm7l,4ij7jqehds0m6s1ubss1aj7710
OIDC_CLIENT_ID=604evnknhtitgpltjdo90ghm7l
OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
```

Vite (local `.env` or Cloudflare Pages Production — bake at `npm run build`):

```
VITE_API_BASE_URL=https://api.getlakbay.com
VITE_AUTH_DEV_BYPASS=false
VITE_OIDC_CLIENT_ID=604evnknhtitgpltjdo90ghm7l
VITE_OIDC_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG
VITE_OIDC_AUTHORIZE_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize
VITE_OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
VITE_OIDC_LOGOUT_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/logout
```

Local Vite can keep `VITE_API_BASE_URL=http://localhost:3000` and `VITE_AUTH_DEV_BYPASS=true` so Harper still appears on localhost only.

`OIDC_ISSUER` / `OIDC_JWKS_URI` always use the **Cognito IdP host** (`cognito-idp.ap-southeast-1.amazonaws.com`), not `getlakbay.com`. Token / hosted UI use the **domain prefix** (`*.auth.ap-southeast-1.amazoncognito.com`).

### How to test Hosted UI on admin.getlakbay.com

1. Confirm Nest on the tunnel machine has `OIDC_ISSUER` / `OIDC_JWKS_URI` / `OIDC_AUDIENCE` as above. Restart Nest after pulling the localhost-only bypass guard.
2. Rebuild Pages (`workflow_dispatch` on `deploy-pages.yml` or a `web-v*` tag) so Vite bakes `VITE_OIDC_*`. Dashboard env alone does not change an old `dist`.
3. Open https://admin.getlakbay.com → **Sign in with Cognito** (not Harper). Log in as `hr@lab.local` / `LabPass123!`. First visit may prompt a new password if the user was left in `FORCE_CHANGE_PASSWORD` — lab users were set permanent.
4. https://onboarding.getlakbay.com → same Hosted UI as `luis.reyes@lab.local`.

If the Hosted UI errors `redirect_mismatch`, add the exact origin (no trailing slash) under Cognito → User pools → **hris-lab** → **App integration** → **hris-web** → **Allowed callback URLs** / **Allowed sign-out URLs**.

Put users in Cognito groups named exactly like `UserRole`. Lab users (email sign-in, password `LabPass123!`):

| Email | Group |
|-------|--------|
| `hr@lab.local` | `hr_admin` |
| `maya.santos@lab.local` | `manager` |
| `luis.reyes@lab.local` | `employee` |
| `sysadmin@lab.local` | `system_admin` |

Cognito is the AWS-native Entra stand-in. Keycloak remains the closer **enterprise IdP** story for interviews.

### Recreate users / callbacks (CLI or console)

Users and Hosted UI callbacks were applied on the live pool. Do **not** create a second domain. If you need to redo users:

**Console:** Cognito → User pools → **hris-lab** → **Users** → Create user (email as username, mark email verified, temporary password `LabPass123!`, then set permanent). **Groups** → add to `hr_admin` / `manager` / `employee` / `system_admin`. **App integration** → **App clients** → **hris-web** → Hosted UI: OAuth grant **Authorization code**, scopes `openid email profile`, callbacks/sign-out URLs as in `infra/aws-cognito/main.tf`.

**CLI** (region `ap-southeast-1`, pool `ap-southeast-1_Z0Q7ukIMG`, client `604evnknhtitgpltjdo90ghm7l`):

```bash
aws cognito-idp admin-create-user --user-pool-id ap-southeast-1_Z0Q7ukIMG \
  --username hr@lab.local --message-action SUPPRESS \
  --user-attributes Name=email,Value=hr@lab.local Name=email_verified,Value=true Name=name,Value='Harper Reyes' \
  --temporary-password 'LabPass123!' --region ap-southeast-1
aws cognito-idp admin-set-user-password --user-pool-id ap-southeast-1_Z0Q7ukIMG \
  --username hr@lab.local --password 'LabPass123!' --permanent --region ap-southeast-1
aws cognito-idp admin-add-user-to-group --user-pool-id ap-southeast-1_Z0Q7ukIMG \
  --username hr@lab.local --group-name hr_admin --region ap-southeast-1
```

Repeat for `maya.santos@lab.local` → `manager`, `luis.reyes@lab.local` → `employee`, `sysadmin@lab.local` → `system_admin`.

