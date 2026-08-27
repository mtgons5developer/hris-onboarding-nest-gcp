# Auth, IAM/RBAC, and AWS lab path

Primary cloud for this lab is **AWS**: **Cognito** (auth) + **S3** (document uploads). Nest runs on a Mac behind **Cloudflare Tunnel**; static portals are **Cloudflare Pages**. GCP Cloud Run / Cloud SQL / Firebase Auth are **not** in the runtime path (optional leftovers: `STORAGE_DRIVER=gcs`, `infra/terraform`, `docs/GCP_SETUP.md`).

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

**Do not apply** `infra/terraform` (unused GCP Cloud SQL/Run) or an RDS stack unless you accept billing. Cognito (`infra/aws-cognito`) and S3 (`infra/aws-s3`) are the lab AWS path — do **not** apply a second Cognito hosted domain (prefix `hris-lab-mtgons5` already exists).

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
| — | `VITE_LANDING_URL` (post-sign-out redirect; default `https://getlakbay.com`) |

Local Docker (Cognito + Keycloak dual issuers; bypass is localhost-only). Pair lists by index — same order in `OIDC_ISSUER` and `OIDC_JWKS_URI`:

```
AUTH_DEV_BYPASS=true
OIDC_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG,http://localhost:8082/realms/hris
OIDC_JWKS_URI=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG/.well-known/jwks.json,http://localhost:8082/realms/hris/protocol/openid-connect/certs
OIDC_AUDIENCE=604evnknhtitgpltjdo90ghm7l,4ij7jqehds0m6s1ubss1aj7710,hris-web,hris-mobile,account
OIDC_CLIENT_ID=604evnknhtitgpltjdo90ghm7l
OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
```

Tunnel-only Nest can drop the Keycloak pair and keep Cognito alone. Restart Nest after `.env` changes.

Vite (local `.env` or Cloudflare Pages Production — bake at `npm run build`):

```
VITE_API_BASE_URL=https://api.getlakbay.com
VITE_AUTH_DEV_BYPASS=false
VITE_OIDC_CLIENT_ID=604evnknhtitgpltjdo90ghm7l
VITE_OIDC_ISSUER=https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Z0Q7ukIMG
VITE_OIDC_AUTHORIZE_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/authorize
VITE_OIDC_TOKEN_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/oauth2/token
VITE_OIDC_LOGOUT_URL=https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/logout
VITE_LANDING_URL=https://getlakbay.com
```

Local Vite can keep `VITE_API_BASE_URL=http://localhost:3000` and `VITE_AUTH_DEV_BYPASS=true` so Harper still appears on localhost only. Optional Keycloak password-grant (localhost **Sign in with Keycloak** only — do not point these at Cognito):

```
# VITE_KEYCLOAK_TOKEN_URL=http://localhost:8082/realms/hris/protocol/openid-connect/token
# VITE_KEYCLOAK_CLIENT_ID=hris-web
```

(Defaults match Compose when unset.)

`OIDC_ISSUER` / `OIDC_JWKS_URI` always use the **Cognito IdP host** (`cognito-idp.ap-southeast-1.amazonaws.com`), not `getlakbay.com`. Token / hosted UI use the **domain prefix** (`*.auth.ap-southeast-1.amazoncognito.com`).

### How to test Hosted UI on admin.getlakbay.com

1. Confirm Nest on the tunnel machine has `OIDC_ISSUER` / `OIDC_JWKS_URI` / `OIDC_AUDIENCE` as above. Restart Nest after pulling the localhost-only bypass guard.
2. Rebuild Pages (`workflow_dispatch` on `deploy-pages.yml` or a `web-v*` tag) so Vite bakes `VITE_OIDC_*`. Dashboard env alone does not change an old `dist`.
3. Open https://admin.getlakbay.com → **Sign in with Cognito** (not Harper). Log in as `hr@lab.local` / `LabPass123!`. First visit may prompt a new password if the user was left in `FORCE_CHANGE_PASSWORD` — lab users were set permanent.
4. https://onboarding.getlakbay.com → same Hosted UI as `luis.reyes@lab.local`.

If the Hosted UI errors `redirect_mismatch`, add the exact origin (no trailing slash) under Cognito → User pools → **hris-lab** → **App integration** → **hris-web** → **Allowed callback URLs** / **Allowed sign-out URLs**.

**Sign-out redirect to landing:** Admin and onboarding SPAs call Hosted UI logout as  
`https://hris-lab-mtgons5.auth.ap-southeast-1.amazoncognito.com/logout?client_id=…&logout_uri=…`  
(not `redirect_uri`, not `/oauth2/logout`). Production `logout_uri` is exactly `https://getlakbay.com` (no trailing slash). Cognito rejects with **Invalid request** if that URL is missing from the allow list — a 404 on the apex after redirect is a different (post-Cognito) problem.

**hris-web — Allowed callback URLs** (login `redirect_uri`; keep all):

```
http://localhost:5173
http://localhost:5174
https://admin.getlakbay.com
https://onboarding.getlakbay.com
https://hris-admin.pages.dev
https://hris-onboarding.pages.dev
```

**hris-web — Allowed sign-out URLs** (logout `logout_uri`; must include landing apex):

```
http://localhost:5173
http://localhost:5174
http://localhost:5175
https://getlakbay.com
https://admin.getlakbay.com
https://onboarding.getlakbay.com
https://hris-admin.pages.dev
https://hris-onboarding.pages.dev
```

Do **not** add `https://getlakbay.com/` (trailing slash) unless the SPA sends that exact string. Optional: also add `https://www.getlakbay.com` if you ever redirect users to www (SPA code normalizes to apex).

Console: Cognito → User pools → **hris-lab** → **App integration** → **App clients** → **hris-web** → **Hosted UI** → edit **Allowed callback URLs** / **Allowed sign-out URLs** → **Save changes**. Or `terraform apply` in `infra/aws-cognito` (TF already lists the above).

Put users in Cognito groups named exactly like `UserRole`. Lab users (email sign-in, password `LabPass123!`):

| Email | Group |
|-------|--------|
| `hr@lab.local` | `hr_admin` |
| `maya.santos@lab.local` | `manager` |
| `luis.reyes@lab.local` | `employee` |
| `sysadmin@lab.local` | `system_admin` |

Cognito is the AWS-native Entra stand-in. Keycloak remains the closer **enterprise IdP** story for interviews.

## Amazon S3 document uploads (lab)

Terraform: **`infra/aws-s3/`** — bucket (default name `hris-lab-uploads-<account-id>`), **SSE-S3**, block public access, **30-day lifecycle** on prefix `uploads/`, IAM policy for Nest (`PutObject` / `GetObject` / `DeleteObject` / `HeadObject` on `uploads/*`).

**Not applied by default.** Run manually when you have AWS credentials (same lab account as Cognito):

```bash
cd infra/aws-s3
cp terraform.tfvars.example terraform.tfvars   # optional
terraform init
terraform plan
terraform apply
terraform output bucket_name
terraform output region
```

Create access keys for IAM user `hris-lab-nest-uploads` (if `create_iam_user = true`):

```bash
aws iam create-access-key --user-name hris-lab-nest-uploads --region ap-southeast-1
```

### Map S3 outputs → Nest env

| Setting | Env var |
|---------|---------|
| `bucket_name` output | `S3_BUCKET` |
| `region` output | `AWS_REGION` |
| Lab access key | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (never commit) |
| Driver | `STORAGE_DRIVER=s3` |

Presigned URL TTL (optional): `S3_SIGNED_URL_TTL_SECONDS`, `S3_DOWNLOAD_URL_TTL_SECONDS` (default 900).

Local/offline dev keeps `STORAGE_DRIVER=local` and `LOCAL_UPLOAD_DIR` — no AWS required.

### Quota and lifecycle

| Rule | Where |
|------|--------|
| **30-day object TTL** | S3 lifecycle on `uploads/*` |
| **100 MB per employee** | Nest `DocumentsService` + `size_bytes` on `documents_meta` |
| **10 MB max per file** | Nest validation on register / local PUT |

S3 deletes bytes after 30 days; **Postgres metadata rows remain** for audit unless you add a cleanup job later.

### Verify upload (Flutter / web)

1. Apply S3 Terraform and set Nest env (`STORAGE_DRIVER=s3`, bucket, region, keys).
2. Run migration: `npm run prisma:migrate -w @hris/api`
3. Restart Nest. Register returns a **presigned S3 PUT URL** (not localhost).
4. Mobile/web: `POST /api/v1/documents` with `sizeBytes`, then `PUT` to `uploadUrl` with `Content-Type` header (same flow as optional GCS adapter).
5. Download / view: `GET /api/v1/documents/:id/download-url` → presigned GET (S3; or GCS if that driver is enabled) or Nest `/download` proxy (local). Employees and HR with case access can open; `DELETE /api/v1/documents/:id` for uploader or `hr_admin`.

Interview one-liner: *“Onboarding docs land in a private S3 bucket with SSE and a 30-day lifecycle; Nest issues presigned PUTs/GETs, serves local downloads when `STORAGE_DRIVER=local`, and enforces a 100 MB per-employee quota in Postgres because S3 can’t do per-user caps.”*

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

