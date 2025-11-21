resource "kubernetes_namespace" "image_hosting" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "image_hosting" {
  name       = "image-hosting-app"
  repository = "" # Local chart
  chart      = "${path.module}/../../../helm/image-hosting" # Relative path to chart from module
  namespace  = kubernetes_namespace.image_hosting.metadata[0].name

  depends_on = [kubernetes_namespace.image_hosting]

  # Replica Count
  set {
    name  = "service.replicaCount"
    value = var.service_replica_count
  }

  # Dynamic Image Tag
  set {
    name  = "global.image.tag"
    value = var.app_version
  }
  set {
    name  = "frontend.image.tag"
    value = var.app_version
  }
  set {
    name  = "backend.image.tag"
    value = var.app_version
  }
  set {
    name  = "service.image.tag"
    value = var.app_version
  }
  
  # Environment specific env vars
  set {
    name  = "backend.env.NODE_ENV"
    value = var.environment
  }

  recreate_pods = true
}
