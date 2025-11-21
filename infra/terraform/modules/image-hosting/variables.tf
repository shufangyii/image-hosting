variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
}

variable "app_version" {
  description = "Application version tag"
  type        = string
}

variable "service_replica_count" {
  description = "Number of replicas for the Rust service"
  type        = number
  default     = 1
}
