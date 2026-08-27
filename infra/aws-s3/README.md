# HRIS lab document uploads (Amazon S3)

Terraform for onboarding document storage: **SSE-S3**, **block public access**, **CORS** for browser presigned uploads, **30-day lifecycle** on `uploads/*`, and an IAM policy for the Nest API (`PutObject`, `GetObject`, `DeleteObject`, `HeadObject`).

Region defaults to **`ap-southeast-1`** (same lab account as `infra/aws-cognito/`).

## CORS (browser uploads)

Web onboarding (Vite / Cloudflare Pages) uploads via **presigned PUT** directly to S3. The bucket must allow those origins or the browser blocks the request (Flutter native does not need CORS).

Allowed origins (see `aws_s3_bucket_cors_configuration` in `main.tf` / `cors.json`):

- `http://localhost:5173`, `http://localhost:5174`
- `https://admin.getlakbay.com`, `https://onboarding.getlakbay.com`, `https://getlakbay.com`
- `https://hris-admin.pages.dev`, `https://hris-onboarding.pages.dev`

Methods: `GET`, `PUT`, `HEAD`, `POST`. Headers: `*`. Expose: `ETag`. MaxAge: `3000`.

To apply CORS without a full Terraform run:

```bash
aws s3api put-bucket-cors \
  --bucket "$(terraform output -raw bucket_name)" \
  --cors-configuration file://cors.json \
  --region ap-southeast-1
```

## Prerequisites

- AWS CLI configured for the lab account (`mtgons5.ea@gmail.com` or equivalent)
- Terraform ≥ 1.6
- **Do not commit** `terraform.tfstate`, `*.tfvars` with secrets, or access keys

## Apply (manual — agent does not run this)

```bash
cd infra/aws-s3
cp terraform.tfvars.example terraform.tfvars   # optional overrides
terraform init
terraform plan
terraform apply
```

Note the outputs:

```bash
terraform output bucket_name
terraform output region
terraform output nest_uploads_policy_arn
```

## IAM credentials for Nest

After apply, create access keys for `hris-lab-nest-uploads` (if `create_iam_user = true`):

```bash
aws iam create-access-key --user-name hris-lab-nest-uploads --region ap-southeast-1
```

Set on the Nest host (never commit):

```
STORAGE_DRIVER=s3
S3_BUCKET=<bucket_name output>
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Alternatively attach `nest_uploads_policy_arn` to an ECS task role / App Runner instance role and omit static keys.

## Lifecycle vs Postgres metadata

S3 deletes objects after **30 days** via lifecycle rule. Rows in `documents_meta` are **not** auto-deleted — they remain for audit. Optional future job: mark rows `expired` or purge keys that 404 on `HeadObject`.

## Per-employee quota

S3 cannot enforce **100 MB per employee**. Nest enforces this in `DocumentsService` using `size_bytes` on `documents_meta` (see `apps/api/src/documents/document-quota.ts`).

## Destroy

```bash
terraform destroy
```

Empty the bucket first if `force_destroy` is not enabled (default).
