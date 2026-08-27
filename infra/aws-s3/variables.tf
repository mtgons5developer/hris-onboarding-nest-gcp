variable "region" {
  type        = string
  default     = "ap-southeast-1"
  description = "AWS region for the uploads bucket"
}

variable "bucket_name" {
  type        = string
  default     = null
  description = "Override bucket name; default hris-lab-uploads-<account-id>"
}

variable "create_iam_user" {
  type        = bool
  default     = true
  description = "Create hris-lab-nest-uploads IAM user with the uploads policy"
}

variable "iam_user_name" {
  type        = string
  default     = "hris-lab-nest-uploads"
  description = "IAM user name when create_iam_user is true"
}
