# Optional / unused: GCP Cloud SQL + GCS + Artifact Registry for Cloud Run.
# Current lab: Cognito + S3 + Cloudflare Tunnel — see ../aws-cognito, ../aws-s3, ../../docs/AWS_AND_IAM.md
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  description = "Dedicated lab GCP project (not Alerto24 production)."
}

variable "region" {
  type    = string
  default = "asia-southeast1"
}

variable "db_password" {
  type      = string
  sensitive = true
}

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
    "artifactregistry.googleapis.com",
    "iamcredentials.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

resource "google_sql_database_instance" "pg" {
  name             = "hris-lab-pg"
  database_version = "POSTGRES_16"
  region           = var.region
  depends_on       = [google_project_service.apis]
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
    }
    backup_configuration { enabled = false }
  }
  deletion_protection = false
}

resource "google_sql_database" "lab" {
  name     = "hris_lab"
  instance = google_sql_database_instance.pg.name
}

resource "google_sql_user" "hris" {
  name     = "hris"
  instance = google_sql_database_instance.pg.name
  password = var.db_password
}

resource "google_storage_bucket" "docs" {
  name                        = "${var.project_id}-onboarding-docs"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true
  lifecycle_rule {
    condition { age = 30 }
    action { type = "Delete" }
  }
}

resource "google_secret_manager_secret" "db" {
  secret_id = "hris-database-url"
  replication { auto {} }
}

resource "google_secret_manager_secret_version" "db" {
  secret = google_secret_manager_secret.db.id
  secret_data = format(
    "postgresql://hris:%s@/%s?host=/cloudsql/%s",
    var.db_password,
    google_sql_database.lab.name,
    google_sql_database_instance.pg.connection_name,
  )
}

resource "google_artifact_registry_repository" "hris" {
  location      = var.region
  repository_id = "hris-lab"
  format        = "DOCKER"
}

output "sql_connection_name" {
  value = google_sql_database_instance.pg.connection_name
}

output "docs_bucket" {
  value = google_storage_bucket.docs.name
}

output "artifact_repo" {
  value = google_artifact_registry_repository.hris.name
}
