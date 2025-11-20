resource "kubernetes_namespace" "image_hosting" {
  metadata {
    name = "image-hosting"
  }
}

resource "helm_release" "image_hosting" {
  name       = "image-hosting-app"
  repository = "" # Local chart
  chart      = "${path.module}/../helm/image-hosting"
  namespace  = kubernetes_namespace.image_hosting.metadata[0].name

  # Ensure the namespace is created before the release
  depends_on = [kubernetes_namespace.image_hosting]

  # Values can be overridden here
  set {
    name  = "service.replicaCount"
    value = "2"
  }
  
  # Re-create pods if config changes
  recreate_pods = true
}
