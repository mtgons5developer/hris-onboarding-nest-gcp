terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current" {}

locals {
  bucket_name = coalesce(
    var.bucket_name,
    "hris-lab-uploads-${data.aws_caller_identity.current.account_id}",
  )
}

resource "aws_s3_bucket" "uploads" {
  bucket = local.bucket_name
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "expire-uploads-after-30-days"
    status = "Enabled"

    filter {
      prefix = "uploads/"
    }

    expiration {
      days = 30
    }
  }
}

resource "aws_iam_policy" "nest_uploads" {
  name        = "hris-lab-nest-uploads"
  description = "Presigned upload/download for Nest HRIS document adapter (uploads/* prefix)"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ObjectReadWrite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:HeadObject",
        ]
        Resource = "${aws_s3_bucket.uploads.arn}/uploads/*"
      },
      {
        Sid      = "ListBucketPrefix"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.uploads.arn
        Condition = {
          StringLike = {
            "s3:prefix" = ["uploads/*"]
          }
        }
      },
    ]
  })
}

# Optional lab IAM user — attach access keys in console/CLI; never commit keys.
resource "aws_iam_user" "nest_uploads" {
  count = var.create_iam_user ? 1 : 0
  name  = var.iam_user_name
}

resource "aws_iam_user_policy_attachment" "nest_uploads" {
  count      = var.create_iam_user ? 1 : 0
  user       = aws_iam_user.nest_uploads[0].name
  policy_arn = aws_iam_policy.nest_uploads.arn
}

output "bucket_name" {
  value = aws_s3_bucket.uploads.id
}

output "bucket_arn" {
  value = aws_s3_bucket.uploads.arn
}

output "region" {
  value = var.region
}

output "nest_uploads_policy_arn" {
  value = aws_iam_policy.nest_uploads.arn
}

output "iam_user_name" {
  value = var.create_iam_user ? aws_iam_user.nest_uploads[0].name : null
}
