variable "kube_config_path" {
  description = "Path to the kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context to use (e.g., docker-desktop, minikube)"
  type        = string
  default     = "docker-desktop" # Change this to your current context
}
