terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Cognito only — always-free 50k MAU. Do not add RDS/ALB here.
provider "aws" {
  region = var.region
}

variable "region" {
  type    = string
  default = "ap-southeast-1"
}

# Hosted UI / OAuth2 token endpoint. Prefix is globally unique across Cognito.
variable "cognito_domain_prefix" {
  type        = string
  default     = "hris-lab-mtgons5"
  description = "Cognito domain prefix. Token URL: https://<prefix>.auth.<region>.amazoncognito.com/oauth2/token"
}

resource "aws_cognito_user_pool" "hris" {
  name = "hris-lab"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_uppercase = false
    require_symbols   = false
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "hris-web"
  user_pool_id = aws_cognito_user_pool.hris.id
  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://admin.getlakbay.com",
    "https://onboarding.getlakbay.com",
    "https://hris-admin.pages.dev",
    "https://hris-onboarding.pages.dev",
  ]
  logout_urls = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://getlakbay.com",
    "https://admin.getlakbay.com",
    "https://onboarding.getlakbay.com",
    "https://hris-admin.pages.dev",
    "https://hris-onboarding.pages.dev",
  ]
  supported_identity_providers  = ["COGNITO"]
  prevent_user_existence_errors = "ENABLED"
}

# Native Flutter client. Do not attach these callbacks to hris-web.
# Apply (or create in console) after Hosted UI domain exists. Public + PKCE only.
resource "aws_cognito_user_pool_client" "mobile" {
  name         = "hris-mobile"
  user_pool_id = aws_cognito_user_pool.hris.id
  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls = [
    "hris://auth",
    "com.mtgons5.hris.onboarding://callback",
  ]
  logout_urls = [
    "hris://auth",
    "com.mtgons5.hris.onboarding://callback",
  ]
  supported_identity_providers  = ["COGNITO"]
  prevent_user_existence_errors = "ENABLED"

  # Imported after CLI create. `generate_secret=false` on import would otherwise
  # force replacement and mint a new client id.
  lifecycle {
    prevent_destroy = true
    ignore_changes  = [generate_secret]
  }
}

resource "aws_cognito_user_group" "roles" {
  for_each     = toset(["hr_admin", "manager", "employee", "system_admin"])
  name         = each.key
  user_pool_id = aws_cognito_user_pool.hris.id
  description  = "RBAC group ${each.key}"
}

# Non-destructive: domain already exists (hris-lab-mtgons5). Do not recreate.
resource "aws_cognito_user_pool_domain" "hris" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.hris.id

  lifecycle {
    prevent_destroy = true
  }
}

output "user_pool_id" { value = aws_cognito_user_pool.hris.id }
output "client_id" { value = aws_cognito_user_pool_client.web.id }
output "mobile_client_id" { value = aws_cognito_user_pool_client.mobile.id }
output "mobile_callback_urls" {
  value = aws_cognito_user_pool_client.mobile.callback_urls
}
output "region" { value = var.region }
output "issuer" {
  value = "https://cognito-idp.${var.region}.amazonaws.com/${aws_cognito_user_pool.hris.id}"
}
output "jwks_uri" {
  value = "https://cognito-idp.${var.region}.amazonaws.com/${aws_cognito_user_pool.hris.id}/.well-known/jwks.json"
}
output "cognito_domain_prefix" { value = aws_cognito_user_pool_domain.hris.domain }
output "token_url" {
  value = "https://${aws_cognito_user_pool_domain.hris.domain}.auth.${var.region}.amazoncognito.com/oauth2/token"
}
output "authorize_url" {
  value = "https://${aws_cognito_user_pool_domain.hris.domain}.auth.${var.region}.amazoncognito.com/oauth2/authorize"
}
output "logout_url" {
  value = "https://${aws_cognito_user_pool_domain.hris.domain}.auth.${var.region}.amazoncognito.com/logout"
}
