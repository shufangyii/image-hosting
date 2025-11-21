module "image_hosting" {
  source = "../../modules/image-hosting"

  environment           = "prod"
  namespace             = "image-hosting-prod"
  app_version           = var.app_version
  service_replica_count = 3
}
