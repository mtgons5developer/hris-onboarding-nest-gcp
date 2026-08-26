# GCP lab setup (Phase 3)

Create a **new** GCP + Firebase project. Do not reuse Alerto24 production (`sonorous-summer-415805` / related).

## 1. Project

```bash
gcloud projects create hris-onboarding-lab --name="HRIS Onboarding Lab"
gcloud billing accounts list
gcloud billing projects link hris-onboarding-lab --billing-account=YOUR_ACCOUNT
gcloud config set project hris-onboarding-lab
```

Enable a **budget alert** (lab spend cap, e.g. $10/month).

## 2. Firebase (Auth)

```bash
# Console: https://console.firebase.google.com → add project to the GCP project
# Enable Email/Password (and optionally Google)
# Optional: App Check on the two hosting sites
```

Download a service account for Cloud Run or use the default compute SA with `roles/firebase.admin` if you set custom claims from Nest.

## 3. Infrastructure

Console **or** OpenTofu/Terraform in `infra/terraform`:

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # edit; do not commit
terraform init
terraform plan
terraform apply
```

Creates: Cloud SQL Postgres (`db-f1-micro`), GCS bucket with 30-day lifecycle, Secret Manager `hris-database-url`, Artifact Registry `hris-lab`.

## 4. GitHub secrets for deploy workflow

| Secret | Purpose |
|--------|---------|
| `GCP_PROJECT_ID` | Lab project id |
| `GCP_REGION` | e.g. `asia-southeast1` |
| `WIF_PROVIDER` | Workload Identity Federation provider resource name |
| `WIF_SERVICE_ACCOUNT` | Deployer SA email |
| `GCS_BUCKET` | Onboarding docs bucket |

Then: `git tag api-v0.1.0 && git push --tags` or **Actions → Deploy API → Run workflow**.

## 5. Hosting the portals

- **Firebase Hosting** (two sites: `hris-admin`, `hris-onboarding`) or
- Upload Vite `dist/` to a public GCS bucket + load balancer.

Set `VITE_API_BASE_URL` to the Cloud Run URL at build time.

## Cost posture

- Cloud Run `min-instances=0`
- Smallest Cloud SQL; stop/delete when idle
- GCS lifecycle delete
- No Firestore as system of record
